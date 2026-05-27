# Requirements Quality Checklist: Optimizer UI (Comprehensive)

**Feature**: 002-optimizer-ui  
**Created**: 2026-02-15  
**Updated**: 2026-02-17  
**Focus Areas**: UX, API, Performance, Security  
**Depth Level**: Standard (PR Review Readiness)  
**Audience**: Reviewer

---

## Purpose

This checklist tests the **REQUIREMENTS QUALITY**, not the implementation. Every item evaluates whether requirements are complete, clear, consistent, measurable, or cover all scenarios.

---

## Resolution Summary

| Item   | Status      | Resolution                                                                                                                                |
| ------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| CHK001 | ✅ RESOLVED | FR-002a specifies visual hierarchy: 120x160px cards, 16px gap, gold border for 5-star, tier badge colors                                  |
| CHK002 | ✅ RESOLVED | FR-016b defines 5 interaction states: hover, focus, active, disabled, loading with specific visual feedback                               |
| CHK003 | ✅ RESOLVED | FR-009a now specifies dedicated empty states for each panel                                                                               |
| CHK004 | ✅ RESOLVED | FR-030a specifies full modal closing behavior (ESC, click outside, close button, focus trap)                                              |
| CHK006 | ✅ RESOLVED | FR-021c specifies toast positioning, stacking, z-index                                                                                    |
| CHK007 | ✅ RESOLVED | FR-011 specifies structured JSON error format with field-level codes and inline display                                                   |
| CHK008 | ✅ RESOLVED | FR-022a specifies cancel-and-replace pattern for concurrent requests                                                                      |
| CHK015 | ✅ RESOLVED | Spec clarifies: 20s warning, 30s cancellation offer                                                                                       |
| CHK016 | ✅ RESOLVED | SC-007 defines mid-range devices: Snapdragon 665+, 4GB+ RAM, 2020+, reference devices                                                     |
| CHK017 | ✅ RESOLVED | Spec clarifies: >= 1,000,000 M suffix, >= 10,000 K suffix                                                                                 |
| CHK020 | ✅ RESOLVED | FR-021c and edge case section specify 5s auto-dismiss with pause on hover                                                                 |
| CHK021 | ✅ RESOLVED | FR-006 and data-model SLOT_CONFIG are consistent (8 base + 16 wing max)                                                                   |
| CHK024 | ✅ RESOLVED | FR-011 specifies 300-500ms debounce, clarifications confirm                                                                               |
| CHK025 | ✅ RESOLVED | FR-021c and edge case both specify 5 seconds auto-dismiss                                                                                 |
| CHK026 | ✅ RESOLVED | Modal overlay pattern with interactive Cancel button (FR-017, FR-022 updated)                                                             |
| CHK027 | ✅ RESOLVED | Hybrid persistence model - auto-save session, explicit save for named builds (FR-023a/b/c)                                                |
| CHK030 | ✅ RESOLVED | SC-008 specifies task-based assessment: identify top recommendation, explain ranking, identify resources consumed                         |
| CHK031 | ✅ RESOLVED | US1-Acceptance-5 specifies: disabled catalog gems (opacity-50), toast notification, tooltip on hover                                      |
| CHK034 | ✅ RESOLVED | "First-Time User Journey" section added with 12-step flow                                                                                 |
| CHK035 | ✅ RESOLVED | FR-023, FR-023a cover session restoration flow                                                                                            |
| CHK036 | ✅ RESOLVED | FR-017, FR-022 specify cancellation during optimization                                                                                   |
| CHK037 | ✅ RESOLVED | "Post-Optimization Iteration Flow" section added                                                                                          |
| CHK038 | ✅ RESOLVED | FR-021e defines per-error-type UI: validation (inline), insufficient-resources (toast+action), timeout (modal), server-error (toast+code) |
| CHK041 | ✅ RESOLVED | Edge case section specifies resonance boundaries: 0 min, thresholds 6000/7000/8000/8500+ for 4/8/12/16 wing slots                         |
| CHK048 | ✅ RESOLVED | FR-041a specifies Core Web Vitals targets (FCP <1.8s, LCP <2.5s, TTI <3.8s)                                                               |
| CHK050 | ✅ RESOLVED | FR-041b specifies progressive enhancement for slow networks/low-end devices                                                               |
| CHK051 | ✅ RESOLVED | Moot - storage moved to server-side database, localStorage only stores anonymous ID                                                       |
| CHK052 | ✅ RESOLVED | FR-043 specifies keyboard navigation for all interactive elements                                                                         |
| CHK053 | ✅ RESOLVED | FR-044a specifies ARIA live regions for critical optimization events                                                                      |
| CHK054 | ✅ RESOLVED | FR-045 specifies WCAG AA contrast ratios: 4.5:1 normal text, 3:1 large text/UI, error red #DC2626                                         |
| CHK055 | ✅ RESOLVED | FR-030a specifies focus trap and restoration for gem detail modal                                                                         |
| CHK059 | ✅ RESOLVED | FR-046 specifies XSS prevention with defense-in-depth approach                                                                            |
| CHK062 | ✅ RESOLVED | FR-029b specifies localStorage unavailability fallback to server-side session                                                             |

