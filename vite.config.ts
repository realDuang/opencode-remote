import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import solid from "vite-plugin-solid";
import os from "os";
import http from "http";
import type { IncomingMessage, ServerResponse } from "http";
import { tunnelManager } from "./scripts/tunnel-manager";

// ============================================================================
// Configuration
// ============================================================================

// Electron's internal Auth API server port (must match auth-api-server.ts)
const AUTH_API_PORT = 4097;

// ============================================================================
// Helper Functions
// ============================================================================

function sendJson(res: ServerResponse, data: any, status = 200): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function getLocalIp(): string {
  let localIp = "localhost";
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name];
    if (!nets) continue;
    for (const net of nets) {
      if (net.family === "IPv4" && !net.internal) {
        localIp = net.address;
        break;
      }
    }
    if (localIp !== "localhost") break;
  }
  return localIp;
}

function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

function isLocalhost(ip: string): boolean {
  const normalizedIp = ip.replace(/^::ffff:/, "");
  return (
    normalizedIp === "127.0.0.1" ||
    normalizedIp === "::1" ||
    normalizedIp === "localhost"
  );
}

/**
 * Proxy a request to Electron's Auth API server
 */
function proxyToAuthApi(
  req: IncomingMessage,
  res: ServerResponse,
  targetPath?: string
): void {
  const path = targetPath || req.url || "/";

  // Collect request body if present
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const options: http.RequestOptions = {
      hostname: "127.0.0.1",
      port: AUTH_API_PORT,
      path: path,
      method: req.method,
      headers: {
        ...req.headers,
        host: `127.0.0.1:${AUTH_API_PORT}`,
        // Forward client IP for logging
        "x-forwarded-for": getClientIp(req),
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.statusCode = proxyRes.statusCode || 500;

      // Copy response headers
      for (const [key, value] of Object.entries(proxyRes.headers)) {
        if (value) res.setHeader(key, value);
      }

      proxyRes.pipe(res);
    });

    proxyReq.on("error", (err) => {
      console.error("[Vite Proxy] Failed to connect to Auth API:", err.message);
      sendJson(res, {
        error: "Auth service unavailable. Make sure Electron is running.",
        details: err.message
      }, 503);
    });

    if (body) {
      proxyReq.write(body);
    }
    proxyReq.end();
  });

  req.on("error", (err) => {
    console.error("[Vite Proxy] Request error:", err);
    sendJson(res, { error: "Request failed" }, 500);
  });
}

// ============================================================================
// Vite Config
// ============================================================================

export default defineConfig({
  plugins: [
    tailwindcss(),
    solid(),
    {
      name: "auth-api-proxy",
      configureServer(server) {
        // ====================================================================
        // Proxy all /api/auth/* and /api/admin/* and /api/devices/* requests
        // to Electron's internal Auth API server
        // ====================================================================
        server.middlewares.use((req, res, next) => {
          const url = req.url || "";

          // List of API paths that should be proxied to Electron's Auth API
          const authApiPaths = [
            "/api/auth/",
            "/api/admin/",
            "/api/devices",
          ];

          const shouldProxy = authApiPaths.some(p => url.startsWith(p));

          if (shouldProxy) {
            proxyToAuthApi(req, res);
            return;
          }

          next();
        });

        // ====================================================================
        // System: Get system info
        // GET /api/system/info
        // ====================================================================
        server.middlewares.use((req, res, next) => {
          if (req.url !== "/api/system/info" || req.method !== "GET") {
            next();
            return;
          }

          sendJson(res, {
            localIp: getLocalIp(),
            port: 5174,
          });
        });

        // ====================================================================
        // System: Check if request is from localhost
        // GET /api/system/is-local
        // ====================================================================
        server.middlewares.use((req, res, next) => {
          if (req.url !== "/api/system/is-local" || req.method !== "GET") {
            next();
            return;
          }

          const clientIp = getClientIp(req);
          const isLocal = isLocalhost(clientIp);
          sendJson(res, { isLocal });
        });

        // ====================================================================
        // Tunnel Management APIs
        // ====================================================================
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith("/api/tunnel")) {
            next();
            return;
          }

          try {
            if (req.url === "/api/tunnel/start" && req.method === "POST") {
              const info = await tunnelManager.start(5174);
              sendJson(res, info);
              return;
            }

            if (req.url === "/api/tunnel/stop" && req.method === "POST") {
              await tunnelManager.stop();
              sendJson(res, { success: true });
              return;
            }

            if (req.url === "/api/tunnel/status" && req.method === "GET") {
              const info = tunnelManager.getInfo();
              sendJson(res, info);
              return;
            }

            sendJson(res, { error: "Not found" }, 404);
          } catch (error: any) {
            console.error("[API Error]", error);
            sendJson(res, { error: error.message }, 500);
          }
        });
      },
    },
  ],
  server: {
    port: 5174,
    host: true,
    allowedHosts: [
      "localhost",
      ".trycloudflare.com",
    ],
    proxy: {
      "/opencode-api": {
        target: "http://localhost:4096",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/opencode-api/, ""),
      },
      "/opencode-api/global/event": {
        target: "http://localhost:4096",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/opencode-api/, ""),
        timeout: 0,
      },
    },
  },
});
