// Define the structure of our translations
export interface LocaleDict {
  // Common
  common: {
    loading: string;
    cancel: string;
    save: string;
    delete: string;
    confirm: string;
    back: string;
    copied: string;
    showMore: string;
    showLess: string;
    showResults: string;
    hideResults: string;
    showDetails: string;
    hideDetails: string;
    showPreview: string;
    hidePreview: string;
    showContents: string;
    hideContents: string;
    showOutput: string;
    hideOutput: string;
    error: string;
    unknownProject: string;
  };

  // Login page
  login: {
    title: string;
    accessCode: string;
    placeholder: string;
    invalidCode: string;
    errorOccurred: string;
    verifying: string;
    connect: string;
  };

  // Chat page
  chat: {
    newSession: string;
    remoteAccess: string;
    settings: string;
    logout: string;
    startConversation: string;
    startConversationDesc: string;
    disclaimer: string;
  };

  // Settings page
  settings: {
    back: string;
    title: string;
    serverUrl: string;
    serverUrlDesc: string;
    testing: string;
    testConnection: string;
    connectionSuccess: string;
    connectionFailed: string;
    serverUrlEmpty: string;
    serverError: string;
    urlUpdated: string;
    saveFailed: string;
    saving: string;
    saveAndConnect: string;
    infoTitle: string;
    infoDefault: string;
    infoRemote: string;
    infoChange: string;
  };

  // Remote Access page
  remote: {
    title: string;
    publicAccess: string;
    publicAccessDesc: string;
    starting: string;
    startFailed: string;
    securityWarning: string;
    securityWarningDesc: string;
    accessPassword: string;
    connectionAddress: string;
    publicAddress: string;
    lanAddress: string;
    localAddress: string;
    lan: string;
    public: string;
    notConnected: string;
    publicQrScan: string;
    lanQrScan: string;
    publicQrDesc: string;
    lanQrDesc: string;
  };

  // Session Sidebar
  sidebar: {
    noSessions: string;
    newSession: string;
    deleteConfirm: string;
    deleteSession: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
    files: string;
  };

  // Prompt Input
  prompt: {
    normalMode: string;
    normal: string;
    buildMode: string;
    build: string;
    planMode: string;
    plan: string;
    placeholder: string;
    send: string;
  };

  // Model Selector
  model: {
    selectModel: string;
    noModels: string;
  };

  // Message Parts
  parts: {
    linkToMessage: string;
    thinking: string;
    attachment: string;
    creatingPlan: string;
    updatingPlan: string;
    completingPlan: string;
    match: string;
    matches: string;
    result: string;
    results: string;
  };
}

export const en: LocaleDict = {
  // Common
  common: {
    loading: "Loading...",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    confirm: "Confirm",
    back: "Back",
    copied: "Copied!",
    showMore: "Show more",
    showLess: "Show less",
    showResults: "Show results",
    hideResults: "Hide results",
    showDetails: "Show details",
    hideDetails: "Hide details",
    showPreview: "Show preview",
    hidePreview: "Hide preview",
    showContents: "Show contents",
    hideContents: "Hide contents",
    showOutput: "Show output",
    hideOutput: "Hide output",
    error: "Error",
    unknownProject: "Unknown Project",
  },

  // Login page
  login: {
    title: "OpenCode Remote",
    accessCode: "Access Code",
    placeholder: "Enter 6-digit code",
    invalidCode: "Invalid access code",
    errorOccurred: "An error occurred. Please try again.",
    verifying: "Verifying...",
    connect: "Connect",
  },

  // Chat page
  chat: {
    newSession: "New Session",
    remoteAccess: "Remote Access",
    settings: "Settings",
    logout: "Logout",
    startConversation: "Start a new conversation",
    startConversationDesc: "Select a model and type any question in the input box below to start chatting.",
    disclaimer: "AI-generated content may be inaccurate. Please verify important information.",
  },

  // Settings page
  settings: {
    back: "Back",
    title: "Connection Settings",
    serverUrl: "OpenCode Server URL",
    serverUrlDesc: "Enter the OpenCode server address you want to connect to (e.g., http://localhost:4096)",
    testing: "Testing...",
    testConnection: "Test Connection",
    connectionSuccess: "Connection test successful!",
    connectionFailed: "Failed to connect to server:",
    serverUrlEmpty: "Server URL cannot be empty",
    serverError: "Server returned error:",
    urlUpdated: "Server URL updated",
    saveFailed: "Save failed. Please check the URL format",
    saving: "Saving...",
    saveAndConnect: "Save & Connect",
    infoTitle: "Info",
    infoDefault: "Default address is usually /opencode-api (pointing to local proxy)",
    infoRemote: "If connecting to a remote server, make sure the network is reachable",
    infoChange: "After changing the address, chat history and session list will load from the new server",
  },

  // Remote Access page
  remote: {
    title: "Remote Access",
    publicAccess: "Public Remote Access",
    publicAccessDesc: "Access via Cloudflare tunnel from the internet",
    starting: "Starting tunnel, please wait...",
    startFailed: "Failed to start. Please ensure cloudflared is installed",
    securityWarning: "Security Warning:",
    securityWarningDesc: "Remote access allows full control of this device. Keep your access password safe and never share it with untrusted people.",
    accessPassword: "Access Password",
    connectionAddress: "Connection Address",
    publicAddress: "Public Address",
    lanAddress: "LAN Address",
    localAddress: "Local Address",
    lan: "LAN",
    public: "Public",
    notConnected: "Not Connected",
    publicQrScan: "Scan to access via public network",
    lanQrScan: "Scan to access via LAN",
    publicQrDesc: "Suitable for remote connections, may be slower",
    lanQrDesc: "Make sure your phone and computer are on the same Wi-Fi",
  },

  // Session Sidebar
  sidebar: {
    noSessions: "No sessions",
    newSession: "New session",
    deleteConfirm: "Are you sure you want to delete this session?",
    deleteSession: "Delete session",
    justNow: "just now",
    minutesAgo: "{count} min ago",
    hoursAgo: "{count}h ago",
    daysAgo: "{count}d ago",
    files: "{count} files",
  },

  // Prompt Input
  prompt: {
    normalMode: "Normal chat mode",
    normal: "Normal",
    buildMode: "Build mode - for building and coding tasks",
    build: "Build",
    planMode: "Plan mode - for planning and design tasks",
    plan: "Plan",
    placeholder: "Type a message...",
    send: "Send message",
  },

  // Model Selector
  model: {
    selectModel: "Select Model",
    noModels: "No models available. Please configure the server first",
  },

  // Message Parts
  parts: {
    linkToMessage: "Link to this message",
    thinking: "Thinking",
    attachment: "Attachment",
    creatingPlan: "Creating plan",
    updatingPlan: "Updating plan",
    completingPlan: "Completing plan",
    match: "{count} match",
    matches: "{count} matches",
    result: "{count} result",
    results: "{count} results",
  },
};
