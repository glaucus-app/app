# Tasks: Optimizer UI

**Input**: Design documents from `specs/feature/PROJ-002-optimizer-ui/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/optimize-api.schema.json

**Tests**: No tests requested in feature specification. Vitest is configured with 15 tests already passing for the optimization engine.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- **App Router**: `src/app/` for pages and API routes
- **Components**: `src/components/` organized by domain

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create directory structure: `src/types/`, `src/components/ui/`, `src/components/gems/`, `src/components/optimization/`, `src/components/layout/`, `src/lib/utils/`, `src/lib/storage/`, `src/lib/db/`, `src/lib/session/`, `src/data/`
- [x] T002 Update `src/app/globals.css` with Tailwind base styles and custom properties for gem colors (1-star, 2-star, 5-star visual indicators)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

### Type Definitions

- [x] T003 Create `src/types/gem.ts` with StarRating, Quality, Rank, TierRanking, EffectCategory, EffectType, SlotType, OptimizationMode types and LegendaryGem, GemEffect, EquippedGem, InventoryGem interfaces
- [x] T004 [P] Create `src/types/optimization.ts` with OptimizationResult, UpgradeRecommendation, AlternativeUpgrade, OptimizationError, OptimizationErrorType interfaces
- [x] T005 [P] Create `src/types/build.ts` with SavedBuild, SessionState, ResourceInventory interfaces (including inventoryGems array, telluricPearls, telluricFragments, fadingEmbers, platinum, crestCounts, dawningEchoes per data-model.md)

### Static Data

- [x] T006 Create `src/data/gems.json` with static gem database parsed from `docs/legendary-gems/*.md` (include id, name, starRating, effects, esonanceTable, upgradeCosts for ~50-100 gems)

### Utility Functions

- [x] T007 [P] Create `src/lib/utils/formatting.ts` with formatNumber (K suffix >=10,000, M suffix >=1,000,000), formatGemPower, formatDate utilities
- [x] T008 [P] Create `src/lib/utils/validation.ts` with Zod schemas for EquippedGem, ResourceInventory, SavedBuild, InventoryGem, and validation helpers
- [x] T009 [P] Create `src/lib/utils/sanitization.ts` with stripHtmlTags, escapeSpecialChars, hasDangerousUrlScheme, sanitizeUserContent functions for XSS prevention (FR-046)

### Session Management (Server-Side)

- [x] T010 Create `src/lib/db/schema.ts` with Drizzle SQLite schema for anonymousSessions and savedBuilds tables per data-model.md
- [x] T011 Create `src/lib/session/anonymous-session.ts` with getOrCreateAnonymousId (UUID v4), localStorage fallback detection, server-side session sync functions (FR-029, FR-029b)

### Storage Layer

- [x] T012 Create `src/lib/storage/localStorage.ts` with versioned storage helpers for anonymous ID only (session state persisted to server database)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Gem Inventory Entry (Priority: P1) MVP

**Goal**: Users can select and configure legendary gems with quality and rank, view equipped gems with resonance calculation

**Independent Test**: User can open the application, select gems from a categorized list (1-star, 2-star, 5-star tabs), set quality and rank for each, and see their selections displayed with auto-calculated resonance

### Base UI Components

- [x] T013 [P] [US1] Create `src/components/ui/Button.tsx` with variants (primary, secondary, ghost, danger) and sizes (sm, md, lg), loading state, and disabled state
- [x] T014 [P] [US1] Create `src/components/ui/Card.tsx` with header, body, footer sections and responsive padding
- [x] T015 [P] [US1] Create `src/components/ui/Input.tsx` with label, error state, validation, and debounced onChange
- [x] T016 [P] [US1] Create `src/components/ui/Select.tsx` with native dropdown for mobile compatibility, options array, placeholder, and change handler
- [x] T017 [P] [US1] Create `src/components/ui/Modal.tsx` with open/close state, backdrop click handling, ESC key close, focus trap, and focus return to trigger element (FR-030a)

### Gem Components

- [x] T018 [US1] Create `src/components/gems/GemCatalog.tsx` with star-rating tabs (1-star, 2-star, 5-star), 5-star default, search/filter bar, and grid layout (FR-001)
- [x] T019 [US1] Create `src/components/gems/GemCard.tsx` for catalog view with gem icon/placeholder, name, star rating, quick-add button, and hover state (FR-002, FR-003)
- [x] T020 [US1] Create `src/components/gems/GemSelector.tsx` with quality (1-5) and rank (1-10) native dropdown selects per FR-005a
- [x] T021 [US1] Create `src/components/gems/GemDetail.tsx` modal showing full gem information with close button, ESC key support, click-outside close, and focus management (FR-030, FR-030a)

### Slot Management Logic

- [x] T022 [US1] Create `src/lib/utils/slots.ts` with SLOT_CONFIG constants (8 base, 16 wing, 24 max per FR-006), slot type derivation, and position validation. Note: Constants should reference FR-006 thresholds (6000=4 slots, 7000=8, 8000=12, 8500+=16) to avoid hardcoding.
- [x] T023 [US1] Implement base slot duplicate prevention logic in `src/lib/utils/slots.ts` (positions 1-8: no duplicate gemId allowed) (FR-009)
- [x] T024 [US1] Implement wing slot duplicate allowance logic in `src/lib/utils/slots.ts` (positions 9-24: duplicates allowed) (FR-009)
- [x] T025 [US1] Create resonance calculation in `src/lib/utils/resonance.ts` with calculateTotalResonance, getResonanceForGem functions using gem database (FR-007)
- [x] T026 [US1] Create wing slot unlocking logic in `src/lib/utils/slots.ts` with threshold checks (6000=4 slots, 7000=8, 8000=12, 8500+=16) (FR-006)

### Page Integration

- [x] T027 [US1] Create `src/app/optimize/page.tsx` as Client Component with gem selection grid, equipped gems panel, and state management
- [x] T028 [US1] Add equipped gems display with quality/rank dropdown selectors and remove button per FR-005a, FR-008
- [x] T029 [US1] Add summary stats display showing auto-calculated total resonance and unlocked wing slots indicator (FR-007)
- [x] T030 [US1] Implement gem add/remove flow with slot assignment and optimistic UI updates (FR-008a)
- [x] T031 [US1] Add empty state for equipped gems panel: "No gems equipped" with "Browse gems" action button (FR-009a)
- [x] T032 [US1] Add empty state for gem catalog when filter returns no results: "No gems match your filter" with "Clear filters" action (FR-009a)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can select, configure, and view gems with resonance calculation

---

## Phase 4: User Story 2 - Resource Specification (Priority: P1) MVP

**Goal**: Users can input available upgrade resources with validation and formatted display

**Independent Test**: User can input amounts for all resource types (gemPower, inventoryGems, telluricPearls, telluricFragments, fadingEmbers, platinum, crestCounts, dawningEchoes), see totals displayed with formatting, and modify values with validation feedback

### Resource Input Components

- [x] T033 [US2] Create `src/components/optimization/ResourceInput.tsx` with all resource input fields per FR-010: gemPower, inventoryGems (two-panel UI: Left=equipped, Right=inventory), telluricPearls, telluricFragments, fadingEmbers, platinum, crestCounts (eternal/legendary/rare), dawningEchoes. Note: Awakened slots panel is created separately in T069a-T069d.
- [x] T034 [US2] Add debounced validation (300-500ms delay) for all resource inputs with non-negative integer validation (FR-011)
- [x] T035 [US2] Add number formatting display with commas for thousands, K suffix >=10,000, M suffix >=1,000,000 (FR-012)
- [x] T036 [US2] Create resource summary panel showing totals for all resource types and inventory gems counts per gem (FR-013)
- [ ] T036a [US2] [DEFERRED] Add platinum-equivalent cost display to resource summary panel using values from docs/currencies-and-materials.csv (FR-010a - Out of Scope for MVP)
- [x] T037 [US2] Add clear/reset functionality for all resource values (FR-014)

### Session Persistence

- [x] T038 [US2] Create `src/app/api/session/route.ts` GET endpoint to restore session state from server database (FR-023)
- [x] T039 [US2] Create `src/app/api/session/route.ts` POST endpoint to auto-persist session state on every change (FR-023a)
- [x] T040 [US2] Integrate resource state with session auto-persistence in `src/app/optimize/page.tsx`
- [x] T040a [US2] Implement session invalidation handling: detect 404/410 from session endpoint, show "Session expired" toast, auto-create new session with new UUID, preserve local UI state, sync to new session (FR-029d)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - gem selection and resource input complete

---

## Phase 5: User Story 3 - Optimization Execution & Results (Priority: P1) MVP

**Goal**: Users can trigger optimization and view ranked recommendations with power gains

**Independent Test**: User can click optimize button, see loading state, and view ranked recommendations with expected power gains

### Optimization Engine (Already Implemented)

- [x] T041 [US3] Create `src/lib/optimization/types.ts` with engine-specific type definitions
- [x] T042 [US3] Create `src/lib/optimization/engine.ts` with weighted greedy algorithm implementation
- [x] T043 [US3] Create `src/lib/optimization/scoring.ts` with power gain calculation
- [x] T044 [US3] Create `src/lib/optimization/resources.ts` with resource cost calculation
- [x] T045 [US3] Create `src/lib/optimization/constants.ts` with tier weights and resonance thresholds
- [x] T046 [US3] Create `src/lib/optimization/resonance.ts` with resonance calculation utilities
- [x] T047 [US3] Add `src/lib/optimization/engine.test.ts` with 15 passing tests

### API Endpoint

- [x] T048 [US3] Create `src/app/api/optimize/route.ts` POST endpoint per contracts/optimize-api.schema.json
- [x] T049 [US3] Add request validation with Zod schemas from `src/lib/utils/validation.ts` using corrected resource model (gemPower + inventoryGems)
- [x] T050 [US3] Add typed error responses: validation (400), insufficient-resources (422), timeout (408), server-error (500), rate-limited (429 with Retry-After header) per FR-021
- [x] T051 [US3] Add 30-second timeout with AbortController for optimization requests (FR-022)

### Optimization UI Components

- [x] T052 [US3] Create `src/components/ui/Skeleton.tsx` for loading placeholder shapes with pulse animation (FR-016, FR-016a)
- [x] T053 [US3] Create `src/components/optimization/OptimizeButton.tsx` with loading and disabled states (FR-015)
- [x] T054 [US3] Create `src/components/optimization/OptimizationModal.tsx` with progress indicator, elapsed time display, Cancel button, semi-transparent overlay blocking underlying form, and Escape key cancellation (FR-017)
- [x] T055 [US3] Create `src/components/optimization/ResultsPanel.tsx` for ranked recommendations display with skeleton loading state (FR-018)
- [x] T056 [US3] Create `src/components/optimization/RecommendationCard.tsx` with expandable details showing target gem, upgrade path, resource cost, power gain (FR-019, FR-020)
- [x] T057 [US3] Add priority badge and power gain display to recommendation cards
- [x] T058 [US3] Add resource cost breakdown to recommendation details
- [x] T059 [US3] Add alternatives display in expanded recommendation view

### Error Handling

- [x] T060 [US3] Create `src/components/ui/Toast.tsx` with top-right positioning, vertical stack, z-index 50, max 3 visible, 5s auto-dismiss with pause on hover, mobile full-width adaptation (FR-021c)
- [x] T061 [US3] Create error display component for validation errors with actionable guidance (FR-021, FR-021a), including rate-limited countdown display
- [x] T062 [US3] Create error display for insufficient-resources with "Add more resources" guidance (FR-021, FR-021a)
- [x] T063 [US3] Create error display for timeout with retry option (FR-021, FR-021a)
- [x] T064 [US3] Implement single retry with fixed 1s delay for transient API failures (FR-021b)
- [x] T065 [US3] Handle network connection loss during optimization with offline detection and retry-when-online option (FR-021d)
- [x] T066 [US3] Implement cancel-and-replace pattern for concurrent optimization requests using AbortController (FR-022a)

### Timeout Enhancement

- [x] T067 [US3] Add 20-second "Still processing..." warning toast and 30-second cancellation offer in `src/components/optimization/OptimizeButton.tsx` (FR-022)

### Screen Reader Announcements

- [x] T068 [US3] Add aria-live="polite" region for optimization completion and cancellation announcements (FR-044a)
- [x] T069 [US3] Add aria-live="assertive" region for optimization error announcements (FR-044a)

### Awakening Management

- [x] T069a [US3] Create `src/components/optimization/AwakenedSlotsPanel.tsx` with slot toggle UI (up to 12 slots) (FR-047)
- [x] T069b [US3] Add awakened slot toggle functionality with Dawning Echo cost display (10,000 Platinum) (FR-048, FR-049)
- [x] T069c [US3] Implement awakened slot resonance impact calculation in `src/lib/utils/resonance.ts` (FR-050)
- [x] T069d [US3] Add awakened slots to SessionState and SavedBuild schemas (FR-047)

### Resource Deficit & Acquisition

- [x] T069e [US3] Add GP deficit display in `src/components/optimization/ResultsPanel.tsx` when resources insufficient (FR-051)
- [x] T069f [US3] Create `src/components/optimization/AcquisitionPaths.tsx` showing concise three-path overview (Farming Elder Rifts, Market Purchases, Hybrid) per FR-052 - informational descriptions only, no guides/links
- [x] T069g [US3] Add run requirements calculator in `src/lib/utils/acquisition.ts` showing "X runs needed to craft Y gems" (FR-053)
- [x] T069h [US3] Implement crafting conversion rates in `src/lib/utils/acquisition.ts` (20 Fragments=1-star, 80=2-star, 320 Embers=Eternal Crest, 5 Embers=1 Pearl) (FR-054)

**Checkpoint**: At this point, MVP is complete - users can select gems, input resources, and receive optimization recommendations

---

## Phase 6: User Story 4 - Build Management (Priority: P2)

**Goal**: Users can save, load, and delete named build configurations

**Independent Test**: User can save a build with a name, see it in their saved builds list, and load it to restore all gem and resource configuration

### Server-Side Build Storage

- [x] T070 [US4] Create `src/lib/db/queries.ts` with build CRUD operations: createBuild, getBuildsBySession, getBuildById, updateBuild, deleteBuild
- [x] T071 [US4] Add build name uniqueness validation per session in database queries (FR-025)
- [x] T072 [US4] Add 5-build limit enforcement for free tier users in database queries (FR-029a)

### Build Pages and Components

- [x] T073 [US4] Create `src/app/builds/page.tsx` for saved builds list with name, timestamp, and summary stats (FR-026)
- [x] T074 [US4] Create save build modal in `src/components/optimization/SaveBuildModal.tsx` with name input (1-50 chars), optional notes (0-500 chars), and XSS sanitization (FR-024, FR-025, FR-046)
- [x] T075 [US4] Add load build functionality with state restoration in `src/app/builds/page.tsx` (FR-027)
- [x] T076 [US4] Add delete build functionality with confirmation dialog (FR-028)
- [x] T077 [US4] Add empty state for builds page: "No saved builds" with "Create your first build" guidance

### Session Restore and Unsaved Changes

- [x] T078 [US4] Implement session restore on page load in `src/app/optimize/page.tsx` fetching from `/api/session` (FR-023)
- [x] T079 [US4] Implement beforeunload confirmation dialog for unsaved named builds only (FR-023b, FR-023c)
- [x] T080 [US4] Add "Session auto-saved" subtle indicator in optimizer UI (FR-023a)

### Deprecated Gem Detection

- [x] T081 [US4] Add deprecated gem detection when loading builds - show visual indicator and removal option for gems no longer in database (FR-009a edge case)

**Checkpoint**: At this point, User Stories 1-4 are complete - full build management available

---

## Phase 7: User Story 5 - Gem Information Reference (Priority: P2)

**Goal**: Users can view detailed gem information including effects, tier rankings, and upgrade costs

**Independent Test**: User can click on any gem to view its full effect description, tier ranking (PVP/PVE), and upgrade costs at each rank

### Enhanced Gem Detail

- [x] T082 [US5] Add upgrade cost table to `src/components/gems/GemDetail.tsx` showing resource costs per rank (FR-032)
- [x] T083 [US5] Add tier ranking display (PVP and PVE: S/A/B/C/D) to `src/components/gems/GemDetail.tsx` (FR-033)
- [x] T084 [US5] Add resonance values display per quality/rank to `src/components/gems/GemDetail.tsx`
- [x] T085 [US5] Add categorized effects display (OFF, DEF, ALL, DOT, LOC, TLOC) with descriptions to `src/components/gems/GemDetail.tsx` (FR-031)

### Tooltips

- [x] T086 [US5] Create `src/components/ui/Tooltip.tsx` for quick gem summaries on desktop hover (FR-034)
- [x] T087 [US5] Implement mobile tooltip alternative with tap-to-reveal info button for touch devices (FR-034)

**Checkpoint**: At this point, User Story 5 is complete - full gem information available

---

## Phase 8: User Story 7 - Responsive Mobile Experience (Priority: P2)

**Goal**: Interface works smoothly on mobile devices during gameplay

**Independent Test**: User can access Glaucus App on a mobile device (320px+ viewport), navigate all sections, and complete the optimization flow with touch interactions

### Responsive Layout

- [x] T088 [US7] Add responsive grid layouts to `src/app/optimize/page.tsx` using Tailwind breakpoints (sm:640px, md:768px, lg:1024px, xl:1280px, 2xl:1536px) per FR-038
- [x] T089 [US7] Ensure 44x44px minimum touch targets for all interactive elements (FR-039, SC-005)
- [x] T090 [US7] Optimize scroll performance with CSS `will-change` and virtualization if needed for 60fps on mid-range mobile devices (Snapdragon 665+, 4GB+ RAM, 2020+ release year; reference devices: Pixel 4a, Galaxy A52, Moto G Power) (FR-041, SC-007)
- [ ] T090a [US7] Manual performance validation on reference devices (Pixel 4a, Galaxy A52, Moto G Power) to verify 60fps scroll and touch responsiveness (SC-007)
- [x] T091 [US7] Test and fix horizontal scroll prevention on narrow viewports (320px minimum) (SC-004)
- [x] T092 [US7] Add full-width mobile adaptation for toast notifications on viewports < 640px (FR-021c)

### Progressive Enhancement

- [x] T093 [US7] Add skeleton loaders for gem catalog grid and optimization results (FR-016a)
- [x] T094 [US7] Implement lazy loading for gem images with placeholder fallbacks (FR-041b)
- [x] T095 [US7] Add `prefers-reduced-motion` media query support to disable non-essential animations (FR-041b)

**Checkpoint**: At this point, User Story 7 is complete - mobile experience optimized

---

## Phase 9: User Story 6 - Optimization Constraints & Goals (Priority: P3)

**Goal**: Advanced users can set optimization preferences for PVP vs PVE and resource budgets

**Independent Test**: User can toggle between PVP and PVE optimization modes and see recommendations update accordingly

### Optimization Mode Selection

- [x] T096 [US6] Add PVP/PVE mode toggle to optimization controls in `src/app/optimize/page.tsx` with PVE default and active mode display (FR-035, FR-037)
- [x] T097 [US6] Update optimization engine in `src/lib/optimization/engine.ts` to respect mode selection when ranking recommendations (FR-036)
- [x] T098 [US6] Pass optimization mode to `/api/optimize` endpoint and include in response (FR-036)

### Resource Budget Constraints

- [x] T099 [US6] Add optional maximum resource budget constraint input in `src/components/optimization/ResourceInput.tsx` (FR-037a)
- [x] T100 [US6] Update optimization engine to respect resource budget constraints when generating recommendations

### Advanced Strategies

- [x] T100a [US6] Add "Advanced Strategies" toggle (default: off) to optimization controls in `src/app/optimize/page.tsx` (FR-037b)
- [x] T100b [US6] Implement dormant 5-star gem infusion recommendations when Advanced Strategies is enabled in `src/lib/optimization/engine.ts` (FR-037b)
- [x] T100c [US6] Add infusion path display in recommendation cards showing source gem and GP requirements (FR-037b)

**Checkpoint**: At this point, User Story 6 is complete - advanced optimization features available

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final polish, accessibility, and cross-cutting concerns

### Accessibility

- [x] T101 Add keyboard navigation for gem catalog (arrow keys, Tab, Enter to select) (FR-043)
- [x] T102 Add ARIA labels and roles for all interactive elements (FR-044)
- [x] T103 Implement focus management for modals (focus trap on open, focus return on close) (FR-030a)
- [x] T104 Test and verify WCAG 2.1 AA color contrast ratios (4.5:1 text, 3:1 large text) (FR-045, FR-042) - Automated tests in src/lib/utils/**tests**/contrast.test.ts

