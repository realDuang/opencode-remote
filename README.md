# OpenCode Remote

A standalone web interface for OpenCode with random access code authentication.

## Overview

OpenCode Remote provides a clean, modern web UI for interacting with OpenCode through your browser. It runs locally, automatically starts an OpenCode server, and provides secure access through a randomly generated 6-digit code.

## Features

- 🔐 **Secure Authentication** - Random 6-digit access codes for each session
- 💬 **Real-time Chat** - Live message streaming via Server-Sent Events
- 📁 **Session Management** - Create, switch, and manage multiple chat sessions
- 🎨 **Syntax Highlighting** - Beautiful code display with Shiki
- 📝 **Markdown Support** - Rich text formatting with marked
- 🔄 **Code Diffs** - Visual code change comparisons
- 🌓 **Theme Support** - Dark and light mode compatible
- 🌐 **Internationalization** - English and Simplified Chinese support
- ⚡ **Fast & Responsive** - Built with SolidJS for optimal performance

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 18+
- OpenCode installed and available in your PATH

### 1. Install Dependencies

```bash
bun install
```

### 2. Start the Application

```bash
bun run start
```

This will:

1. Generate a random 6-digit access code
2. Save it to `.auth-code` file
3. Start the OpenCode server on port 4096
4. Start the web UI on port 5174
5. Display the access code in the terminal

### 3. Access the Web UI

1. Open your browser and navigate to: `http://localhost:5174`
2. Enter the 6-digit access code shown in the terminal
3. Start chatting with OpenCode!

## Development

### Run Web UI Only

If you want to run the OpenCode server separately:

```bash
bun run dev
```

This starts only the Vite dev server on port 5174.

### Build for Production

```bash
bun run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
bun run preview
```

### Type Checking

```bash
bunx tsc --noEmit
```

## Project Structure

```
opencode-remote/
├── src/
│   ├── pages/                  # Page components
│   │   ├── Login.tsx          # Login with access code
│   │   ├── Chat.tsx           # Main chat interface
│   │   ├── Settings.tsx       # Settings page
│   │   └── RemoteAccess.tsx   # Remote access configuration
│   ├── components/            # Reusable UI components
│   │   ├── SessionSidebar.tsx # Session list sidebar
│   │   ├── MessageList.tsx    # Message display
│   │   ├── PromptInput.tsx    # User input box
│   │   ├── ModelSelector.tsx  # Model selection dropdown
│   │   ├── LanguageSwitcher.tsx # Language switcher
│   │   └── share/             # Message content renderers
│   │       ├── part.tsx       # Part component router
│   │       ├── content-text.tsx
│   │       ├── content-markdown.tsx
│   │       ├── content-code.tsx
│   │       ├── content-diff.tsx
│   │       ├── content-bash.tsx
│   │       ├── content-error.tsx
│   │       └── icons/         # Icon components
│   ├── lib/                   # Core libraries
│   │   ├── auth.ts           # Authentication logic
│   │   ├── opencode-client.ts # OpenCode API client
│   │   └── i18n.tsx          # Internationalization provider
│   ├── locales/              # Translation files
│   │   ├── en.ts             # English translations
│   │   └── zh-CN.ts          # Simplified Chinese translations
│   ├── stores/               # State management (SolidJS stores)
│   │   ├── session.ts        # Session state
│   │   ├── message.ts        # Message state
│   │   └── config.ts         # Configuration state
│   ├── types/                # TypeScript type definitions
│   │   └── opencode.ts       # OpenCode API types
│   ├── App.tsx               # Root component with routing
│   └── main.tsx              # Application entry point
├── scripts/
│   └── start.ts              # Startup script (generate code + start servers)
├── vite.config.ts            # Vite config with auth middleware
├── tailwind.config.js        # Tailwind CSS configuration
└── package.json              # Dependencies and scripts
```

## Architecture

### Authentication Flow

1. **Access Code Generation**: `scripts/start.ts` generates a random 6-digit code
2. **Code Verification**: User enters code via `Login.tsx`
3. **Token Exchange**: Vite middleware (`vite.config.ts`) validates code and returns a JWT-like token
4. **Token Storage**: Token stored in `localStorage` for session persistence
5. **Authenticated Access**: All subsequent requests include the token

### Data Flow

```
User Input (Chat.tsx)
    ↓
OpenCode API Client (opencode-client.ts)
    ↓
REST API → OpenCode Server (port 4096)
    ↓
SSE Stream ← OpenCode Server
    ↓
Event Handler (handleSSEEvent)
    ↓
State Update (SolidJS Store)
    ↓
UI Re-render (Reactive)
```

### API Communication

- **REST API**: Used for session/message CRUD operations
- **SSE (Server-Sent Events)**: Used for real-time message streaming
- **Proxy**: Vite proxies `/opencode-api/*` to `http://localhost:4096/*`

### State Management

Uses SolidJS reactive stores:

