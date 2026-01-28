import fs from "fs";
import path from "path";
import crypto from "crypto";
import { app } from "electron";

// =============================================================================
// Types
// =============================================================================

export interface DeviceInfo {
  id: string;
  name: string;
  platform: string;
  browser: string;
  createdAt: number;
  lastSeenAt: number;
  ip: string;
  isHost?: boolean;
}

export interface PendingRequest {
  id: string;
  device: {
    name: string;
    platform: string;
    browser: string;
  };
  ip: string;
  status: "pending" | "approved" | "denied" | "expired";
  createdAt: number;
  resolvedAt?: number;
  deviceId?: string;
  token?: string;
}

interface DeviceStoreData {
  devices: Record<string, DeviceInfo>;
  pendingRequests: Record<string, PendingRequest>;
  revokedTokens: string[];
  jwtSecret: string;
}

interface TokenPayload {
  deviceId: string;
  iat: number;
  exp: number;
}

// =============================================================================
// Simple JWT Implementation
// =============================================================================

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64").toString("utf-8");
}

function createHmacSignature(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

function generateJWT(payload: object, secret: string, expiresInDays: number = 365): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);

  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInDays * 24 * 60 * 60,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = createHmacSignature(`${headerB64}.${payloadB64}`, secret);

  return `${headerB64}.${payloadB64}.${signature}`;
}

function verifyJWT(token: string, secret: string): { valid: boolean; payload?: TokenPayload } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false };

    const [headerB64, payloadB64, signature] = parts;
    const expectedSignature = createHmacSignature(`${headerB64}.${payloadB64}`, secret);

    if (signature !== expectedSignature) return { valid: false };

    const payload = JSON.parse(base64UrlDecode(payloadB64)) as TokenPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return { valid: false };

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

// =============================================================================
// Device Store
// =============================================================================

class DeviceStore {
  private data: DeviceStoreData | null = null;
  private revokedSet: Set<string> = new Set();
  private initialized = false;

  /**
   * Initialize DeviceStore - must be called after app.whenReady()
   */
  init(): void {
    if (this.initialized) return;
    this.data = this.load();
    this.revokedSet = new Set(this.data.revokedTokens);
    this.initialized = true;
  }

  /**
   * Reload data from disk
   * Used to sync with Web side in dev mode
   */
  reload(): void {
    if (!this.initialized) return;
    this.data = this.load();
    this.revokedSet = new Set(this.data.revokedTokens);
  }

  private ensureInitialized(): DeviceStoreData {
    if (!this.data) {
      throw new Error("DeviceStore not initialized. Call init() after app.whenReady()");
    }
    return this.data;
  }

  private getDevicesFilePath(): string {
    // In development mode, Electron and Web side share the same .devices.json file.
    // This may cause race conditions but is acceptable for dev purposes.
    if (!app.isPackaged) {
      return path.join(process.cwd(), ".devices.json");
    }
    // In production, use the standard user data directory
    return path.join(app.getPath("userData"), "devices.json");
  }

