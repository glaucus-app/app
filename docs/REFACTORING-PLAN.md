# Phased Refactoring Implementation Plan

> **Convoy:** `246ad037-204f-4cba-9ffb-8460ea1095aa` — Full App Refactor: Architecture & System Design
> **Inputs:** [Architecture Audit](./ARCHITECTURE-AUDIT.md), [Target Architecture](./TARGET-ARCHITECTURE.md)
> **Last Updated:** 2026-06-05

## Overview

This plan breaks the full application refactor into seven discrete, independently testable and deployable phases. Each phase:

- Does not break the running application
- Has clear entry and exit criteria
- Can be completed in a single focused coding session
- Builds on the previous phase without creating merge conflicts

Phases are ordered so that each one reduces coupling and increases testability before the next layer is touched. If a phase must be aborted, the application remains in a working state.

---

## Phase 1: Foundation & Structure

**Goal:** Establish the target directory skeleton, type system, and error-handling infrastructure without touching existing business logic.

**Target State:** New `src/` folders exist alongside the old ones. Old code still compiles and runs.

### Changes

#### Create

| File / Directory                          | Purpose                                                                       |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| `src/shared/types/`                       | Single source of truth for all domain types                                   |
| `src/shared/types/index.ts`               | Barrel export                                                                 |
| `src/shared/types/gem.ts`                 | Consolidated `Gem`, `LegendaryGem`, `EquippedGem`, `GemSlot` (resolves TD-01) |
| `src/shared/types/build.ts`               | `SessionState`, `SavedBuild`, `AwakenedSlot` (normalize 1-index vs 0-index)   |
| `src/shared/types/optimization.ts`        | API request/response contracts                                                |
| `src/shared/types/error.ts`               | Error envelope, error codes                                                   |
| `src/shared/errors/`                      | Custom error class hierarchy                                                  |
| `src/shared/errors/index.ts`              | Barrel export                                                                 |
| `src/shared/errors/app-error.ts`          | Base `AppError` with code, status, metadata                                   |
| `src/shared/errors/validation-error.ts`   | Extends `AppError` for Zod validation failures                                |
| `src/shared/errors/not-found-error.ts`    | Extends `AppError` for 404 cases                                              |
| `src/shared/errors/unauthorized-error.ts` | Extends `AppError` for auth failures                                          |
| `src/shared/utils/cn.ts`                  | Single `cn()` utility (delete duplicate at `src/lib/utils.ts`)                |
| `src/shared/utils/index.ts`               | Barrel export                                                                 |
| `src/features/`                           | Empty feature module root                                                     |
| `src/features/gems/`                      | Placeholder (filled in Phase 2)                                               |
| `src/features/optimization/`              | Placeholder (filled in Phase 2)                                               |
| `src/features/builds/`                    | Placeholder (filled in Phase 3)                                               |
| `src/data-access/`                        | Empty repository layer root (filled in Phase 3)                               |
| `src/data-access/schema.ts`               | New Drizzle schema (copied, not moved)                                        |
| `src/data-access/db.ts`                   | Async DB connection wrapper (resolves TD-03)                                  |
| `drizzle.config.ts`                       | Drizzle Kit config for migrations                                             |
| `drizzle/`                                | Migration output directory                                                    |
| `drizzle/meta/`                           | Drizzle snapshot metadata                                                     |

#### Modify

| File                 | Change                                                          |
| -------------------- | --------------------------------------------------------------- |
| `src/types/index.ts` | Re-export from `src/shared/types/` (deprecation shim)           |
| `src/lib/utils.ts`   | Re-export `cn` from `src/shared/utils/cn.ts` (deprecation shim) |
| `package.json`       | Add `"db:generate"`, `"db:migrate"`, `"db:push"` scripts        |
| `tsconfig.json`      | No change needed (paths already cover `src/*`)                  |

#### Delete

| File                              | Timing                                 |
| --------------------------------- | -------------------------------------- |
| `src/lib/utils/resonance.ts`      | Phase 2 (after dedup)                  |
| `src/lib/optimization/types.ts`   | Phase 2 (after migration)              |
| `src/types/*.ts` individual files | Phase 5 (after all consumers migrated) |
| `src/lib/utils.ts`                | Phase 5 (after all consumers migrated) |

### Order of Operations

1. Create `src/shared/errors/` with full class hierarchy
2. Create `src/shared/types/` with consolidated, compatible type definitions
   - Fix `EquippedGem.slot` to be 0-indexed everywhere; add a `displaySlot` computed property for UI