---

## Requirement Completeness

### UX/UI Requirements

- [x] CHK001 - Are visual hierarchy requirements specified for the gem catalog grid layout, including card sizing, spacing, and visual prominence rules? [Completeness, **RESOLVED** - FR-002a specifies: 120x160px cards, 16px gap, gold border for 5-star, tier badge colors]
- [x] CHK002 - Are interaction state requirements (hover, focus, active, disabled, loading) documented for all interactive elements including buttons, cards, and form inputs? [Completeness, **RESOLVED** - FR-016b defines 5 states with specific visual feedback]
- [x] CHK003 - Are requirements for empty states defined for each panel (empty gem catalog, no equipped gems, no recommendations)? [Completeness, **RESOLVED** - Spec §FR-009a specifies dedicated empty states with contextual messaging and guidance actions]
- [x] CHK004 - Are requirements for the gem detail modal/panel closing behavior (ESC key, click outside, close button) specified? [Completeness, **RESOLVED** - Spec §FR-030a specifies full modal closing behavior including focus return]
- [ ] CHK005 - Are requirements for the save build modal's cancel action (unsaved name/notes handling) defined? [Completeness, Spec §FR-024]
- [x] CHK006 - Are requirements for toast notification positioning, stacking order, and z-index hierarchy documented? [Completeness, **RESOLVED** - Spec §FR-021c specifies position (top-right), stack (vertical, newest top), z-index (50)]

### API/Data Requirements

- [x] CHK007 - Are input validation error response requirements specified with exact field-level error message formats? [Completeness, **RESOLVED** - FR-011 specifies structured JSON format with field-level codes and inline display]
- [x] CHK008 - Are requirements for concurrent optimization request handling (multiple tabs, request deduplication) defined? [Completeness, **RESOLVED** - Spec §FR-022a specifies cancel-and-replace pattern with AbortController]
- [ ] CHK009 - Are requirements for the `/api/optimize` endpoint request schema documented with all optional vs required field distinctions? [Completeness, data-model §OptimizationResult]
- [x] CHK010 - Are requirements for localStorage schema migration strategy (version upgrades) defined? [Completeness, **RESOLVED** - Moot: localStorage only stores anonymousId for server lookup; all session data is server-side]

---

## Requirement Clarity

### Quantification & Specificity

