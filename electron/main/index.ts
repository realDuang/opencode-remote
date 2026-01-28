import { app, BrowserWindow } from "electron";
import { createWindow, getMainWindow } from "./window-manager";
import { registerIpcHandlers } from "./ipc-handlers";
import { opencodeProcess } from "./services/opencode-process";
import { deviceStore } from "./services/device-store";
import { authApiServer } from "./services/auth-api-server";
import { productionServer } from "./services/production-server";

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

// Track if we're already quitting to prevent double cleanup
let isQuitting = false;

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    const mainWindow = getMainWindow();
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    // Initialize DeviceStore (needs to be after app ready)
    deviceStore.init();

    // Register IPC handlers
    registerIpcHandlers();

    // In dev mode, start internal Auth API server
    // Vite middleware will proxy requests to this server
    if (!app.isPackaged) {
      try {
        await authApiServer.start();
      } catch (err) {
        console.error("[Main] Failed to start Auth API server:", err);
      }
    } else {
      // In production mode, start the production HTTP server
      // This is required for Cloudflare Tunnel to work
      try {
        const port = await productionServer.start(5173);
        console.log(`[Main] Production server started on port ${port}`);
      } catch (err) {
        console.error("[Main] Failed to start Production server:", err);
      }
    }

    // Start OpenCode service
    try {
      await opencodeProcess.start();
    } catch (err) {
      console.error("Failed to start OpenCode service:", err);
    }

    // Create main window
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  // On non-macOS platforms, quit when all windows are closed
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  // Cleanup before app quits
  app.on("will-quit", async (event) => {
    if (isQuitting) return;
    isQuitting = true;

    event.preventDefault();

    try {
      await Promise.all([
        authApiServer.stop(),
        opencodeProcess.stop(),
        productionServer.stop()
      ]);
    } catch (err) {
      console.error("[Main] Cleanup error:", err);
    }

    app.exit(0);
  });
}