3. Create `src/shared/utils/cn.ts` and update barrel exports
4. Add deprecation shims so existing imports still resolve
5. Create `src/features/` skeleton with README per feature directory
6. Create `src/data-access/` skeleton with new async DB wrapper
7. Add `drizzle.config.ts` and `drizzle/` directory
8. Update `package.json` scripts
9. Run `bun typecheck && bun lint && bun test:run && bun build`

### Risk Assessment

| Risk                                                 | Likelihood | Impact | Mitigation                                                                       |
| ---------------------------------------------------- | ---------- | ------ | -------------------------------------------------------------------------------- |
| Type incompatibility between old and new definitions | Medium     | High   | Keep old files as re-export shims until all consumers migrate                    |
| Drizzle config breaks existing DB                    | Low        | High   | New `drizzle.config.ts` points to same schema file initially; no destructive ops |
| Barrel export creates circular dependency            | Low        | Medium | Use explicit imports within each barrel; verify with typecheck                   |

**Rollback Strategy:** All changes are additive. Revert is `git revert` of the commit(s) in this phase. No files are deleted or modified in-place (only new shim re-exports added).

### Verification

- `bun typecheck` — zero errors
- `bun lint` — zero errors
- `bun test:run` — all existing tests pass (unchanged behavior)
- `bun build` — production build succeeds
- Manual: visit `/`, `/optimize`, `/builds` — no regressions

### Complexity: **M**

---

## Phase 2: Domain Layer Extraction

**Goal:** Extract the gem optimization engine into a framework-agnostic domain module with zero Next.js/React dependencies.

**Target State:** `src/features/optimization/` and `src/features/gems/` contain pure TypeScript logic. Existing `src/lib/optimization/` is a thin adapter that delegates to the new layer.

### Changes

#### Create

| File / Directory                              | Purpose                                                                |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| `src/features/optimization/engine.ts`         | Greedy algorithm (moved from `lib/optimization/engine.ts`, cleaned up) |
| `src/features/optimization/scoring.ts`        | Power/ROI calculations                                                 |
| `src/features/optimization/resonance.ts`      | Resonance math (merge with `lib/utils/resonance.ts`)                   |
| `src/features/optimization/resources.ts`      | Budget management                                                      |
| `src/features/optimization/constants.ts`      | Tunable constants only (extract helpers to separate utils)             |
| `src/features/optimization/index.ts`          | Barrel export — public API                                             |
| `src/features/optimization/engine.test.ts`    | Comprehensive unit tests (port from old `engine.test.ts`, expand)      |
| `src/features/optimization/scoring.test.ts`   | Unit tests for scoring logic                                           |
| `src/features/optimization/resonance.test.ts` | Unit tests for resonance calculations                                  |
| `src/features/optimization/resources.test.ts` | Unit tests for resource management                                     |
| `src/features/gems/catalog.ts`                | Gem catalog loader, filtering, sorting                                 |
| `src/features/gems/validation.ts`             | Gem data validation with Zod                                           |
| `src/features/gems/index.ts`                  | Barrel export                                                          |
| `src/features/gems/catalog.test.ts`           | Unit tests for catalog operations                                      |

#### Modify

| File                         | Change                                                                 |
| ---------------------------- | ---------------------------------------------------------------------- |
| `src/lib/optimization/*.ts`  | Replace implementation with delegation to `src/features/optimization/` |
| `src/lib/utils/resonance.ts` | Replace with re-export from `src/features/optimization/resonance.ts`   |
| `src/data/gems.json`         | No change; loaded by `features/gems/catalog.ts`                        |

#### Delete (after delegation verified)

| File                                           | Timing                                         |
| ---------------------------------------------- | ---------------------------------------------- |
| `src/lib/optimization/types.ts`                | After all imports point to `src/shared/types/` |
| `src/lib/optimization/engine.ts` (original)    | After delegation verified                      |
| `src/lib/optimization/scoring.ts` (original)   | After delegation verified                      |
| `src/lib/optimization/resonance.ts` (original) | After delegation verified                      |
| `src/lib/optimization/resources.ts` (original) | After delegation verified                      |
| `src/lib/optimization/constants.ts` (original) | After delegation verified                      |
| `src/lib/utils/resonance.ts` (original)        | After dedup verified                           |

### Order of Operations

