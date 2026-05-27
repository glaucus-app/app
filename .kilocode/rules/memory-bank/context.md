# Active Context: Glaucus App (Diablo Immortal Legendary Gems Optimizer)

## Current State

**Project Status**: ✅ All Implementation Tasks Complete - Ready for Manual Validation

All implemented user stories (P1-P3) have been completed:

- **User Story 1 (P1)**: Gem Inventory Entry - Select, configure, and manage equipped gems
- **User Story 2 (P1)**: Resource Specification - Input and validate upgrade resources
- **User Story 3 (P1)**: Optimization Execution & Results - Run optimization and view recommendations
- **User Story 4 (P2)**: Build Management - Save, load, delete named builds
- **User Story 5 (P2)**: Gem Information Reference - Tooltips, upgrade costs, tier rankings
- **User Story 6 (P3)**: Optimization Constraints - PVP/PVE mode toggle, budget constraints, Advanced Strategies
- **User Story 7 (P2)**: Responsive Mobile Experience - Touch targets, responsive layouts

### Implemented Components

| Phase    | Description                                     | Status      |
| -------- | ----------------------------------------------- | ----------- |
| Phase 1  | Setup - Directory structure, globals.css        | ✅ Complete |
| Phase 2  | Foundational - Types, data, utilities, session  | ✅ Complete |
| Phase 3  | User Story 1 - Gem Inventory Entry              | ✅ Complete |
| Phase 4  | User Story 2 - Resource Specification           | ✅ Complete |
| Phase 5  | User Story 3 - Optimization Execution & Results | ✅ Complete |
| Phase 6  | User Story 4 - Build Management                 | ✅ Complete |
| Phase 7  | User Story 5 - Gem Information Reference        | ✅ Complete |
| Phase 8  | User Story 7 - Responsive Mobile Experience     | ✅ Complete |
| Phase 9  | User Story 6 - Optimization Constraints         | ✅ Complete |
| Phase 10 | Polish & Cross-Cutting Concerns                 | ✅ Complete |

## Recently Completed (2026-03-07)

- [x] **TweakCN Theme Migration** - Full migration to TweakCN theme with OKLCH colors and CSS variables:
  - Added TweakCN theme CSS variables in globals.css (OKLCH-based colors)
  - Added dark mode support (.dark class)
  - Converted all hardcoded shadows (shadow-sm/md/lg/xl) to use var(--shadow-\*)
  - Fixed ring-offset colors to use var(--background)
  - Updated all UI components (Button, Select, Input, Card, Modal, Dialog, Tooltip, Toast)
  - Updated optimization components (AcquisitionPaths, AwakenedSlotsPanel, OptimizationModal, ResultsPanel)

## Previously Completed (2026-02-19)

- [x] **T100a: Advanced Strategies Toggle** - Added toggle (default: off) to optimization controls (FR-037b)
- [x] **T100b: Infusion Recommendations** - Implemented dormant 5-star gem infusion logic in optimization engine
- [x] **T100c: Infusion Path Display** - Created InfusionRecommendationCard component for displaying infusion paths
- [x] **T105: Optimistic UI Updates** - Created useOptimisticUpdate hook with automatic rollback on failure
- [x] **T106: Multi-Tab Conflict Detection** - Created useMultiTabSync hook using BroadcastChannel API

## Previously Completed (2026-02-18)

- [x] **T104-T113: Validation Tests** - Added automated tests for WCAG contrast, performance targets, and integration flows
- [x] **T114: CSP Headers** - Content Security Policy configured in next.config.ts (FR-046)
- [x] **Phase 6: Build Management** - Save/load builds, deprecated gem detection, beforeunload confirmation
- [x] **Phase 7: Gem Information Reference** - Tooltips (desktop/mobile), resonance tables, upgrade costs
- [x] **Phase 8: Responsive Mobile** - Touch targets (44x44px), responsive layouts, scroll optimization
- [x] **Phase 9: Optimization Constraints** - PVP/PVE mode toggle, resource budget constraint input
- [x] **Accessibility** - Screen reader announcer (aria-live regions), focus management in modals
- [x] **Awakening Management** - AwakenedSlotsPanel, resonance bonus calculation
- [x] **Acquisition Paths** - Three-path overview, run calculator, crafting rates

