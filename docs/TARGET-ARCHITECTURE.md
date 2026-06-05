# Target Architecture — Glaucus App

> **Date:** 2026-06-05
> **Project:** Diablo Immortal Gem Optimizer (Glaucus)
> **Purpose:** Define the desired end-state architecture for the application

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Layered Architecture](#2-layered-architecture)
3. [Module Organization](#3-module-organization)
4. [Data Architecture](#4-data-architecture)
5. [API Design](#5-api-design)
6. [Component Architecture](#6-component-architecture)
7. [Testing Strategy](#7-testing-strategy)
8. [Deployment & Ops](#8-deployment--ops)
9. [Data Flow Diagrams](#9-data-flow-diagrams)
10. [Module Boundary Definitions](#10-module-boundary-definitions)
11. [Architectural Decision Records](#11-architectural-decision-records)

---

## 1. Architecture Overview

Glaucus is a Next.js 16 application that provides gem optimization for Diablo Immortal players. The target architecture adopts a **layered, domain-driven** approach with clear separation of concerns, enabling testability, maintainability, and scalability from a single-player SQLite app to a multi-user PostgreSQL deployment.

### Guiding Principles

- **Domain purity**: Core gem optimization logic is framework-agnostic and testable in isolation
- **Feature modularity**: Code grouped by feature domain, not by technical type
- **Progressive enhancement**: SQLite-first with a clear migration path to PostgreSQL
- **Server-first**: Server components by default, client components only when interactivity is required
- **Typed boundaries**: Zod validation at every external boundary (API, database, external data)

---

## 2. Layered Architecture

The application is organized into four distinct layers with strict dependency direction: **Presentation → Application → Domain ← Infrastructure**.

### 2.1 Presentation Layer

**Responsibility:** Render UI, handle user interaction, display data.

| Component | Description |
|-----------|-------------|
| Pages | Next.js route handlers (`app/` directory) — Server Components by default |
| Feature Components | UI composed of domain-specific components (`gems/`, `optimization/`, `builds/`) |
| UI Primitives | Unstyled, accessible base components built on Radix UI (`ui/`) |
| Layouts | Shared page layouts, navigation, providers |

**Rules:**
- No business logic in presentation components
- No direct data access or API calls from components (use hooks or Server Components)
- Server Components render static content; Client Components handle interactivity only

### 2.2 Application Layer

**Responsibility:** Orchestrate use cases, coordinate domain objects, manage application state.

| Component | Description |
|-----------|-------------|
| Use Cases | Single-responsibility functions that orchestrate domain logic (e.g., `OptimizeBuild`, `SaveBuild`, `LoadSession`) |
| Hooks | React hooks that bridge use cases to components (e.g., `useOptimize`, `useBuilds`, `useSession`) |
| DTOs | Data transfer objects for API request/response shaping |
| Validators | Zod schemas for API boundary validation |

**Rules:**
- Use cases depend on domain layer interfaces, not infrastructure
- Hooks use React Query / SWR for server state, localStorage for client persistence
- No direct database access — goes through repository interfaces

### 2.3 Domain Layer

**Responsibility:** Core business logic, types, and rules — completely framework-agnostic.

| Component | Description |
|-----------|-------------|
| Entities | Core domain types (`Gem`, `Build`, `Session`, `OptimizationResult`) |
| Value Objects | Immutable domain concepts (`GemSlot`, `PowerScore`, `ResonanceSet`) |
| Domain Services | Pure business logic (`GemScorer`, `ResonanceCalculator`, `BudgetManager`) |
| Repository Interfaces | Abstract data access contracts (`GemRepository`, `BuildRepository`, `SessionRepository`) |
| Domain Events | Typed events for cross-domain communication |

**Rules:**
- **Zero** dependencies on Next.js, React, database drivers, or any framework
- All functions are pure or accept explicit dependencies via constructor/injection
- Importable and testable in isolation (can run in Node.js, browser, or test runner)
- No JSON serialization logic — that belongs in the infrastructure layer

### 2.4 Infrastructure Layer

**Responsibility:** External system integration, data persistence, authentication, configuration.

| Component | Description |
|-----------|-------------|
| Database | Drizzle ORM + SQLite (current) / PostgreSQL (future) adapters |
| Repositories | Concrete implementations of domain repository interfaces |
| API Routes | Next.js route handlers with Zod validation |
| Auth | NextAuth / Battle.net OAuth integration |
| Storage | localStorage adapter, file system utilities |
| External APIs | Diablo Immortal API clients, OCR service wrappers |
| Configuration | Environment variable parsing, feature flags |

**Rules:**
- Infrastructure implements domain interfaces, never the reverse
- Database queries use repository pattern — no raw queries in API routes
- All external input is validated with Zod schemas
- Secrets never reach the domain or presentation layers

### 2.4 Dependency Rule

```
Presentation → Application → Domain ← Infrastructure
     ↓              ↓            ↓           ↓
   (reads)      (reads)     (no deps)   (implements)
```

Dependencies flow **inward**. Outer layers depend on inner layers. The domain layer depends on nothing.

---

## 3. Module Organization

### 3.1 Target Directory Structure

Code is organized by **feature domain**, not by technical type.

```
src/
├── app/                              # Next.js App Router (Presentation)
│   ├── (marketing)/                  # Public pages route group
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Home page
│   │   └── about/
│   │       └── page.tsx
│   ├── (app)/                        # Application pages route group
│   │   ├── layout.tsx                # Authenticated layout with nav
│   │   ├── optimize/
│   │   │   ├── page.tsx              # Optimization page
│   │   │   └── loading.tsx
│   │   └── builds/
│   │       ├── page.tsx              # Saved builds page
│   │       └── [id]/
│   │           └── page.tsx          # Single build view
│   ├── api/                          # API routes (Infrastructure)
│   │   ├── gems/
│   │   │   └── route.ts              # GET gem catalog
│   │   ├── builds/
│   │   │   ├── route.ts              # GET list, POST create
│   │   │   └── [id]/
│   │   │       └── route.ts          # GET, PATCH, DELETE
│   │   ├── optimize/
│   │   │   └── route.ts              # POST optimization
│   │   ├── session/
│   │   │   └── route.ts              # Session CRUD
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth handlers
│   ├── layout.tsx                    # Root layout (providers, fonts)
│   ├── globals.css                   # Global styles
│   └── not-found.tsx                 # 404 page
│
├── features/                         # Feature modules (Domain + Application)
│   ├── gems/
│   │   ├── types.ts                  # Gem domain types
│   │   ├── schemas.ts                # Zod validation schemas
│   │   ├── constants.ts              # Gem-specific constants
│   │   ├── scoring.ts                # Power/ROI calculations
│   │   ├── resonance.ts              # Resonance calculations
│   │   ├── repository.ts             # GemRepository interface
│   │   ├── repository.sqlite.ts      # SQLite implementation
│   │   ├── loader.ts                 # Static gem data loader
│   │   ├── components/
│   │   │   ├── GemCatalog.tsx
│   │   │   ├── GemCard.tsx
│   │   │   ├── GemDetail.tsx
│   │   │   ├── GemSelector.tsx
│   │   │   └── InventorySlot.tsx
│   │   ├── hooks/
│   │   │   ├── useGems.ts
│   │   │   └── useGemSelection.ts
│   │   └── __tests__/
│   │       ├── scoring.test.ts
│   │       ├── resonance.test.ts
│   │       └── repository.test.ts
│   │
│   ├── optimization/
│   │   ├── types.ts                  # Optimization domain types
│   │   ├── schemas.ts                # Zod schemas for IO
│   │   ├── engine.ts                 # Core optimization algorithm
│   │   ├── resources.ts              # Budget management
│   │   ├── acquisition.ts            # Acquisition path calculation
│   │   ├── use-cases/
│   │   │   ├── optimize-build.ts     # OptimizeBuild use case
│   │   │   └── compare-builds.ts     # CompareBuilds use case
│   │   ├── components/
│   │   │   ├── ResultsPanel.tsx
│   │   │   ├── OptimizeButton.tsx
│   │   │   ├── OptimizationModal.tsx
│   │   │   ├── RecommendationCard.tsx
│   │   │   ├── InfusionRecommendationCard.tsx
│   │   │   ├── OptimizationError.tsx
│   │   │   ├── AwakenedSlotsPanel.tsx
│   │   │   ├── AcquisitionPaths.tsx
│   │   │   └── ResourceInput.tsx
│   │   ├── hooks/
│   │   │   ├── useOptimize.ts
│   │   │   └── useOptimizationState.ts
│   │   └── __tests__/
│   │       ├── engine.test.ts
│   │       ├── engine.property.test.ts
│   │       ├── resources.test.ts
│   │       └── use-cases/
│   │           └── optimize-build.test.ts
│   │
│   ├── builds/
│   │   ├── types.ts                  # Build domain types
│   │   ├── schemas.ts                # Zod validation schemas
│   │   ├── repository.ts             # BuildRepository interface
│   │   ├── repository.sqlite.ts      # SQLite implementation
│   │   ├── use-cases/
│   │   │   ├── create-build.ts
│   │   │   ├── load-build.ts
│   │   │   ├── update-build.ts
│   │   │   ├── delete-build.ts
│   │   │   └── list-builds.ts
│   │   ├── components/
│   │   │   ├── BuildList.tsx
│   │   │   ├── BuildCard.tsx
│   │   │   ├── BuildDetail.tsx
│   │   │   └── SaveBuildModal.tsx
│   │   ├── hooks/
│   │   │   ├── useBuilds.ts
│   │   │   └── useBuildState.ts
│   │   └── __tests__/
│   │       ├── repository.test.ts
│   │       └── use-cases/
│   │           └── create-build.test.ts
│   │
│   ├── session/
│   │   ├── types.ts                  # Session domain types
│   │   ├── schemas.ts
│   │   ├── repository.ts             # SessionRepository interface
│   │   ├── repository.sqlite.ts
│   │   ├── repository.local.ts       # localStorage adapter
│   │   ├── use-cases/
│   │   │   ├── restore-session.ts
│   │   │   ├── persist-session.ts
│   │   │   └── clear-session.ts
│   │   ├── hooks/
│   │   │   ├── useSession.ts
│   │   │   └── useMultiTabSync.ts
│   │   └── __tests__/
│   │       └── repository.test.ts
│   │
│   └── auth/
│       ├── types.ts
│       ├── schemas.ts
│       ├── repository.ts             # UserRepository interface
│       ├── repository.sqlite.ts
│       ├── use-cases/
│       │   ├── login.ts
│       │   ├── logout.ts
│       │   └── get-profile.ts
│       ├── components/
│       │   ├── LoginButton.tsx
│       │   └── UserProfile.tsx
│       ├── hooks/
│       │   └── useAuth.ts
│       └── __tests__/
│           └── use-cases/
│               └── login.test.ts
│
├── shared/                           # Cross-cutting concerns
│   ├── ui/                           # UI primitive library
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── tooltip.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx
│   │   ├── index.ts
│   │   └── styles/
│   │       └── theme.css             # TweakCN theme tokens
│   ├── utils/
│   │   ├── cn.ts                     # Tailwind class merging
│   │   ├── formatting.ts             # Number/date formatting
│   │   ├── sanitization.ts           # XSS protection
│   │   └── __tests__/
│   │       └── formatting.test.ts
│   ├── config/
│   │   ├── env.ts                    # Environment variable parsing
│   │   └── features.ts               # Feature flag definitions
│   ├── errors/
│   │   ├── app-error.ts              # Base error class
│   │   ├── domain-errors.ts          # Domain-specific errors
│   │   └── api-errors.ts             # API error responses
│   ├── validation/
│   │   ├── base-schemas.ts           # Shared Zod schemas
│   │   └── validators.ts             # Validation helpers
│   ├── db/
│   │   ├── connection.ts             # Database connection management
│   │   ├── schema.ts                 # Drizzle schema definitions
│   │   ├── migrations/               # Migration files
│   │   │   ├── 0001_initial.sql
│   │   │   └── meta/
│   │   │       └── _journal.json
│   │   └── seed.ts                   # Database seeding
│   └── __tests__/
│       └── integration/
│           └── gem-addition-flow.test.ts
│
├── test/                             # Test infrastructure
│   ├── setup.ts                      # Vitest setup
│   ├── fixtures/                     # Test fixtures
│   │   ├── gems.ts
│   │   └── builds.ts
│   └── mocks/                        # Mock implementations
│       ├── repository.mock.ts
│       └── auth.mock.ts
│
└── types/                            # Global type definitions
    └── index.ts                      # Barrel export
```

### 3.2 Module Colocation Rules

Each feature module (`features/<feature>/`) contains:

1. **Domain definitions** — Types, value objects, domain services (top-level `.ts` files)
2. **Use cases** — Application orchestration in `use-cases/`
3. **Repository contracts** — Interface + implementation in same module
4. **UI components** — Feature-specific components in `components/`
5. **React hooks** — State management and data fetching in `hooks/`
6. **Tests** — Co-located tests in `__tests__/` mirroring production structure

**Barrel exports:** Each feature module exports a public API via `features/<feature>/index.ts` that only exposes what other modules may import. Internal implementation details remain private.

---

## 4. Data Architecture

### 4.1 Database Strategy

#### Current State: Better-SQLite3 + Drizzle ORM

The application currently uses SQLite via `better-sqlite3` with Drizzle ORM. This is sufficient for the current scale:
- Single-player anonymous sessions
- Up to 5 saved builds per user (free tier)
- Local development and low-traffic deployment

#### Migration Triggers to PostgreSQL

Migrate to PostgreSQL when **any** of these conditions are met:

| Trigger | Threshold | Rationale |
|---------|-----------|-----------|
| Concurrent users | > 50 simultaneous writers | SQLite's single-writer bottleneck |
| Data volume | > 10,000 saved builds | Query performance degradation |
| Multi-user features | Shared builds, leaderboards | Need row-level security, concurrent reads |
| Geographic distribution | Users in multiple regions | Need connection pooling, read replicas |
| Tier upgrade | Paid tiers with > 50 builds | Need transactions with higher isolation |

#### Migration Path

```
SQLite + Drizzle → PostgreSQL + Drizzle → Redis cache + PostgreSQL
```

**Drizzle ORM is the abstraction layer** that makes this migration straightforward:
- Schema definitions remain identical
- Migration tooling (`drizzle-kit`) supports both dialects
- Repository implementations swap out without affecting domain or application layers

### 4.2 Database Schema Design

#### Target Schema

```
users
├── id (UUID, PK)
├── email (text, unique, nullable)
├── emailVerified (boolean, default false)
├── authProvider (text: 'anonymous' | 'battlenet')
├── providerId (text, nullable)
├── tier (text: 'free' | 'dolphin' | 'whale')
├── createdAt (timestamp)
└── lastActive (timestamp)

saved_builds
├── id (UUID, PK)
├── userId (UUID, FK -> users.id, cascade delete)
├── name (text, not null)
├── notes (text, nullable)
├── isPublic (boolean, default false)
├── createdAt (timestamp)
└── updatedAt (timestamp)

build_equipment
├── id (UUID, PK)
├── buildId (UUID, FK -> saved_builds.id, cascade delete)
├── slotIndex (integer, 1-indexed)
├── equipmentName (text)
├── equipmentRank (integer)
└── awakenedGems (json)

build_gems
├── id (UUID, PK)
├── buildId (UUID, FK -> saved_builds.id, cascade delete)
├── gemId (text)
├── slotIndex (integer, 1-indexed)
├── rank (integer)
├── isLegendary (boolean)
└── metadata (json)

build_resources
├── id (UUID, PK)
├── buildId (UUID, FK -> saved_builds.id, cascade delete)
├── resourceType (text)
├── quantity (integer)
└── updatedAt (timestamp)

build_settings
├── id (UUID, PK)
├── buildId (UUID, FK -> saved_builds.id, cascade delete, unique)
├── awakenedSlots (integer, default 0)
├── optimizationGoal (text: 'maxPower' | 'maxROI' | 'budget')
└── constraints (json)
```

**Key normalization changes from current state:**
- Session state JSON is decomposed into relational tables
- Equipment, gems, and resources are first-class tables with constraints
- Public/private build visibility is explicit
- User authentication is unified (anonymous + Battle.net share the `users` table)

### 4.3 Data Access Patterns

#### Repository Pattern

All data access goes through repository interfaces defined in the domain layer:

```typescript
// Domain interface (features/builds/repository.ts)
interface BuildRepository {
  findById(id: string): Promise<Build | null>;
  findByUserId(userId: string, options?: ListOptions): Promise<Build[]>;
  create(build: NewBuild): Promise<Build>;
  update(id: string, data: Partial<Build>): Promise<Build>;
  delete(id: string): Promise<void>;
}
```

Concrete implementations live alongside the interface:

```
features/builds/
├── repository.ts           # BuildRepository interface
├── repository.sqlite.ts    # SQLite implementation
├── repository.postgres.ts  # PostgreSQL implementation (future)
└── repository.mock.ts      # Mock for testing
```

#### Query Abstraction

- **Simple queries**: Direct Drizzle queries in repository implementations
- **Complex queries**: Named query builder methods with clear input/output types
- **No raw SQL**: All queries use Drizzle's type-safe query builder
- **Query caching**: Repository methods accept an optional cache key for Next.js caching

### 4.4 Caching Strategy

| Layer | Technology | Scope | Invalidation |
|-------|------------|-------|--------------|
| Server response | Next.js `unstable_cache` | API route responses | Time-based (revalidate) + tag-based |
| Server component | Next.js `fetch` cache | Page data | Tag-based |
| Client state | React Query / SWR | Server state in browser | Mutation-based (query invalidation) |
| Client persistence | localStorage | Anonymous ID, UI preferences | Manual (user action) |
| Cross-tab sync | BroadcastChannel | Active session state | Event-driven |

#### Caching Rules

1. **Static data** (gem catalog): Cache for 24 hours, invalidate on version change
2. **User data** (builds, session): No server cache, always fresh from database
3. **Client state**: React Query with stale-while-revalidate, 30-second stale time
4. **Optimization results**: Cache for 5 minutes keyed by input hash

### 4.5 State Management

```
┌─────────────────────────────────────────────────────┐
│                   State Strategy                     │
├──────────────────┬──────────────────────────────────┤
│ Server State     │ React Query / SWR                │
│                  │ • Build lists                      │
│                  │ • Session data                     │
│                  │ • Optimization results             │
├──────────────────┼──────────────────────────────────┤
│ Client State     │ React useState / useReducer        │
│                  │ • Form input values                │
│                  │ • UI toggle states                 │
│                  │ • Modal open/close                 │
├──────────────────┼──────────────────────────────────┤
│ URL State        │ Next.js searchParams               │
│                  │ • Active build ID                  │
│                  │ • Filter/sort parameters           │
├──────────────────┼──────────────────────────────────┤
│ Persistent       │ localStorage                       │
│ Client State     │ • Anonymous user ID                │
│                  │ • UI preferences (theme, layout)   │
├──────────────────┼──────────────────────────────────┤
│ Optimistic State │ Custom hook (useOptimisticUpdate)  │
│                  │ • Build save operations            │
│                  │ • Session auto-save                │
└──────────────────┴──────────────────────────────────┘
```

**Rule:** Prefer server state. Only use client state for truly local UI concerns.

---

## 5. API Design

### 5.1 API Contract

All API routes follow RESTful conventions with JSON request/response bodies.

#### Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/gems` | Get gem catalog | None |
| `POST` | `/api/optimize` | Run gem optimization | None (anonymous) / User |
| `GET` | `/api/builds` | List user's saved builds | Required |
| `POST` | `/api/builds` | Create a new build | Required |
| `GET` | `/api/builds/:id` | Get a specific build | Required (owner) |
| `PATCH` | `/api/builds/:id` | Update a build | Required (owner) |
| `DELETE` | `/api/builds/:id` | Delete a build | Required (owner) |
| `GET` | `/api/session` | Restore session state | None (anonymous) / User |
| `POST` | `/api/session` | Persist session state | None (anonymous) / User |
| `DELETE` | `/api/session` | Clear session state | None (anonymous) / User |

#### Request/Response Format

**Success response:**
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-06-05T03:00:00Z",
    "requestId": "req_abc123"
  }
}
```

**Error response:**
```json
{
  "error": {
    "type": "validation_error",
    "title": "Invalid Build Name",
    "message": "Build name must be between 1 and 100 characters.",
    "details": [
      {
        "field": "name",
        "message": "String must contain at most 100 character(s)"
      }
    ],
    "guidance": "Please check the build name and try again."
  },
  "meta": {
    "timestamp": "2026-06-05T03:00:00Z",
    "requestId": "req_abc123"
  }
}
```

### 5.2 Error Type Taxonomy

| Error Type | HTTP Status | Description |
|------------|-------------|-------------|
| `validation_error` | 400 | Request body failed Zod validation |
| `not_found` | 404 | Resource does not exist |
| `unauthorized` | 401 | Missing or invalid authentication |
| `forbidden` | 403 | User lacks permission for this resource |
| `conflict` | 409 | Resource conflict (e.g., duplicate name) |
| `rate_limit_exceeded` | 429 | Too many requests |
| `timeout` | 408 | Operation exceeded time limit |
| `internal_error` | 500 | Unexpected server error |

### 5.3 Validation Strategy

**All API routes use Zod schemas** at the boundary:

```
Request → Zod parse → Use case → Domain logic → Repository → Response
                                    ↓
                            Zod-safe types throughout
```

- Request bodies are validated with `z.safeParse()` for detailed error collection
- Path parameters are validated (UUID format, numeric ranges)
- Query parameters are validated with defaults
- Response bodies are shaped through DTOs (never expose internal types directly)

**Schema location:** Zod schemas live in the feature module that owns the domain concept:
- `features/builds/schemas.ts` — Build create/update schemas
- `features/optimization/schemas.ts` — Optimization request/response schemas
- `features/session/schemas.ts` — Session state schemas
- `shared/validation/base-schemas.ts` — Reusable schemas (UUID, pagination, etc.)

### 5.4 Rate Limiting

| Endpoint | Limit | Window | Strategy |
|----------|-------|--------|----------|
| `/api/optimize` | 10 requests | 60 seconds | Sliding window per user/IP |
| `/api/builds` (POST) | 5 requests | 60 seconds | Sliding window per user |
| `/api/session` (POST) | 30 requests | 60 seconds | Sliding window per user |
| All GET endpoints | 60 requests | 60 seconds | Sliding window per user/IP |

**Implementation:**
- Anonymous users: Rate limit by IP address (from request headers)
- Authenticated users: Rate limit by user ID
- SQLite implementation: In-memory sliding window counter (sufficient for current scale)
- Future: Move to Redis-based rate limiting (Upstash or self-hosted)

### 5.5 Middleware Pipeline

Each API route processes requests through a pipeline:

```
Request
  → CORS check (if applicable)
  → Rate limit check
  → Authentication (if required)
  → Authorization (ownership check)
  → Zod validation
  → Use case execution
  → Response formatting
  → Error handling
```

The middleware pipeline is implemented as a composable wrapper function in `shared/api/middleware.ts`.

---

## 6. Component Architecture

### 6.1 Server vs Client Component Strategy

| Component Type | Default | When to Use | Examples |
|----------------|---------|-------------|----------|
| **Server Component** | Default | Data fetching, static rendering, SEO | Pages, layouts, card lists |
| **Client Component** | Opt-in | Interactivity, state, browser APIs | Forms, modals, real-time updates |

**Rules:**
1. **All components are Server Components by default** — no `"use client"` directive
2. Add `"use client"` only when the component uses:
   - React state hooks (`useState`, `useReducer`)
   - Effect hooks (`useEffect`, `useLayoutEffect`)
   - Browser APIs (`window`, `localStorage`, `navigator`)
   - Event handlers (`onClick`, `onChange`, `onSubmit`)
   - Custom hooks that use any of the above
3. **Composition pattern:** Server components fetch data and pass it as props to client components
4. **Islands pattern:** Keep client components as small as possible; wrap them in server components

### 6.2 Component Composition Patterns

```
Page (Server)
├── Layout (Server)
│   ├── Nav (Server)
│   │   └── LoginButton (Client)
│   └── Sidebar (Server)
├── DataFetcher (Server) → fetch data
└── FeatureContainer (Server)
    └── InteractiveWidget (Client)
        ├── UI_Primitive (Client)
        └── UI_Primitive (Client)
```

**Key patterns:**

1. **Container/Presentational:** Server container fetches data, client presentational renders it
2. **Compound Components:** Related components share context via React Context (client-only subtree)
3. **Render Props / Slot:** Pass components as `children` or props for flexible composition
4. **Headless UI:** UI primitives in `shared/ui/` are unstyled and accept className props

### 6.3 UI Primitive Library

Located in `shared/ui/`, built on **Radix UI** primitives with **TweakCN** theming.

| Primitive | Radix Base | Purpose |
|-----------|------------|---------|
| `Button` | None | Styled button with variants (primary, secondary, ghost, destructive) |
| `Input` | None | Form input with label, error, helper text |
| `Card` | None | Container with header, body, footer |
| `Select` | `@radix-ui/react-select` | Dropdown selection |
| `Dialog` | `@radix-ui/react-dialog` | Modal dialog |
| `Tooltip` | `@radix-ui/react-tooltip` | Hover tooltip |
| `Skeleton` | None | Loading placeholder |
| `Toast` | None | Notification banner |
| `ScreenReaderAnnouncer` | None | Accessibility live region |

**Theming:** Uses `class-variance-authority` for component variants and `tailwind-merge` for className composition. Theme tokens defined in `shared/ui/styles/theme.css`.

**Design tokens:**
- Colors from TweakCN palette
- Typography scale (xs, sm, base, lg, xl, 2xl)
- Spacing scale (Tailwind defaults)
- Border radius, shadows, transitions

### 6.4 Form Handling Strategy

| Scenario | Approach | Validation |
|----------|----------|------------|
| **Simple forms** (save build, edit notes) | Controlled inputs with React state | Zod schema on submit |
| **Complex forms** (optimization settings) | useReducer with action types | Zod schema per action |
| **Server-submitted forms** | Next.js Server Actions | Zod on server, progressive enhancement |
| **API-bound forms** | React Hook Form + Zod resolver | Zod at boundary and in form |

**Validation flow:**
1. Client-side: Zod schema validates on change/blur (immediate feedback)
2. On submit: Full Zod validation before API call
3. Server-side: Zod validation at API boundary (defense in depth)
4. Error display: Standardized error component maps Zod errors to field messages

---

## 7. Testing Strategy

### 7.1 Testing Pyramid

```
         ┌─────────┐
         │   E2E   │  ~5% — Critical user journeys
         ├─────────┤
         │Integration│ ~15% — API routes, data flows
         ├─────────┤
         │ Component │ ~20% — UI rendering, interaction
         ├─────────┤
    ┌────┤  Unit    │ ~60% — Domain logic, utilities
    │    └─────────┘
    │
    └── Total coverage target: 80%+
```

### 7.2 Unit Tests

| Target | Coverage | Framework | Location |
|--------|----------|-----------|----------|
| Domain services | **95%+** | Vitest | `features/<feature>/__tests__/*.test.ts` |
| Use cases | **90%+** | Vitest | `features/<feature>/__tests__/use-cases/*.test.ts` |
| Repository implementations | **85%+** | Vitest | `features/<feature>/__tests__/repository.test.ts` |
| Utility functions | **90%+** | Vitest | `shared/utils/__tests__/*.test.ts` |
| Validation schemas | **85%+** | Vitest | `features/<feature>/__tests__/schemas.test.ts` |

**Property-based testing for the optimization engine:**

```typescript
// Using fast-check for property-based tests
import fc from 'fast-check';

describe('Optimization Engine (property tests)', () => {
  it('always returns a result within budget', () => {
    fc.assert(
      fc.property(
        gemCatalogArbitrary,
        resourceArbitrary,
        (gems, resources) => {
          const result = optimize(gems, resources);
          expect(result.totalCost).toBeLessThanOrEqual(resources.budget);
        }
      )
    );
  });

  it('never assigns more than one gem per slot', () => {
    // Property: result.slotAssignments.length <= totalSlots
  });

  it('power score is monotonically non-decreasing with more resources', () => {
    // Property: increase(budget) => result.powerScore >= previous
  });
});
```

### 7.3 Integration Tests

| Target | Coverage | Framework | Location |
|--------|----------|-----------|----------|
| API routes | **90%+** | Vitest + supertest-like | `src/__tests__/integration/api/*.test.ts` |
| Database queries | **85%+** | Vitest + test DB | `features/<feature>/__tests__/repository.integration.test.ts` |
| Session management | **90%+** | Vitest | `features/session/__tests__/session.integration.test.ts` |
| Cross-feature flows | **80%+** | Vitest | `src/__tests__/integration/*.test.ts` |

**API route testing approach:**
- Use Next.js test utilities to invoke route handlers directly
- Mock database at the repository level
- Test all HTTP methods, error cases, and edge conditions
- Validate response shapes against Zod schemas

### 7.4 Component Tests

| Target | Coverage | Framework | Location |
|--------|----------|-----------|----------|
| UI primitives | **80%+** | Vitest + Testing Library | `shared/ui/__tests__/*.test.tsx` |
| Feature components | **70%+** | Vitest + Testing Library | `features/<feature>/__tests__/components/*.test.tsx` |
| Form components | **80%+** | Vitest + Testing Library | `features/<feature>/__tests__/forms/*.test.tsx` |

**Testing approach:**
- Test user-visible behavior, not implementation details
- Use `screen.getByRole()` for accessibility-friendly selectors
- Mock API calls at the fetch level
- Test rendering, interaction, and error states

### 7.5 E2E Tests

| Scenario | Tool | Location |
|----------|------|----------|
| Full optimization flow | Playwright | `e2e/optimization.spec.ts` |
| Save and load build | Playwright | `e2e/builds.spec.ts` |
| Session persistence across refresh | Playwright | `e2e/session.spec.ts` |
| Cross-tab synchronization | Playwright | `e2e/multi-tab.spec.ts` |
| Mobile responsiveness | Playwright | `e2e/responsive.spec.ts` |
| Accessibility audit | Playwright + axe | `e2e/accessibility.spec.ts` |

### 7.6 Performance Benchmarks

| Target | Metric | Tool | Location |
|--------|--------|------|----------|
| Optimization engine | < 5 seconds for full catalog scan | Vitest benchmark | `features/optimization/__tests__/engine.benchmark.ts` |
| Page load (LCP) | < 2.5 seconds | Playwright | `e2e/performance.spec.ts` |
| API response time | < 200ms (p95) | Vitest integration tests | `src/__tests__/integration/api/performance.test.ts` |

---

## 8. Deployment & Ops

### 8.1 Deployment Options

#### Option A: Vercel (Recommended)

| Aspect | Details |
|--------|---------|
| **Platform** | Vercel Hobby / Pro |
| **Build** | Automatic Next.js build on push to main |
| **Runtime** | Serverless functions (API routes) + Edge (optional) |
| **Database** | SQLite not supported on Vercel serverless; use Turso, Neon, or Supabase |
| **CDN** | Vercel Edge Network for static assets and cached pages |
| **Preview** | Automatic preview deployments per PR |

**Note:** Vercel serverless functions are ephemeral — SQLite files are not persisted between invocations. For Vercel deployment, the database **must** be PostgreSQL (Neon, Supabase, or Turso).

#### Option B: Self-Hosted (VPS / Container)

| Aspect | Details |
|--------|---------|
| **Platform** | Docker container on VPS (DigitalOcean, Railway, Fly.io) |
| **Build** | Docker image built from `Dockerfile` |
| **Runtime** | Node.js standalone server (`next start`) |
| **Database** | SQLite file persisted on mounted volume, or PostgreSQL |
| **Reverse Proxy** | Caddy or Nginx for TLS termination |
| **CI/CD** | GitHub Actions build + deploy on push |

**Dockerfile:**
```dockerfile
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["bun", "run", "server.js"]
```

### 8.2 Database Migration Strategy

**Tool:** `drizzle-kit` for schema management.

#### Migration Workflow

1. **Define schema change** in `shared/db/schema.ts`
2. **Generate migration**: `bun drizzle-kit generate`
3. **Review migration SQL** in `shared/db/migrations/`
4. **Apply migration**: `bun drizzle-kit migrate`
5. **Commit migration files** to version control

#### Migration Commands

| Command | Purpose |
|---------|---------|
| `bun drizzle-kit generate` | Generate migration from schema diff |
| `bun drizzle-kit migrate` | Apply pending migrations |
| `bun drizzle-kit studio` | Open database GUI for inspection |
| `bun drizzle-kit push` | Push schema directly (dev only, no migration files) |

#### Migration Safety

- **Never** edit migration files after they are committed
- **Always** test migrations on a copy of production data
- **Backward-compatible** migrations first, then code deploy, then cleanup migrations
- **Rollback:** Keep `drizzle-kit` down migration scripts for each migration

### 8.3 Environment Configuration

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Database connection string | Yes | `file:./data/di-lab.db` |
| `NEXTAUTH_SECRET` | NextAuth session secret | Yes (auth) | - |
| `NEXTAUTH_URL` | Auth callback URL | Yes (auth) | `http://localhost:3000` |
| `BATTLENET_CLIENT_ID` | Battle.net OAuth client ID | Yes (auth) | - |
| `BATTLENET_CLIENT_SECRET` | Battle.net OAuth secret | Yes (auth) | - |
| `NODE_ENV` | Runtime environment | No | `development` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in ms | No | `60000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | `60` |

**Environment parsing:** All environment variables are parsed and validated at startup via `shared/config/env.ts` using Zod. The application fails fast on missing required variables.

### 8.4 Monitoring and Logging

#### Application Logging

| Level | Usage | Destination |
|-------|-------|-------------|
| `ERROR` | Unhandled exceptions, API failures, database errors | stderr (captured by platform) |
| `WARN` | Rate limit approaches, degraded performance, cache misses | stderr |
| `INFO` | Server start, migration application, user actions (anonymized) | stdout |
| `DEBUG` | Detailed request/response logging (dev only) | stdout |

**Structured logging (JSON format for production):**
```json
{
  "level": "info",
  "timestamp": "2026-06-05T03:00:00Z",
  "requestId": "req_abc123",
  "method": "POST",
  "path": "/api/optimize",
  "duration_ms": 1234,
  "status": 200
}
```

#### Performance Monitoring

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| Page load (LCP) | Vercel Analytics / Web Vitals | > 2.5s |
| API response time (p95) | Custom middleware logging | > 500ms |
| Optimization duration (p95) | Engine instrumentation | > 10s |
| Error rate | Platform error tracking | > 1% of requests |
| Database query time | Drizzle query logging | > 100ms |

#### Health Checks

- `/api/health` — Returns `{ status: "ok", uptime, version, database: "connected" }`
- Platform-level health checks (Vercel, Docker healthcheck) monitor this endpoint

---

## 9. Data Flow Diagrams

### 9.1 Optimization Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      User (Browser)                           │
│                                                                │
│  ┌──────────────┐    ┌──────────────────┐    ┌─────────────┐ │
│  │ ResourceInput │───>│ OptimizationModal│───>│ ResultsPanel │ │
│  │ (Client)      │    │ (Client)          │    │ (Client)     │ │
│  └──────────────┘    └────────┬─────────┘    └─────────────┘ │
│                               │                                │
│                               │ POST /api/optimize             │
│                               │ { gems, resources, settings }  │
└───────────────────────────────┼────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                      Server (Next.js)                          │
│                                                                 │
│  ┌─────────────┐   ┌──────────────┐   ┌───────────────────┐  │
│  │ Zod         │──>│ OptimizeBuild│──>│ OptimizationEngine │  │
│  │ Validation  │   │ Use Case     │   │ (Domain Service)   │  │
│  └─────────────┘   └──────┬───────┘   └─────────┬─────────┘  │
│                           │                      │            │
│                           │              ┌───────┴───────┐    │
│                           │              │ GemLoader     │    │
│                           │              │ (Repository)  │    │
│                           │              └───────────────┘    │
│                           │                                    │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                  Response { result, recommendations }   │   │
│  └────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                      User (Browser)                            │
│  ┌──────────────┐                                              │
│  │ ResultsPanel │ ← Display optimization results              │
│  │ (Client)     │ ← Show acquisition paths                    │
│  └──────────────┘ ← Allow save as build                       │
└───────────────────────────────────────────────────────────────┘
```

### 9.2 Build Save Flow

```
┌───────────────────────────────────────────────────────────────┐
│                      User (Browser)                            │
│                                                                 │
│  ┌──────────────────┐                                         │
│  │ SaveBuildModal   │ ─ User fills name, notes               │
│  │ (Client)         │ ─ Validates with Zod schema             │
│  └────────┬─────────┘                                         │
│           │ POST /api/builds                                   │
│           │ { name, notes, equippedGems, resources }           │
└───────────┼────────────────────────────────────────────────────┘
            │
            ▼
┌───────────────────────────────────────────────────────────────┐
│                      Server (Next.js)                          │
│                                                                 │
│  1. Rate limit check                                            │
│  2. Authenticate user (anonymous ID or session)                 │
│  3. Zod validation of request body                              │
│  4. Sanitize input (XSS protection)                             │
│  5. CreateBuild use case                                        │
│     ├── Check build limit (free tier: 5)                        │
│     ├── Check name uniqueness                                   │
│     └── BuildRepository.create()                                │
│         └── Dr INSERT into savedBuilds                          │
│  6. Return { data: build, meta: { ... } }                       │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                      User (Browser)                            │
│                                                                 │
│  ┌──────────────────┐                                         │
│  │ Optimistic update │ ─ UI shows new build immediately       │
│  │ + Rollback on     │ ─ Revert on error                      │
│  │ error             │                                         │
│  └──────────────────┘                                         │
│                                                                 │
│  ┌──────────────────┐                                         │
│  │ React Query       │ ─ Invalidate build list query            │
│  │ cache             │ ─ Refetch from server                   │
│  └──────────────────┘                                         │
└───────────────────────────────────────────────────────────────┘
```

### 9.3 Session Sync Flow

```
┌───────────────────────────────────────────────────────────────┐
│                      Browser (Tab A)                           │
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────┐               │
│  │ localStorage     │◄────►│ useSession hook  │               │
│  │ (anonymousId,    │      │ (Client)          │               │
│  │  sessionState)   │      └────────┬─────────┘               │
│  └──────────────────┘               │                          │
│                                     │ POST /api/session        │
│                                     │ (debounced, 2s)          │
└─────────────────────────────────────┼──────────────────────────┘
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │   BroadcastChannel     │
                          │   "glaucus-session"    │
                          │   ──────────────       │
                          │   Tab A → Tab B sync   │
                          │   Tab B → Tab A sync   │
                          └───────┬───────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────┐
│                      Browser (Tab B)                           │
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────┐               │
│  │ useSession hook  │◄────►│ localStorage     │               │
│  │ (Client)          │      │ (anonymousId,    │               │
│  └──────────────────┘      │  sessionState)   │               │
│                            └──────────────────┘               │
└───────────────────────────────────────────────────────────────┘
```

---

## 10. Module Boundary Definitions

### 10.1 Import Rules

| From | Can Import | Cannot Import |
|------|------------|---------------|
| `features/*` | `shared/*`, own module internals | Other feature modules' internals (only public API via barrel) |
| `shared/*` | Nothing (only other shared modules) | `features/*`, `app/*` |
| `app/*` | `features/*` (barrel exports), `shared/*` | Other `app/*` routes, direct feature internals |

### 10.2 Dependency Direction

```
app/  ────depends-on────>  features/  ────depends-on────>  shared/
  │                           │                                │
  │  (use case calls)         │  (interface calls)             │  (utility calls)
  ▼                           ▼                                ▼
features/                   domain types                    utilities
```

### 10.3 Public API Contracts

Each feature module exports via `index.ts`:

```typescript
// features/optimization/index.ts
// Public API — this is all other modules may import

export { optimizeBuild } from './use-cases/optimize-build';
export { useOptimize } from './hooks/useOptimize';
export type { OptimizationResult, OptimizationInput } from './types';
export { OptimizationModal } from './components/OptimizationModal';
export { ResultsPanel } from './components/ResultsPanel';
```

### 10.4 Cross-Cutting Concerns

| Concern | Location | Responsibility |
|---------|----------|----------------|
| Error handling | `shared/errors/` | Base error class, domain errors, API error formatter |
| Validation | `shared/validation/` | Base Zod schemas, validation helpers |
| Configuration | `shared/config/` | Environment parsing, feature flags |
| Logging | `shared/config/` | Logger setup, request ID generation |
| Database | `shared/db/` | Connection management, schema definitions, migrations |

---

## 11. Architectural Decision Records

### ADR-001: Use Layered Architecture with Domain-Driven Design

**Status:** Accepted
**Date:** 2026-06-05
**Context:** The current codebase uses a type-based organization (components/, lib/, types/) that makes it hard to understand feature boundaries and leads to duplicated types and unclear dependencies.
**Decision:** Adopt a four-layer architecture (Presentation → Application → Domain ← Infrastructure) with feature-based module organization. The domain layer contains pure business logic with zero framework dependencies.
**Consequences:**
- **Positive:** Clear separation of concerns, testable domain logic, easier to onboard developers, framework-agnostic core
- **Negative:** More files and directories, requires discipline to maintain boundaries, initial refactor cost
- **Risk:** Medium — requires team discipline but has clear patterns

### ADR-002: SQLite First, PostgreSQL When Needed

**Status:** Accepted
**Date:** 2026-06-05
**Context:** The app currently serves anonymous users with low data volume. PostgreSQL adds complexity and cost that isn't needed yet. However, we need a clear path to scale.
**Decision:** Start with SQLite + Drizzle ORM. Migrate to PostgreSQL when concurrent writers exceed 50, data volume exceeds 10,000 builds, or multi-user features are needed. Drizzle ORM abstracts the database dialect.
**Consequences:**
- **Positive:** Simple setup, zero infrastructure cost, fast local development, clear migration path
- **Negative:** Cannot deploy SQLite to Vercel serverless, will need external DB for cloud hosting
- **Risk:** Low — Drizzle makes migration straightforward, triggers are well-defined

### ADR-003: Repository Pattern for Data Access

**Status:** Accepted
**Date:** 2026-06-05
**Context:** API routes currently contain raw Drizzle queries mixed with business logic, making testing difficult and creating tight coupling between the API layer and database.
**Decision:** Use the repository pattern with interfaces defined in the domain layer and concrete implementations in the infrastructure layer. API routes and use cases depend on repository interfaces, not implementations.
**Consequences:**
- **Positive:** Testable (mock repositories), swappable database implementations, clear data access contracts
- **Negative:** More boilerplate code, interface maintenance overhead
- **Risk:** Low — well-established pattern with clear benefits

### ADR-004: Zod Validation at Every Boundary

**Status:** Accepted
**Date:** 2026-06-05
**Context:** Validation is inconsistent — some API routes use Zod, others use manual checks. Type safety is undermined by ad-hoc validation.
**Decision:** All external boundaries (API request/response, database input, external data) must use Zod schemas for validation and type inference. Schemas live in the feature module that owns the domain concept.
**Consequences:**
- **Positive:** Consistent validation, runtime type safety, single source of truth for types, detailed error messages
- **Negative:** Schema duplication between features (mitigated by shared base schemas)
- **Risk:** Low — Zod is already a dependency and widely understood

### ADR-005: Server Components by Default

**Status:** Accepted
**Date:** 2026-06-05
**Context:** Next.js 16 supports Server Components as the default. The current codebase doesn't clearly delineate server vs client responsibilities.
**Decision:** All components are Server Components by default. Add `"use client"` only when interactivity, state, or browser APIs are needed. Keep client components as small as possible ("islands" pattern).
**Consequences:**
- **Positive:** Better performance (less JS shipped), simpler data fetching, SEO-friendly
- **Negative:** Requires mental model shift, some patterns need rethinking
- **Risk:** Low — Next.js documentation is excellent, team is familiar with the model

### ADR-006: Unified Slot Indexing (1-Indexed)

**Status:** Accepted
**Date:** 2026-06-05
**Context:** The current codebase has a mismatch between 1-indexed slot representation in the UI/types and 0-indexed in the engine, with ad-hoc conversion throughout. This is a source of off-by-one bugs and confusion.
**Decision:** Standardize on **1-indexed** slot numbering throughout the entire application (UI, types, API, database, engine). The game uses 1-indexed slots, so our domain model should match the real-world concept.
**Consequences:**
- **Positive:** Eliminates conversion bugs, matches game domain model, simpler mental model
- **Negative:** Requires updating engine internal loops from 0-based to 1-based
- **Risk:** Medium — requires careful engine refactoring but eliminates a persistent source of bugs

### ADR-007: Use Case Pattern for Application Logic

**Status:** Accepted
**Date:** 2026-06-05
**Context:** Business logic is currently scattered between API routes, hooks, and utility functions with no clear orchestration pattern.
**Decision:** Use the use case pattern — single-responsibility functions that orchestrate domain objects and repository calls. Each use case has a clear input/output contract and can be tested in isolation. Hooks and API routes call use cases, they don't contain business logic.
**Consequences:**
- **Positive:** Clear entry points for features, testable orchestration, reusable across API and hooks
- **Negative:** More files, may feel like overkill for simple features
- **Risk:** Low — pattern scales well and keeps API routes thin

### ADR-008: Property-Based Testing for Optimization Engine

**Status:** Accepted
**Date:** 2026-06-05
**Context:** The optimization engine uses a greedy algorithm with complex interactions between scoring, resonance, and resource management. Example-based tests cannot cover the full input space.
**Decision:** Add property-based tests using `fast-check` alongside example-based unit tests. Properties to verify: budget constraint adherence, slot uniqueness, monotonic improvement with more resources, determinism for same input.
**Consequences:**
- **Positive:** Catches edge cases example-based tests miss, documents algorithm invariants, high confidence in correctness
- **Negative:** Property tests can be harder to debug when they fail, requires learning fast-check
- **Risk:** Low — fast-check is lightweight, properties are well-defined for this domain

### ADR-009: Feature-Based Directory Structure

**Status:** Accepted
**Date:** 2026-06-05
**Context:** The current type-based organization (components/, lib/, types/) requires developers to navigate across multiple directories to understand a single feature.
**Decision:** Reorganize into feature-based modules under `features/` with colocation of types, components, hooks, tests, and API code per feature domain. Shared code goes under `shared/`.
**Consequences:**
- **Positive:** Features are self-contained, easier to understand and modify, clear ownership boundaries
- **Negative:** Requires significant file movement during refactor, some code duplication risk across features
- **Risk:** Medium — the refactor itself is large but the end state is clearly better

### ADR-010: Standardized Error Response Format

**Status:** Accepted
**Date:** 2026-06-05
**Context:** Error responses are inconsistent — some routes return `{ message, details? }`, others return structured objects with `type`, `title`, `message`, `guidance`. Clients must handle multiple formats.
**Decision:** Standardize on a single error response format for all API routes: `{ error: { type, title, message, details?, guidance? }, meta: { timestamp, requestId } }`. Error types are a closed enumeration.
**Consequences:**
- **Positive:** Consistent client error handling, better UX with actionable guidance, easier to document
- **Negative:** Requires updating all existing API routes
- **Risk:** Low — straightforward change with clear benefits