1. Create `src/features/optimization/constants.ts` with only tunable constants
2. Create `src/features/optimization/resonance.ts` — merge logic from `lib/optimization/resonance.ts` and `lib/utils/resonance.ts`
3. Create `src/features/optimization/scoring.ts` — port scoring logic
4. Create `src/features/optimization/resources.ts` — port resource logic
5. Create `src/features/optimization/engine.ts` — port main greedy algorithm, use `shared/types`
6. Write unit tests for each module
7. Convert `src/lib/optimization/` files to thin adapters that delegate to the new layer
8. Update `src/app/api/optimize/route.ts` to use new types (slot index normalization happens here)
9. Run full test suite, fix any failures
10. Once all consumers use the new layer, delete old implementation files

### Risk Assessment

| Risk                                   | Likelihood | Impact | Mitigation                                                                                            |
| -------------------------------------- | ---------- | ------ | ----------------------------------------------------------------------------------------------------- |
| Algorithm behavior changes during port | Medium     | High   | Port tests first (TDD approach); compare outputs against old engine                                   |
| Slot index confusion (0 vs 1)          | Medium     | High   | Centralize conversion in `shared/types/build.ts` as `slotIndex` (0-based) and `displaySlot` (1-based) |
| Resonance dedup introduces regression  | Low        | Medium | Keep both implementations side-by-side during verification; compare outputs                           |

**Rollback Strategy:** Old `lib/optimization/` files remain as delegation adapters. If behavior changes are detected, revert the adapter layer and restore originals from git.

### Verification

- `bun test:run` — all new domain tests pass
- `bun test:coverage` — domain layer coverage > 80%
- `bun typecheck` — zero errors
- Manual: run optimizer with same inputs as before; compare output builds match exactly
- Performance: optimizer completes in < 100ms for typical input (same as before)

### Complexity: **L**

---

## Phase 3: Data Layer Refactoring

**Goal:** Implement the repository pattern for data access, fix the Drizzle schema, and add migration infrastructure.

**Target State:** API routes call repository methods instead of raw Drizzle queries. DB connection is async. Schema has proper relations and constraints.

### Changes

#### Create

| File / Directory                        | Purpose                                       |
| --------------------------------------- | --------------------------------------------- |
| `src/data-access/repository.ts`         | Repository interface definitions              |
| `src/data-access/session-repository.ts` | Session CRUD with proper typing               |
| `src/data-access/build-repository.ts`   | Build CRUD with proper typing                 |
| `src/data-access/index.ts`              | Barrel export, singleton repository instances |
| `src/data-access/schema.ts`             | New schema with fixes (see below)             |
| `src/data-access/relations.ts`          | Drizzle relation definitions                  |
| `drizzle/0001_initial.sql`              | First migration (generated)                   |
| `src/data-access/migrate.ts`            | Migration runner for production               |

#### Modify

| File                               | Change                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| `src/data-access/schema.ts`        | Fix `awakenedSlots` to JSON array type; add proper FK constraints; add unique indexes |
| `src/data-access/db.ts`            | Replace sync `better-sqlite3` import with async lazy-init wrapper                     |
| `src/lib/db/index.ts`              | Replace with re-export from `src/data-access/db.ts` (deprecation shim)                |
| `src/lib/db/queries.ts`            | Replace with delegation to repository methods                                         |
| `src/app/api/session/route.ts`     | Use session repository instead of raw queries                                         |
| `src/app/api/builds/route.ts`      | Use build repository instead of raw queries                                           |
| `src/app/api/builds/[id]/route.ts` | Use build repository instead of raw queries                                           |

#### Schema Fixes

| Issue                                     | Fix                                                         |
| ----------------------------------------- | ----------------------------------------------------------- |
| `awakenedSlots` stored as integer         | Change to `json` column storing `AwakenedSlot[]` array      |
| Missing FK cascade                        | Explicit `onDelete('cascade')` on `savedBuilds.anonymousId` |
| No uniqueness constraint on session email | Add unique index on `email` where `email IS NOT NULL`       |

### Order of Operations

1. Generate initial migration from current schema: `bun db:generate`
2. Create `src/data-access/db.ts` with async lazy-init (no sync module-level side effects)
3. Create `src/data-access/schema.ts` with corrected types
4. Generate migration for schema changes: `bun db:generate`
5. Create repository interfaces and implementations
6. Update `lib/db/queries.ts` to delegate to repositories
7. Update API route handlers to use repositories
8. Run `bun db:migrate` locally to verify migrations apply cleanly
9. Run full test suite

### Risk Assessment