- [ ] CHK011 - Is "appropriate visual feedback" in User Story 1 quantified with specific visual indicators (color changes, animations, icons)? [Clarity, Spec §US1-Acceptance-2]
- [ ] CHK012 - Is "clear error message" in FR-021 clarified with specific error message content, tone, and actionability criteria? [Clarity, Spec §FR-021]
- [ ] CHK013 - Is "touch-friendly interaction targets" in FR-039 quantified beyond the 44x44px minimum (spacing between targets, hit area expansion)? [Clarity, Spec §FR-039, SC-005]
- [ ] CHK014 - Is "smoothly at 60fps" in SC-007 clarified with acceptable frame time variance budget and measurement methodology? [Clarity, Spec §SC-007]
- [x] CHK015 - Is "reasonable time" in the optimization timeout edge case quantified with the specific 30-second threshold? [Clarity, **RESOLVED** - Spec §FR-022 specifies 20s warning, 30s cancellation offer; edge case section confirms]
- [x] CHK016 - Is "mid-range mobile devices" in SC-007 defined with specific device classes, CPU/memory thresholds, or benchmark devices? [Clarity, **RESOLVED** - Spec §SC-007 defines: Snapdragon 665+, 4GB+ RAM, 2020+ release; reference devices: Pixel 4a, Galaxy A52, Moto G Power]
- [x] CHK017 - Is "large numbers appropriately formatted" in the edge case clarified with specific formatting rules for billions, trillions? [Clarity, **RESOLVED** - Spec §Edge Cases specifies: >= 1,000,000 uses M suffix, >= 10,000 uses K suffix, below 10,000 uses comma formatting]

### Ambiguous Terms

- [ ] CHK018 - Is "quick summary" in FR-034 clarified with specific content fields and character/line limits? [Clarity, Spec §FR-034]
- [ ] CHK019 - Is "additional details" in FR-020 specified with exact content structure and data sources? [Clarity, Spec §FR-020]
- [x] CHK020 - Is "non-blocking toast warning" in the multi-tab edge case clarified with z-index, positioning, and interaction priority? [Clarity, **RESOLVED** - Spec §FR-021c specifies z-index: 50, position: top-right, auto-dismiss 5s with pause on hover]

---

## Requirement Consistency

### Cross-Reference Alignment

- [x] CHK021 - Are the gem slot counts consistent between FR-006 (8 base + up to 16 wing) and data-model SLOT_CONFIG constants? [Consistency, **RESOLVED** - Both specify 8 base + 16 wing max = 24 total]
- [ ] CHK022 - Is the optimization timeout value consistent between FR-022 (30 seconds), plan.md performance goals (<5s), and SC-002? [Consistency, Spec §FR-022, plan.md, SC-002]
- [ ] CHK023 - Are the build capacity limits consistent between FR-029a (5 free tier), plan.md (5 builds max), and data-model SavedBuild? [Consistency, Spec §FR-029a, plan.md]
- [x] CHK024 - Is the debounced validation timing consistent between FR-011 (300-500ms) and clarifications (300-500ms)? [Consistency, **RESOLVED** - Both specify 300-500ms]
- [x] CHK025 - Is the auto-dismiss toast timing consistent between the multi-tab edge case (5 seconds) and clarifications? [Consistency, **RESOLVED** - FR-021c and edge case both specify 5 seconds with pause on hover]

### Conflict Detection

- [x] CHK026 - Are there conflicts between "disable user interaction during optimization" (FR-017) and "cancellation option after 30 seconds" (FR-022)? [Conflict, **RESOLVED** - Modal overlay pattern: underlying form disabled, Cancel button in modal remains interactive (see FR-017, FR-022, plans/PROJ-002-resolution-plan.md)]
- [x] CHK027 - Are there conflicts between "auto-persist on every change" (FR-023a) and "unsaved changes confirmation" (FR-023b)? [Conflict, **RESOLVED** - Hybrid persistence model: SessionState auto-saved (no confirmation), SavedBuild requires explicit save (confirmation for unsaved named builds) - see FR-023a/b/c and plans/PROJ-002-resolution-plan.md]

---

## Acceptance Criteria Quality

### Measurability

