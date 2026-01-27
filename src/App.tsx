import { Router, HashRouter, Route, useNavigate, Navigate } from "@solidjs/router";
import { createEffect, onMount, type ParentComponent } from "solid-js";
import { Auth } from "./lib/auth";
import { I18nProvider } from "./lib/i18n";
import { logger } from "./lib/logger";
import { initElectronTitleBar, isElectron } from "./lib/platform";
import "./lib/theme";
import EntryPage from "./pages/EntryPage";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import Devices from "./pages/Devices";
import { AccessRequestNotification } from "./components/AccessRequestNotification";

// Use HashRouter for Electron (file:// protocol) and regular Router for web
// HashRouter uses URL hashes (#/path) which work with file:// protocol
const AppRouter: ParentComponent = (props) => {
  // In production Electron, use HashRouter for file:// protocol compatibility
  if (isElectron() && window.location.protocol === "file:") {
    return <HashRouter>{props.children}</HashRouter>;
  }
  return <Router>{props.children}</Router>;
};

// Redirect component for /login route
function LoginRedirect() {
  return <Navigate href="/" />;
}

// Redirect component for /remote route
function RemoteRedirect() {
  if (isElectron()) {
    logger.debug("[Remote Route] Electron host, redirecting to /");
    return <Navigate href="/" />;
  }
  // Web clients: redirect to chat if authenticated, else to /
  if (Auth.isAuthenticated()) {
    logger.debug("[Remote Route] Web client authenticated, redirecting to /chat");
    return <Navigate href="/chat" />;
  }
  logger.debug("[Remote Route] Web client not authenticated, redirecting to /");
  return <Navigate href="/" />;
}

// Protected chat route component
function ChatRoute() {
  const navigate = useNavigate();

  createEffect(() => {
    if (!Auth.isAuthenticated()) {
      logger.debug("❌ Not authenticated, redirecting to entry");
      navigate("/", { replace: true });
    } else {
      logger.debug("✅ Authenticated, showing chat");
    }
  });

  return <Chat />;
}

function App() {
  logger.debug("🎨 App component rendering");
  logger.debug("🔐 Is authenticated:", Auth.isAuthenticated());

  // Initialize Electron title bar safe area on mount
  onMount(() => {
    initElectronTitleBar();
  });

  return (
    <I18nProvider>
      <AccessRequestNotification />
      <AppRouter>
        <Route path="/" component={EntryPage} />
        <Route path="/login" component={LoginRedirect} />
        <Route path="/remote" component={RemoteRedirect} />
        <Route path="/settings" component={Settings} />
        <Route path="/devices" component={Devices} />
        <Route path="/chat" component={ChatRoute} />
      </AppRouter>
    </I18nProvider>
  );
}

export default App;
