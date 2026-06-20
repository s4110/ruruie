# ruruie - Project Documentation

## Project Overview

**ruruie** is a web application built with SolidJS and Nostr protocol integration. This is a modern, reactive single-page application using the latest web technologies.

### Application Purpose

The goal of this application is to create a **high-performance, X (Twitter-like) client using the Nostr protocol**.

**Key Objectives:**
- **High Efficiency**: Optimized rendering and data handling
- **Excellent Performance**: Fast load times, smooth interactions, minimal lag
- **Nostr-Native**: Full utilization of the decentralized Nostr protocol
- **Modern UX**: Responsive, intuitive interface comparable to mainstream social platforms

**Performance Priorities:**
1. Fast initial load and time-to-interactive
2. Smooth scrolling and infinite feeds
3. Efficient relay connection management
4. Optimized event caching and deduplication
5. Minimal bundle size
6. Responsive UI updates

**Technical Approach:**
- Leverage SolidJS's fine-grained reactivity for minimal re-renders
- Use virtual scrolling for large feeds (@tanstack/solid-virtual)
- Implement smart relay subscription strategies
- Optimize Nostr event processing
- Apply performance best practices throughout

## Communication Guidelines for AI Assistants

**IMPORTANT: Language Usage Rules**

When working on this project, AI assistants must follow these language conventions:

- **Internal Thinking/Reasoning**: Use English for all internal processing, analysis, and technical reasoning
- **User Communication**: Use Japanese (日本語) for all direct communication with users

This ensures:
- Technical accuracy and clarity in internal processing
- Natural, accessible communication in the user's preferred language
- Consistency across all AI interactions in this project

**Example:**
```
[Internal reasoning in English: "I need to update the signal pattern..."]
User response: 「シグナルのパターンを更新しました。」
```

## MCP Tool Usage Guidelines

**IMPORTANT: Efficient Tool Selection**

This project has MCP (Model Context Protocol) servers configured. AI assistants must use the appropriate tools for different tasks:

### 1. Project Structure Investigation

**ALWAYS use codegraph MCP first** when:
- Exploring the codebase structure
- Finding where specific functionality is implemented
- Understanding code dependencies
- Analyzing component relationships
- Mapping out the project architecture

**Why codegraph:**
- Specifically designed for code analysis
- Provides graph-based code understanding
- More accurate for codebase navigation
- Faster for structural queries

**Example queries for codegraph:**
- "Show me all components that use Nostr events"
- "Map the dependency graph for the feed feature"
- "Find all files that import from shared/nostr"

### 2. Package Documentation & Behavior

**Use deepwiki MCP** when:
- Investigating package APIs and documentation
- Understanding library behavior and usage patterns
- Learning about framework features (SolidJS, Nostr tools, etc.)
- Checking compatibility or version-specific features
- Looking up best practices from official docs

**Why deepwiki:**
- Access to Wikipedia and web documentation
- Can fetch official package documentation
- Provides context on library concepts
- Helps understand third-party tools

**Example queries for deepwiki:**
- "How does SolidJS createEffect work?"
- "What are the nostr-tools finalizeEvent parameters?"
- "Tailwind CSS v4 migration guide"

### 3. Tool Selection Priority

```
Task: "Find where relay connections are managed"
→ Use: codegraph (codebase structure)

Task: "How do I use Relay.connect from nostr-tools?"
→ Use: deepwiki (package documentation)

Task: "What components depend on the relay manager?"
→ Use: codegraph (code dependencies)

Task: "What's the difference between createSignal and createStore?"
→ Use: deepwiki (framework concepts)
```

### 4. Combined Usage

For complex tasks, use both strategically:

1. **Use deepwiki** to understand the concept/API
2. **Use codegraph** to find implementation in the codebase
3. Synthesize both for comprehensive understanding

**Example workflow:**
```
Task: "Implement Nostr event subscription"

Step 1: deepwiki → "How does nostr-tools subscription API work?"
Step 2: codegraph → "Are there existing subscription patterns in the codebase?"
Step 3: Implement using learned API + existing patterns
```

### 5. When NOT to Use MCP

**Use standard tools instead:**
- Reading specific files → Use Read tool
- Searching for exact text → Use Grep tool
- File pattern matching → Use Glob tool
- Running commands → Use Bash tool

MCP tools are for higher-level understanding, not basic file operations.

## Tech Stack

