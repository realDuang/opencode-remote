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

  createEffect(() => {
    if (!Auth.isAuthenticated()) {
      logger.debug("[OfficialApp] Not authenticated, redirecting to entry");
      window.location.href = "/";
    }
  });

  function handleIframeLoad() {
    setLoading(false);
    logger.debug("[OfficialApp] Iframe loaded successfully");
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

        {/* Iframe for official app */}
        <Show when={!error()}>
          <iframe
            src="/opencode-app/"
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