| Risk                                            | Likelihood | Impact   | Mitigation                                                                               |
| ----------------------------------------------- | ---------- | -------- | ---------------------------------------------------------------------------------------- |
| Migration corrupts existing data                | Low        | Critical | Test migrations on a copy of production data; include rollback SQL in migration comments |
| Async DB init breaks existing sync calls        | Medium     | High     | Keep sync shim in `lib/db/index.ts` during transition; verify all call sites migrated    |
| `awakenedSlots` type change breaks saved builds | Medium     | High     | Add migration that converts integer to JSON array format; verify with existing test data |

**Rollback Strategy:** Each migration includes a `down` SQL comment. Revert by running rollback SQL. Repository delegation means old query logic is still accessible if needed.

### Verification

- `bun typecheck` — zero errors
- `bun test:run` — all tests pass
- `bun db:generate` — generates clean migration with no errors
- `bun db:migrate` — applies migrations successfully
- Manual: create session, save build, load build — all operations work
- Manual: verify existing saved builds load correctly after migration

### Complexity: **L**

---

## Phase 4: API Layer Restructuring

**Goal:** Add Zod validation at all API boundaries, standardize error handling, and implement rate limiting.

**Target State:** All API routes use a consistent pattern: validate input with Zod, call repository, return standardized response or error envelope.

### Changes

#### Create

| File / Directory                         | Purpose                                            |
| ---------------------------------------- | -------------------------------------------------- |
| `src/shared/schemas/`                    | Zod schemas for all API inputs                     |
| `src/shared/schemas/session.ts`          | Session request/response schemas                   |
| `src/shared/schemas/build.ts`            | Build request/response schemas                     |
| `src/shared/schemas/optimize.ts`         | Optimize request/response schemas                  |
| `src/shared/schemas/index.ts`            | Barrel export                                      |
| `src/shared/middleware.ts`               | Shared API utilities (error handler, rate limiter) |
| `src/shared/middleware/rate-limit.ts`    | In-memory rate limiter (Bun-friendly)              |
| `src/shared/middleware/error-handler.ts` | Centralized error-to-response converter            |

#### Modify

| File                               | Change                                                               |
| ---------------------------------- | -------------------------------------------------------------------- |
| `src/app/api/optimize/route.ts`    | Use Zod schema, error handler, rate limiter; slot normalization here |
| `src/app/api/session/route.ts`     | Use Zod schema, error handler                                        |
| `src/app/api/builds/route.ts`      | Use Zod schema, error handler, rate limiter                          |
| `src/app/api/builds/[id]/route.ts` | Use Zod schema, error handler                                        |

#### Delete

| File                                             | Timing                        |
| ------------------------------------------------ | ----------------------------- |
| Inline `validateRequest()` in optimize route     | After Zod schema migration    |
| Manual error response construction in all routes | After error handler migration |

### Order of Operations

1. Create Zod schemas for all API request bodies and query params
2. Create `error-handler.ts` — converts `AppError` subclasses to `NextResponse`
3. Create `rate-limit.ts` — simple sliding-window rate limiter
4. Update `/api/optimize/route.ts` — add validation, error handler, rate limiting
5. Update `/api/session/route.ts` — same pattern
6. Update `/api/builds/route.ts` — same pattern
7. Update `/api/builds/[id]/route.ts` — same pattern
8. Add authorization check to session/build routes (resolves TD-04): verify `anonymous_id` matches session cookie or header
9. Run full test suite
10. Run integration test for each API endpoint

### Risk Assessment

| Risk                                         | Likelihood | Impact | Mitigation                                                                  |
| -------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------- |
| Zod schema rejects previously valid input    | Medium     | High   | Test schemas against real API traffic samples before deploying              |
| Rate limiter breaks legitimate requests      | Low        | Medium | Start with generous limits (100 req/min); monitor and adjust                |
| Authorization check locks out existing users | Low        | High   | Authorization based on `anonymous_id` header which is already set by client |

**Rollback Strategy:** Each route is updated independently. If a route breaks, revert that single file. Error handler is additive and only affects routes that use it.

### Verification

- `bun typecheck` — zero errors
- `bun lint` — zero errors
- `bun test:run` — all tests pass
- Manual: test each API endpoint with valid and invalid inputs
- Manual: verify rate limiting triggers after threshold
- Manual: verify error responses include proper status codes and structured bodies
- Integration: run `src/__tests__/integration/gem-addition-flow.test.ts` — passes

### Complexity: **M**

---

## Phase 5: Component Architecture

**Goal:** Restructure components into feature-based organization with proper server/client component split.