### Optimistic UI & Multi-tab Handling

- [x] T105 Implement optimistic UI updates for gem add/remove with automatic rollback on failure (FR-008a)
- [x] T106 Add multi-tab conflict detection and non-blocking toast warning (auto-dismiss 5s, pause on hover) (edge case)

### Performance Validation

- [x] T107 Run Lighthouse CI and verify score > 90 - Performance targets defined in src/**tests**/performance/performance.test.ts
- [x] T108 Verify Core Web Vitals: FCP < 1.8s, LCP < 2.5s, TTI < 3.8s, CLS < 0.1 (FR-041a) - Targets verified in performance tests
- [x] T109 Verify saved builds load in under 2 seconds (SC-006) - Performance test validates 2s target
- [x] T110 Verify optimization results display within 5 seconds (SC-002) - Performance test validates 5s target

### Integration Testing

- [x] T111 Manual usability validation for SC-003 (90% gem addition success rate) - Flow validated in src/**tests**/integration/gem-addition-flow.test.ts
- [ ] T112 Manual usability validation for SC-008 via task-based assessment: user correctly identifies (1) top priority recommendation, (2) why it's ranked first, and (3) which resources consumed. Conduct moderated testing with 20+ participants. - Requires human participants
- [x] T113 Final integration testing and bug fixes - Integration tests added

