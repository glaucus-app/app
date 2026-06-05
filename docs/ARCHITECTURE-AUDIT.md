# Architecture Audit — Glaucus (DI-Lab)

> **Date:** 2026-06-05
> **Project:** Diablo Immortal Gem Optimizer (Glaucus / DI-Lab)
> **Scope:** Comprehensive as-is architecture audit covering all layers

---

## 1. Directory Structure

```
project-root/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── task.md
│   ├── pull_request_template.md
│   └── workflows/
│       └── release-please.yml
├── .husky/                            # Git hooks (pre-commit, commit-msg)
├── .kilocode/                         # AI agent rules and recipes
│   ├── rules/
│   │   ├── memory-bank/
│   │   │   ├── architecture.md
│   │   │   ├── brief.md
│   │   │   ├── context.md
│   │   │   ├── product.md
│   │   │   └── tech.md
│   │   ├── commit.md
│   │   ├── development.md
│   │   ├── memory-bank-instructions.md
│   │   └── specify-rules.md
│   └── recipes/
│       └── add-database.md
├── .specify/                          # Spec-driven dev templates
├── docs/                              # Game mechanics reference (CSVs + MDs)
├── e2e/                               # Playwright E2E tests (empty)
├── specs/                             # Feature specifications
│   ├── README.md
│   └── feature/
│       ├── PROJ-001-workflow-foundation/
│       │   └── data-model.md
│       └── PROJ-002-optimizer-ui/
│           ├── spec.md, plan.md, tasks.md, quickstart.md
│           ├── data-model.md, research.md
│           ├── contracts/optimize-api.schema.json
│           └── checklists/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── builds/
│   │   │   │   ├── route.ts              # GET list, POST create
│   │   │   │   └── [id]/route.ts         # GET, PATCH, DELETE
│   │   │   ├── optimize/route.ts         # POST optimization
│   │   │   └── session/route.ts          # GET restore, POST persist, DELETE
│   │   ├── builds/page.tsx
│   │   ├── optimize/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── favicon.ico
│   ├── components/
│   │   ├── gems/
│   │   │   ├── index.ts
│   │   │   ├── GemCatalog.tsx
│   │   │   ├── GemCard.tsx
│   │   │   ├── GemDetail.tsx
│   │   │   ├── GemSelector.tsx
│   │   │   └── InventorySlot.tsx
│   │   ├── optimization/
│   │   │   ├── index.ts
│   │   │   ├── ResultsPanel.tsx
│   │   │   ├── OptimizeButton.tsx
│   │   │   ├── OptimizationModal.tsx
│   │   │   ├── RecommendationCard.tsx
│   │   │   ├── InfusionRecommendationCard.tsx
│   │   │   ├── OptimizationError.tsx
│   │   │   ├── AwakenedSlotsPanel.tsx
│   │   │   ├── AcquisitionPaths.tsx
│   │   │   ├── ResourceInput.tsx
│   │   │   └── SaveBuildModal.tsx
│   │   └── ui/
│   │       ├── index.ts
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Card.tsx
│   │       ├── Select.tsx
│   │       ├── Dialog.tsx
│   │       ├── Modal.tsx
│   │       ├── Tooltip.tsx
│   │       ├── Skeleton.tsx
│   │       ├── Toast.tsx
│   │       └── ScreenReaderAnnouncer.tsx
│   ├── data/
│   │   └── gems.json                    # Static gem database
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts                 # Drizzle connection setup
│   │   │   ├── schema.ts                # Drizzle SQLite schema
│   │   │   └── queries.ts               # CRUD operations
│   │   ├── hooks/
│   │   │   ├── useMultiTabSync.ts
│   │   │   ├── useOptimisticUpdate.ts
│   │   │   └── useOptimize.ts
│   │   ├── optimization/
│   │   │   ├── engine.ts                # Main greedy algorithm
│   │   │   ├── engine.test.ts           # Unit tests
│   │   │   ├── scoring.ts               # Power/ROI calculations
│   │   │   ├── resonance.ts             # Resonance math
│   │   │   ├── resources.ts             # Resource constraints
│   │   │   ├── constants.ts             # Tunable constants/tables
│   │   │   └── types.ts                 # Engine-specific types
│   │   ├── session/
│   │   │   └── anonymous-session.ts     # Client-side session sync
│   │   ├── storage/
│   │   │   └── localStorage.ts
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   ├── formatting.ts
│   │   │   ├── validation.ts
│   │   │   ├── sanitization.ts
│   │   │   ├── slots.ts
│   │   │   ├── resonance.ts
│   │   │   ├── acquisition.ts
│   │   │   └── __tests__/contrast.test.ts
│   │   ├── data/
│   │   │   └── gems.ts                  # Gem data loader
│   │   └── utils.ts                     # cn() Tailwind merge
│   ├── types/
│   │   ├── index.ts                     # Barrel re-export
│   │   ├── gem.ts                       # Gem domain types
│   │   ├── build.ts                     # Build/session types
│   │   └── optimization.ts              # Optimization API types
│   ├── __tests__/
│   │   ├── performance/performance.test.ts
│   │   └── integration/gem-addition-flow.test.ts
│   └── test/
│       └── setup.ts                     # Vitest test setup
├── middleware.ts
├── commitlint.config.js
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── playwright.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── vitest.config.ts
```

