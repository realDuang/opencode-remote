import { Router, Route } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";
import { Auth } from "./lib/auth";
import { I18nProvider } from "./lib/i18n";
import { logger } from "./lib/logger";
import EntryPage from "./pages/EntryPage";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import Devices from "./pages/Devices";
import { AccessRequestNotification } from "./components/AccessRequestNotification";

function App() {
  logger.debug("🎨 App component rendering");
  logger.debug("🔐 Is authenticated:", Auth.isAuthenticated());

  return (
    <I18nProvider>
      <AccessRequestNotification />
      <Router>
        <Route path="/" component={EntryPage} />
        <Route
          path="/login"
          component={() => {
            window.location.href = "/";
            return null;
          }}
        />
        <Route
          path="/remote"
          component={() => {
            // Redirect /remote to / (EntryPage handles remote config for localhost)
            // Remote users should not access this route at all
            const [isLocal, setIsLocal] = createSignal<boolean | null>(null);

            createEffect(() => {
              Auth.isLocalAccess().then((local) => {
                setIsLocal(local);
                if (!local) {
                  // Remote users: redirect to chat (deny access to config)
                  logger.debug("[Remote Route] Remote user, redirecting to /chat");
                  window.location.href = "/chat";
                } else {
                  // Localhost users: redirect to / (EntryPage shows config)
                  logger.debug("[Remote Route] Localhost user, redirecting to /");
                  window.location.href = "/";
                }
              });
            });

            // Show loading while checking
            return (
              <Show when={isLocal() === null}>
                <div class="min-h-screen flex items-center justify-center bg-zinc-950">
                  <div class="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </Show>
            );
          }}
        />
        <Route path="/settings" component={Settings} />
        <Route path="/devices" component={Devices} />
        <Route
          path="/chat"
          component={() => {
            createEffect(() => {
              if (!Auth.isAuthenticated()) {
                logger.debug("❌ Not authenticated, redirecting to entry");
                window.location.href = "/";
              } else {
                logger.debug("✅ Authenticated, showing chat");
              }
            });
            return <Chat />;
          }}
        />
      </Router>
    </I18nProvider>
  );
}

export default App;