### Core Framework
- **SolidJS** (v1.9.12) - Reactive UI framework
- **TypeScript** (v6.0.2) - Type-safe development
- **Vite** (v8.0.12) - Build tool and dev server

### Styling
- **Tailwind CSS** (v4.3.1) - Utility-first CSS framework
- **@tailwindcss/vite** (v4.3.1) - Tailwind v4 Vite plugin

### Key Dependencies
- **nostr-tools** (v2.23.5) - Nostr protocol implementation
- **@solidjs/router** (v0.16.1) - Client-side routing for SolidJS
- **@tanstack/solid-virtual** (v3.13.29) - Virtualization for large lists

### Development Tools
- **Biome** (v2.5.0) - Linter and formatter
- **pnpm** - Package manager

## Project Structure

<!-- UPDATED: 2026-06-20 - Established directory structure architecture -->

### Root Structure

```
ruruie/
├── .agents/                # Agent definitions for AI assistants
├── .claude/                # Claude Code configuration
│   ├── commands/          # Custom slash commands
│   └── mcp_settings.json  # MCP server settings (deepwiki, codegraph)
├── .vscode/               # VSCode settings
├── public/                # Static assets
├── src/                   # Source code (see detailed structure below)
├── index.html             # HTML entry point
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration (composite)
├── tsconfig.app.json      # App TypeScript config
├── tsconfig.node.json     # Node/Vite TypeScript config
├── biome.json             # Biome linter/formatter config
├── package.json           # Project dependencies and scripts
├── pnpm-lock.yaml         # Lock file
└── AGENT.md               # This file - project documentation
```

### Source Code Structure (`src/`)

**Architecture Decision: Simple Feature-Based Structure**

This project uses a simple, feature-based directory structure optimized for early-stage development. We explicitly avoid over-engineering with FSD (Feature-Sliced Design) or other complex architectures at this stage.

```
src/
├── features/              # Feature modules (create as needed)
│   ├── feed/             # Example: Feed feature
│   ├── profile/          # Example: Profile feature
│   └── messages/         # Example: Messages feature
├── shared/               # Shared code across features
│   ├── ui/              # Reusable UI components
│   ├── nostr/           # Nostr-specific utilities & hooks
│   │   ├── relays.ts   # Relay connection management
│   │   ├── events.ts   # Event creation & validation
│   │   ├── keys.ts     # Key management
│   │   └── hooks/      # Nostr-related hooks
│   └── lib/             # General utilities (non-Nostr)
├── App.tsx              # Main App component
└── index.tsx            # Application entry point
```

### Architecture Principles