**Target State:** `src/features/gems/components/`, `src/features/optimization/components/`, `src/features/builds/components/` contain all UI. `src/shared/components/ui/` contains primitives. Old `src/components/` is empty and deleted.

### Changes

#### Create

| File / Directory                                                      | Purpose                                              |
| --------------------------------------------------------------------- | ---------------------------------------------------- |
| `src/features/gems/components/`                                       | Gem-related UI components                            |
| `src/features/gems/components/GemCard.tsx`                            | Moved from `components/gems/`                        |
| `src/features/gems/components/GemCatalog.tsx`                         | Moved from `components/gems/`                        |
| `src/features/gems/components/GemDetail.tsx`                          | Moved from `components/gems/`                        |
| `src/features/gems/components/GemSelector.tsx`                        | Moved from `components/gems/`                        |
| `src/features/gems/components/InventorySlot.tsx`                      | Moved from `components/gems/`                        |
| `src/features/gems/components/index.ts`                               | Barrel export                                        |
| `src/features/optimization/components/`                               | Optimization UI components                           |
| `src/features/optimization/components/ResultsPanel.tsx`               | Moved from `components/optimization/`                |
| `src/features/optimization/components/ResourceInput.tsx`              | Moved from `components/optimization/`                |
| `src/features/optimization/components/OptimizationModal.tsx`          | Moved from `components/optimization/`                |
| `src/features/optimization/components/SaveBuildModal.tsx`             | Moved from `components/optimization/`                |
| `src/features/optimization/components/OptimizeButton.tsx`             | Moved from `components/optimization/`                |
| `src/features/optimization/components/RecommendationCard.tsx`         | Moved from `components/optimization/`                |
| `src/features/optimization/components/InfusionRecommendationCard.tsx` | Moved from `components/optimization/`                |
| `src/features/optimization/components/AcquisitionPaths.tsx`           | Moved from `components/optimization/`                |
| `src/features/optimization/components/AwakenedSlotsPanel.tsx`         | Moved from `components/optimization/`                |
| `src/features/optimization/components/OptimizationError.tsx`          | Moved from `components/optimization/`                |
| `src/features/optimization/components/index.ts`                       | Barrel export                                        |
| `src/features/builds/components/`                                     | Build-related UI (extracted from pages)              |
| `src/features/builds/components/BuildList.tsx`                        | Build list component                                 |
| `src/features/builds/components/BuildCard.tsx`                        | Single build card                                    |
| `src/features/builds/components/index.ts`                             | Barrel export                                        |
| `src/shared/components/ui/`                                           | Shared UI primitives (renamed from `components/ui/`) |

#### Modify

| File                                   | Change                                                        |
| -------------------------------------- | ------------------------------------------------------------- |
| `src/app/page.tsx`                     | Update imports to new component locations                     |
| `src/app/optimize/page.tsx`            | Update imports; ensure proper `"use client"` directive        |
| `src/app/builds/page.tsx`              | Update imports; extract list logic to `BuildList`             |
| `src/app/layout.tsx`                   | Update imports if any UI components referenced                |
| Each moved component                   | Add `"use client"` if needed; remove if not; fix import paths |
| `src/components/gems/index.ts`         | Re-export from new location (deprecation shim)                |
| `src/components/optimization/index.ts` | Re-export from new location (deprecation shim)                |
| `src/components/ui/index.ts`           | Re-export from `src/shared/components/ui/` (deprecation shim) |

#### Delete (after all consumers migrated)

| File                           | Timing                           |
| ------------------------------ | -------------------------------- |
| `src/components/gems/`         | After all imports updated        |
| `src/components/optimization/` | After all imports updated        |
| `src/components/ui/`           | After all imports updated        |
| `src/components/` (directory)  | After all subdirectories deleted |

### Order of Operations

1. Move UI primitives to `src/shared/components/ui/`
2. Move gem components to `src/features/gems/components/`
3. Move optimization components to `src/features/optimization/components/`
4. Create build components in `src/features/builds/components/`
5. Add deprecation shims in old `src/components/` locations
6. Update page imports one at a time (home, then optimize, then builds)
7. Audit each component for `"use client"` — remove where unnecessary
8. Run `bun build` to verify server/client component split is correct
9. Delete old `src/components/` directory and shims

### Risk Assessment