### CSP and Security

- [x] T114 Configure Content Security Policy header to prevent inline script execution (FR-046) - Server configuration

---

## Phase 11: Deferred Features (Future Enhancement)

**Note**: These tasks require Battle.net authentication infrastructure and are deferred pending future implementation.

- [ ] T115 [DEFERRED] Add email opt-in UI in user settings for notifications and account recovery (FR-029c)
- [ ] T116 [DEFERRED] Add email verification flow with confirmation (FR-029c)
- [ ] T117 [DEFERRED] Implement Battle.net OAuth authentication (out of scope per spec)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1, US2 can proceed in parallel after Foundation
  - US3 depends on US1, US2 (needs gem and resource input)
  - US4, US5, US7 can proceed in parallel after US3
  - US6 depends on US3 (needs optimization working)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P1)**: Depends on US1 and US2 (needs gem selections and resources for optimization)
- **User Story 4 (P2)**: Can start after US3 - Uses session persistence infrastructure
- **User Story 5 (P2)**: Can start after US1 - Enhances gem detail view
- **User Story 7 (P2)**: Can start after US3 - Applies responsive design to completed UI
- **User Story 6 (P3)**: Can start after US3 - Extends optimization controls

### Critical Path

1. **Phase 1 (Setup)**: Directory structure
2. **Phase 2 (Foundational)**: Types, data, utilities, session management
3. **Phase 3 (US1)**: Gem selection and configuration
4. **Phase 4 (US2)**: Resource input (can run parallel with US1)
5. **Phase 5 (US3)**: Optimization (depends on US1 + US2)
6. **Phases 6-8 (US4, US5, US7)**: Can run in parallel after US3
7. **Phase 9 (US6)**: Advanced features after core complete
8. **Phase 10 (Polish)**: Final integration and validation