1. **YAGNI (You Aren't Gonna Need It)**
   - Don't create directories until needed
   - Start simple, evolve as patterns emerge
   - Avoid premature optimization

2. **Feature Organization**
   - Each feature is self-contained
   - Features own their components and hooks
   - Feature-specific logic stays within feature folder

3. **Nostr Code Centralization**
   - ALL Nostr protocol code goes in `shared/nostr/`
   - Never duplicate relay/event handling logic
   - Shared hooks for common Nostr operations

4. **Shared Code Strategy**
   - `shared/ui/`: Components used by 2+ features
   - `shared/nostr/`: All Nostr-related code
   - `shared/lib/`: Generic utilities

### Migration Path

**Current Stage:** Simple structure (recommended for <10 features, <100 files, <3 developers)

**Future Consideration:** Migrate to FSD when:
- Feature count exceeds 10
- Team size exceeds 3 developers
- File count exceeds 100
- Dependency management becomes complex

### Anti-Patterns to Avoid

❌ Don't create these directories prematurely:
- `src/app/` (FSD layer)
- `src/pages/` (use `features/` instead)
- `src/widgets/` (FSD layer)
- `src/entities/` (FSD layer)
- `src/components/` (ambiguous - use `features/` or `shared/ui/`)
- `src/hooks/` (organize by domain instead)
- `src/utils/` (use `shared/lib/` or `shared/nostr/`)

See [.agents/feature-developer.md](.agents/feature-developer.md) for detailed structure rules.

## Application Entry Points

### HTML Entry
- **[index.html](index.html)** - Root HTML file that loads the app via `src/index.tsx`

### JavaScript Entry
- **[src/index.tsx](src/index.tsx:1)** - Renders the SolidJS app into the DOM
  - Imports global styles from `index.css`
  - Renders the `App` component into `#root`

### Main Component
- **[src/App.tsx](src/App.tsx:1)** - Main application component
  - Currently a minimal setup with a test paragraph
  - Uses SolidJS signals for reactive state

## Configuration Files

### Build & Development
- **[vite.config.ts](vite.config.ts:1)** - Vite configuration with SolidJS and Tailwind plugins
- **[tsconfig.json](tsconfig.json:1)** - TypeScript project references setup
- **[tsconfig.app.json](tsconfig.app.json)** - App-specific TypeScript settings
- **[tsconfig.node.json](tsconfig.node.json)** - Vite config TypeScript settings

### Styling
- **[tailwind.config.js](tailwind.config.js:1)** - Tailwind CSS configuration
  - Content sources: `./index.html`, `./src/**/*.{js,ts,jsx,tsx}`
  - No custom theme extensions or plugins currently
- **[src/index.css](src/index.css:1)** - Tailwind v4 imports using `@import "tailwindcss";`

### Code Quality
- **[biome.json](biome.json:1)** - Biome configuration
  - Formatter: tabs, enabled
  - Linter: recommended preset
  - VCS integration: Git
  - Auto organize imports

### MCP Servers
- **[.claude/mcp_settings.json](.claude/mcp_settings.json:1)** - Project-specific MCP server configuration
  - **deepwiki**: Wikipedia search and article retrieval
  - **codegraph**: Code graph analysis

## Available Scripts

```bash
# Development
pnpm dev          # Start Vite dev server (http://localhost:5173)

# Production Build
pnpm build        # TypeScript build + Vite production build

# Preview
pnpm preview      # Preview production build locally
```

## Development Guidelines

### Package Management
- **Always use `pnpm`** for installing dependencies
- The project uses pnpm workspaces (see `pnpm-workspace.yaml`)

### Code Style
- Use Biome for linting and formatting
- Tabs for indentation (configured in biome.json)
- Double quotes for JavaScript/TypeScript strings

### TypeScript
- TypeScript 6.0.2 with strict type checking
- Composite project structure with separate configs for app and build tools

### Styling Approach
- **Tailwind CSS v4** for styling
- Use utility classes directly in JSX (e.g., `class="font-bold text-lg"`)
- Custom CSS variables defined in `index.css` for theming:
  - Light/dark mode support via `@media (prefers-color-scheme: dark)`
  - CSS custom properties for colors, fonts, shadows

## Key Features & Patterns

### Nostr Integration
- The project includes `nostr-tools` for Nostr protocol support
- Currently not actively used in the minimal App component

### Routing
- `@solidjs/router` is installed but not yet implemented in the current App

### Virtualization
- `@tanstack/solid-virtual` available for efficient rendering of large lists

### Reactive State
- Uses SolidJS signals for reactive state management
- Example: `const [count, setCount] = createSignal(0);`

## Architecture Notes

### SolidJS Specifics
- Uses `class` instead of `className` for CSS classes
- Fine-grained reactivity - no virtual DOM
- Components are just functions that run once
- Signals (`createSignal`) for reactive primitives

### Tailwind CSS v4
- New import syntax: `@import "tailwindcss";` instead of `@tailwind` directives
- Uses `@tailwindcss/vite` plugin for integration
- No PostCSS or Autoprefixer needed (built into Tailwind v4)

## Future Considerations

Based on installed dependencies, the project appears to be set up for:
1. **Nostr-based application** - Social protocol integration
2. **Client-side routing** - Multi-page SPA
3. **Large data sets** - Virtual scrolling support
4. **Modern styling** - Utility-first CSS with Tailwind

## Notes for AI Assistants

- This project is in early development stages
- Main App component is currently minimal (just a test paragraph)
- All core infrastructure is set up and ready for feature development
- When making changes:
  - Use `pnpm` for package management
  - Follow Biome's linting rules
  - Use SolidJS patterns (signals, JSX with `class` not `className`)
  - Apply Tailwind utility classes for styling
  - Ensure TypeScript types are properly defined

## Common Pitfalls & Best Practices

### Nostr Protocol Integration

#### WebSocket Subscription Lifecycle
**❌ WRONG - Finishing immediately on first event:**
```typescript
relay.subscribe([filter], {
  onevent(event) {
    resolve(event); // ❌ Don't resolve immediately
  },
  oneose() {
    // This might never be reached
  }
});
```

**✅ CORRECT - Wait for EOSE (End of Stored Events):**
```typescript
let receivedEvent: Event | null = null;

relay.subscribe([filter], {
  onevent(event) {
    receivedEvent = event; // Store the event
    // Don't finish yet - wait for EOSE
  },
  oneose() {
    resolve(receivedEvent); // Now finish with the stored event
  }
});
```

**Why:**
- `onevent` fires for each matching event as it arrives
- `oneose` signals that all stored events matching the filter have been sent
- For queries with `limit: 1`, you still need to wait for `oneose` to know the query is complete

#### Relay Connection Optimization

**❌ WRONG - Waiting for all relays:**
```typescript
const results = await Promise.all(
  relays.map(url => fetchFromRelay(url))
);
```

**✅ CORRECT - Race for first successful response:**
```typescript
// Use Promise.race for first response
const result = await Promise.race(
  relays.map(url => fetchFromRelay(url))
    .map(p => p.then(r => r || Promise.reject()))
);

// Fallback to Promise.all if race fails
if (!result) {
  const results = await Promise.all(promises);
  return results.find(r => r !== null);
}
```

**Why:**
- Nostr is decentralized - multiple relays often have the same data
- First relay to respond is usually the fastest/closest
- Significantly improves perceived performance (3-5s → 1-2s)

#### WebSocket Cleanup Patterns

**Best Practice:**
```typescript
let subClosed = false;
let timeoutId: ReturnType<typeof setTimeout> | null = null;

const closeSub = () => {
  if (subClosed) return; // Prevent duplicate closes
  subClosed = true;
  try {
    sub?.close();
  } catch {
    // Ignore "already closed" errors
  }
};

try {
  // ... subscription logic
} finally {
  if (timeoutId) clearTimeout(timeoutId);
  if (relay) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    try {
      relay.close();
    } catch {
      // Ignore close errors
    }
  }
}
```

**Why:**
- WebSocket can only be closed once
- Need flags to prevent duplicate close attempts
- Small delay before relay close prevents race conditions

### SolidJS Reactive Patterns

#### createResource Data Flow

**Common Issue:** Data fetched but UI not updating

**Debug Checklist:**
1. Check if `resource.loading` transitions from `true` to `false`
2. Verify `resource()` returns the actual data (not undefined)
3. Ensure `resource.state` reaches `"ready"` state
4. Confirm the source signal is properly reactive

**Use createEffect for debugging:**
```typescript
createEffect(() => {
  console.log("Resource state changed:");
  console.log("- loading:", resource.loading);
  console.log("- data:", resource());
  console.log("- state:", resource.state);
  console.log("- error:", resource.error);
});
```

#### Handling Null/Undefined Data in Components

**❌ WRONG - Assuming data always exists:**
```typescript
function ProfileCard(props: { profile: Profile }) {
  return <div>{props.profile.name}</div>; // ❌ Crashes if null
}
```

**✅ CORRECT - Graceful handling with fallback UI:**
```typescript
function ProfileCard(props: { profile: Profile | null }) {
  return (
    <Show
      when={props.profile !== null && props.profile !== undefined}
      fallback={<EmptyProfileUI />}
    >
      <div>{props.profile.name}</div>
    </Show>
  );
}
```

**Why:**
- Network requests can fail
- Data might not exist on the server
- Better UX to show meaningful feedback than crash

### Development Workflow

#### Editor Diagnostics vs. Actual Errors

**Issue:** Editor shows red squiggles but code works fine

**Resolution:**
1. Always verify with Biome: `pnpm biome check <file>`
2. Editor diagnostics can lag or be incorrect (caching issues)
3. Biome is the source of truth for this project
4. If Biome passes, the code is valid

#### Import Organization

**Auto-fix imports with Biome:**
```bash
pnpm biome check --write src/
```

**Common issue:** Unused imports after refactoring
- Let Biome handle it automatically
- Don't manually manage imports unless necessary

### Performance Optimization Patterns

#### Timeout Values for Relay Operations

**Recommended timeouts:**
- Profile fetching: 3 seconds
- Multiple profiles: 10 seconds
- Timeline/feed: 5 seconds
- Real-time subscriptions: No timeout (ongoing)

**Why:**
- Balance between responsiveness and reliability
- Most relays respond within 1-2 seconds
- Longer timeouts for batch operations

#### Data Fetching Strategies

**Single item (profile, event):**
- Use `Promise.race` with multiple relays
- Timeout: 3s
- Return first successful response

**Multiple items (feed, timeline):**
- Use `Promise.all` to gather from multiple relays
- Deduplicate by event ID
- Timeout: 5-10s depending on expected count

**Real-time (live updates):**
- Keep subscription open
- No timeout
- Handle reconnection logic