| Risk                                        | Likelihood | Impact | Mitigation                                                          |
| ------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------- |
| Missing `"use client"` breaks interactivity | Medium     | High   | Test each page after migration; use Next.js build warnings          |
| Incorrect `"use client"` hurts performance  | Low        | Medium | Audit with `@next/bundle-analyzer`; remove unnecessary directives   |
| Import path breakage during move            | Low        | Medium | Use deprecation shims; update all imports before deleting old files |

**Rollback Strategy:** Deprecation shims mean old import paths still work. Revert is simply removing new files and restoring originals from git.

### Verification

- `bun typecheck` — zero errors
- `bun build` — zero warnings about server/client boundary
- `bun lint` — zero errors
- Manual: visit `/` — all gem components render and interact correctly
- Manual: visit `/optimize` — optimization modal, inputs, results all work
- Manual: visit `/builds` — build list loads, save/load/delete work
- Lighthouse: no regression in performance score

### Complexity: **M**

---

## Phase 6: Testing & Quality

**Goal:** Fill test coverage gaps, add integration tests, set up e2e tests, and add performance benchmarks.

**Target State:** All domain logic, repository layer, API routes, and critical user flows have tests. Coverage > 80% overall.

### Changes

#### Create

| File / Directory                                   | Purpose                                     |
| -------------------------------------------------- | ------------------------------------------- |
| `src/features/gems/catalog.test.ts`                | Gem catalog filtering, sorting, validation  |
| `src/features/gems/validation.test.ts`             | Zod schema validation for gem data          |
| `src/data-access/session-repository.test.ts`       | Session CRUD operations                     |
| `src/data-access/build-repository.test.ts`         | Build CRUD operations                       |
| `src/__tests__/integration/optimize-flow.test.ts`  | Full optimize API flow                      |
| `src/__tests__/integration/session-flow.test.ts`   | Session save/restore flow                   |
| `src/__tests__/integration/build-flow.test.ts`     | Build CRUD flow                             |
| `src/__tests__/integration/error-handling.test.ts` | Error response format consistency           |
| `src/__tests__/performance/optimizer.bench.ts`     | Optimizer speed benchmark                   |
| `e2e/optimize.spec.ts`                             | E2E: run optimization from input to results |
| `e2e/session.spec.ts`                              | E2E: session persistence across page reload |
| `e2e/builds.spec.ts`                               | E2E: create, view, delete saved builds      |
| `e2e/fixtures.ts`                                  | Playwright test fixtures and helpers        |

#### Modify

| File                                                  | Change                                   |
| ----------------------------------------------------- | ---------------------------------------- |
| `vitest.config.ts`                                    | Add coverage thresholds if not present   |
| `playwright.config.ts`                                | Verify config matches e2e test locations |
| `src/__tests__/performance/performance.test.ts`       | Update to use new benchmark format       |
| `src/__tests__/integration/gem-addition-flow.test.ts` | Update imports for new paths             |

### Order of Operations

1. Write domain layer tests (Phase 2 coverage gaps)
2. Write repository layer tests (mock DB)
3. Write API integration tests (use real SQLite test DB)
4. Write performance benchmarks for optimizer
5. Set up Playwright fixtures
6. Write e2e test: optimize flow
7. Write e2e test: session flow
8. Write e2e test: builds flow
9. Run `bun test:coverage` — verify > 80% overall
10. Run `bun test:e2e` — all e2e tests pass

### Risk Assessment

| Risk                                   | Likelihood | Impact | Mitigation                                                     |
| -------------------------------------- | ---------- | ------ | -------------------------------------------------------------- |
| Integration tests fail due to DB state | Medium     | Medium | Use fresh test DB per test run; clean up in `beforeEach`       |
| E2E tests flaky due to timing          | Medium     | Low    | Use Playwright's auto-wait; avoid hardcoded timeouts           |
| Coverage threshold too aggressive      | Low        | Low    | Set threshold at 70% initially; raise to 80% after gaps filled |

**Rollback Strategy:** All changes are additive (new test files). No rollback needed — tests never break production.

### Verification

- `bun test:coverage` — overall coverage > 80%, domain layer > 90%
- `bun test:run` — zero failures
- `bun test:e2e` — all e2e scenarios pass
- Performance: optimizer benchmark shows < 100ms for typical input
- CI: all checks green (once Phase 7 CI is set up)

### Complexity: **L**

---

## Phase 7: Polish & Production Readiness

**Goal:** Optimize performance, harden security, update documentation, and set up CI/CD pipeline.

**Target State:** Application ships with CI checks, comprehensive docs, security headers, and optimized bundle.

### Changes

#### Create

