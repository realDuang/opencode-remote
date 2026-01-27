import { spawn, ChildProcess } from "child_process";
import { app } from "electron";
import path from "path";
import fs from "fs";
import { EventEmitter } from "events";

interface OpenCodeStatus {
  running: boolean;
  port: number;
  pid?: number;
  startTime?: number;
  error?: string;
}

class OpenCodeProcess extends EventEmitter {
  private process: ChildProcess | null = null;
  private port: number = 4096;
  private status: OpenCodeStatus = { running: false, port: 4096 };

  private getOpencodePath(): string {
    if (!app.isPackaged) {
      return "opencode"; // Use system PATH in dev mode
    }

    const resourcesPath = process.resourcesPath;
    const platform = process.platform;
    const arch = process.arch;

    const binaryName = platform === "win32" ? "opencode.exe" : "opencode";
    return path.join(resourcesPath, "bin", `${platform}-${arch}`, binaryName);
  }

  async start(): Promise<OpenCodeStatus> {
    if (this.process) {
      return this.status;
    }

    const opencodePath = this.getOpencodePath();

    // Check if binary exists before spawning
    if (app.isPackaged && !fs.existsSync(opencodePath)) {
      const error = new Error(`OpenCode binary not found at ${opencodePath}`);
      this.status = { running: false, port: this.port, error: error.message };
      throw error;
    }

    try {
      this.process = spawn(
        opencodePath,
        ["serve", "--hostname", "127.0.0.1", "--port", this.port.toString(), "--cors"],
        {
          env: { ...process.env },
          stdio: ["ignore", "pipe", "pipe"],
          shell: process.platform === "win32",
        }
      );

      this.status = {
        running: true,
        port: this.port,
        pid: this.process.pid,
        startTime: Date.now(),
      };

      this.process.stdout?.on("data", (data) => {
        console.log("[OpenCode]", data.toString());
      });

      this.process.stderr?.on("data", (data) => {
        console.error("[OpenCode Error]", data.toString());
      });

      this.process.on("close", (code) => {
        console.log("[OpenCode] Process exited with code:", code);
        this.status = { running: false, port: this.port };
        this.process = null;
        this.emit("stopped", code);
      });

      this.process.on("error", (err) => {
        console.error("[OpenCode] Process error:", err);
        this.status = { running: false, port: this.port, error: err.message };
        this.process = null;
        this.emit("error", err);
      });

      await this.waitForReady();

      return this.status;
    } catch (error: any) {
      this.status = { running: false, port: this.port, error: error.message };
      throw error;
    }
  }

  private async waitForReady(timeout: number = 10000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(`http://localhost:${this.port}/provider`);
        if (response.ok) {
          console.log("[OpenCode] Service is ready");
          return;
        }
      } catch {
        // Service not ready yet, keep waiting
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    throw new Error("OpenCode service failed to start within timeout");
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill("SIGTERM");

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          if (this.process) {
            this.process.kill("SIGKILL");
          }
          resolve();
        }, 5000);

        this.process?.once("close", () => {
          clearTimeout(timeout);
          resolve();
        });
      });

      this.process = null;
    }
    this.status = { running: false, port: this.port };
  }

  getStatus(): OpenCodeStatus {
    return this.status;
  }

  getPort(): number {
    return this.port;
  }
}

export const opencodeProcess = new OpenCodeProcess();