- [ ] CHK028 - Can SC-001 (under 3 minutes for first use) be objectively measured with specific start/end event definitions? [Measurability, Spec §SC-001]
- [ ] CHK029 - Can SC-003 (90% success rate for adding gems) be objectively measured with specific success/failure criteria definitions? [Measurability, Spec §SC-003]
- [x] CHK030 - Can SC-008 (95% understand optimization results) be objectively measured with specific comprehension criteria and assessment method? [Measurability, **RESOLVED** - SC-008 specifies task-based assessment with 3 measurable tasks]
- [x] CHK031 - Can User Story 1 acceptance scenario 5 (maximum capacity reached indication) be objectively verified with specific UI element/behavior? [Measurability, **RESOLVED** - US1-Acceptance-5 specifies: disabled catalog gems (opacity-50), toast notification, tooltip]

### Success Criteria Traceability

- [ ] CHK032 - Are success criteria SC-001 through SC-010 traceable to specific functional requirements that enable their achievement? [Traceability, Spec §SC-001 to SC-010]
- [ ] CHK033 - Is SC-004 (no horizontal scrolling on mobile) achievable given all specified component width requirements? [Traceability, Spec §SC-004, FR-038]

---

## Scenario Coverage

### User Flow Coverage

- [x] CHK034 - Are requirements for the "first-time user with no saved session" flow complete from landing to first optimization result? [Scenario Coverage, **RESOLVED** - Spec §First-Time User Journey section added with 12-step flow from landing to results]
- [x] CHK035 - Are requirements for the "returning user with saved session" flow complete including session restoration verification? [Scenario Coverage, **RESOLVED** - Spec §FR-023 and FR-023a specify server-side session restoration]
- [x] CHK036 - Are requirements for the "partial optimization" flow (user cancels mid-processing) defined? [Scenario Coverage, **RESOLVED** - Spec §FR-017, FR-022 specify cancellation via modal Cancel button or Escape key]
- [x] CHK037 - Are requirements for the "build modification after optimization" flow (user adjusts gems based on recommendations) defined? [Scenario Coverage, **RESOLVED** - Spec §Post-Optimization Iteration Flow section added with 6-step modification flow]

### Error Flow Coverage

- [x] CHK038 - Are requirements for all four error types (validation, insufficient-resources, timeout, server-error) complete with UI rendering specifications? [Scenario Coverage, **RESOLVED** - FR-021e defines per-error-type UI: validation (inline), insufficient-resources (toast+action), timeout (modal), server-error (toast+code)]
- [ ] CHK039 - Are requirements for retry UI state (loading indicator, retry button state, disabled interactions) defined? [Scenario Coverage, Spec §FR-021b]
- [ ] CHK040 - Are requirements for network reconnection after optimization failure defined? [Scenario Coverage, Spec §Edge Cases]

---

## Edge Case Coverage

### Boundary Conditions

- [x] CHK041 - Are requirements for minimum/maximum resonance values and their impact on wing slot unlocking defined? [Edge Case, **RESOLVED** - Edge case section specifies: 0 min, thresholds 6000/7000/8000/8500+ for 4/8/12/16 wing slots]
- [ ] CHK042 - Are requirements for maximum integer values in resource inputs (2,147,483,647) defined with handling for overflow? [Edge Case, data-model §ResourceInventory]
- [ ] CHK043 - Are requirements for gem catalog loading with 100 gems (maximum specified) defined with performance expectations? [Edge Case, Spec §Assumptions, SC-007]
- [ ] CHK044 - Are requirements for build name uniqueness enforcement at the maximum character limit (50 chars) defined? [Edge Case, data-model §SavedBuild]

### Invalid Input Handling

- [ ] CHK045 - Are requirements for negative resource input values specified with rejection behavior and error messaging? [Edge Case, Spec §Edge Cases]
- [ ] CHK046 - Are requirements for non-numeric resource input (letters, special characters, paste content) defined? [Edge Case, Spec §Edge Cases]
- [ ] CHK047 - Are requirements for duplicate gem ID in base slots specified with exact prevention mechanism and user feedback? [Edge Case, Spec §FR-009]