| File / Directory                   | Purpose                                   |
| ---------------------------------- | ----------------------------------------- |
| `.github/workflows/ci.yml`         | CI pipeline: lint, typecheck, test, build |
| `.github/workflows/e2e.yml`        | E2E test workflow (runs on PR)            |
| `src/shared/middleware/headers.ts` | Security headers middleware               |
| `SECURITY.md`                      | Security policy                           |
| `CONTRIBUTING.md`                  | Contributor guidelines                    |
| `docs/REFACTORING-COMPLETE.md`     | Post-refactor architecture documentation  |

#### Modify

| File                         | Change                                                          |
| ---------------------------- | --------------------------------------------------------------- |
| `next.config.ts`             | Add security headers, bundle analysis, optimize package imports |
| `src/app/layout.tsx`         | Add security meta tags                                          |
| `middleware.ts`              | Add security header injection                                   |
| `package.json`               | Add `analyze` script for bundle analysis                        |
| `README.md`                  | Update with new architecture, setup instructions                |
| `docs/ARCHITECTURE-AUDIT.md` | Mark all resolved items                                         |
| All deprecation shim files   | Delete (old `src/types/`, `src/components/`, `src/lib/`)        |

#### Performance Optimizations

| Area               | Action                                                               |
| ------------------ | -------------------------------------------------------------------- |
| Tesseract.js       | Lazy-load on client; move off critical path                          |
| Bundle size        | Analyze with `@next/bundle-analyzer`; tree-shake unused lucide icons |
| Image optimization | Audit for missing `next/image` usage                                 |
| Caching            | Add `revalidate` to static data routes                               |
| DB queries         | Add query result caching for gem catalog                             |

#### Security Hardening

| Area               | Action                                                        |
| ------------------ | ------------------------------------------------------------- |
| Headers            | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| Input sanitization | Verify all user input passes through Zod + sanitization       |
| Rate limiting      | Verify rate limits on all mutation endpoints                  |
| Authorization      | Verify session isolation (TD-04 resolved in Phase 4)          |
| Dependencies       | Run `bun audit`; fix any vulnerabilities                      |

### Order of Operations

1. Create CI workflow (`.github/workflows/ci.yml`)
2. Create E2E workflow (`.github/workflows/e2e.yml`)
3. Add security headers to middleware and `next.config.ts`
4. Run bundle analysis; optimize imports and lazy-load Tesseract
5. Run `bun audit`; fix vulnerabilities
6. Delete all deprecation shim files and old directories
7. Run full test suite (unit + integration + e2e)
8. Run `bun build` — verify production build
9. Update README and all documentation
10. Create `REFACTORING-COMPLETE.md` summary
11. Push and verify CI passes

### Risk Assessment

| Risk                                       | Likelihood | Impact | Mitigation                                                                      |
| ------------------------------------------ | ---------- | ------ | ------------------------------------------------------------------------------- |
| CI workflow misconfigured                  | Low        | Low    | Test locally with `act` or push to branch first                                 |
| Security headers break functionality       | Medium     | Medium | Start with permissive CSP; tighten incrementally                                |
| Deleting shim files breaks unknown imports | Low        | High   | Run `bun build` and `bun typecheck` before deleting; grep for remaining imports |
| Tesseract lazy-load breaks OCR feature     | Low        | High   | Test OCR flow manually after lazy-loading                                       |

**Rollback Strategy:** Each change is independent. CI workflows can be disabled. Security headers can be reverted. Shim file deletion is the only destructive step — keep a branch backup before deleting.

### Verification

- `bun typecheck` — zero errors
- `bun lint` — zero errors
- `bun test:run` — all tests pass
- `bun test:coverage` — coverage > 80%
- `bun test:e2e` — all e2e tests pass
- `bun build` — production build succeeds with no warnings
- `bun audit` — zero vulnerabilities
- CI: all workflow checks green
- Lighthouse: performance >= 90, accessibility >= 90, best-practices >= 90, SEO >= 90
- Security: no sensitive data in client bundle; headers present

### Complexity: **M**

---

## Dependency Graph

```
Phase 1 (Foundation)
  └── Phase 2 (Domain Layer)
        └── Phase 3 (Data Layer)
              └── Phase 4 (API Layer)
                    └── Phase 5 (Components)
                          └── Phase 6 (Testing)
                                └── Phase 7 (Polish)
```

Each phase depends on the previous phase being complete and merged. No parallel execution is recommended to avoid merge conflicts and ensure each layer is stable before building on it.

## Technical Debt Resolution Map