## Current Structure

| File/Directory                                               | Purpose                              | Status      |
| ------------------------------------------------------------ | ------------------------------------ | ----------- |
| `src/app/api/optimize/route.ts`                              | Optimization API endpoint            | ✅ Complete |
| `src/app/api/session/route.ts`                               | Session persistence API              | ✅ Complete |
| `src/components/gems/`                                       | Gem selection components             | ✅ Complete |
| `src/components/optimization/`                               | Optimization UI components           | ✅ Complete |
| `src/components/optimization/InfusionRecommendationCard.tsx` | Infusion path display                | ✅ Complete |
| `src/components/ui/`                                         | Base UI components                   | ✅ Complete |
| `src/lib/hooks/useOptimize.ts`                               | Optimization hook with retry         | ✅ Complete |
| `src/lib/hooks/useOptimisticUpdate.ts`                       | Optimistic UI with rollback          | ✅ Complete |
| `src/lib/hooks/useMultiTabSync.ts`                           | Multi-tab conflict detection         | ✅ Complete |
| `src/lib/utils/acquisition.ts`                               | Crafting rates, run calculator       | ✅ Complete |
| `src/lib/utils/resonance.ts`                                 | Resonance + awakened calculations    | ✅ Complete |
| `src/lib/optimization/`                                      | Optimization engine                  | ✅ Complete |
| `src/lib/optimization/engine.ts`                             | Engine with infusion recommendations | ✅ Complete |
| `src/lib/optimization/types.ts`                              | Infusion-related types               | ✅ Complete |
| `src/types/`                                                 | TypeScript type definitions          | ✅ Complete |
| `src/types/build.ts`                                         | SessionState with advancedStrategies | ✅ Complete |
| `src/data/gems.json`                                         | Static gem database                  | ✅ Complete |

## Next Steps

1. **Manual Validation** - Test optimization flow end-to-end with Advanced Strategies enabled
2. **Performance Testing** - Lighthouse CI, Core Web Vitals validation
3. **Usability Testing** - SC-003 (90% gem addition success rate), SC-008 (recommendation comprehension)
4. **Future Features** - Battle.net OAuth, diablo.tv integration, character verification

## Architecture Decisions

### Tech Stack

- **Framework**: Next.js 16 with App Router
- **Auth**: Anonymous sessions (localStorage UUID) + optional email opt-in
- **Database**: Drizzle ORM + better-sqlite3 (SQLite)
- **UI**: Tailwind CSS 4 + lucide-react icons
- **Validation**: Zod schemas
- **Testing**: Vitest (15 tests passing)

### Key Patterns

- **Client Components**: Interactive UI with `"use client"` directive
- **Server Components**: Data fetching, static content
- **API Routes**: REST endpoints for optimization and session management
- **Type Safety**: Strict TypeScript with isolated modules
- **Optimistic UI**: Immediate UI updates with automatic rollback on failure
- **Multi-Tab Sync**: BroadcastChannel API for cross-tab communication

### Slot System

- **Base Slots**: 8 slots (positions 1-8), no duplicate gems
- **Wing Slots**: Up to 16 slots (positions 9-24), duplicates allowed
- **Unlock Thresholds**: 6000=4, 7000=8, 8000=12, 8500+=16 wing slots
- **Awakened Slots**: Up to 12 slots with 10% resonance bonus

### Advanced Strategies (FR-037b)

- **Toggle**: Default OFF, user must enable for infusion recommendations
- **Infusion**: Dormant 5-star gems (R10) can gain +80 additional resonance via socketed GP
- **Display**: InfusionRecommendationCard shows source gems, GP cost, resonance gain