- **Session Store**: Manages session list, current session, loading state
- **Message Store**: Nested structure `bySession[sessionId][messageId]` for efficient message caching

## Tech Stack

| Category              | Technology      | Version  |
| --------------------- | --------------- | -------- |
| **Framework**         | SolidJS         | ^1.9.3   |
| **Build Tool**        | Vite            | ^5.4.21  |
| **Router**            | @solidjs/router | ^0.14.12 |
| **Styling**           | Tailwind CSS    | ^3.4.0   |
| **Language**          | TypeScript      | ^5.6.3   |
| **Package Manager**   | Bun             | Latest   |
| **Code Highlighting** | Shiki           | ^1.24.2  |
| **Markdown**          | Marked          | ^15.0.4  |
| **Date/Time**         | Luxon           | ^3.5.0   |
| **Diff**              | diff            | ^7.0.0   |
| **i18n**              | @solid-primitives/i18n | ^2.2.1   |

## Configuration

### Language / 语言

OpenCode Remote supports English and Simplified Chinese. The application automatically detects your browser language. You can manually switch languages using the language selector in the top-right corner of any page.

OpenCode Remote 支持英文和简体中文。应用会自动检测您的浏览器语言。您也可以在任何页面右上角使用语言选择器手动切换语言。

**Available Languages / 可用语言:**
- English (en)
- 简体中文 (zh-CN)

The language preference is saved in `localStorage` and persists across sessions.

语言偏好保存在 `localStorage` 中，并在会话之间保持不变。

### Port Configuration

Edit `vite.config.ts` and `scripts/start.ts` to change ports:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 5174, // Web UI port
    proxy: {
      "/opencode-api": {
        target: "http://localhost:4096", // OpenCode server port
      },
    },
  },
});
```

### Tailwind Configuration

Customize theme in `tailwind.config.js`:

```javascript
export default {
  theme: {
    extend: {
      // Your custom theme
    },
  },
};
```

## Troubleshooting

### Port Already in Use

**Problem**: Port 5174 or 4096 is already occupied.

**Solution**:

1. Kill the process using the port: `lsof -ti:5174 | xargs kill -9`
2. Or change the port in `vite.config.ts` and `scripts/start.ts`

### Dependencies Issues

**Problem**: Module not found or version conflicts.

**Solution**:

```bash
rm -rf node_modules bun.lockb
bun install
```

### OpenCode Server Not Starting

**Problem**: OpenCode server fails to start.

**Solution**:

1. Ensure OpenCode is installed: `which opencode`
2. Check OpenCode version: `opencode --version`
3. Manually start OpenCode: `opencode server --port 4096`

### SSE Connection Failed

**Problem**: Messages not updating in real-time.

**Solution**:

1. Check browser console for SSE errors
2. Verify OpenCode server is running on port 4096
3. Check Vite proxy configuration in `vite.config.ts`
4. Look for `[SSE Client]` logs in browser console

### Build Errors

**Problem**: TypeScript or build errors.

**Solution**:

```bash
# Check TypeScript errors
bunx tsc --noEmit

# Clear cache and rebuild
rm -rf dist .vite
bun run build
```

## API Reference

### OpenCode Client (`src/lib/opencode-client.ts`)

#### Session Methods

```typescript
// List all sessions
listSessions(): Promise<Session.Info[]>

// Create a new session
createSession(title?: string): Promise<Session.Info>

// Delete a session
deleteSession(id: string): Promise<void>

// Get session details
getSession(id: string): Promise<Session.Info>
```

#### Message Methods

```typescript
// Send a message
sendMessage(sessionId: string, text: string): Promise<void>

// Get all messages in a session
getMessages(sessionId: string): Promise<MessageV2.Info[]>

// Get message parts (if needed separately)
getMessageParts(sessionId: string, messageId: string): Promise<MessageV2.Part[]>
```

#### SSE Connection

```typescript
// Connect to SSE stream
connectSSE(onEvent: (event: { type: string; data: any }) => void): () => void
```

**Event Types**:

- `message.part.updated`: New message content
- `session.updated`: Session metadata changed
- `session.created`: New session created
- `message.updated`: Message metadata changed

## Contributing

### Code Style

- Use TypeScript strict mode
- Follow SolidJS reactive patterns
- Use Tailwind for styling (no custom CSS unless necessary)
- Prefer `createMemo` for computed values
- Use `createStore` for complex state

### Commit Guidelines

- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Keep commits focused and atomic
- Write clear commit messages

## Documentation

- **AGENTS.md**: Comprehensive guide for AI agents and developers
- **README.md**: This file - user-facing documentation

## License

MIT

## Support

For issues and questions:

- Check the [Troubleshooting](#troubleshooting) section
- Review [AGENTS.md](./AGENTS.md) for detailed architecture
- Open an issue on GitHub

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-13  
**Compatible with**: OpenCode 1.1.15+
