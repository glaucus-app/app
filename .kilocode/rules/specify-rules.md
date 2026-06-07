# Glaucus App Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-06-06

## Active Technologies

- TypeScript 5.9.x with Bun runtime + Next.js 16, React 19, Tailwind CSS 4, Zod 4, lucide-react, drizzle-orm, better-sqlite3 (feature/PROJ-002-optimizer-ui)
- SQLite via Drizzle ORM for server-side sessions and builds (feature/PROJ-002-optimizer-ui)
- React 19 with Server Components for interactive UI (002-optimizer-ui)
- Zod for runtime validation and schema definition (002-optimizer-ui)
- localStorage for client-side state persistence (002-optimizer-ui)
- Next.js Server Actions and API routes for server-side processing (002-optimizer-ui)

## Project Structure

```text
src/
├── app/
│   ├── api/
│   │   └── v1/
│   ├── optimize/
│   ├── builds/
│   └── characters/
├── features/
│   ├── gems/
│   ├── optimization/
│   ├── builds/
│   └── characters/
├── shared/
│   ├── types/
│   ├── errors/
│   ├── utils/
│   └── components/
└── lib/
    └── db/
```

## Commands

- `bun typecheck` — Type checking
- `bun lint` — Check code quality
- `bun build` — Build production app

## Code Style

- Use Server Components by default
- Add `"use client"` only when needed for interactivity
- Use `bun` as package manager (not npm/yarn)
- Commit format: `type(scope): description` (lowercase, max 72 chars)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