## External APIs

| API                      | Purpose                | Status    |
| ------------------------ | ---------------------- | --------- |
| Battle.net OAuth         | User authentication    | 🔮 Future |
| diablo.tv                | DI days/events data    | 🔮 Future |
| diabloimmortalredeem.com | Character verification | 🔮 Future |

## Session History

| Date       | Changes                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 2026-02-19 | Fixed critical XSS vulnerability in escapeHtml function - htmlEscapeMap now correctly maps special chars to HTML entities      |
| 2026-02-19 | Completed deferred tasks T100a-T100c, T105, T106: Advanced Strategies, infusion recommendations, optimistic UI, multi-tab sync |
| 2026-02-18 | Added automated validation tests: WCAG contrast (15 tests), performance (13 tests), integration flow (14 tests)                |
| 2026-02-18 | Fixed success green color (#16A34A → #15803D) for WCAG AA compliance                                                           |
| 2026-02-18 | Added CSP headers (T114) - Content Security Policy, X-Frame-Options, X-XSS-Protection in next.config.ts                        |
| 2026-02-18 | Completed Phases 6-9: Build management, gem reference, responsive mobile, optimization constraints                             |
| 2026-02-18 | Added PVP/PVE mode toggle with visual indicator and context text                                                               |
| 2026-02-18 | Implemented responsive layouts with 44x44px touch targets                                                                      |
| 2026-02-18 | Added tooltips for desktop hover and mobile tap-to-reveal                                                                      |
| 2026-02-18 | Implemented deprecated gem detection and warning UI                                                                            |
| 2026-02-18 | Completed MVP implementation - All Phase 1-5 tasks done                                                                        |
| 2026-02-18 | Implemented optimization UI components - Modal, ResultsPanel, RecommendationCard                                               |
| 2026-02-18 | Added error handling - Validation, timeout, retry logic, offline handling                                                      |
| 2026-02-18 | Created accessibility components - Screen reader announcer                                                                     |
| 2026-02-18 | Implemented awakening management - AwakenedSlotsPanel, resonance bonus                                                         |
| 2026-02-18 | Added acquisition paths - Three-path overview, run calculator, crafting rates                                                  |
| 2026-02-17 | Cross-checked and updated tasks.md: Added rate-limited (429) to FR-021 error types, moved FR-052-054 tasks to MVP scope        |
| 2026-02-17 | Resolved 12 analysis findings via clarification session                                                                        |
| 2026-02-15 | Implemented optimization engine with weighted greedy algorithm                                                                 |
| 2026-02-14 | Completed workflow foundation implementation - all 66 tasks done                                                               |

## Optimizer UI (002) Summary

| Component         | Status      | Description                                   |
| ----------------- | ----------- | --------------------------------------------- |
| Setup             | ✅ Complete | Directory structure, globals.css              |
| Foundational      | ✅ Complete | Types, data, utilities, session               |
| User Story 1 (P1) | ✅ Complete | Gem Inventory Entry                           |
| User Story 2 (P1) | ✅ Complete | Resource Specification                        |
| User Story 3 (P1) | ✅ Complete | Optimization Execution & Results              |
| User Story 4 (P2) | ✅ Complete | Build Management                              |
| User Story 5 (P2) | ✅ Complete | Gem Information Reference                     |
| User Story 6 (P3) | ✅ Complete | Optimization Constraints & Goals              |
| User Story 7 (P2) | ✅ Complete | Responsive Mobile Experience                  |
| Polish            | ✅ Complete | Accessibility, performance, integration tests |

## Quick Reference

- **Package Manager**: `bun`
- **Commit Workflow**: `bun typecheck && bun lint && git add -A && git commit -m "type: description" && git push`
- **Pre-commit Hooks**: lint, typecheck
- **Commit Format**: `type(scope): description` (lowercase, max 72 chars)
- **Spec Directory**: `specs/`
- **Constitution Version**: 2.0.0