  private load(): DeviceStoreData {
    const DEVICES_FILE = this.getDevicesFilePath();

    if (fs.existsSync(DEVICES_FILE)) {
      try {
        const raw = fs.readFileSync(DEVICES_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        return {
          devices: parsed.devices || {},
          pendingRequests: parsed.pendingRequests || {},
          revokedTokens: parsed.revokedTokens || [],
          jwtSecret: parsed.jwtSecret || this.generateSecret(),
        };
      } catch {
        return this.createEmpty();
      }
    }
    return this.createEmpty();
  }

  private createEmpty(): DeviceStoreData {
    const data: DeviceStoreData = {
      devices: {},
      pendingRequests: {},
      revokedTokens: [],
      jwtSecret: this.generateSecret(),
    };
    this.save(data);
    return data;
  }

  private generateSecret(): string {
    return crypto.randomBytes(64).toString("hex");
  }

  private save(data?: DeviceStoreData): void {
    const toSave = data || this.ensureInitialized();
    const DEVICES_FILE = this.getDevicesFilePath();
    fs.writeFileSync(DEVICES_FILE, JSON.stringify(toSave, null, 2));
  }

  generateDeviceId(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  addDevice(device: DeviceInfo): void {
    const data = this.ensureInitialized();
    data.devices[device.id] = device;
    this.save();
  }

  getDevice(deviceId: string): DeviceInfo | undefined {
    const data = this.ensureInitialized();
    return data.devices[deviceId];
  }

  updateDevice(deviceId: string, updates: Partial<DeviceInfo>): void {
    const data = this.ensureInitialized();
    if (data.devices[deviceId]) {
      data.devices[deviceId] = { ...data.devices[deviceId], ...updates };
      this.save();
    }
  }

  updateLastSeen(deviceId: string, ip: string): void {
    const data = this.ensureInitialized();
    if (data.devices[deviceId]) {
      data.devices[deviceId].lastSeenAt = Date.now();
      data.devices[deviceId].ip = ip;
      this.save();
    }
  }

  removeDevice(deviceId: string): boolean {
    const data = this.ensureInitialized();
    if (data.devices[deviceId]) {
      delete data.devices[deviceId];
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Revoke all devices except the specified one
   */
  revokeAllExcept(keepDeviceId: string): number {
    const data = this.ensureInitialized();
    const deviceIds = Object.keys(data.devices);
    let count = 0;
    for (const id of deviceIds) {
      if (id !== keepDeviceId) {
        delete data.devices[id];
        count++;
      }
    }
    if (count > 0) {
      this.save();
    }
    return count;
  }

  generateToken(deviceId: string): string {
    const data = this.ensureInitialized();
    return generateJWT({ deviceId }, data.jwtSecret, 365);
  }

  verifyToken(token: string): { valid: boolean; deviceId?: string } {
    if (this.revokedSet.has(token)) {
      return { valid: false };
    }

    const data = this.ensureInitialized();
    const result = verifyJWT(token, data.jwtSecret);
    if (!result.valid || !result.payload) {
      return { valid: false };
    }

    const device = data.devices[result.payload.deviceId];
    if (!device) {
      return { valid: false };
    }

    return { valid: true, deviceId: result.payload.deviceId };
  }

  /**
   * List all devices
   */
  listDevices(): DeviceInfo[] {
    const data = this.ensureInitialized();
    return Object.values(data.devices);
  }

  /**
   * Generate 6-digit access code
   * Uses hash of JWT secret to generate a stable but predictable code
   */
  getAccessCode(): string {
    const data = this.ensureInitialized();
    // Use hash of secret to generate 6-digit numeric code
    const hash = crypto.createHash("sha256").update(data.jwtSecret).digest("hex");
    // Take first 12 hex chars, convert to number and mod
    const num = parseInt(hash.substring(0, 12), 16) % 1000000;
    return num.toString().padStart(6, "0");
  }

  // =========================================================================
  // Pending Request Methods
  // =========================================================================

  /**
   * List all pending access requests
   */
  listPendingRequests(): PendingRequest[] {
    const data = this.ensureInitialized();
    // Clean up expired requests (older than 5 minutes)
    const now = Date.now();
    const validRequests: PendingRequest[] = [];

    for (const req of Object.values(data.pendingRequests)) {
      if (req.status === "pending" && now - req.createdAt < 5 * 60 * 1000) {
        validRequests.push(req);
      }
    }

    return validRequests;
  }

  /**
   * Create a pending access request
   */
  createPendingRequest(device: { name: string; platform: string; browser: string }, ip: string): PendingRequest {
    const data = this.ensureInitialized();
    const id = crypto.randomBytes(16).toString("hex");

    const request: PendingRequest = {
      id,
      device,
      ip,
      status: "pending",
      createdAt: Date.now(),
    };

    data.pendingRequests[id] = request;
    this.save();

    return request;
  }

  /**
   * Get pending request
   */
  getPendingRequest(requestId: string): PendingRequest | undefined {
    const data = this.ensureInitialized();
    return data.pendingRequests[requestId];
  }

  /**
   * Approve access request
   */
  approveRequest(requestId: string): PendingRequest | undefined {
    const data = this.ensureInitialized();
    const request = data.pendingRequests[requestId];

    if (!request || request.status !== "pending") {
      return undefined;
    }

    // Create device and token
    const deviceId = this.generateDeviceId();
    const token = generateJWT({ deviceId }, data.jwtSecret, 365);

    const device: DeviceInfo = {
      id: deviceId,
      name: request.device.name,
      platform: request.device.platform,
      browser: request.device.browser,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      ip: request.ip,
    };

    // Add device directly to data, don't call addDevice (avoid data loss from reload)
    data.devices[device.id] = device;

    // Update request status
    request.status = "approved";
    request.resolvedAt = Date.now();
    request.deviceId = deviceId;
    request.token = token;

    // Save all changes at once
    this.save();

    return request;
  }

  /**
   * Deny access request
   */
  denyRequest(requestId: string): PendingRequest | undefined {
    const data = this.ensureInitialized();
    const request = data.pendingRequests[requestId];

    if (!request || request.status !== "pending") {
      return undefined;
    }

    request.status = "denied";
    request.resolvedAt = Date.now();

    this.save();

    return request;
  }
}

export const deviceStore = new DeviceStore();