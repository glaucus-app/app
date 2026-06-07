# Greenfield Implementation Plan — Glaucus App

> **Convoy:** `ca469997-9a7c-46d4-bd60-9dbb1f61b6f4` — Foundational Docs Overhaul - Fresh Start
> **Inputs:** [Target Architecture](./TARGET-ARCHITECTURE.md), [Constitution](./.specify/memory/constitution.md)
> **Last Updated:** 2026-06-06

## Overview

This plan builds the Glaucus application as a completely new implementation, incorporating lessons from previous iterations. Each milestone:

- Delivers working, shippable functionality
- Has clear entry and exit criteria
- Can be completed in focused coding sessions
- Builds on previous milestones through clean architectural layers

The old application codebase is used as a **reference for requirements only**, not as code to be patched or incrementally modified. All work is greenfield from this point forward.

---

## Phase 1: Foundation & Structure

**Goal:** Establish the target directory skeleton, type system, and error-handling infrastructure for the new Glaucus implementation.

**Target State:** Clean `src/` structure following specification-first development with proper type definitions.

### Changes

#### Create

| File / Directory                          | Purpose                                               |
| ----------------------------------------- | ----------------------------------------------------- |
| `src/shared/types/`                       | Single source of truth for all domain types           |
| `src/shared/types/index.ts`               | Barrel export                                         |
| `src/shared/types/gem.ts`                 | `Gem`, `LegendaryGem`, `EquippedGem`, `GemSlot` types |
| `src/shared/types/build.ts`               | `SessionState`, `SavedBuild`, `AwakenedSlot` types    |
| `src/shared/types/error.ts`               | Error envelope, error codes                           |
| `src/shared/errors/`                      | Custom error class hierarchy                          |
| `src/shared/errors/index.ts`              | Barrel export                                         |
| `src/shared/errors/app-error.ts`          | Base `AppError` with code, status, metadata           |
| `src/shared/errors/validation-error.ts`   | Extends `AppError` for Zod validation failures        |
| `src/shared/errors/not-found-error.ts`    | Extends `AppError` for 404 cases                      |
| `src/shared/errors/unauthorized-error.ts` | Extends `AppError` for auth failures                  |
| `src/shared/utils/`                       | Shared utilities                                      |
| `src/shared/utils/cn.ts`                  | Single `cn()` utility                                 |
| `src/shared/utils/index.ts`               | Barrel export                                         |
| `src/features/`                           | Feature module root                                   |
| `src/features/gems/`                      | Gem domain feature                                    |
| `src/features/optimization/`              | Optimization domain feature                           |
| `src/features/builds/`                    | Build management feature                              |
| `src/features/characters/`                | Character management feature                          |
| `src/lib/db/`                             | Database layer                                        |
| `src/lib/db/schema.ts`                    | Fresh Drizzle schema (greenfield design)              |
| `src/lib/db/index.ts`                     | DB connection wrapper                                 |

### Order of Operations

1. Create `src/shared/errors/` with full class hierarchy
2. Create `src/shared/types/` with type definitions per specification
3. Create `src/shared/utils/` with shared utilities
4. Create `src/features/` skeleton with feature directories
5. Create `src/lib/db/schema.ts` with fresh Drizzle schema
6. Run `bun typecheck && bun lint && bun build`

### Verification

- `bun typecheck` — zero errors
- `bun lint` — zero errors
- `bun build` — production build succeeds

### Complexity: **M**

---

## Phase 2: Domain Layer Implementation

**Goal:** Implement the gem optimization engine as a framework-agnostic domain module.

**Target State:** `src/features/optimization/` contains pure TypeScript logic with comprehensive test coverage.

### Changes

#### Create

| File / Directory                           | Purpose                                |
| ------------------------------------------ | -------------------------------------- |
| `src/features/optimization/engine.ts`      | Greedy algorithm for gem optimization  |
| `src/features/optimization/scoring.ts`     | Power/ROI calculations                 |
| `src/features/optimization/resonance.ts`   | Resonance math calculations            |
| `src/features/optimization/resources.ts`   | Budget management                      |
| `src/features/optimization/index.ts`       | Barrel export                          |
| `src/features/optimization/engine.test.ts` | Unit tests for optimization engine     |
| `src/features/gems/catalog.ts`             | Gem catalog loader, filtering, sorting |
| `src/features/gems/validation.ts`          | Gem data validation with Zod           |
| `src/features/gems/index.ts`               | Barrel export                          |

### Verification

- `bun test:run` — all domain tests pass
- `bun test:coverage` — domain layer coverage > 80%

### Complexity: **L**

---

## Phase 3: Data & API Layer

**Goal:** Implement repository pattern and API endpoints for data persistence.

**Target State:** API routes use repository methods with proper validation and error handling.

### Changes

