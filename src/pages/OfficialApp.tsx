import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import { Auth } from "../lib/auth";
import { useI18n } from "../lib/i18n";
import { logger } from "../lib/logger";

/**
 * OfficialApp - Embeds the official OpenCode App UI via iframe
 *
 * The official app is built from the submodule and served at /opencode-app/
 * It connects to the same OpenCode server (port 4096) through the Vite proxy
 */
export default function OfficialApp() {
  const { t } = useI18n();
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [storageReady, setStorageReady] = createSignal(false);
  const [iframeSrc, setIframeSrc] = createSignal<string | null>(null);

  createEffect(() => {
    if (!Auth.isAuthenticated()) {
      logger.debug("[OfficialApp] Not authenticated, redirecting to entry");
      window.location.href = "/";
    }
  });

  // Sync storage from server BEFORE loading iframe
  // Since parent and iframe share localStorage (same origin), we populate it first
  createEffect(() => {
    const token = Auth.getToken();
    if (!token) return;

    console.log("[OfficialApp] Syncing storage from server...");
    fetch("/api/storage", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (data && typeof data === "object" && !data.error) {
          const keys = Object.keys(data);
          console.log("[OfficialApp] Received", keys.length, "keys from server");
          
          // Check the critical project key
          const projectKey = "opencode.global.dat:globalSync.project";
          if (data[projectKey]) {
            console.log("[OfficialApp] Project data from API:", data[projectKey].substring(0, 200));
          }
          
          // Write all keys to localStorage
          Object.entries(data).forEach(([key, value]) => {
            if (typeof value === "string") {
              localStorage.setItem(key, value);
            }
          });
          
          // Verify the write
          const writtenValue = localStorage.getItem(projectKey);
          console.log("[OfficialApp] After write, localStorage has project data:", writtenValue ? "yes" : "no");
          console.log("[OfficialApp] Storage synced:", keys.length, "keys");
          
          // Force a small delay to ensure localStorage writes are flushed
          // This helps because the iframe's JS might start executing in the same tick
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        console.log("[OfficialApp] Setting storageReady to true");
        setStorageReady(true);
        // Set iframe src with timestamp to ensure fresh load
        setIframeSrc(`/opencode-app/?_t=${Date.now()}`);
      })
      .catch((err) => {
        console.error("[OfficialApp] Failed to sync storage:", err);
        setStorageReady(true); // Continue anyway
        setIframeSrc(`/opencode-app/?_t=${Date.now()}`);
      });
  });

  // Intercept localStorage writes and sync to server
  // Also poll for changes made by iframe (since we can't intercept iframe's localStorage calls)
  createEffect(() => {
    if (!storageReady()) return;

    const token = Auth.getToken();
    if (!token) return;

    const originalSetItem = localStorage.setItem.bind(localStorage);
    const originalRemoveItem = localStorage.removeItem.bind(localStorage);

    // Track last known values to detect changes
    const lastKnownValues = new Map<string, string>();
    
    // Initialize with current values
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("opencode.")) {
        const value = localStorage.getItem(key);
        if (value) lastKnownValues.set(key, value);
      }
    }

    // Sync a key to server
    const syncToServer = (key: string, value: string) => {
      logger.debug("[OfficialApp] Syncing to server:", key, "length:", value.length);
      fetch(`/api/storage/${encodeURIComponent(key)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      }).catch((err) => logger.error("[OfficialApp] Failed to sync:", err));
    };

    // Intercept parent window localStorage writes
    localStorage.setItem = function (key: string, value: string) {
      originalSetItem(key, value);
      if (key.startsWith("opencode.")) {
        lastKnownValues.set(key, value);
        syncToServer(key, value);
      }
    };

    localStorage.removeItem = function (key: string) {
      originalRemoveItem(key);
      if (key.startsWith("opencode.")) {
        lastKnownValues.delete(key);
        fetch(`/api/storage/${encodeURIComponent(key)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }).catch((err) => logger.error("[OfficialApp] Failed to sync removeItem:", err));
      }
    };

    // Poll for changes made by iframe (every 2 seconds)
    const pollInterval = setInterval(() => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith("opencode.")) continue;
        
        const currentValue = localStorage.getItem(key);
        if (!currentValue) continue;
        
        const lastValue = lastKnownValues.get(key);
        if (currentValue !== lastValue) {
          logger.debug("[OfficialApp] Detected change in:", key);
          lastKnownValues.set(key, currentValue);
          syncToServer(key, currentValue);
        }
      }
      
      // Check for deleted keys
      for (const key of lastKnownValues.keys()) {
        if (localStorage.getItem(key) === null) {
          logger.debug("[OfficialApp] Detected deletion of:", key);
          lastKnownValues.delete(key);
          fetch(`/api/storage/${encodeURIComponent(key)}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }).catch((err) => logger.error("[OfficialApp] Failed to sync delete:", err));
        }
      }
    }, 2000);

    onCleanup(() => {
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
      clearInterval(pollInterval);
    });
  });

  function handleIframeLoad() {
    setLoading(false);
    logger.debug("[OfficialApp] Iframe loaded successfully");
    
    // Debug: Check if iframe can access localStorage
    try {
      const iframe = document.querySelector('iframe');
      if (iframe?.contentWindow) {
        const iframeStorage = iframe.contentWindow.localStorage;
        
        // Check project data (the critical key for showing projects)
        const projectKey = "opencode.global.dat:globalSync.project";
        const projectData = iframeStorage.getItem(projectKey);
        console.log("[OfficialApp] Iframe localStorage project data:", projectData ? "exists" : "MISSING");
        if (projectData) {
          try {
            const parsed = JSON.parse(projectData);
            console.log("[OfficialApp] Iframe project count:", parsed?.value?.length ?? 0);
          } catch (e) {
            console.log("[OfficialApp] Failed to parse project data");
          }
        }
        
        // Check server data
        const serverKey = "opencode.global.dat:server";
        const serverData = iframeStorage.getItem(serverKey);
        console.log("[OfficialApp] Iframe localStorage server data:", serverData ? "exists" : "MISSING");
        
        // List all opencode keys
        const allKeys: string[] = [];
        for (let i = 0; i < iframeStorage.length; i++) {
          const key = iframeStorage.key(i);
          if (key?.startsWith("opencode.")) {
            allKeys.push(key);
          }
        }
        console.log("[OfficialApp] All opencode keys in iframe:", allKeys);
      }
    } catch (err) {
      console.error("[OfficialApp] Cannot access iframe localStorage:", err);
    }
  }

  function handleIframeError() {
    setLoading(false);
    setError("Failed to load official app. Run: bun run build:official-app");
    logger.error("[OfficialApp] Failed to load iframe");
  }

  // Check if official app exists
  createEffect(() => {
    fetch("/opencode-app/index.html", { method: "HEAD" })
      .then((res) => {
        if (!res.ok) {
          setError("Official app not built. Run: bun run build:official-app");
          setLoading(false);
        }
      })
      .catch(() => {
        setError("Official app not built. Run: bun run build:official-app");
        setLoading(false);
      });
  });

  return (
    <div class="h-screen w-screen flex flex-col bg-zinc-950">
      {/* Header bar with back button */}
      <div class="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
        <div class="flex items-center gap-3">
          <a
            href="/chat"
            class="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="text-sm">{t().common.back || "Back"}</span>
          </a>
          <span class="text-zinc-600">|</span>
          <span class="text-zinc-300 text-sm font-medium">
            OpenCode Official UI
          </span>
        </div>
        <div class="flex items-center gap-2">
          <a
            href="/chat"
            class="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors"
          >
            Simple UI
          </a>
        </div>
      </div>

      {/* Main content area */}
      <div class="flex-1 relative">
        {/* Loading indicator */}
        <Show when={loading()}>
          <div class="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
            <div class="flex flex-col items-center gap-4">
              <div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span class="text-zinc-400 text-sm">{t().common.loading}</span>
            </div>
          </div>
        </Show>

        {/* Error state */}
        <Show when={error()}>
          <div class="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
            <div class="flex flex-col items-center gap-4 max-w-md text-center px-6">
              <div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-8 w-8 text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <p class="text-zinc-300">{error()}</p>
              <div class="flex gap-3">
                <a
                  href="/chat"
                  class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                >
                  Use Simple UI
                </a>
                <button
                  onClick={() => window.location.reload()}
                  class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </Show>

        {/* Iframe for official app - only load after storage is synced */}
        <Show when={!error() && iframeSrc()}>
          <iframe
            src={iframeSrc()!}
            class="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="OpenCode Official App"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        </Show>
      </div>
    </div>
  );
}