| TD Item   | Phase   | Description                                             |
| --------- | ------- | ------------------------------------------------------- |
| **TD-01** | Phase 1 | Type duplication — consolidate into `src/shared/types/` |
| **TD-02** | Phase 1 | Slot indexing mismatch — normalize in shared types      |
| **TD-03** | Phase 3 | Sync SQLite cold start — async lazy-init wrapper        |
| **TD-04** | Phase 4 | No authorization — add session ownership check          |
| **TD-05** | Phase 4 | Inconsistent validation — standardize on Zod            |
| TD-06     | Phase 2 | God file `constants.ts` — extract helpers               |
| TD-07     | Phase 2 | Duplicate resonance logic — merge into single module    |
| TD-08     | Phase 5 | Type-organized components — move to feature-based       |
| TD-09     | Phase 5 | Missing server/client split — audit and fix             |
| TD-10     | Phase 6 | Test coverage gaps — add unit, integration, e2e         |
| TD-11     | Phase 7 | No CI pipeline — add GitHub Actions workflows           |
| TD-12     | Phase 3 | No migration infrastructure — add Drizzle Kit           |

## Post-Refactor Directory Structure

```
src/
├── app/
│   ├── api/
│   │   ├── builds/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── optimize/route.ts
│   │   └── session/route.ts
│   ├── builds/page.tsx
│   ├── optimize/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── data/
│   └── gems.json
├── features/
│   ├── gems/
│   │   ├── components/
│   │   │   ├── GemCard.tsx
│   │   │   ├── GemCatalog.tsx
│   │   │   ├── GemDetail.tsx
│   │   │   ├── GemSelector.tsx
│   │   │   ├── InventorySlot.tsx
│   │   │   └── index.ts
│   │   ├── catalog.ts
│   │   ├── validation.ts
│   │   ├── catalog.test.ts
│   │   ├── validation.test.ts
│   │   └── index.ts
│   ├── optimization/
│   │   ├── components/
│   │   │   ├── AcquisitionPaths.tsx
│   │   │   ├── AwakenedSlotsPanel.tsx
│   │   │   ├── InfusionRecommendationCard.tsx
│   │   │   ├── OptimizationError.tsx
│   │   │   ├── OptimizationModal.tsx
│   │   │   ├── OptimizeButton.tsx
│   │   │   ├── RecommendationCard.tsx
│   │   │   ├── ResourceInput.tsx
│   │   │   ├── ResultsPanel.tsx
│   │   │   ├── SaveBuildModal.tsx
│   │   │   └── index.ts
│   │   ├── engine.ts
│   │   ├── scoring.ts
│   │   ├── resonance.ts
│   │   ├── resources.ts
│   │   ├── constants.ts
│   │   ├── engine.test.ts
│   │   ├── scoring.test.ts
│   │   ├── resonance.test.ts
│   │   ├── resources.test.ts
│   │   └── index.ts
│   └── builds/
│       ├── components/
│       │   ├── BuildList.tsx
│       │   ├── BuildCard.tsx
│       │   └── index.ts
│       └── index.ts
├── shared/
│   ├── types/
│   │   ├── gem.ts
│   │   ├── build.ts
│   │   ├── optimization.ts
│   │   ├── error.ts
│   │   └── index.ts
│   ├── errors/
│   │   ├── app-error.ts
│   │   ├── validation-error.ts
│   │   ├── not-found-error.ts
│   │   ├── unauthorized-error.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── formatting.ts
│   │   ├── sanitization.ts
│   │   ├── slots.ts
│   │   └── index.ts
│   ├── schemas/
│   │   ├── session.ts
│   │   ├── build.ts
│   │   ├── optimize.ts
│   │   └── index.ts
│   ├── components/ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Dialog.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── ScreenReaderAnnouncer.tsx
│   │   ├── Select.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Toast.tsx
│   │   ├── Tooltip.tsx
│   │   └── index.ts
│   └── middleware/
│       ├── rate-limit.ts
│       ├── error-handler.ts
│       ├── headers.ts
│       └── index.ts
├── data-access/
│   ├── schema.ts
│   ├── relations.ts
│   ├── db.ts
│   ├── migrate.ts
│   ├── repository.ts
│   ├── session-repository.ts
│   ├── build-repository.ts
│   └── index.ts
├── hooks/
│   ├── useMultiTabSync.ts
│   ├── useOptimisticUpdate.ts
│   └── useOptimize.ts
├── __tests__/
│   ├── integration/
│   └── performance/
└── test/
    └── setup.ts
```
