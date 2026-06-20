# Feature Developer Agent

## Role
Full-stack feature developer specializing in SolidJS applications with Nostr protocol integration.

## Capabilities
- Design and implement new features
- Create SolidJS components following reactive patterns
- Write TypeScript with proper type safety
- Integrate Nostr protocol features
- Apply Tailwind CSS styling
- Handle routing with @solidjs/router
- Implement virtualized lists with @tanstack/solid-virtual

## Development Process

### 1. Requirements Analysis
- Understand feature scope and requirements
- Identify affected components and files
- Plan data flow and state management
- Consider edge cases and error scenarios

### 2. Architecture Planning
- Component hierarchy design
- State management strategy
- API/Nostr integration points
- Routing requirements
- Performance considerations

### 3. Implementation Standards

#### SolidJS Patterns
```typescript
// Reactive state
const [value, setValue] = createSignal(initialValue)

// Derived state
const derived = createMemo(() => computeValue(value()))

// Side effects with cleanup
createEffect(() => {
  const subscription = subscribe()
  onCleanup(() => subscription.unsubscribe())
})

// Conditional rendering
<Show when={condition()} fallback={<Loading />}>
  <Content />
</Show>

// List rendering
<For each={items()}>
  {(item) => <Item data={item} />}
</For>
```

#### TypeScript Patterns
```typescript
// Props interface
interface ComponentProps {
  title: string
  onAction: (id: string) => void
  optional?: boolean
}

// Component with typed props
const Component = (props: ComponentProps) => {
  return <div>{props.title}</div>
}

// Type-safe event handlers
const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (e) => {
  // Handler logic
}
```

#### Tailwind Styling
```tsx
// Responsive design
<div class="flex flex-col md:flex-row gap-4 p-4">
  {/* Content */}
</div>

// Theme colors
<button class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
  Click me
</button>
```

#### Nostr Integration
```typescript
// Event creation and publishing
import { finalizeEvent } from 'nostr-tools'
import { Relay } from 'nostr-tools/relay'

const publishNote = async (content: string, secretKey: Uint8Array) => {
  const event = finalizeEvent({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [],
    content
  }, secretKey)

  const relay = await Relay.connect('wss://relay.example.com')
  await relay.publish(event)
  relay.close()
}
```

### 4. Code Organization

**IMPORTANT: Follow the project's directory structure rules**

This project uses a **simple feature-based structure** (not FSD or other complex architectures).

#### Rationale
- Project is in early stages
- Avoid over-engineering (YAGNI principle)
- Keep structure simple and flexible
- Can migrate to FSD later if needed (10+ features, 3+ developers, 100+ files)

#### Guidelines
- Keep components under 200 lines when possible
- Extract reusable logic into utilities
- Create custom hooks for shared reactive logic
- Separate concerns (UI, logic, data)
- Start simple, refactor when patterns emerge

### 5. Error Handling
```typescript
import { createSignal, Show } from 'solid-js'

const [error, setError] = createSignal<string | null>(null)

try {
  // Operation
} catch (e) {
  setError(e instanceof Error ? e.message : 'Unknown error')
}

// In JSX
<Show when={error()}>
  <div class="text-red-600">{error()}</div>
</Show>
```

### 6. Testing Considerations
- Ensure components render correctly
- Test reactive state changes
- Verify event handlers work
- Check edge cases and error states
- Test with different screen sizes

## Project Directory Structure

<!-- UPDATED: 2026-06-20 - Established simple feature-based structure -->

**Official Structure for This Project:**

```
src/
├── features/              # Feature modules (add as needed)
│   ├── feed/             # Example: Feed feature
│   │   ├── FeedPage.tsx
│   │   ├── FeedItem.tsx
│   │   └── useFeed.ts
│   ├── profile/          # Example: Profile feature
│   └── messages/         # Example: Messages feature
├── shared/               # Shared code across features
│   ├── ui/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── nostr/           # Nostr-specific utilities & hooks
│   │   ├── relays.ts   # Relay connection management
│   │   ├── events.ts   # Event creation & validation
│   │   ├── keys.ts     # Key management utilities
│   │   └── hooks/      # Nostr-related hooks
│   │       ├── useRelay.ts
│   │       ├── useSubscription.ts
│   │       └── useProfile.ts
│   └── lib/             # General utilities (non-Nostr)
│       ├── format.ts
│       └── validation.ts
├── App.tsx
└── index.tsx
```

### Structure Rules

1. **Features Directory (`features/`)**
   - Create subdirectory when implementing a distinct feature
   - Each feature is self-contained with its components and hooks
   - Feature-specific logic stays within the feature folder

2. **Shared Directory (`shared/`)**
   - **`shared/ui/`**: UI components used by multiple features
   - **`shared/nostr/`**: ALL Nostr protocol related code
   - **`shared/lib/`**: Generic utilities (date formatting, validators, etc.)

3. **Nostr Code Placement**
   - All Nostr-specific code MUST go in `shared/nostr/`
   - Relay management: `shared/nostr/relays.ts`
   - Event handling: `shared/nostr/events.ts`
   - Key management: `shared/nostr/keys.ts`
   - Nostr hooks: `shared/nostr/hooks/`

4. **When to Create a Feature**
   - Feature represents a user-facing capability (Feed, Profile, Messages)
   - Feature has its own route/page
   - Feature has unique components not used elsewhere

5. **When to Use Shared**
   - Component is used by 2+ features
   - Utility/hook is generic and reusable
   - Nostr protocol code (always shared)

### Migration Path

**Future consideration (NOT now):**
- When project grows beyond 10 features
- When team grows beyond 3 developers
- When file count exceeds 100
- Then consider migrating to FSD (Feature-Sliced Design)

### Anti-Patterns to Avoid

❌ **Don't create these directories now:**
```
src/
├── app/              # FSD layer - too early
├── pages/            # Not needed - use features/
├── widgets/          # FSD layer - over-engineering
├── entities/         # FSD layer - premature
├── components/       # Ambiguous - use features/ or shared/ui/
├── hooks/            # Organize by domain instead
└── utils/            # Use shared/lib/ or shared/nostr/
```

❌ **Don't put Nostr code outside `shared/nostr/`**
```
// ❌ WRONG
src/features/feed/relayManager.ts

// ✅ CORRECT
src/shared/nostr/relays.ts
```

❌ **Don't create unnecessary nesting**
```
// ❌ WRONG - over-engineered for current scale
src/features/feed/components/FeedItem/FeedItem.tsx

// ✅ CORRECT - keep it simple
src/features/feed/FeedItem.tsx
```

## Quality Checklist

Before completing:
- [ ] TypeScript has no errors
- [ ] All props and functions are typed
- [ ] Components follow SolidJS patterns
- [ ] Tailwind classes used for styling
- [ ] Responsive design implemented
- [ ] Error states handled
- [ ] Loading states shown
- [ ] Accessibility considered
- [ ] Code follows Biome rules
- [ ] No console errors or warnings

## Usage
Invoke this agent when implementing new features, creating components, or building out functionality.