---

## 2. Module Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                     Presentation Layer                          │
│  src/app/pages  │  src/components/  │  src/lib/hooks/           │
└────────┬─────────────────────────────────┬──────────────────────┘
         │                                 │
         ▼                                 ▼
┌──────────────────────────┐    ┌──────────────────────────────────┐
│       API Routes          │    │    Types Layer (src/types/)       │
│  /api/builds/*            │    │  gem.ts │ build.ts │ optimization│
│  /api/optimize            │    └──────────┬───────────┬───────────┘
│  /api/session             │               │           │
└────────┬─────────────────┘               │           │
         │                                 │           │
         ▼                                 ▼           ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Application Layer                            │
│  src/lib/db/queries.ts  │  src/lib/session/  │  src/lib/utils/   │
│  src/lib/storage/       │  src/lib/data/     │                   │
└────────┬────────────────────────────────────────┬───────────────┘
         │                                        │
         ▼                                        ▼
┌────────────────────────┐              ┌──────────────────────────┐
│   Infrastructure Layer  │              │    Domain Layer           │
│  src/lib/db/index.ts    │              │  src/lib/optimization/    │
│  better-sqlite3         │              │  src/data/gems.json       │
│  Drizzle ORM            │              │  engine, scoring,         │
│  localStorage           │              │  resonance, resources     │
└────────────────────────┘              └──────────────────────────┘
```

### Concrete Dependencies

| Module | Depends On |
|--------|-----------|
| `/api/optimize` | `lib/optimization/*`, `types/optimization.ts`, `types/gem.ts`, `data/gems.json` |
| `/api/builds/*` | `lib/db/queries.ts`, `lib/db/schema.ts`, `lib/utils/sanitization.ts`, `zod` |
| `/api/session` | `lib/db/index.ts`, `types/build.ts` |
| `components/gems/*` | `components/ui/*`, `types/gem.ts`, `lib/optimization/constants.ts` (direct) |
| `components/optimization/*` | `components/ui/*`, `types/*`, `lib/optimization/constants.ts` |
| `lib/optimization/engine.ts` | `scoring.ts`, `resonance.ts`, `resources.ts`, `constants.ts`, `types.ts` |
| `lib/session/anonymous-session.ts` | `types/build.ts`, `/api/session` endpoints |
| `lib/db/queries.ts` | `lib/db/schema.ts`, `lib/db/index.ts` |
| `lib/hooks/*` | `lib/optimization/*`, `lib/session/*`, `lib/storage/*` |

---

## 3. API Routes Analysis

### `/api/builds/` — Build Management

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/builds?anonymousId=<uuid>` | GET | List all builds for a session | anonymousId query param |
| `/api/builds` | POST | Create a new build | anonymousId in body (Zod validated) |
| `/api/builds/[id]?anonymousId=<uuid>` | GET | Get single build | anonymousId query param |
| `/api/builds/[id]` | PATCH | Update build (name, notes, gems, resources) | anonymousId in body (Zod validated) |
| `/api/builds/[id]` | DELETE | Delete build | anonymousId query param |

**Request/Response Shapes:**
- POST/Create: `{ name, notes?, equippedGems, resources, awakenedSlots }` -> `{ id, name, ... }`
- Validation: Zod schemas (`CreateBuildSchema`, `UpdateBuildSchema`)
- Error responses: `{ message, details? }` with appropriate HTTP status codes
- Business logic: Build name uniqueness check, 5-build limit enforcement

**Data Flow:**
```
Client POST -> Zod validate -> sanitizeUserContent() -> checkBuildLimit() 
  -> checkNameAvailability() -> createBuild() -> 201 with build object
```

### `/api/optimize` — Optimization Engine

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/optimize` | POST | Run gem optimization | anonymousId in body |

**Request/Response Shapes:**
- Request: `{ equippedGems, resources, copyInventory, mode?, gameMode?, infusionGems? }`
- Response: `{ recommendations, totalPowerGain, infusionRecommendations, processingTimeMs }`
- Validation: Manual (not Zod) — custom `validateRequest()` function
- Timeout: 30-second `Promise.race`

**Data Flow:**
```
Client POST -> validateRequest() -> load gems from JSON Map
  -> convert UI types (1-indexed) to engine types (0-indexed)
  -> optimize() -> convert engine results back to API format
  -> return structured response or error
```

### `/api/session` — Session Management

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/session?anonymousId=<uuid>` | GET | Restore session state | anonymousId query param |
| `/api/session` | POST | Persist session state | anonymousId in body |
| `/api/session` | DELETE | Clear session (testing) | anonymousId query param |

**Data Flow:**
```
GET: anonymousId -> getSession() -> return sessionState or createEmptySessionState()
POST: { anonymousId, sessionState } -> upsertSession() -> 200/410
DELETE: anonymousId -> deleteSession() -> 204/410
```

---

## 4. Database Layer Analysis

### Schema (`src/lib/db/schema.ts`)

Two tables defined with Drizzle ORM:

**anonymousSessions**
| Column | Type | Notes |
|--------|------|-------|
| anonymousId | text (UUID) | Primary key |
| email | text | Nullable |
| emailVerified | integer | Boolean |
| sessionState | text (JSON) | Serialized SessionState |
| createdAt | integer (timestamp) | Auto-set |
| lastActive | integer (timestamp) | Auto-updated |

**savedBuilds**
| Column | Type | Notes |
|--------|------|-------|
| id | text (UUID) | Primary key |
| anonymousId | text (UUID) | FK -> anonymousSessions.anonymousId (cascade delete) |
| name | text | Unique per session |
| notes | text | Nullable |
| equippedGems | text (JSON) | Serialized gem array |
| resources | text (JSON) | Serialized resource inventory |
| awakenedSlots | integer | Stored as count, not array |
| createdAt | integer (timestamp) | Auto-set |
| updatedAt | integer (timestamp) | Auto-updated |

**Indexes:**
- `savedBuilds.anonymousId`
- `savedBuilds.createdAt DESC`

**Constants:**
- `DATABASE_PATH = ./data/di-lab.db`
- `MAX_BUILDS_FREE_TIER = 5`

### Connection (`src/lib/db/index.ts`)

```
module load -> ensureDir(data/) -> Database(DATABASE_PATH) -> drizzle(db, { schema })
```

- Synchronous connection at module initialization
- No connection pooling
- Exports: `db`, all schema types, helper functions

### Queries (`src/lib/db/queries.ts`)

**Build Operations:**
- `createBuild()` — validates name uniqueness, checks tier limit
- `getBuildsBySession()` — returns all builds, no pagination
- `getBuildById()` — single build with ownership check
- `updateBuild()` — partial update with merge
- `deleteBuild()` — cascade handled by FK
- `isBuildNameAvailable()` — uniqueness check
- `getBuildCount()` — tier limit enforcement

**Session Operations:**
- `upsertSession()` — insert or replace (no merge)
- `getSession()` — returns null if not found
- `deleteSession()` — removes session
- `updateSessionState()` — updates JSON blob and lastActive

**Issues Identified:**
- `awakenedSlots` stored as integer count but `SavedBuild` interface expects `AwakenedSlot[]` array
- Conversions happen at the query layer, not schema layer
- Session upsert replaces entire state (no merge on upsert)
- No prepared statements or query optimization
- No pagination on `getBuildsBySession()`

---

## 5. Optimization Engine Analysis

### File Structure

| File | Lines | Responsibility |
|------|-------|----------------|
| `engine.ts` | 456 | Main greedy algorithm, orchestration |
| `scoring.ts` | 302 | Power and ROI calculations |
| `resonance.ts` | 164 | Resonance math, thresholds, wing slots |
| `resources.ts` | 253 | Budget management, affordability checks |
| `constants.ts` | 356 | All tunable constants and lookup tables |
| `types.ts` | 265 | Engine-specific type definitions |

### Algorithm: Weighted Greedy Optimization

```
1. generatePossibleUpgrades() -> all single-rank upgrade candidates
2. calculateTotalResonance() -> current state baseline
3. For each candidate:
   a. calculatePowerGain() -> delta power with threshold bonus
   b. calculatePriorityScore() -> ROI = powerGain / resourceCost
4. filterAffordableUpgrades() -> remove unaffordable
5. Sort by priorityScore descending
6. Greedy select: for each affordable candidate, deduct resources
7. generateReasoning() -> human-readable explanations
8. If R10 5-star gems present -> generateInfusionRecommendations()
9. Return { recommendations, totalPowerGain, infusionRecommendations, processingTimeMs }
```

### Input/Output Contracts

**Input (`OptimizationInput`):**
```typescript
{
  equippedGems: EquippedGem[]      // 0-indexed slot, rank, quality
  copyInventory: Map<string, number> // gemName -> copies
  mode: 'tier' | 'roi'
  gameMode: 'pve' | 'pvp'
  infusionGems?: string[]
}
```

**Output (`OptimizationResult`):**
```typescript
{
  recommendations: UpgradeRecommendation[]
  totalPowerGain: number
  infusionRecommendations: InfusionRecommendation[]
  processingTimeMs: number
}
```

**UpgradeRecommendation:**
```typescript
{
  gemName: string
  slot: number                    // 0-indexed
  fromRank: number
  toRank: number
  priorityScore: number
  powerGain: number
  resonanceGain: number
  crGain: number
  gemPowerCost: number
  copiesUsed: number
  reasoning: string
}
```

### Key Concerns

1. **Single-rank steps only**: The engine only considers one-rank-at-a-time upgrades. Multi-rank combinations that might be more efficient are not evaluated.
2. **Greedy, not optimal**: Greedy selection can miss globally optimal solutions.
3. **No caching**: Optimization results are not cached for identical inputs.
4. **Infusion is separate**: Infusion recommendations are generated as a post-processing step, not integrated into the main optimization loop.

---

## 6. Session Management Analysis

### `src/lib/session/anonymous-session.ts`

**Architecture:**
```
Browser localStorage          Server API
┌─────────────┐              ┌──────────────┐
│ anonymousId │ ───GET────►  │ /api/session │
│ sessionState│ ◄───200────  │              │
│             │ ───POST───►  │              │
│             │ ◄───200────  │              │
└─────────────┘              └──────────────┘
```

**Key Functions:**
- `getOrCreateAnonymousId()` — generates UUID v4, stores in localStorage
- `fetchSessionState()` — GET /api/session with AbortSignal
- `persistSessionState()` — POST /api/session
- `updateEquippedGems()`, `updateResources()`, `updateAwakenedSlots()` — state mutators
- `autoSaveSessionState()` — debounced (500ms) auto-persist with abort controller
- `handleSessionInvalidation()` — clears ID, creates fresh session

**Issues:**
- Session state stored as denormalized JSON blob in single column
- Sessions never expire (commented out expiration logic)
- UUID generation relies on `crypto.randomUUID()` with Math.random fallback (less secure)
- No conflict resolution for multi-tab writes (last-write-wins)
- Auto-save can race with manual saves

---

## 7. Component Hierarchy Analysis

### UI Primitives (`src/components/ui/`)

| Component | Pattern | Notes |
|-----------|---------|-------|
| Button | shadcn/cva | 6 variants, loading state, asChild |
| Input | shadcn | Label, error, debounce, NumberInput variant |
| Card | shadcn composition | Card, Header, Title, Content, Footer, Body |
| Select | Dual-mode | Native select (mobile) + Radix (desktop) |
| Dialog | Radix | shadcn-styled Dialog with Header, Footer |
| Modal | Custom portal | Focus trap, ESC close, ConfirmModal variant |
| Tooltip | Custom | Delay, positioning, GemSummaryTooltip |
| Skeleton | shadcn | Pulse/wave animations, specialized variants |
| Toast | Context-based | Max 3, 5s auto-dismiss, 4 types |
| ScreenReaderAnnouncer | ARIA | Live regions (polite + assertive) |

### Gem Components (`src/components/gems/`)

| Component | Responsibility |
|-----------|----------------|
| GemCatalog | Browse by star tabs, search, filter by tier |
| GemCard | Catalog card with slot icon, tier badges, actions |
| GemDetail | Modal: effects, resonance table, costs |
| GemSelector | Quality/rank dropdowns, compact variant |
| InventorySlot | Tactical slot display with gradient, rank footer |

### Optimization Components (`src/components/optimization/`)

| Component | Responsibility |
|-----------|----------------|
| ResultsPanel | Sorted recommendation cards, summary stats, states |
| OptimizeButton | Sparkles button, loading state, timer |
| OptimizationModal | Full-screen modal, spinner, cancel |
| RecommendationCard | Individual upgrade recommendation |
| InfusionRecommendationCard | Infusion suggestion display |
| OptimizationError | Error display variants |
| AwakenedSlotsPanel | Wing slot management |
| AcquisitionPaths | Resource deficit and crafting paths |
| ResourceInput | Resource inventory input |
| SaveBuildModal | Build save dialog |

### Component Issues

1. **Dialog and Modal overlap**: Both exist with similar functionality. Modal is marked "backward compatibility" but both are actively imported.
2. **Custom Tooltip**: Reimplements tooltip when `@radix-ui/react-tooltip` is in dependencies.
3. **Direct constant imports**: GemDetail imports `ONE_STAR_RESONANCE`, `GEM_POWER_COSTS` directly from optimization constants, coupling UI to engine internals.
4. **No compound components**: UI primitives use prop-based configuration instead of compound component patterns.

---

## 8. Type System Analysis

### Type Definitions

**`src/types/gem.ts`** (236 lines) — Domain-facing gem types:
- `LegendaryGem` — with `effects[]`, `categories`, full game metadata
- `EquippedGem` — 1-indexed `slotPosition`, `rank`, `quality`
- `InventoryGem` — extends `LegendaryGem` with `quantity`
- `SLOT_CONFIG` — 8 base + 16 wing = 24 max slots
- Helpers: `deriveSlotType()`, `calculateUnlockedWingSlots()`, `canEquipGem()`

**`src/types/build.ts`** (241 lines) — Session/build types:
- `SessionState` — current UI state shape
- `SavedBuild` — database-backed build shape
- `AnonymousSession` — server session object
- `LocalStorageSchema` — localStorage versioned schema
- Constants: `STORAGE_KEY`, `MAX_BUILDS_PER_SESSION`
- Helpers: `createEmptySessionState()`, `sessionToSavedBuild()`, `savedBuildToSession()`

**`src/types/optimization.ts`** (231 lines) — API-facing types:
- `OptimizeRequest` — with `copyInventory: Record<string, number>`
- `OptimizeResponse` — API response shape
- `UpgradeRecommendation` — individual recommendation
- `OptimizationResult` — full result
- Constants: `CRAFTING_RATES`

**`src/lib/optimization/types.ts`** (265 lines) — Engine-facing types:
- `LegendaryGem` — **different interface** (no `effects[]`)
- `EquippedGem` — 0-indexed `slot`, different field names
- `UpgradeResources` — with `Map<string, number>` copy inventory
- `OptimizationInput` — engine input shape
- `OptimizationResult` — **different shape** from API types

### Critical Type Duplication

| Concept | src/types/ | src/lib/optimization/types.ts | Conflict |
|---------|-----------|-------------------------------|----------|
| Gem definition | `LegendaryGem` (with effects) | `LegendaryGem` (without effects) | INCOMPATIBLE |
| Equipped gem | `EquippedGem` (1-indexed) | `EquippedGem` (0-indexed) | INCOMPATIBLE |
| Tier ranking | `TierRanking` | `TierRanking` | Duplicate |
| Star rating | `StarRating` | `StarRating` | Duplicate |
| Quality | `Quality` | `QualityRating` | Named differently |
| Result | `OptimizationResult` | `OptimizationResult` | Different shapes |
| Game mode | `OptimizationMode` | `GameMode` | Named differently |

### Slot Indexing Mismatch

| Layer | Indexing | Field |
|-------|----------|-------|
| UI components | 1-indexed | `slotPosition: 1-24` |
| API request/response | 1-indexed | `slotPosition: 1-24` |
| Engine input | 0-indexed | `slot: 0-23` |
| Engine output | 0-indexed | `slot: 0-23` |
| Database | N/A (stored in JSON) | N/A |

Conversion happens ad-hoc in `/api/optimize/route.ts`:
```
slotPosition - 1  (UI -> Engine)
slot + 1          (Engine -> UI)
```

---

## 9. External Dependencies Review

| Package | Version | Purpose | Concerns |
|---------|---------|---------|----------|
| `next` | ^16.1.3 | Framework | App Router, Server Components |
| `react` | ^19.2.3 | UI library | Latest major |
| `drizzle-orm` | ^0.45.1 | ORM | Good choice for TypeScript |
| `better-sqlite3` | ^12.6.2 | SQLite driver | Synchronous, single-writer |
| `zod` | ^4.3.6 | Validation | Only used in /api/builds |
| `@radix-ui/*` | ^1.1.x | UI primitives | Dialog, Popover, Select, Tooltip |
| `next-auth` | ^5.0.0-beta.30 | Auth | Beta, not used (anonymous only) |
| `@auth/drizzle-adapter` | ^1.1.1 | Auth adapter | Installed but unused |
| `tesseract.js` | ^7.0.0 | OCR | Large bundle, client-only |
| `lucide-react` | ^0.564.0 | Icons | Good choice |
| `class-variance-authority` | ^0.7.1 | Component variants | Standard pattern |
| `tailwind-merge` | ^3.5.0 | Class merging | Standard pattern |

---

## 10. Test Coverage Analysis

### Test Infrastructure

| Tool | Purpose | Status |
|------|---------|--------|
| Vitest | Unit/integration tests | Configured and active |
| Playwright | E2E tests | Configured but NO tests |
| Testing Library | Component testing | Installed |

### Existing Tests

| File | Lines | Coverage |
|------|-------|----------|
| `src/lib/optimization/engine.test.ts` | 389 | Engine: empty input, tier prioritization, resource constraints, result structure, edge cases, performance (<100ms) |
| `src/__tests__/performance/performance.test.ts` | 164 | Constant validation, not real measurements |
| `src/__tests__/integration/gem-addition-flow.test.ts` | Exists | Content unreadable |
| `src/lib/utils/__tests__/contrast.test.ts` | Exists | Content unreadable |

### Coverage Gaps

| Area | Status | Priority |
|------|--------|----------|
| API routes | NO TESTS | HIGH |
| Database queries | NO TESTS | HIGH |
| Components | NO TESTS | MEDIUM |
| Session management | NO TESTS | MEDIUM |
| Type validation | NO TESTS | MEDIUM |
| E2E scenarios | NO TESTS (empty e2e/) | LOW |
| Scoring calculations | NO TESTS | MEDIUM |
| Resonance calculations | NO TESTS | MEDIUM |
| Resource calculations | NO TESTS | MEDIUM |
| Hooks | NO TESTS | LOW |

---

## 11. Build and Dev Tooling

| Tool | Config | Purpose |
|------|--------|---------|
| ESLint | `eslint.config.mjs` | Flat config with `eslint-config-next` |
| TypeScript | `tsconfig.json` | ES2017, strict mode, `@/*` alias |
| Prettier | `.prettierrc` (default) | Code formatting |
| Husky | `.husky/` | Git hooks |
| lint-staged | `.lintstagedrc.json` | Pre-commit linting |
| commitlint | `commitlint.config.js` | Conventional commits |
| release-please | `.github/workflows/release-please.yml` | Automated releases |
| Drizzle Kit | `drizzle-kit ^0.31.9` | Schema migrations |

### Hook Pipeline

```
git commit
  -> lint-staged triggers
     -> eslint --fix *.ts *.tsx
     -> prettier --write *.{ts,tsx,json,md}
  -> commit-msg hook (commitlint)
     -> validates conventional commit format
  -> commit succeeds
```

---

## 12. Identified Code Smells

### Tight Coupling

1. **Components import engine constants directly**
   - `GemDetail.tsx` imports `ONE_STAR_RESONANCE`, `GEM_POWER_COSTS` from `lib/optimization/constants.ts`
   - UI layer should not depend on domain-layer implementation details
   - Risk: Engine constant changes break UI without type errors

2. **API route embeds type conversion logic**
   - `/api/optimize/route.ts` contains inline conversion between UI types (1-indexed) and engine types (0-indexed)
   - This logic is duplicated across request parsing and response formatting
   - Should be a dedicated adapter/mapper module

### God Modules

1. **`constants.ts` (356 lines)**
   - Contains: tier multipliers, resonance tables, CR tables, gem power costs, threshold constants, AND helper functions (`getGemPowerCost`, `getResonance`, `getCR`)
   - Mixes data (lookup tables) with behavior (calculation functions)
   - Should separate into `constants.ts` (data) and `helpers.ts` (behavior)

2. **`queries.ts` (283 lines)**
   - All database operations in one file
   - No logical grouping or module separation
   - Should be split by entity: `builds.ts`, `sessions.ts`

### Unclear Boundaries

1. **Two type systems for the same domain**
   - `src/types/gem.ts` vs `src/lib/optimization/types.ts`
   - No clear contract between UI/API types and engine types
   - Requires manual conversion at boundaries

2. **Validation scattered across layers**
   - `/api/builds` uses Zod schemas
   - `/api/optimize` uses manual `validateRequest()` function
   - No unified validation strategy

### Duplicated Logic

1. **Resonance calculations exist in multiple places**
   - `lib/optimization/resonance.ts` — engine resonance
   - `lib/utils/resonance.ts` — utility resonance helpers
   - `lib/optimization/constants.ts` — resonance lookup tables
   - `types/gem.ts` — resonance-related type definitions

2. **Dialog and Modal components overlap**
   - Both provide modal dialog functionality
   - Different APIs, different implementations
   - Confusing for developers choosing which to use

### Leaky Abstractions

1. **`awakenedSlots` type inconsistency**
   - Database stores as integer count
   - `SavedBuild` interface expects `AwakenedSlot[]` array
   - Conversion happens in queries, not at schema boundary
   - Callers may receive unexpected shapes

2. **`copyInventory` format mismatch**
   - API uses `Record<string, number>`
   - Engine uses `Map<string, number>`
   - Conversion happens inline in API route

---

## 13. Performance Concerns

### Cold Start

1. **Synchronous SQLite connection**
   - `lib/db/index.ts` creates `better-sqlite3` connection at module load
   - Blocks the entire module initialization
   - On serverless, this happens on every cold start

2. **Full gem JSON loaded at module init**
   - `/api/optimize/route.ts` loads and parses entire `gems.json` into a Map at module scope
   - In serverless, this repeats on every cold start
   - No lazy loading or streaming option

### Runtime

1. **No query caching**
   - Every API call hits SQLite directly
   - No SWR/React Query on client
   - No Next.js caching on server
   - Repeated identical requests re-execute

2. **No pagination**
   - `GET /api/builds` returns ALL builds for a session
   - No cursor or offset-based pagination
   - Will degrade as users accumulate builds

3. **Greedy algorithm limitations**
   - O(n log n) for single-rank upgrade candidates
   - Does not evaluate multi-rank upgrade combinations
   - May produce suboptimal recommendations
   - Performance test validates <100ms but only with constants, not real data

### Memory

1. **Session state as JSON blob**
   - Entire session state serialized to single TEXT column
   - No partial updates possible
   - Large sessions increase read/write latency

2. **In-memory gem database**
   - `gemDatabase` Map held per server process
   - Duplicates memory in multi-process deployments
   - Not shared across instances

---

## 14. Scalability Bottlenecks

| Bottleneck | Impact | Current Limit | Scale Concern |
|------------|--------|---------------|---------------|
| SQLite single-writer | Serializes all writes | 1 concurrent write | Fails under concurrent load |
| No connection pooling | Single connection per process | 1 connection | No horizontal scaling |
| In-memory gem DB | Memory per process | Process memory limit | Wasteful in multi-process |
| No pagination | All results returned | ~5 builds/session | Degrades with data growth |
| No rate limiting | Unlimited requests | None | Abuse potential |
| No caching | Every request hits DB | 0% cache hit | Unnecessary DB load |

### Scaling Path

**Current (SQLite) -> Intermediate (PostgreSQL) -> Scale (Redis cache + PostgreSQL)**

1. **SQLite**: Single process, local file, simple deployment
2. **PostgreSQL**: Connection pooling, concurrent writes, horizontal reads
3. **Redis**: Session caching, gem data caching, rate limiting
4. **CDN**: Static gem data, component caching

---

## 15. Security Review

### Authentication Flow

| Aspect | Status | Risk |
|--------|--------|------|
| Anonymous auth via UUID | Implemented | UUID is easily spoofable |
| No session expiration | Commented out | Stale sessions accumulate |
| No CSRF protection | Not implemented | Anonymous state in body |
| Ownership via anonymousId | Query param | Trivially forgeable |

**Risk Level: HIGH** — Any client can access any session by guessing or crafting a UUID.

### Input Validation

| Endpoint | Validation Method | Consistency |
|----------|-------------------|-------------|
| `/api/builds` | Zod schemas | Consistent |
| `/api/optimize` | Manual validation | INCONSISTENT |
| `/api/session` | Manual checks | Minimal |

**Concern:** `/api/optimize` uses custom `validateRequest()` instead of Zod, creating inconsistent validation patterns and potential gaps.

### XSS Protection

- `sanitizeUserContent()` applied to build names and notes
- Content stored as JSON in SQLite
- No Content-Security-Policy headers configured
- No HTML sanitization on display side

### Security Headers

| Header | Value | Assessment |
|--------|-------|------------|
| X-Content-Type-Options | nosniff | Good |
| X-Frame-Options | ALLOWALL | VULNERABLE to clickjacking |
| X-XSS-Protection | 1; mode=block | Good (deprecated but harmless) |
| Content-Security-Policy | Not set | MISSING |
| Strict-Transport-Security | Not set | MISSING |
| Referrer-Policy | Not set | MISSING |

### Session Security

- Anonymous ID stored in localStorage (accessible to XSS)
- No HttpOnly cookies
- No session token rotation
- No session binding (IP, user-agent)

---

## 16. Technical Debt — Prioritized

### HIGH IMPACT

| ID | Item | Impact | Effort | Description |
|----|------|--------|--------|-------------|
| TD-01 | Type duplication | HIGH | MEDIUM | `src/types/gem.ts` and `src/lib/optimization/types.ts` define incompatible `LegendaryGem` and `EquippedGem` interfaces. Maintenance burden and runtime bug risk. |
| TD-02 | Slot indexing mismatch | HIGH | LOW | 1-indexed (UI) vs 0-indexed (engine) with ad-hoc conversion. Conversion bugs are subtle and hard to trace. |
| TD-03 | Synchronous SQLite cold start | HIGH | MEDIUM | DB connection blocks module init. Degrades serverless cold starts significantly. |
| TD-04 | No authorization | HIGH | MEDIUM | Any UUID can access any session. UUID is the only "auth" — trivially forgeable. |
| TD-05 | Inconsistent validation | MEDIUM | LOW | `/api/builds` uses Zod, `/api/optimize` uses manual validation. Should unify on Zod. |

### MEDIUM IMPACT

| ID | Item | Impact | Effort | Description |
|----|------|--------|--------|-------------|
| TD-06 | Dual Dialog/Modal components | MEDIUM | LOW | Overlapping functionality confuses developers. Should consolidate on Radix Dialog. |
| TD-07 | No repository pattern | MEDIUM | MEDIUM | Direct Drizzle access from API routes. No abstraction for data access patterns or caching. |
| TD-08 | Custom Tooltip reimplementation | LOW | LOW | `Tooltip.tsx` duplicates `@radix-ui/react-tooltip` already in dependencies. |
| TD-09 | God module constants.ts | MEDIUM | LOW | Mixes lookup tables with helper functions. Should separate data from behavior. |
| TD-10 | No rate limiting | MEDIUM | LOW | Anonymous API endpoints have no throttling. Abuse potential. |
| TD-11 | Session state as JSON blob | MEDIUM | MEDIUM | Denormalized storage prevents partial updates and efficient queries. |
| TD-12 | awakenedSlots type inconsistency | MEDIUM | LOW | Integer in DB vs array in interface. Conversion at wrong layer. |

### LOW IMPACT

| ID | Item | Impact | Effort | Description |
|----|------|--------|--------|-------------|
| TD-13 | No E2E tests | LOW | HIGH | Playwright configured but `e2e/` directory is empty. No integration-level coverage. |
| TD-14 | Performance tests are fake | LOW | MEDIUM | Performance tests validate constants, not real optimization performance. |
| TD-15 | No error boundaries | LOW | LOW | No React error boundaries for component-level error recovery. |
| TD-16 | next-auth unused | LOW | LOW | `next-auth` and `@auth/drizzle-adapter` installed but not used (anonymous only). Dead dependency weight. |

---

## 17. Summary

### Strengths

1. **Clean optimization engine** — Well-structured greedy algorithm with clear input/output contracts
2. **TypeScript throughout** — Strong typing with strict mode enabled
3. **Radix UI primitives** — Accessible, composable UI foundation
4. **Convention-based tooling** — ESLint, Prettier, commitlint, release-please all configured
5. **Game data separation** — Gem data in JSON, not hardcoded in logic
6. **Barrel exports** — Consistent use of `index.ts` for module public APIs

### Weaknesses

1. **Type system duplication** — Two parallel type definitions for the same domain concepts
2. **No authorization** — Anonymous UUID is the only access control
3. **Inconsistent patterns** — Zod in some routes, manual validation in others
4. **SQLite limitations** — Synchronous, single-writer, no pooling
5. **Component overlap** — Multiple implementations of the same UI pattern
6. **Test gaps** — Only engine logic tested; API, DB, components, sessions all untested

### Opportunities

1. **Unified type layer** — Single source of truth for domain types with adapters at boundaries
2. **Zod everywhere** — Consistent validation using Zod across all API boundaries
3. **Repository pattern** — Abstract data access for caching and database switching
4. **Feature-based structure** — Group code by feature domain, not by type
5. **PostgreSQL migration path** — Design for eventual horizontal scaling
6. **Comprehensive test suite** — Unit, integration, and E2E coverage for all layers