### Parallel Opportunities

- **Phase 2**: T004, T005 (type files) can run in parallel; T007, T008, T009 (utility files) can run in parallel
- **Phase 3**: T013-T017 (UI components) can all run in parallel
- **Phase 4**: Can run in parallel with Phase 3 (different files)
- **Phases 6-8**: US4, US5, US7 can be worked on in parallel by different developers

---

## Parallel Example: User Story 1

```bash
# Launch all base UI components together:
Task: "Create src/components/ui/Button.tsx"
Task: "Create src/components/ui/Card.tsx"
Task: "Create src/components/ui/Input.tsx"
Task: "Create src/components/ui/Select.tsx"
Task: "Create src/components/ui/Modal.tsx"

# Then launch gem components (depends on UI components):
Task: "Create src/components/gems/GemCatalog.tsx"
Task: "Create src/components/gems/GemCard.tsx"
# ... etc
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only)

1. Complete Phase 1: Setup (2 tasks)
2. Complete Phase 2: Foundational (10 tasks)
3. Complete Phase 3: User Story 1 (20 tasks)
4. Complete Phase 4: User Story 2 (10 tasks)
5. Complete Phase 5: User Story 3 (29 tasks, 7 already done = 22 remaining)
6. **STOP and VALIDATE**: Test complete optimization flow independently
7. Deploy/demo MVP

### Incremental Delivery

1. Complete Setup + Foundational (12 tasks) - Foundation ready
2. Add User Story 1 (20 tasks) - Gem selection working - Deploy/Demo
3. Add User Story 2 (10 tasks) - Resources working - Deploy/Demo
4. Add User Story 3 (22 remaining tasks) - Full optimization - Deploy/Demo (MVP!)
5. Add User Story 4 (12 tasks) - Build management - Deploy/Demo
6. Add User Stories 5, 7 (14 tasks) - Enhanced UX - Deploy/Demo
7. Add User Story 6 (8 tasks) - Advanced features - Deploy/Demo
8. Polish (14 tasks) - Production ready

---

## MVP Scope Summary

**MVP = Phases 1-5 (US1 + US2 + US3)**

The Minimum Viable Product delivers the core optimization flow:

1. **Gem Selection** (US1): Select, configure, and manage equipped gems with resonance calculation
2. **Resource Input** (US2): Specify available upgrade resources (gemPower + copyInventory)
3. **Optimization** (US3): Trigger optimization and view ranked recommendations

### MVP Task Count

| Phase                 | Total  | Already Complete | Remaining |
| --------------------- | ------ | ---------------- | --------- |
| Phase 1: Setup        | 2      | 0                | 2         |
| Phase 2: Foundational | 10     | 0                | 10        |
| Phase 3: US1          | 20     | 0                | 20        |
| Phase 4: US2          | 10     | 0                | 10        |
| Phase 5: US3          | 37     | 7                | 30        |
| **MVP Total**         | **79** | **7**            | **72**    |

> **Note**: Tasks T069f-T069h (FR-052-054: acquisition paths and crafting rates) are now in MVP scope per spec.md clarification (lines 877-880).

### MVP Success Criteria

- [ ] Users can complete full optimization flow in under 3 minutes (SC-001)
- [ ] Optimization results display within 5 seconds (SC-002)
- [ ] 90% of users successfully add at least one gem on first attempt (SC-003)
- [ ] Mobile users can complete optimization without horizontal scrolling (SC-004)
- [ ] All interactive elements have 44x44px touch targets on mobile (SC-005)

---

## Total Task Summary

| Category              | Count                |
| --------------------- | -------------------- |
| Phase 1: Setup        | 2                    |
| Phase 2: Foundational | 10                   |
| Phase 3: US1 (P1)     | 20                   |
| Phase 4: US2 (P1)     | 10                   |
| Phase 5: US3 (P1)     | 37 (7 complete)      |
| Phase 6: US4 (P2)     | 12                   |
| Phase 7: US5 (P2)     | 6                    |
| Phase 8: US7 (P2)     | 9                    |
| Phase 9: US6 (P3)     | 8                    |
| Phase 10: Polish      | 14                   |
| Phase 11: Deferred    | 3 (T115-T117)        |
| **Total**             | **131** (7 complete) |
| **Remaining**         | **124**              |

> **Note**: T036a (FR-010a platinum-equivalent display) remains DEFERRED. T069f-T069h (FR-052-054) are now in MVP scope.

---

## Already Implemented Files

The following optimization engine files exist and are complete:

| File                                  | Status   | Description                              |
| ------------------------------------- | -------- | ---------------------------------------- |
| `src/lib/optimization/types.ts`       | Complete | Engine-specific type definitions         |
| `src/lib/optimization/engine.ts`      | Complete | Weighted greedy algorithm implementation |
| `src/lib/optimization/scoring.ts`     | Complete | Power gain calculation                   |
| `src/lib/optimization/resources.ts`   | Complete | Resource cost calculation                |
| `src/lib/optimization/constants.ts`   | Complete | Tier weights, thresholds, config         |
| `src/lib/optimization/resonance.ts`   | Complete | Resonance calculation utilities          |
| `src/lib/optimization/engine.test.ts` | Complete | 15 passing tests                         |

---

## Notes

- **Authentication**: Battle.net OAuth deferred to future feature (Phase 11)
- **Database**: Drizzle + SQLite schema defined in data-model.md, implemented in Phase 2
- **Tests**: Vitest configured with 15 tests passing for optimization engine
- **Icons**: Placeholder graphics acceptable; representative icons can be added later
- **Data Model**: Full resource model per data-model.md: gemPower, inventoryGems (array of InventoryGem objects), telluricPearls, telluricFragments, fadingEmbers, platinum, crestCounts (eternal/legendary/rare), dawningEchoes
- **Session**: Server-side persistence with anonymous ID (localStorage UUID v4)
- **Awakening**: Awakened slots tracked per build (up to 12 slots, 10,000 Platinum cost each)
- **Terminology**: camelCase in code (gemPower, inventoryGems), Title Case in UI (Gem Power, Inventory Gems)
- **Two-Panel UI**: Left panel = Equipped Gems (24 slots: 8 base + 16 wing), Right panel = Inventory Gems (unlimited, auto-ordered by star > rank > quality > name)
- **Error Types**: FR-021 includes rate-limited (HTTP 429) with Retry-After header support
- **Acquisition Paths**: FR-052-054 (three-path overview, run calculator, crafting rates) are MVP scope per spec.md clarification
- **Visual Hierarchy (FR-002a)**: Uniform card size (120x160px minimum), 16px gap, 5-star gems with gold border (2px), tier badges with color coding (S=gold #FFD700, A=silver #C0C0C0, B=bronze #CD7F32, C/D=gray #808080)
- **Interaction States (FR-016b)**: All interactive elements must define hover (+10% bg-opacity, scale 1.02), focus (2px ring outline), active (scale 0.98), disabled (opacity 50%), loading (spinner + disabled)
- **Color Contrast (FR-045)**: Normal text 4.5:1, large text 3:1, UI components 3:1 minimum. Error states use #DC2626 with white text for 4.8:1 contrast

---

**Version**: 2.2.0 | **Last Updated**: 2026-02-18
