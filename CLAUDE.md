# Meeting AI — Real-time Transcription & Translation

## Quick Reference

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm test         # Run tests (watch mode)
pnpm test:run     # Run tests once
pnpm test:coverage # Run tests with coverage
```

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router) + React 19 + TypeScript 5
- **UI:** Shadcn/UI + Radix UI + Tailwind CSS 4
- **Backend:** Firebase Auth + Firestore (real-time sync)
- **Local Storage:** IndexedDB via `idb`
- **Testing:** Vitest + Testing Library + jsdom
- **Package Manager:** pnpm

## Architecture

Clean Architecture with dependency inversion. Four layers:

```
src/
├── domain/          # Entities, ports (interfaces), use cases — no framework deps
├── application/     # Services orchestrating use cases
├── infrastructure/  # Adapters: Firebase, IndexedDB, Web Speech API, MyMemory API
└── presentation/    # React hooks and components
```

- `app/` — Next.js App Router pages
- `components/ui/` — Shadcn/UI primitives
- `__tests__/` — mirrors `src/` structure
- `src/di/container.ts` — dependency injection wiring

## Path Aliases

`@/*` maps to the project root (e.g., `@/src/domain/entities/Meeting`).

## Key Patterns

- **Ports & Adapters:** Domain defines interfaces (`*Port`), infrastructure implements them.
- **Immutable entities:** `Meeting` uses factory methods for state transitions (idle → recording → paused → completed).
- **DI via React Context:** `DependencyProvider` supplies all services to components.
- **Dual recording:** Host controls meeting status; participants record independently.
- **Transcript merging:** Local + Firestore transcripts are deduped and sorted by timestamp.

## Environment Variables

Firebase config required in `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

## Supported Languages

Korean (ko), English (en), Japanese (ja), Chinese (zh)

## Code Style

- Strict TypeScript (`strict: true`)
- ESLint with `eslint-config-next`
- Functional React components with hooks
- Domain entities are plain TypeScript classes — no React or framework imports