#### Create

| File / Directory                   | Purpose                           |
| ---------------------------------- | --------------------------------- |
| `src/lib/db/repository.ts`         | Repository interface definitions  |
| `src/lib/db/session-repository.ts` | Session CRUD operations           |
| `src/lib/db/build-repository.ts`   | Build CRUD operations             |
| `src/shared/schemas/`              | Zod schemas for API validation    |
| `src/shared/schemas/session.ts`    | Session request/response schemas  |
| `src/shared/schemas/build.ts`      | Build request/response schemas    |
| `src/shared/schemas/optimize.ts`   | Optimize request/response schemas |
| `src/shared/middleware/`           | Shared API utilities              |

#### Modify

| File                               | Change                      |
| ---------------------------------- | --------------------------- |
| `src/app/api/v1/optimize/route.ts` | Create v1 optimize endpoint |
| `src/app/api/v1/session/route.ts`  | Create v1 session endpoint  |
| `src/app/api/v1/builds/route.ts`   | Create v1 builds endpoint   |

### Verification

- `bun typecheck` — zero errors
- `bun test:run` — all tests pass
- Manual: test each API endpoint with valid and invalid inputs

### Complexity: **L**

---

## Phase 4: UI Components

**Goal:** Implement feature-based UI components with proper server/client component split.

**Target State:** Components organized under feature directories with clean separation.

### Changes

#### Create

| File / Directory                                        | Purpose                |
| ------------------------------------------------------- | ---------------------- |
| `src/features/gems/components/GemCard.tsx`              | Gem card component     |
| `src/features/gems/components/GemSelector.tsx`          | Gem selector component |
| `src/features/optimization/components/ResultsPanel.tsx` | Results display        |
| `src/shared/components/ui/`                             | Shared UI primitives   |
| `src/shared/components/ui/Button.tsx`                   | Button component       |
| `src/shared/components/ui/Card.tsx`                     | Card component         |
| `src/shared/components/ui/index.ts`                     | Barrel export          |

### Verification

- `bun typecheck` — zero errors
- `bun build` — zero warnings about server/client boundary

### Complexity: **M**

---

## Phase 5: Testing & Quality

**Goal:** Fill test coverage gaps and ensure quality standards.

**Target State:** All domain logic and critical user flows have comprehensive tests.

### Changes

#### Create

| File / Directory                                  | Purpose                   |
| ------------------------------------------------- | ------------------------- |
| `src/__tests__/integration/optimize-flow.test.ts` | Full optimize API flow    |
| `src/__tests__/integration/session-flow.test.ts`  | Session save/restore flow |
| `src/__tests__/integration/build-flow.test.ts`    | Build CRUD flow           |

### Verification

- `bun test:coverage` — overall coverage > 80%
- `bun test:run` — all tests pass

### Complexity: **L**

---

## Phase 6: Polish & Production

**Goal:** Finalize the application for public release.

**Target State:** Application ships with CI checks, comprehensive docs, and optimized bundle.

### Changes

#### Create

| File / Directory           | Purpose                   |
| -------------------------- | ------------------------- |
| `.github/workflows/ci.yml` | CI pipeline configuration |
| `SECURITY.md`              | Security policy           |
| `CONTRIBUTING.md`          | Contributor guidelines    |

### Verification

- `bun typecheck` — zero errors
- `bun lint` — zero errors
- `bun test:run` — all tests pass
- `bun build` — production build succeeds

### Complexity: **M**

---

## Dependency Graph

```
Phase 1 (Foundation)
  └── Phase 2 (Domain Layer)
        └── Phase 3 (Data & API Layer)
              └── Phase 4 (UI Components)
                    └── Phase 5 (Testing)
                          └── Phase 6 (Polish)
```

Each phase builds on the previous one through clean architectural layers.

## Technical Debt Resolution Map

| Issue     | Phase   | Description                                   |
| --------- | ------- | --------------------------------------------- |
| **TD-01** | Phase 1 | Type definitions consolidated in shared/types |
| **TD-02** | Phase 1 | Slot indexing normalized in shared types      |
| **TD-03** | Phase 3 | Async DB connection wrapper                   |
| **TD-04** | Phase 3 | Authorization via session ownership check     |
| **TD-05** | Phase 3 | Consistent validation with Zod                |
| **TD-06** | Phase 2 | Constants extracted to separate utils         |
| **TD-07** | Phase 2 | Resonance logic in dedicated module           |
| **TD-08** | Phase 4 | Feature-based component organization          |
| **TD-09** | Phase 4 | Proper server/client component split          |
| **TD-10** | Phase 5 | Comprehensive test coverage                   |
| **TD-11** | Phase 6 | CI pipeline with GitHub Actions               |
| **TD-12** | Phase 3 | Drizzle migration infrastructure              |