---

## Non-Functional Requirements

### Performance Requirements

- [x] CHK048 - Are performance requirements for initial page load (FCP <1.5s, TTI <3s) defined with measurement methodology? [NFR Performance, **RESOLVED** - Spec §FR-041a specifies Core Web Vitals: FCP <1.8s, LCP <2.5s, TTI <3.8s, CLS <0.1 on mid-range mobile with 4G]
- [ ] CHK049 - Are performance requirements for gem catalog scroll performance (60fps) defined with scroll complexity factors? [NFR Performance, Spec §SC-007]
- [x] CHK050 - Are performance degradation requirements for slow networks or low-end devices defined? [NFR Performance, **RESOLVED** - Spec §FR-041b specifies skeleton loaders, lazy image loading, reduced motion for prefers-reduced-motion]
- [x] CHK051 - Are performance requirements for localStorage read/write operations with large build datasets defined? [NFR Performance, **RESOLVED** - Moot: localStorage only stores anonymousId; all session data persisted server-side]

### Accessibility Requirements

- [x] CHK052 - Are accessibility requirements for keyboard navigation order and focus management across all panels defined? [NFR Accessibility, **RESOLVED** - Spec §FR-043 specifies keyboard navigation for all interactive elements]
- [x] CHK053 - Are accessibility requirements for screen reader announcements during async operations (loading, errors) defined? [NFR Accessibility, **RESOLVED** - Spec §FR-044a specifies ARIA live regions: polite for completion/cancellation, assertive for errors]
- [x] CHK054 - Are accessibility requirements for color contrast on all state variations (hover, active, disabled, error) defined? [NFR Accessibility, **RESOLVED** - FR-045 specifies WCAG AA: 4.5:1 normal text, 3:1 large text/UI, error red #DC2626 with white text]
- [x] CHK055 - Are accessibility requirements for the gem detail modal focus trap and restoration defined? [NFR Accessibility, **RESOLVED** - Spec §FR-030a specifies focus trap (Tab cycles within modal) and focus returns to trigger element]

### Security Requirements

- [ ] CHK056 - Are security requirements for client-side vs server-side validation split documented with rationale? [NFR Security, Gap]
- [x] CHK057 - Are security requirements for localStorage data exposure risk mitigation defined? [NFR Security, **RESOLVED** - Moot: localStorage only stores anonymousId; session data server-side with database encryption at rest]
- [ ] CHK058 - Are security requirements for error message information exposure (avoiding internal details) defined? [NFR Security, Spec §FR-021]
- [x] CHK059 - Are security requirements for XSS prevention in user-entered build names and notes defined? [NFR Security, **RESOLVED** - Spec §FR-046 and data-model §XSS Prevention specify: strip HTML tags, reject dangerous URL schemes, React auto-escaping, CSP header, server-side validation mirrors client-side]

---

## Dependencies & Assumptions

### External Dependency Documentation

- [ ] CHK060 - Are assumptions for gem database availability documented with fallback behavior if data is missing/corrupt? [Dependencies, Spec §Assumptions, Gap]
- [ ] CHK061 - Are assumptions for optimization algorithm API contract documented with versioning strategy? [Dependencies, Spec §Assumptions]
- [x] CHK062 - Are assumptions for localStorage availability and quota documented with fallback behavior? [Dependencies, **RESOLVED** - Spec §FR-029b specifies: detect unavailability, use server-side session only, display one-time "Session saving to cloud" message]
- [ ] CHK063 - Are assumptions for image assets (gem icons) documented with placeholder behavior specification? [Dependencies, Spec §Assumptions, Clarifications]

### Internal Dependency Documentation

- [ ] CHK064 - Are dependencies between FR-006 (resonance slot calculation) and FR-007 (resonance display) explicitly documented? [Dependencies, Spec §FR-006, FR-007]
- [x] CHK065 - Are dependencies between FR-023a (auto-persist) and FR-023b (unsaved changes dialog) explicitly documented? [Dependencies, **RESOLVED** - Spec §FR-023c explicitly distinguishes SessionState vs SavedBuild persistence models]

---

## Ambiguities & Conflicts

### Resolved Clarifications

- [x] CHK066 - Are all clarifications from the 2026-02-14 session integrated into the specification requirements? [Ambiguity Resolution, **RESOLVED** - Spec §Clarifications section contains all resolved clarifications with dates]
- [x] CHK067 - Is the resonance calculation clarification (auto-calculated, no manual input) reflected consistently across FR-010, FR-006, and data-model? [Ambiguity Resolution, **RESOLVED** - FR-010 notes "Resonance is NOT a manual input", FR-006 specifies "automatically calculated", data-model §calculateTotalResonance provides implementation]

### Outstanding Ambiguities

- [ ] CHK068 - Is the exact behavior for "multiple copies of same gem in inventory" (quantity tracking UI) specified beyond the edge case note? [Ambiguity, Spec §Edge Cases]
- [ ] CHK069 - Is the exact behavior for "deprecated gems in saved builds" removal flow specified with UI element and confirmation requirements? [Ambiguity, Spec §Edge Cases]
- [ ] CHK070 - Is the exact tier ranking source and update frequency specified for PVP/PVE rankings? [Ambiguity, Spec §Phase 0 Research]

---

## Summary

| Category                    | Total  | Resolved | Open   | Critical Open |
| --------------------------- | ------ | -------- | ------ | ------------- |
| Requirement Completeness    | 10     | 8        | 2      | 0             |
| Requirement Clarity         | 10     | 5        | 5      | 0             |
| Requirement Consistency     | 7      | 7        | 0      | 0             |
| Acceptance Criteria Quality | 6      | 2        | 4      | 0             |
| Scenario Coverage           | 7      | 5        | 2      | 0             |
| Edge Case Coverage          | 7      | 1        | 6      | 0             |
| Non-Functional Requirements | 12     | 10       | 2      | 0             |
| Dependencies & Assumptions  | 6      | 2        | 4      | 0             |
| Ambiguities & Conflicts     | 5      | 2        | 3      | 0             |
| **Total**                   | **70** | **42**   | **28** | **0**         |

### Open Critical Items (0)

✅ All critical items have been resolved!

### Open High-Priority Items (0)

✅ All high-priority items have been resolved!

### Remaining Open Items (28)

Remaining items are medium/low priority and can be addressed during implementation:

- **Requirement Completeness** (2): CHK005, CHK009
- **Requirement Clarity** (5): CHK011-CHK014, CHK018-CHK019
- **Acceptance Criteria Quality** (4): CHK028-CHK029, CHK032-CHK033
- **Scenario Coverage** (2): CHK039-CHK040
- **Edge Case Coverage** (6): CHK042-CHK047
- **Non-Functional Requirements** (2): CHK049, CHK056, CHK058
- **Dependencies & Assumptions** (4): CHK060-CHK061, CHK063-CHK064
- **Ambiguities & Conflicts** (3): CHK068-CHK070

---

## Traceability Reference

| Code                   | Source                                        |
| ---------------------- | --------------------------------------------- |
| Spec §FR-XXX           | spec.md Functional Requirements               |
| Spec §US#-Acceptance-# | spec.md User Story Acceptance Scenarios       |
| Spec §SC-###           | spec.md Success Criteria                      |
| Spec §Edge Cases       | spec.md Edge Cases section                    |
| Spec §Clarifications   | spec.md Clarifications section                |
| Spec §Assumptions      | spec.md Assumptions section                   |
| data-model §Entity     | data-model.md Entity definition               |
| plan.md                | plan.md Technical Context                     |
| Gap                    | Missing requirement - needs specification     |
| Ambiguity              | Unclear requirement - needs clarification     |
| Conflict               | Contradictory requirements - needs resolution |

---

**Version**: 2.2.0 | **Last Updated**: 2026-02-18
