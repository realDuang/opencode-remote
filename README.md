<div align="center">

# OpenCode Remote

**[English](./README.md)** | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md)

**Access OpenCode from Any Device, Anywhere**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![OpenCode](https://img.shields.io/badge/OpenCode-1.1.15+-green.svg)](https://opencode.ai)

<img src="https://opencode.ai/logo.svg" alt="OpenCode Remote" width="120" />

*Use your powerful workstation to run AI coding agents while accessing them from a tablet, phone, or any browser — even across the internet.*

</div>

---

## Why OpenCode Remote?

AI coding agents like OpenCode need to run on machines with:
- Access to your codebase and development environment
- Proper API keys and configurations
- Sufficient computing power

But what if you want to **use your phone on the couch**, **pair program from an iPad**, or **access your dev machine from anywhere in the world**?

**OpenCode Remote** solves this by providing a web interface that works from any device with a browser.

### Key Features

| Feature | Description |
|---------|-------------|
| **Remote Access from Any Terminal** | Access OpenCode through a clean web UI from phones, tablets, laptops — any device with a browser |
| **One-Click Public Tunnel** | Enable internet access with a single toggle using Cloudflare Tunnel — no port forwarding or VPN needed |
| **LAN Access** | Instantly accessible from any device on your local network |
| **QR Code Connection** | Scan to connect from mobile devices — no typing URLs |
| **Secure by Default** | Random 6-digit access codes for each session |
| **Real-time Streaming** | Live message streaming via Server-Sent Events |
| **Full Feature Parity** | All OpenCode features work seamlessly through the web UI |
| **Official OpenCode UI** | Access the complete OpenCode web app with full functionality |
| **Cross-Device Sync** | Seamlessly continue your work across multiple devices |

---

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 18+
- [OpenCode CLI](https://opencode.ai) installed

### Installation

```bash
# Clone the repository (with submodules)
git clone --recursive https://github.com/realDuang/opencode-remote.git
cd opencode-remote

# Install dependencies
bun install

# Build the Official OpenCode App (first time only)
bun run build:official-app

# Start the application
bun run start
```

> **Note**: If you cloned without `--recursive`, run `git submodule update --init` to initialize the OpenCode submodule.

### What Happens

1. A random **6-digit access code** is generated and displayed in terminal
2. OpenCode server starts on port `4096`
3. Web UI starts on port `5174`
4. Open `http://localhost:5174` and enter the access code

```
============================================================
Starting OpenCode Remote
============================================================

Access Code: 847291

Starting OpenCode Server...
Starting Web UI...

============================================================
All services started!
Web UI: http://localhost:5174
Use code: 847291
============================================================
```

---

## Two UI Options

OpenCode Remote provides two ways to access OpenCode:

### 1. Simple Chat UI (Default)

A lightweight, mobile-friendly chat interface optimized for quick interactions. Access it at the root URL after login.

### 2. Official OpenCode UI

The complete OpenCode web application with all features. Click the **"Official UI"** button in the top-right corner of the Chat page to access it.

| Feature | Simple Chat UI | Official OpenCode UI |
|---------|----------------|---------------------|
| Mobile-optimized | ✅ | ⚠️ Desktop-focused |
| Full feature set | Basic chat | ✅ Complete |
| Cross-device sync | ✅ | ✅ |
| Lightweight | ✅ | Heavier |

**Cross-Device Sync**: Your session state (current project, layout preferences) automatically syncs across all your devices.

---

## Remote Access Guide

### Method 1: LAN Access (Same Network)

Access from any device on your local network:

1. Find your machine's IP address (shown in the Remote Access page)
2. Open `http://<your-ip>:5174` from another device
3. Enter the 6-digit access code

**Or scan the QR code** displayed on the Remote Access page.

### Method 2: Public Internet Access

Access from anywhere in the world with Cloudflare Tunnel:

1. Install `cloudflared` (run `bun run setup` for guided installation)
2. Go to **Settings** → **Remote Access** in the web UI
3. Toggle on **"Public Access"**
4. Share the generated `*.trycloudflare.com` URL

**No port forwarding, no firewall changes, no VPN required.**

```
┌──────────────────────────────────────────────────────────┐
│                    Your Phone/Tablet                      │
│                          ↓                                │
│              https://xyz.trycloudflare.com                │
│                          ↓                                │
│                  Cloudflare Network                       │
│                          ↓                                │
│              Your Workstation (OpenCode)                  │
└──────────────────────────────────────────────────────────┘
```

---

## Use Cases

### Work from Anywhere
Run OpenCode on your powerful desktop, control it from your laptop at a coffee shop.

### Mobile Coding Assistant
Get AI help on your phone while reviewing code on paper or whiteboard.

### Pair Programming
Share the public URL with a colleague for real-time collaboration.

### Home Server Setup
Run on a home server, access from any device in your house.

---

## Security

OpenCode Remote uses multiple layers of security:

| Layer | Protection |
|-------|------------|
| **Access Code** | Random 6-digit code required for each session |
| **Token Auth** | JWT-like tokens stored in localStorage after login |
| **HTTPS** | Public tunnel automatically uses HTTPS via Cloudflare |
| **Ephemeral URLs** | Public tunnel URLs change each time you start the tunnel |

**Best Practices:**
- Don't share your access code publicly
- Disable public tunnel when not needed
- Use for personal use only — not designed for multi-user scenarios

---

## Development

### Commands

```bash
# Start everything (OpenCode server + Web UI)
bun run start

# Development mode (Web UI only, requires manual OpenCode server)
bun run dev

# Install optional dependencies (cloudflared, etc.)
bun run setup

# Build for production
bun run build

# Build/rebuild the Official OpenCode App
bun run build:official-app

# Update OpenCode submodule and rebuild Official App
bun run update:official-app

# Type checking
bunx tsc --noEmit
```

### Project Structure

```
opencode-remote/
├── src/
│   ├── pages/           # Page components (Chat, Login, Settings, RemoteAccess, OfficialApp)
│   ├── components/      # UI components
│   ├── lib/             # Core libraries (API client, auth, i18n, storage-sync)
│   ├── stores/          # State management
│   └── types/           # TypeScript definitions
├── scripts/
│   ├── start.ts         # Startup script
│   ├── setup.ts         # Dependency setup
│   └── build-official-app.ts  # Official App build script
├── opencode/            # OpenCode submodule (for Official App)
└── vite.config.ts       # Vite config with auth middleware
```

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | SolidJS |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Package Manager | Bun |
| Tunnel | Cloudflare Tunnel |

---

## Troubleshooting

### OpenCode CLI not found

```bash
# Run the setup script for guided installation
bun run setup

# Or install manually:
# macOS/Linux
curl -fsSL https://opencode.ai/install.sh | bash

# Windows
irm https://opencode.ai/install.ps1 | iex
```

### Port already in use

```bash
# Kill process on port 5174
lsof -ti:5174 | xargs kill -9

# Or change port in vite.config.ts
```

### Public tunnel not working

1. Ensure `cloudflared` is installed: `bun run setup`
2. Check your internet connection
3. Try restarting the tunnel from the Remote Access page

### Official App not loading

1. Ensure the submodule is initialized: `git submodule update --init`
2. Build the Official App: `bun run build:official-app`
3. If the build fails, check that `bun` is installed and try again

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

### Code Style
- TypeScript strict mode
- SolidJS reactive patterns
- Tailwind for styling

### Commit Convention
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `refactor:` Code refactoring

---

## License

[MIT](LICENSE)

---

## Links

- [OpenCode](https://opencode.ai) — The AI coding agent
- [Documentation](https://opencode.ai/docs) — OpenCode documentation
- [Issues](https://github.com/realDuang/opencode-remote/issues) — Report bugs or request features

---

<div align="center">

**Built with [OpenCode](https://opencode.ai) and [SolidJS](https://solidjs.com)**

</div>
