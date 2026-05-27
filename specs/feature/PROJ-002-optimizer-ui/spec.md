# Feature Specification: Optimizer UI

**Feature Branch**: `feature/PROJ-002-optimizer-ui`  
**Created**: 2026-02-14  
**Status**: Ready for Implementation  
**Input**: Build the user interface components for the legendary gems optimizer, including gem selection, resource input, optimization results display, and build management

## Summary

This specification defines the user interface components, layout, and interaction patterns for the DI-Lab legendary gems optimizer application. The UI enables Diablo Immortal players to input their gem inventory, specify available resources, receive optimization recommendations, and manage their builds. This specification focuses exclusively on the presentation layer and user interactions.

---

## User Scenarios & Testing

### User Story 1 - Gem Inventory Entry (Priority: P1)

As a player, I want to select and configure my legendary gems so that the optimizer can analyze my current build and provide relevant recommendations.

**Why this priority**: Gem inventory is the foundational input for all optimization functionality. Without accurate gem data, recommendations would be meaningless.

**Independent Test**: User can open the application, select gems from a categorized list, set quality and rank for each, and see their selections displayed. Delivers immediate value by visualizing current build.

**Acceptance Scenarios**:

1. **Given** the gem selector is displayed, **When** user browses the gem catalog, **Then** gems are organized by star rating (1-star, 2-star, 5-star) with visual indicators for each tier
2. **Given** user has selected a gem, **When** user specifies quality (1-5) and rank (1-10), **Then** the gem card updates to show the configured state with appropriate visual feedback
3. **Given** user has configured multiple gems, **When** user views the equipped gems section, **Then** all selected gems are displayed with their quality, rank, and effect summary
4. **Given** user wants to remove a gem, **When** user clicks remove on a gem card, **Then** the gem is removed from the equipped list and returns to the available catalog
5. **Given** user has filled all available slots (base 8 + resonance-unlocked up to 24 total), **When** user attempts to add another gem, **Then** the interface prevents selection and indicates maximum capacity reached via: (1) disabled state on remaining catalog gems with reduced opacity (opacity-50), (2) toast notification "All slots filled - upgrade resonance to unlock more", (3) tooltip on hover showing "No available slots"

---

### User Story 2 - Resource Specification (Priority: P1)

As a player, I want to input my available upgrade resources so that the optimizer can provide realistic recommendations within my constraints.

**Why this priority**: Resource constraints directly impact which upgrades are achievable. Accurate resource input is essential for practical recommendations.

**Independent Test**: User can input amounts for each resource type, see totals displayed, and modify values. Delivers value by tracking available resources in one place.

**Acceptance Scenarios**:

1. **Given** the resource input panel is displayed, **When** user enters gemPower amount, **Then** the value is validated as a positive integer and displayed with formatting (commas for thousands)
2. **Given** user enters resource amounts, **When** user views the resources summary, **Then** all resource types are displayed with their current values and visual indicators
3. **Given** user has entered resource values, **When** user modifies a value to zero or empty, **Then** the interface accepts the input and indicates the resource is unavailable
4. **Given** resource input is complete, **When** user proceeds to optimization, **Then** the resources are validated and passed to the optimization engine

---

### User Story 3 - Optimization Execution & Results (Priority: P1)

As a player, I want to trigger optimization and view prioritized recommendations so that I can make informed decisions about which gems to upgrade.

**Why this priority**: Optimization is the core value proposition of the application. This is the primary reason users visit DI-Lab.

**Independent Test**: User can click optimize button, see loading state, and view ranked recommendations with expected power gains. Delivers immediate actionable intelligence.

**Acceptance Scenarios**:

1. **Given** user has configured gems and resources, **When** user clicks the "Optimize" button, **Then** the interface shows a loading indicator and disables interaction during processing
2. **Given** optimization completes successfully, **When** results are displayed, **Then** recommendations are ranked by priority with clear indicators of power gain per resource invested
3. **Given** optimization results are displayed, **When** user views a recommendation, **Then** the following information is shown: target gem, upgrade path (rank progression), resource cost, expected power gain, and priority ranking
4. **Given** user wants to understand a recommendation, **When** user expands a recommendation card, **Then** additional details appear showing the reasoning and comparison to alternatives
5. **Given** optimization cannot be performed (e.g., no gems selected), **When** user clicks optimize, **Then** the interface displays a clear error message explaining the requirement
6. **Given** optimization returns no viable upgrades (insufficient resources), **When** results are displayed, **Then** the interface indicates that current resources cannot fund any upgrades

---

### User Story 4 - Build Management (Priority: P2)

As a returning player, I want to save my current build configuration so that I can quickly reload it in future sessions without re-entering data.

**Why this priority**: Build persistence improves user experience for repeat visitors but is not required for first-time optimization.

**Independent Test**: User can save a build with a name, see it in their saved builds list, and load it to restore all gem and resource configuration.

**Acceptance Scenarios**:

1. **Given** user has configured a build, **When** user clicks "Save Build", **Then** a modal appears prompting for a build name with optional notes
2. **Given** user saves a build, **When** user navigates to the builds section, **Then** the saved build appears in the list with name, timestamp, and summary stats
3. **Given** user has saved builds, **When** user clicks "Load" on a build, **Then** the interface restores all gem selections, qualities, ranks, and resource amounts
4. **Given** user wants to remove a saved build, **When** user clicks delete on a build, **Then** a confirmation appears and upon confirmation the build is removed
5. **Given** user wants to save a build, **When** user clicks "Save Build", **Then** the build is saved to server-side database linked to their anonymous session (or authenticated account if opted-in)

---

### User Story 5 - Gem Information Reference (Priority: P2)

As a player unfamiliar with certain gems, I want to view detailed gem information so that I can make informed selection decisions.

**Why this priority**: Information access supports decision-making but is secondary to the core optimization flow.

**Independent Test**: User can click on any gem to view its full effect description, tier ranking, and upgrade costs at each rank.

**Acceptance Scenarios**:

1. **Given** user is browsing the gem catalog, **When** user clicks on a gem, **Then** a detail panel/modal appears showing the gem's name, star rating, and full effect description
2. **Given** gem detail view is open, **When** user views effect information, **Then** effects are categorized (OFF, DEF, ALL, etc.) with clear descriptions of what each effect does
3. **Given** gem detail view is open, **When** user views upgrade information, **Then** resource costs for each rank upgrade are displayed
4. **Given** gem detail view is open, **When** user views tier rankings, **Then** the gem's PVP and PVE tier rankings are displayed (S, A, B, C, D)
5. **Given** user wants to quickly compare gems, **When** user hovers over a gem in the catalog, **Then** a tooltip shows key stats and a brief effect summary

---

### User Story 6 - Optimization Constraints & Goals (Priority: P3)

As an advanced player, I want to set optimization preferences so that recommendations align with my specific goals (PVP vs PVE, specific content types).

**Why this priority**: Advanced customization improves recommendation quality but the default optimization provides value without configuration.

**Independent Test**: User can toggle between PVP and PVE optimization modes and see recommendations update accordingly.

**Acceptance Scenarios**:

1. **Given** optimization settings panel is open, **When** user selects optimization mode (PVP/PVE), **Then** the interface indicates the selected mode and subsequent optimizations use appropriate tier rankings
2. **Given** optimization settings panel is open, **When** user sets a maximum resource budget, **Then** recommendations are constrained to not exceed the specified budget
3. **Given** user has set optimization preferences, **When** user runs optimization, **Then** the preferences are applied to the algorithm and reflected in recommendations

---

### User Story 7 - Responsive Mobile Experience (Priority: P2)

As a player using my phone during gameplay, I want the interface to work smoothly on mobile so that I can use DI-Lab while playing Diablo Immortal.

**Why this priority**: Mobile usability is critical for in-game use cases but desktop layout can serve as the design foundation.

**Independent Test**: User can access DI-Lab on a mobile device, navigate all sections, and complete the optimization flow with touch interactions.

**Acceptance Scenarios**:

1. **Given** user accesses DI-Lab on mobile, **When** the page loads, **Then** the layout adapts to the viewport with appropriately sized touch targets
2. **Given** mobile user is viewing the gem catalog, **When** user scrolls through gems, **Then** the catalog scrolls smoothly at 60fps performance (full category loaded per tab, no infinite scroll needed)
3. **Given** mobile user is configuring gems, **When** user interacts with quality/rank selectors, **Then** mobile-friendly input controls are used (dropdowns, sliders, or stepper buttons)
4. **Given** mobile user is viewing optimization results, **When** user scrolls through recommendations, **Then** the results are presented in a mobile-optimized card stack

---

### Edge Cases

- What happens when a user tries to equip the same gem twice in base slots? The interface should prevent duplicate selections in base 8 slots and indicate the gem is already equipped there; duplicates are allowed in resonance wing slots.
- What happens when a user equips/removes a legendary gem? The interface should automatically recalculate total resonance and dynamically update the number of available wing slots based on resonance thresholds (6000=4, 7000=8, 8000=12, 8500+=16).
- What happens when a user has multiple copies of the same gem in their inventory? The app should allow recording multiple identical gems (quantity tracking), though only one can occupy a base slot during optimization.
- What happens when a user enters invalid resource values (negative, non-numeric)? The interface should reject invalid input and display an error message.
- What happens when optimization takes longer than expected? The interface should show a progress indicator and allow cancellation if processing exceeds a reasonable time.
- What happens when a user loses network connection during optimization? The interface should handle errors gracefully and allow retry when connection is restored.
- What happens when a user's saved build contains gems that have been removed from the database? The interface should indicate the deprecated gems and allow removal.
- What happens when a user has very high resource amounts that exceed display formatting? The interface should format numbers >= 1,000,000 with M suffix (e.g., "1.2M gemPower"), numbers >= 10,000 with K suffix (e.g., "15.3K gemPower"); exact thresholds: >= 1,000,000 uses M, >= 10,000 uses K. Numbers below 10,000 display with comma formatting only (e.g., "9,500").
- What happens when a user has DI-Lab open in multiple browser tabs and makes conflicting build changes? The interface should allow concurrent edits but show a non-blocking toast warning (auto-dismiss after 5 seconds with pause on hover) when changes are detected from another tab (optimistic UI pattern per FR-008a).

---

## First-Time User Journey

The following flow documents the complete first-time user experience from landing to first optimization result:

1. **Landing**: User arrives at optimizer page (`/optimize`)
2. **Empty State Display**: User sees empty equipped gems panel with guidance message "Select gems from the catalog to start your build" and gem catalog with 5-star tab selected by default
3. **Gem Selection**: User browses gem catalog (tabs for 1-star, 2-star, 5-star), hovers/taps for quick info, clicks gem to open detail modal
4. **Gem Configuration**: User clicks "Add to Build" in modal, gem appears in first available slot with default quality (1) and rank (1)
5. **Quality/Rank Adjustment**: User uses dropdown selectors on equipped gem card to set quality (1-5) and rank (1-10)
6. **Additional Gems**: User repeats selection process for additional gems (up to 8 base slots, plus resonance-unlocked slots)
7. **Resource Input**: User enters available resources (Gem Power, Gem Copy Inventory, Telluric Pearls, Telluric Fragments, Fading Embers, Platinum, Crest counts, Dawning Echoes) in resources panel with real-time validation
8. **Mode Selection (Optional)**: User notes PVE mode is selected by default, can toggle to PVP if desired
9. **Optimization Trigger**: User clicks "Optimize" button
10. **Processing State**: Modal overlay appears with progress indicator, user can cancel if needed
11. **Results Display**: Optimization results appear in results panel with ranked recommendations
12. **Results Review**: User browses recommendations, expands for details, understands priority ranking

**Success Metrics**: User completes flow in under 3 minutes (SC-001), 90% success rate for adding at least one gem (SC-003)

---

## Post-Optimization Iteration Flow

After viewing optimization results, users typically iterate on their build. This flow documents the common modification patterns:

1. **View Recommendations**: User reviews ranked recommendations with power gain and resource cost
2. **Expand Details**: User clicks to expand a recommendation for reasoning and alternatives
3. **Manual Gem Modification**: User returns to equipped gems panel and:
   - Adjusts quality/rank on an existing gem
   - Removes a gem and adds a different one
   - Adds new gems to empty slots
4. **Resource Adjustment**: User updates resource amounts based on remaining resources after hypothetical upgrade
5. **Re-run Optimization**: User clicks "Optimize" again (previous results are replaced)
6. **Compare Results**: User views new recommendations and compares to previous (note: spec does not include side-by-side comparison feature - this would require history feature in future version)

**Key Implementation Notes**:

- Previous optimization results are cleared when new optimization starts
- Session state (gems, resources, mode) is auto-persisted to server database per FR-023a
- User can cancel optimization at any time per FR-017

---

## Requirements

### Functional Requirements

#### Gem Selection & Configuration

- **FR-001**: System MUST display a gem catalog organized by star rating (1-star, 2-star, 5-star) using tabbed category selector, with 5-star category selected by default
- **FR-002**: System MUST display each gem with its name, star rating, and visual icon/placeholder
- **FR-002a**: System MUST display gem catalog with consistent visual hierarchy: uniform card size (120x160px minimum), 16px gap between cards, 5-star gems highlighted with gold border (2px), tier badges with color coding (S=gold #FFD700, A=silver #C0C0C0, B=bronze #CD7F32, C/D=gray #808080)
- **FR-003**: System MUST allow users to select gems from the catalog for equipment
- **FR-004**: System MUST provide quality selection (1-5) for each equipped gem
- **FR-005**: System MUST provide rank selection (1-10) for each equipped gem
- **FR-005a**: System MUST use dropdown select controls for quality and rank selection on equipped gem cards, providing compact mobile-friendly interaction with native accessibility support
- **FR-006**: System MUST limit equipped gems to 8 base slots plus resonance-unlocked slots (up to 24 total: 8 base + 16 from resonance wings). Resonance is automatically calculated from equipped legendary gems and dynamically unlocks wing slots at thresholds (6000 resonance = 4 slots, 7000 = 8 slots, 8000 = 12 slots, 8500+ = 16 slots). No manual resonance input is required.
- **FR-007**: System MUST display equipped gems in a dedicated section showing current configuration, including automatically calculated total resonance from all equipped legendary gems
- **FR-008**: System MUST allow removal of equipped gems
- **FR-008a**: System MUST provide optimistic UI updates for gem add/remove operations with automatic rollback on failure (optimistic update pattern: update UI immediately, revert if server operation fails)
- **FR-009**: System MUST prevent duplicate gem selections in base 8 slots (same gem ID); duplicate gem IDs are allowed in resonance wing slots. Users may record multiple copies of identical gems in their inventory for quantity tracking.
- **FR-009a**: System MUST display dedicated empty states for each panel with contextual messaging and guidance actions:
  - **Empty Gem Catalog**: Display message "No gems match your filter" with "Clear filters" action button when search/filter returns no results
  - **No Equipped Gems**: Display message "No gems equipped" with "Browse gems" action button and brief instruction "Select gems from the catalog to start your build"
  - **No Recommendations**: Display message "No upgrades available" with contextual explanation (e.g., "Insufficient resources for any upgrades" or "All gems are at maximum rank") and "View resource requirements" action if applicable

#### Resource Input

- **FR-010**: System MUST provide input fields for upgrade resources: Gem Power, Gem Copy Inventory, Telluric Pearls, Telluric Fragments, Fading Embers, Platinum, and Crest counts (Eternal Legendary Crests, Legendary Crests, Rare Crests). Note: Resonance is NOT a manual input; it is auto-calculated from equipped legendary gems.
- **FR-010a**: System MUST display platinum-equivalent costs for all resources based on values from currencies-and-materials.csv for cost comparison purposes. **[DEFERRED - Requires external market data integration]**
- **FR-011**: System MUST validate resource inputs as non-negative integers with debounced feedback (300-500ms delay after user stops typing). Validation errors use structured format: `{ "fields": [{ "field": "gemPower", "code": "INVALID_TYPE", "message": "Must be a positive integer" }] }` with error codes INVALID_TYPE (non-numeric), NEGATIVE_VALUE (negative number), EXCEEDS_MAX (overflow > 2,147,483,647). Errors displayed inline below each field with red border and error icon.
- **FR-012**: System MUST display resource values with appropriate number formatting
- **FR-013**: System MUST show a resources summary panel with all configured values
- **FR-014**: System MUST allow clearing/resetting resource values

#### Optimization Execution

- **FR-015**: System MUST provide an "Optimize" button that triggers the optimization process via server-side API route (`/api/optimize`)
- **FR-016**: System MUST display skeleton loaders (gray placeholder shapes mimicking content layout) during data fetching and optimization processing, replaced by actual content when data arrives
- **FR-016a**: System MUST implement skeleton loaders for gem catalog grid (showing placeholder gem cards) and optimization results (showing placeholder recommendation cards)
- **FR-016b**: System MUST define consistent interaction states for all interactive elements (buttons, cards, form inputs): hover (bg-opacity +10%, scale 1.02), focus (2px ring outline in accent color), active (scale 0.98), disabled (opacity 50%, cursor not-allowed), loading (spinner + disabled state)
- **FR-017**: System MUST display a modal overlay during optimization processing that:
  - Shows a progress indicator (spinner or progress bar)
  - Displays elapsed time (optional, updates every second)
  - Provides a Cancel button that remains interactive
  - Visually disables the underlying form with a semi-transparent overlay
  - Prevents all form interactions (clicks, keyboard navigation) on the underlying UI
  - Allows cancellation via the Cancel button or Escape key
- **FR-018**: System MUST display optimization results as prioritized recommendations
- **FR-019**: System MUST show for each recommendation: target gem, upgrade path (rank progression), resource cost, and expected power gain. **[ADVANCED]** Acquisition paths (how to obtain gems/resources) are a nice-to-have feature showing methods like Elder Rift farming, market purchases, or crafting. Note: FR-052-054 (resource deficit display and acquisition options) are separate in-scope MVP requirements, not part of this advanced feature.
- **FR-020**: System MUST allow users to expand recommendations for additional details
- **FR-021**: System MUST display typed error messages when optimization cannot be performed, with specific handling for: validation errors (invalid input), insufficient-resources (no viable upgrades), timeout (processing exceeded 30 second limit), server-error (backend failure), and rate-limited (HTTP 429 with retry-after guidance showing wait time)
- **FR-021e**: System MUST render each error type with distinct UI treatment: validation errors use inline field display with icon + red border, insufficient-resources errors show toast with 'View requirements' action linking to deficit panel, timeout errors display modal with retry button and elapsed time, server-error shows toast with 'Try again' button and error code for support reference
- **FR-021d**: System MUST handle network connection loss during optimization: detect offline status via navigator.onLine or fetch failure, display "Connection lost" error with retry-when-online option, and queue retry when connection is restored
- **FR-022**: System MUST handle optimization timeout gracefully:
  - Display a timeout warning after 20 seconds with "Still processing..." message
  - Enable cancellation at any time via Cancel button in the modal overlay
  - After 30 seconds, automatically offer cancellation if still processing
  - On cancellation: abort the optimization request, close modal, restore form interactivity
  - Show toast notification confirming cancellation with retry option
- **FR-022a**: System MUST handle concurrent optimization requests using cancel-and-replace pattern:
  - If user triggers a new optimization while one is in progress, cancel the previous request
  - Display a brief "Previous optimization cancelled" message before starting new request
  - Use AbortController to cancel in-flight fetch requests
  - This applies both to rapid button clicks within the same tab and optimization requests from different browser tabs
- **FR-021a**: System MUST provide actionable guidance for each error type (e.g., "Add more resources" for insufficient-resources, "Check your gem configuration" for validation errors, "Too many requests - please wait X seconds" for rate-limited with countdown from Retry-After header)
- **FR-021b**: System MUST implement single retry with fixed 1s delay for transient optimization API failures before displaying error to user (note: single retry only, not exponential backoff which would require multiple retries with increasing delays)
- **FR-021c**: System MUST display toast notifications with the following specification:
  - **Position**: Top-right corner of viewport
  - **Layout**: Vertical stack, newest toast on top
  - **Z-index**: 50 (below modals which use z-index 100)
  - **Max visible**: 3 toasts simultaneously; older toasts auto-dismiss
  - **Auto-dismiss**: 5 seconds with pause on hover
  - **Mobile adaptation**: Full-width at top of screen on viewports < 640px

#### Build Management

- **FR-023**: System MUST restore the last session state (equipped gems, resources, optimization mode) from the server-side database when the user loads the optimizer, identified by anonymous session (device fingerprint) or authenticated account
- **FR-023a**: System MUST auto-persist session state to server-side database on every change:
  - Auto-save applies to SessionState only (gems, resources, optimizationMode)
  - Auto-save occurs on every user action (gem add/remove, quality/rank change, resource input)
  - Auto-saved session is automatically restored on page load
  - Auto-saved session does NOT create a named build
  - User sees "Session auto-saved" indicator (subtle, non-intrusive)
- **FR-023b**: System MUST show unsaved changes confirmation only for named builds:
  - Confirmation dialog appears when user has an unsaved named build in progress
  - A named build is considered "unsaved" when:
    - User explicitly saved the build, then modified it
    - User started with a loaded named build, then modified it
  - Confirmation does NOT appear for:
    - New session state (auto-persisted, no explicit save)
    - Already saved named builds (no modifications since save)
  - Dialog options: "Save", "Don't Save", "Cancel"
- **FR-023c**: System MUST distinguish between session state and named builds:
  - SessionState: Auto-persisted to server, restored on load, no confirmation on exit
  - SavedBuild: Explicit save required, confirmation on exit if modified
  - Transition from session to named build occurs when user clicks "Save Build"
- **FR-024**: System MUST provide a "Save Build" action that captures current configuration to server-side database
- **FR-025**: System MUST prompt for a unique build name when saving, rejecting duplicates with a clear error message
- **FR-026**: System MUST display saved builds in a builds section with name and timestamp
- **FR-027**: System MUST allow loading saved builds to restore configuration
- **FR-028**: System MUST allow deletion of saved builds with confirmation
- **FR-029**: System MUST provide anonymous session identification via localStorage-based anonymous ID:
  - Generate unique identifier (UUID v4) on first visit
  - Store identifier in localStorage for returning user recognition
  - Link session data to anonymous identifier in database
  - Handle localStorage unavailability gracefully (server-side session fallback)
  - Note: Device fingerprinting was considered but rejected due to GDPR privacy concerns
- **FR-029a**: System MUST enforce build capacity limits based on subscription tier (free tier: 5 builds maximum, paid tiers: higher limits) and display remaining capacity to the user
- **FR-029b**: System MUST handle localStorage unavailability gracefully:
  - Detect localStorage availability on page load
  - If unavailable: use server-side session identification only (may lose returning user recognition)
  - Session data still persisted to database via server-side session
  - Display one-time info message "Session saving to cloud" instead of localStorage warning
- **FR-029c**: System MUST provide opt-in email collection:
  - Display optional "Add email for notifications" in user settings
  - Email is optional and can be added/removed at any time
  - Email enables: build reminders, optimization tips, account recovery
  - Clear indication that email is optional (not required for core functionality)
  - Email validation with confirmation flow
  - **[DEFERRED - Moved to Out of Scope for MVP, see tasks T115-T116]**
- **FR-029d**: System MUST handle session invalidation gracefully:
  - Detect session invalidation when server returns 404/410 for session endpoint
  - Display "Session expired" toast notification
  - Automatically create new session with new UUID
  - Preserve local UI state (gems, resources currently displayed)
  - Sync preserved state to new session
  - No data loss for user's current work

#### Gem Information

- **FR-030**: System MUST provide detailed view for each gem showing full effect description
- **FR-030a**: System MUST implement accessible modal closing behavior for gem detail modals:
  - ESC key closes the modal
  - Click outside modal (on overlay) closes the modal
  - Close button is visible and accessible
  - Focus returns to the element that triggered the modal (gem card or catalog item)
  - Modal implements focus trap (Tab cycles within modal content)
- **FR-031**: System MUST categorize gem effects (OFF, DEF, ALL, DOT, LOC, etc.)
- **FR-032**: System MUST display upgrade cost information for each rank
- **FR-033**: System MUST display tier rankings (PVP and PVE) for each gem
- **FR-034**: System MUST provide hover tooltips with quick gem summaries on desktop; on mobile/touch devices, provide tap-to-reveal info button or long-press gesture alternative with visual feedback

#### Optimization Preferences

- **FR-035**: System MUST provide optimization mode selection (PVP/PVE) with PVE as the default selection
- **FR-036**: System MUST apply selected mode to optimization algorithm
- **FR-037**: System MUST display the currently active optimization mode
- **FR-037a**: System MUST allow optional maximum resource budget constraint input that limits optimization recommendations to a user-specified gemPower ceiling
- **FR-037b**: System MUST provide an "Advanced Strategies" toggle (default: off) that, when enabled, shows additional optimization paths including Dormant 5-Star Gem Infusion recommendations

#### Awakening Management

- **FR-047**: System MUST track awakened equipment slots (up to 12 slots)
- **FR-048**: System MUST allow users to toggle awakened status per slot
- **FR-049**: System MUST include Dawning Echo cost (10,000 Platinum equivalent) in optimization when recommending slot awakening
- **FR-050**: System MUST calculate resonance impact of awakened slots on wing slot availability

#### Resource Deficit & Acquisition

- **FR-051**: System MUST display GP deficit when resources are insufficient for recommended upgrades
- **FR-052**: System MUST present three acquisition options when deficit exists:
  - **Farming Elder Rifts** - Earning rewards through gameplay by running Elder Rifts content
  - **Market Purchases** - Acquiring items directly from the Market using Platinum currency
  - **Hybrid Approach** - Combining both farming and market strategies based on availability and efficiency
- **FR-053**: System MUST show run requirements for crafting paths (e.g., "X runs needed to craft Y gems")
- **FR-054**: System MUST use the following crafting conversion rates:
  - 20 Telluric Fragments = 1-star legendary gem = 1 Gem Power when used as fodder
  - 80 Telluric Fragments = 2-star legendary gem = 4 Gem Power when used as fodder
  - 320 Fading Embers = 1 Eternal Legendary Crest
  - 5 Fading Embers = 1 Telluric Pearl (suboptimal vs. saving for Eternal Crest, but viable for minor deficits)

#### Responsive Design

- **FR-038**: System MUST adapt layout for mobile viewport sizes using Tailwind default breakpoints (sm:640px, md:768px, lg:1024px, xl:1280px, 2xl:1536px)
- **FR-039**: System MUST provide touch-friendly interaction targets on mobile
- **FR-040**: System MUST ensure all core functionality is accessible on mobile devices
- **FR-041**: System MUST optimize scrolling performance for long lists on mobile
- **FR-041a**: System MUST meet Core Web Vitals performance budgets for initial page load:
  - First Contentful Paint (FCP) < 1.8 seconds
  - Largest Contentful Paint (LCP) < 2.5 seconds
  - Time to Interactive (TTI) < 3.8 seconds
  - Cumulative Layout Shift (CLS) < 0.1
  - Measured on mid-range mobile devices with 4G network simulation
- **FR-041b**: System MUST implement progressive enhancement for slow networks and low-end devices:
  - Display skeleton loaders for content areas while data loads
  - Implement lazy loading for gem images with placeholder fallbacks
  - Reduce or disable non-essential animations when `prefers-reduced-motion` is set
  - Use Network Information API to detect slow connections (optional enhancement)
  - Core functionality (gem selection, optimization) must work without images loaded

#### Accessibility

- **FR-042**: System MUST conform to WCAG 2.1 AA accessibility standards
- **FR-043**: System MUST provide keyboard navigation for all interactive elements
- **FR-044**: System MUST include appropriate ARIA labels and roles for screen reader support
- **FR-044a**: System MUST provide screen reader announcements for critical optimization events:
  - **Optimization completion**: Announce "Optimization complete. X recommendations found."
  - **Optimization error**: Announce the error title and guidance from FR-021
  - **Optimization cancellation**: Announce "Optimization cancelled."
  - Do NOT announce loading start (modal overlay already indicates progress)
  - Use aria-live="polite" region for non-intrusive announcements
  - Use aria-live="assertive" for error announcements requiring immediate attention
- **FR-045**: System MUST maintain sufficient color contrast ratios per WCAG 2.1 AA: normal text 4.5:1 minimum, large text (18px+ or 14px bold) 3:1 minimum, UI components 3:1 minimum. Hover/active states must maintain ratios, disabled states use opacity 50% (exempt per WCAG), error states use red (#DC2626) with white text for 4.8:1 contrast
- **FR-046**: System MUST prevent XSS attacks in user-entered content:
  - Build names (1-50 characters) and notes (0-500 characters) are user-controllable
  - React's JSX auto-escaping provides baseline protection against injection
  - Additional sanitization required for defense-in-depth:
    - Strip HTML tags from build names and notes before storage
    - Escape special characters (< > & " ') on display
    - Reject content containing javascript: or data: URLs
  - Server-side validation must mirror client-side validation
  - Content Security Policy (CSP) header must be configured to prevent inline script execution

---

## Key Entities

### EquippedGem

Represents a gem selected by the user with specific configuration:

- **Gem Reference**: Identifier linking to the gem database
- **Quality**: Star rating (1-5) indicating gem quality
- **Rank**: Current upgrade rank (1-10)
- **Slot Position**: Position in the equipped gems grid (1-24, where 1-8 are base gear slots and 9-24 are resonance-unlocked wing slots)
- **Resonance Contribution**: Amount of resonance this gem provides (auto-calculated based on gem type, quality, and rank)

### ResourceInventory

Represents the user's available upgrade resources:

- **Gem Power**: Amount of gem power available for upgrades
- **Gem Instances (Inventory)**: Gems owned but not currently equipped - these can be used as "copies" for rank upgrades (for 5-star gems, any quality counts)
- **Telluric Pearls**: Used to craft 5-star gems and specific 2-star gems (limited-time event exclusives)
- **Telluric Fragments**: Used to craft 1-star or 2-star gems
- **Fading Embers**: Used to craft selected 1-star and 2-star gems, random 1-star and 2-star gems, and Eternal Legendary Crests
- **Platinum**: Currency for purchasing Legendary gems from the market and Awakening slots (10,000 Platinum per Dawning Echo)
- **Eternal Legendary Crests**: Guarantees 1-star+ gem drop (can be sold), yields 1 Fading Ember + 1 Telluric Fragment per run
- **Legendary Crests**: Guarantees 1-star+ gem drop (bound), yields 1 Fading Ember + 1 Telluric Fragment per run
- **Rare Crests**: 5% chance for 1-star gem, yields 1 Fading Ember + 4 Telluric Fragments per run
- **Dawning Echoes**: Optional; if user has purchased any, track count for awakened slot capacity

### Gem Inventory (Two-Panel UI Design)

The gem management UI uses a two-panel design similar to the in-game interface:

**Left Panel - Equipped Gems:**

- 24 slots maximum (8 base gear slots + 16 resonance wing slots)
- Shows gems currently socketed in equipment
- Click gem to unequip and move to inventory panel

**Right Panel - Inventory Gems:**

- Unlimited slots for owned but unequipped gems
- Auto-ordered by: Star Rating (5★ > 2★ > 1★) primary, then Rank > Quality > Name secondary
- Click gem to equip (if slot available)

**Gem Instance Concept:**

- Multiple gems with the same name are different instances, not duplicates
- For 5-star gems, any quality can be used as upgrade material
- Higher quality gems can upgrade lower quality gems (e.g., R1 Q4 + R3 Q2 → R4 Q4)

### OptimizationResult

Represents the output of an optimization calculation:

- **Recommendations**: Ordered list of upgrade suggestions
- **Total Power Gain**: Sum of expected power improvements
- **Total Resource Cost**: Sum of resources required for all recommendations
- **Mode**: The optimization mode used (PVP/PVE)

### UpgradeRecommendation

Represents a single upgrade suggestion:

- **Target Gem**: The gem to upgrade or acquire
- **Current Rank**: Starting rank (for upgrades) or 0 (for new acquisitions)
- **Target Rank**: Destination rank
- **Acquisition Path**: One of: gem-power-upgrade (using Gem Power + Copies), craft-pearl (using Telluric Pearls), craft-fragment (using Telluric Fragments), craft-ember (using Fading Embers), market-buy (using Platinum), crest-run (potential drop from crests)
- **Resource Cost**: Resources required for this upgrade/acquisition with platinum-equivalent value
- **Alternative Paths**: Other viable acquisition methods with their costs (for cost comparison)
- **Power Gain**: Expected improvement in combat rating/resonance
- **Priority Rank**: Position in the recommendation list

### AwakenedSlot

Represents an awakened equipment slot:

- **Slot Position**: Which gear slot is awakened (1-12 possible slots)
- **Awakened Status**: Boolean indicating if slot is awakened
- **Dawning Echo Cost**: 10,000 Platinum or 1,000 Orbs per awakening
- **Resonance Benefit**: Additional resonance capacity from having this slot awakened

### SavedBuild

Represents a persisted build configuration:

- **Build ID**: Unique identifier
- **Session ID**: Reference to owning session (anonymous or authenticated)
- **Build Name**: User-provided identifier
- **Equipped Gems**: List of configured gems
- **Resources**: Resource amounts at save time
- **Timestamp**: When the build was saved
- **Notes**: Optional user notes

### AnonymousSession

Represents an anonymous user session:

- **Anonymous ID**: UUID v4 stored in localStorage for identification
- **Email**: Optional email address (if opted-in for notifications/recovery)
- **Email Verified**: Whether email has been verified
- **Created At**: Session creation timestamp
- **Last Active**: Last activity timestamp
- **Session State**: Current gems, resources, optimization mode

> **Terminology Convention**: Code uses camelCase (e.g., `gemPower`, `inventoryGems`), while UI displays use Title Case (e.g., "Gem Power", "Inventory Gems"). The UI uses a two-panel design: Left (Equipped Gems) and Right (Inventory Gems). See [`data-model.md`](./data-model.md#terminology-convention) for the complete terminology mapping table.

---

## UI Component Hierarchy

### Layout Components

```
App Layout
|-- Header
|   |-- Logo
|   |-- Navigation
|   |-- User Menu (anonymous session with opt-in email)
|-- Main Content Area
|   |-- Optimizer View
|   |-- Builds View
|-- Footer
```

### Optimizer Page Components

```
Optimizer Page
|-- Gem Selection Panel
|   |-- Star Rating Tabs
|   |-- Gem Catalog Grid
|   |   |-- Gem Card (catalog view)
|   |       |-- Gem Icon
|   |       |-- Gem Name
|   |       |-- Quick Add Button
|   |-- Search/Filter Bar
|-- Equipped Gems Panel
|   |-- Slot Grid (8 base slots + up to 16 resonance-unlocked wing slots, dynamically unlocked based on auto-calculated resonance)
|   |   |-- Equipped Gem Card
|   |       |-- Gem Display
|   |       |-- Quality Selector
|   |       |-- Rank Selector
|   |       |-- Remove Button
|   |-- Summary Stats (auto-calculated resonance total, CR totals, unlocked wing slots indicator)
|-- Resources Panel
|   |-- Resource Input Fields
|   |   |-- Gem Power Input
|   |   |-- Gem Copy Inventory (per gem)
|   |   |-- Telluric Pearls Input
|   |   |-- Telluric Fragments Input
|   |   |-- Fading Embers Input
|   |   |-- Platinum Input
|   |   |-- Crest Inputs (Eternal, Legendary, Rare)
|   |   |-- Dawning Echoes Input
|   |-- Resources Summary Display
|   |-- Note: Resonance displayed in Equipped Gems Panel, not here
|-- Optimization Controls
|   |-- Optimization Mode Selector
|   |-- Optimize Button
|-- Results Panel
|   |-- Results Summary
|   |-- Recommendations List
|   |   |-- Recommendation Card
|   |       |-- Priority Badge
|   |       |-- Target Gem Display
|   |       |-- Upgrade Path
|   |       |-- Cost Summary
|   |       |-- Power Gain
|   |       |-- Expand Details Button
|   |       |-- Details Expansion
|-- Save Build Modal
|   |-- Build Name Input
|   |-- Notes Input
|   |-- Save/Cancel Actions
```

### Gem Detail Components

```
Gem Detail Modal/Panel
|-- Gem Header
|   |-- Gem Icon
|   |-- Gem Name
|   |-- Star Rating
|-- Effect Categories
|   |-- Effect Section
|   |   |-- Category Label
|   |   |-- Effect Description
|-- Upgrade Costs Table
|   |-- Rank Column
|   |-- Cost Columns
|-- Tier Rankings
|   |-- PVP Tier
|   |-- PVE Tier
|-- Action Buttons
|   |-- Add to Build
|   |-- Close
```

### Builds Page Components

```
Builds Page
|-- Saved Builds List
|   |-- Build Card
|   |   |-- Build Name
|   |   |-- Timestamp
|   |   |-- Summary Stats
|   |   |-- Actions (Load, Delete)
|-- Empty State (no builds)
```

---

## State Management Requirements

### Client-Side State

The UI uses React's built-in state management (useState/useContext) for all client-side state. This approach is sufficient for the P1-P3 scope without over-engineering.

The UI requires management of the following state:

#### Selection State

- **Selected Gems**: Array of currently equipped gems with their configurations
- **Active Slot**: Which slot is currently being configured (if any)
- **Catalog Filter**: Current filter/search criteria for gem catalog
- **Active Star Rating Tab**: Which star rating category is displayed (default: 5-star)
- **Total Resonance**: Auto-calculated sum of resonance from all equipped legendary gems
- **Unlocked Wing Slots**: Number of resonance-unlocked slots available (derived from total resonance thresholds)

#### Resource State

- **Gem Power**: Amount of gem power available for upgrades
- **Gem Copy Inventory**: Map of gem IDs to quantities for rank upgrades via copies
- **Telluric Pearls**: Amount available for 5-star and event-exclusive 2-star gem crafting
- **Telluric Fragments**: Amount available for 1-star and 2-star gem crafting
- **Fading Embers**: Amount available for gem crafting and Eternal Crest purchases
- **Platinum Amount**: User-entered platinum value for market purchases and awakening
- **Crest Counts**: Eternal Legendary Crests, Legendary Crests, Rare Crests counts
- **Dawning Echoes**: Count of purchased Dawning Echoes (for awakened slot tracking)
- **Validation State**: Whether inputs are valid

#### Optimization State

- **Is Loading**: Boolean indicating optimization in progress
- **Results**: Current optimization results or null
- **Error**: Error message if optimization failed
- **Mode**: Current optimization mode (PVP/PVE)
- **Expanded Recommendations**: Which recommendation details are expanded

#### UI State

- **Current View**: Which page/section is active
- **Modal State**: Whether any modal is open and which one
- **Tooltips**: Hover state for tooltips
- **Mobile Menu**: Whether mobile navigation is open

#### Build State

- **Saved Builds**: List of persisted builds (from server-side database)
- **Current Build**: The active build being configured
- **Is Saving**: Whether save operation is in progress
- **Session ID**: Anonymous session identifier (from device fingerprint)
- **Email Opt-in**: Whether user has opted-in to email notifications

---

## Interaction Patterns

### Gem Selection Flow

1. User browses gem catalog (filtered by star rating or search)
2. User clicks gem card to open detail view OR clicks quick-add
3. If detail view: User reviews information and clicks "Add to Build"
4. Gem appears in first available slot in Equipped Gems Panel
5. User configures quality and rank using selectors on the equipped gem card
6. Summary stats update automatically (resonance recalculated, wing slots dynamically unlocked if thresholds reached)

### Resource Input Flow

1. User clicks resource input field
2. User types numeric value
3. Input is validated on blur or change
4. Summary display updates with formatted values
5. Validation state is visually indicated

### Optimization Flow

1. User verifies gems and resources are configured
2. User optionally selects optimization mode (PVP/PVE)
3. User clicks "Optimize" button
4. Loading state appears, button becomes disabled
5. Optimization processes (client or server)
6. Results appear in Results Panel
7. User browses recommendations, expands for details
8. User can re-optimize with different parameters

### Build Save Flow

1. User clicks "Save Build"
2. Modal appears with name input
3. User enters build name and optional notes
4. User clicks "Save"
5. Confirmation appears
6. Build is added to saved builds list

### Build Load Flow

1. User navigates to Builds page
2. User sees list of saved builds
3. User clicks "Load" on desired build
4. Optimizer page appears with build configuration restored
5. User can modify and re-optimize

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can complete the full optimization flow (select gems, enter resources, receive recommendations) in under 3 minutes on first use
- **SC-002**: Optimization results display within 5 seconds of clicking the Optimize button
- **SC-003**: 90% of users successfully add at least one gem to their build on first attempt
- **SC-004**: Mobile users can complete the optimization flow with no horizontal scrolling required
- **SC-005**: All interactive elements have touch targets of at least 44x44 pixels on mobile
- **SC-006**: Saved builds load in under 2 seconds
- **SC-007**: Gem catalog scrolls smoothly at 60fps on mid-range mobile devices (defined as: Snapdragon 665+ or equivalent, 4GB+ RAM, 2020+ release year; reference devices: Pixel 4a, Galaxy A52, Moto G Power)
- **SC-008**: 95% of users understand optimization results without external documentation, measured by task-based assessment: user correctly identifies (1) top priority recommendation, (2) why it's ranked first (cost vs power gain tradeoff), and (3) which resources would be consumed. Assessment via moderated user testing with 20+ participants. Success = all 3 tasks completed without external help.
- **SC-009**: All form validation errors provide clear, actionable guidance
- **SC-010**: Interface renders correctly on viewports from 320px to 1920px width

---

## Assumptions

1. **Gem Database Available**: The UI assumes a data source containing gem information (names, effects, costs, tier rankings) for approximately 50-100 gems
2. **Optimization Algorithm Exists**: The UI assumes an optimization engine is available to process inputs and return recommendations (out of scope for this spec)
3. **Anonymous Session Storage**: User sessions and builds are stored in a server-side database with anonymous identification via device fingerprinting. Users can optionally opt-in to provide email for notifications and account recovery. Battle.net account linking is a future enhancement.
4. **Image Assets**: Gem icons/visuals are available or placeholder graphics are acceptable initially
5. **Single-Language Support**: Initial implementation targets English-only; localization is future work
6. **No Offline Mode**: Application requires network connectivity for optimization calculations and session persistence

---

## Out of Scope

The following items are explicitly out of scope for this UI specification:

1. **Optimization Algorithm**: The calculation engine itself is separate from UI
2. **Battle.net Authentication**: Battle.net account linking is deferred to a later phase (anonymous sessions + opt-in email are in scope)
3. **Screenshot OCR**: Screenshot upload and gem detection is a future feature
4. **Backend APIs**: Server-side endpoints for optimization and data storage (but requirements specify what UI expects)
5. **Database Schema**: Data persistence layer design (but requirements specify expected behavior)
6. **Payment Integration**: Monetization features are future work
7. **DI Days Integration**: External event data integration
8. **Build Sharing**: Sharing builds with other users is future work
9. **Analytics Dashboard**: Historical tracking and analytics are future work
10. **Localization**: Multi-language support is future work
11. **Platinum-Equivalent Cost Display (FR-010a)**: External market data integration exceeds MVP complexity - deferred to future version
12. **Email Opt-in Feature (FR-029c)**: Email collection and verification flow deferred to future implementation (see tasks T115-T116)

---

## Clarifications

### Session 2026-02-17 (Artifact Alignment Remediation)

- Q: Should FR-010a (Platinum-Equivalent Costs) be included in MVP?
  A: **Moved to Out of Scope** - External market data integration exceeds MVP complexity. Task T036a marked as DEFERRED.

- Q: How should gems be organized in the UI?
  A: **Two-panel inventory design** - Left panel shows equipped gems (24 slots: 8 base + 16 wing), right panel shows inventory gems (unlimited slots, auto-ordered by: 5-star > 2-star > 1-star primary, Rank > Quality > Name secondary). Users can click to equip/unequip gems between panels.

- Q: What are "gem copies" in the context of rank upgrades?
  A: **Gem instances, not duplicates** - Multiple gems with the same name are different instances. For 5-star gems, any quality can be used as upgrade material. Higher quality gems can upgrade lower quality gems (e.g., R1 Q4 + R3 Q2 → R4 Q4). Renamed `copyInventory` to `inventoryGems` to reflect this.

- Q: What about acquisition paths in FR-019?
  A: **Advanced feature** - Acquisition paths (how to obtain gems: Elder Rift, market, crafting) are nice-to-have, not MVP. Tasks T069f-T069h marked as DEFERRED.

- Q: Should FR-029c (Email Opt-in) be active or deferred?
  A: **Confirmed as DEFERRED** - FR-029c marked with DEFERRED tag pointing to tasks T115-T116. Added to Out of Scope section for clarity.

- Q: Should artifact versions be synchronized?
  A: **Yes, unified to v2.0.0** - All artifacts (spec.md, tasks.md, data-model.md, plan.md) now use version 2.0.0.

### Session 2026-02-17 (Resource System Expansion)

- Q: What should the optimization scope include for resources?
  A: **Full resource model** - All resources: Gem Power, Gem Copies, Telluric Pearls, Telluric Fragments, Fading Embers, Platinum, Crest counts. Optimizer considers both crafting and upgrading paths. The interconnected mechanics (Crests → Embers/Fragments → Gems → Upgrades) should be modeled for accurate recommendations.

- Q: Should the optimizer include Crest run planning/simulation as an optimization path?
  A: **Crest as resource input only** - Users input crest counts as resources. Optimizer shows potential gem drops from crest runs, but doesn't simulate specific run schedules or slot mechanics. Full Crest simulation with slot batching and pity tracking is deferred to a future version.

- Q: Should the optimizer include Awakened slot management?
  A: **Full Awakening support** - Track awakened slots (purchased with Dawning Echoes), include 10,000 Platinum cost as optimization constraint, model resonance gains from awakening. Each awakened slot costs 1 Dawning Echo (1,000 Orbs or 10,000 Platinum). Optimizer can recommend awakening slots as part of optimization strategy when resonance gains justify the cost.

- Q: Should the optimizer track weekly caps and pity progress?
  A: **No tracking** - Don't track weekly caps or pity. Users manually enter their crest counts, optimizer shows expected outcomes without state tracking. Weekly cap and pity tracking would require persistent state across sessions, significantly increasing complexity. Users can manually adjust crest inputs based on their in-game progress.

- Q: How should the optimizer prioritize crafting vs. market buying for gems?
  A: **Cost-based comparison** - Compare platinum-equivalent costs of crafting vs. buying, recommend the cheaper path. Show both options with costs for user decision. The currencies-and-materials.csv provides exact Platinum values for all materials, enabling accurate cost comparison between crafting paths and market purchases.

### Session 2026-02-17 (Resource Calculation Mechanics)

- Q: How should the optimizer present crafting vs. upgrade recommendations when Gems can be crafted and used as fodder?
  A: **Unified crafting-upgrade path** - Show combined recommendations like "Craft 1-star gem (20 Fragments) → Use as fodder for +1 GP" as part of upgrade recommendations when Fragment resources are available. Users with spare Fragments want to know the optimal path to power gain, whether it's direct upgrade or craft-then-fodder.

- Q: Should the optimizer include Dormant 5-Star Gem Infusion recommendations?
  A: **Infusion as advanced option** - Add an "Advanced Strategies" toggle. When enabled, show infusion recommendations for dormant 5-star gems. Default off to avoid overwhelming new users. The infusion mechanic allows dormant 5-star gems in awakened slots to gain additional resonance by socketing source gems and infusing with GP. This provides an alternative to traditional extraction/upgrade paths.

- Q: What acquisition guidance should the optimizer provide when resources are insufficient?
  A: **Three-path acquisition overview** - When GP deficit exists, present three acquisition options with concise descriptions:
  1. **Farming Elder Rifts** - Earning rewards through gameplay by running Elder Rifts content
  2. **Market Purchases** - Acquiring items directly from the Market using Platinum currency
  3. **Hybrid Approach** - Combining both farming and market strategies based on availability and efficiency
     No guides, no references, no external links. Keep descriptions concise and informational only.

- Q: Should the optimizer include weekly resource projections based on typical play patterns?
  A: **Run calculator only** - Show "X runs needed to craft Y gems" without weekly projections. Let users map runs to their own play schedule. Different players have different weekly capacities; showing run requirements lets them plan according to their own situation.

- Q: Should the optimizer integrate with or reference diablo.tv's Builder tool?
  A: **No integration** - Keep spec as-is with diablo.tv mentioned in documentation only. Focus on DI-Lab's optimization features independently. Build import would add API dependency on an external service. Starting with manual gem entry keeps DI-Lab self-contained.

- Q: What is the Telluric Pearl conversion rate from Fading Embers?
  A: **5 Fading Embers = 1 Telluric Pearl** - This exchange is suboptimal compared to the player-preferred strategy of saving 320 Fading Embers for an Eternal Legendary Crest, but it remains a viable option for bridging minor resource deficits. The optimizer should show this conversion when Telluric Pearls are the bottleneck resource.

### Session 2026-02-17 (Continued)

- Q: Should the application use device fingerprinting or registration form for user identification?
  A: **LocalStorage anonymous ID with optional email opt-in**. Device fingerprinting was considered but rejected due to: (1) GDPR/ePrivacy concerns requiring explicit consent, (2) 40-60% stability over 30 days causing data loss, (3) Implementation complexity for fingerprint change handling. Registration form was rejected due to: (1) High friction causing 20-30% abandonment, (2) Similar complexity to Battle.net auth which is out of scope. The chosen approach provides zero-friction start (localStorage UUID) with optional email for account recovery and notifications.

### Session 2026-02-17

- Q: How should empty states be handled for optimizer panels (empty gem catalog, no equipped gems, no recommendations)?
  A: Add dedicated empty state for each panel with contextual messaging and guidance actions - Comprehensive empty states provide better UX guidance and reduce user confusion, especially for first-time users. Each panel should have contextual messaging and actionable guidance.

- Q: What closing behavior should the gem detail modal support?
  A: ESC key + Close button + Click outside + Focus returns to trigger (full accessibility) - Standard modal accessibility patterns require multiple closing methods for WCAG compliance and better UX. Users should have keyboard, mouse, and visual close options.

- Q: How should concurrent optimization requests be handled when user clicks rapidly or uses multiple tabs?
  A: Cancel previous request, process only the latest (cancel-and-replace pattern) - Most user-friendly pattern where users get the latest result without managing multiple pending requests or seeing stale results.

- Q: What page load performance budgets (FCP, LCP, TTI) should be targeted?
  A: FCP < 1.8s, LCP < 2.5s, TTI < 3.8s (Google "Good" thresholds) - Standard web performance targets aligned with Google's Core Web Vitals thresholds. These are achievable with Next.js and provide good UX without over-optimizing.

- Q: How should the UI handle performance degradation on slow networks or low-end devices?
  A: Skeleton loaders, delayed image loading, reduced animations on slow connections (progressive enhancement) - Ensures core functionality works on slower connections while providing enhanced experience for capable connections. This aligns with the mobile-first use case.

- Q: What positioning and behavior should toast notifications use?
  A: Top-right, vertical stack, newest at top, z-index: 50 (below modals) - Top-right positioning keeps toasts visible without blocking key action areas (bottom is typically for mobile navigation or fixed action buttons). Stacking vertically with newest on top matches common UX patterns.

- Q: What defines a "mid-range mobile device" for performance testing?
  A: Snapdragon 665+ or equivalent, 4GB+ RAM, 2020+ release year (devices: Pixel 4a, Galaxy A52, Moto G Power) - The recommended specs match real-world mid-range devices commonly used for testing. This provides clear, testable criteria without requiring the latest flagship devices.

- Q: What should happen when localStorage is unavailable (disabled, quota exceeded, private browsing)?
  A: Use server-side session identification only - Session data still persisted to database. Display one-time info message "Session saving to cloud". localStorage only stores device fingerprint for returning user recognition; session data is server-side.

- Q: Should the spec include an explicit first-time user flow narrative?
  A: Add explicit first-time user flow section with numbered steps from landing to first optimization result - An explicit flow narrative ensures all transitions and states are covered during implementation. It's low-effort to document but high-value for completeness.

- Q: Should the spec document the post-optimization modification flow?
  A: Add explicit post-optimization flow: view recommendation → apply/modify gems → re-run optimization → compare results - This is a core iterative workflow that most users will follow. Clear documentation prevents implementation gaps and ensures the "re-optimize" experience is smooth.

- Q: What storage architecture should the application use?
  A: Database with anonymous sessions (device fingerprinting) + optional opt-in email. localStorage used only for device fingerprint storage and offline fallback. Server-side database stores all session state and builds. Battle.net linking is future work (out of scope for this version). This provides persistent data across devices while maintaining low-friction anonymous usage.

### Session 2026-02-17 (Rate Limiting)

- Q: Should FR-021 include rate limiting (HTTP 429) as an error type?
  A: **Add rate-limited error type** - FR-021 now includes "rate-limited" error with retry-after guidance showing wait time. Rate limiting is a common API protection pattern and including it provides graceful degradation during high-traffic periods.

### Session 2026-02-17 (Analysis Findings Resolution)

- Q: FR-019 states "Acquisition paths...are a nice-to-have feature" but also mentions FR-052-054 as in-scope MVP requirements - is this a scope conflict?
  A: **No conflict - different features** - FR-019 "acquisition paths" (Elder Rift farming guides, market purchase strategies) are advanced/nice-to-have. FR-052-054 (resource deficit display with three-path overview) are MVP scope. Tasks T069f-h correctly marked DEFERRED for acquisition paths.

- Q: Line 148 shows inconsistent K suffix thresholds (">= 1,000" vs ">= 10,000") - which is correct?
  A: **K suffix applies >= 10,000** - The correct thresholds are: >= 1,000,000 uses M suffix, >= 10,000 uses K suffix. Numbers below 10,000 display with comma formatting only (e.g., "9,500" not "9.5K"). Tasks T007 and T035 correctly implement this threshold. The ">= 1,000 with K suffix" in line 148 was a typo; corrected to ">= 10,000 uses K suffix".

- Q: Does T033 (ResourceInput) include awakened slots panel?
  A: **No, separate tasks** - T033 creates ResourceInput for gemPower, inventoryGems, telluric materials, platinum, crestCounts, and dawningEchoes. Awakened slots panel is T069a-T069d (separate component). This separation is correct - ResourceInput handles resources, AwakenedSlotsPanel handles slot management.

- Q: Is T022 duplication of FR-006 slot configuration a problem?
  A: **No, implementation reference** - T022 creates `SLOT_CONFIG` constant derived from FR-006 thresholds. This is proper implementation practice - code should define constants that spec references. T022 should import/use FR-006 values to avoid hardcoding. Documented in task notes.

- Q: Is "inventoryGems" (code) vs "Gem Copy Inventory" (UI) terminology inconsistent?
  A: **Intentional convention** - Code uses camelCase (`inventoryGems`), UI displays Title Case ("Gem Power", "Inventory Gems"). This is documented in spec.md:509 and tasks.md:521. Consistent with project conventions.

- Q: Does FR-021 rate-limited error have implementation task coverage?
  A: **Covered by T060-T061** - Toast component (T060) and error display component (T061) handle all FR-021 error types including rate-limited. No additional task needed. HTTP 429 handling with retry-after countdown is in scope.

- Q: SC-007 defines mid-range mobile devices but no device-specific testing task exists - should one be added?
  A: **Add manual QA task** - Reference devices (Pixel 4a, Galaxy A52, Moto G Power) should be tested during Phase 10 Polish. Added as T090a for manual performance validation on reference devices.

### Session 2026-02-17 (Session Invalidation)

- Q: What should happen when the server cannot find or validate a user's session (server restart, database cleanup, corrupted session ID)?
  A: **Graceful degradation with transparent recreation** - Show "Session expired" toast notification, create new session automatically, preserve local state (gems, resources from current UI state). Users shouldn't lose work or see cryptic errors. Added FR-029d to specify this behavior.

### Session 2026-02-18 (Acceptance Criteria Measurability)

- Q: How should "95% of users understand optimization results without external documentation" (SC-008) be objectively measured?
  A: **Task-based assessment** - User must correctly: (1) identify the top priority recommendation, (2) explain why it's ranked first (cost vs power gain tradeoff), and (3) identify which resources would be consumed. Assessment conducted via moderated user testing with 20+ participants. Success = user completes all 3 tasks without external help. SC-008 updated with these criteria.

- Q: What specific UI element/behavior indicates "maximum capacity reached" in US1-Acceptance-5?
  A: **Toast notification + visual indicator** - When all slots are filled and user attempts to add another gem: (1) disabled state on remaining catalog gems with reduced opacity, (2) toast notification "All slots filled - upgrade resonance to unlock more", (3) tooltip on hover shows "No available slots". Updated US1-Acceptance-5 with these specifics.

- Q: What visual hierarchy rules should the gem catalog grid follow for card sizing, spacing, and visual prominence?
  A: **Consistent grid with star-based prominence** - Uniform card size (120x160px minimum touch target), 16px gap between cards, 5-star gems highlighted with gold border (2px), tier badges (S/A/B/C/D) with color coding (S=gold, A=silver, B=bronze, C/D=gray). Visual distinction through color and badges rather than size variations ensures consistent layout and mobile responsiveness.

- Q: What interaction states should be defined for all interactive elements (buttons, cards, form inputs)?
  A: **5-state model with measurable feedback** - All interactive elements must define: (1) hover - bg-opacity +10%, scale 1.02 transform, (2) focus - 2px ring outline in accent color, (3) active - scale 0.98 transform, (4) disabled - opacity 50%, cursor not-allowed, no pointer events, (5) loading - spinner icon + disabled state. These states ensure accessibility compliance and consistent UX across the application.

- Q: What field-level error message format should FR-011 specify for resource input validation errors?
  A: **Structured JSON with inline display** - Validation errors returned as `{ "fields": [{ "field": "gemPower", "code": "INVALID_TYPE", "message": "Must be a positive integer" }] }` with error codes: INVALID_TYPE (non-numeric), NEGATIVE_VALUE (negative number), EXCEEDS_MAX (overflow). Errors displayed inline below each field with red border and error icon for immediate user feedback.

- Q: What UI rendering specifications should be defined for each error type (validation, insufficient-resources, timeout, server-error)?
  A: **Per-error-type specifications** - (1) validation: inline field errors with icon + red border, (2) insufficient-resources: toast with 'View requirements' action linking to resource deficit panel, (3) timeout: modal with retry button and elapsed time display, (4) server-error: toast with 'Try again' button and error code for support reference. Each type has distinct visual treatment and actionable guidance.

- Q: What are the minimum/maximum resonance values and their impact on wing slot unlocking?
  A: **Threshold-based unlocking** - Resonance range: 0 (minimum, no wing slots) to calculated max from equipped gems. Thresholds: 6000 resonance = 4 wing slots unlocked, 7000 = 8 slots, 8000 = 12 slots, 8500+ = 16 slots (maximum). Total slots = 8 base + unlocked wing slots (max 24). FR-006 already documents these thresholds; edge case section updated with boundary values.

- Q: What color contrast requirements should be defined for all state variations (hover, active, disabled, error)?
  A: **WCAG AA compliant ratios** - Normal text: 4.5:1 minimum, large text (18px+ or 14px bold): 3:1 minimum, UI components: 3:1 minimum. Hover/active states must maintain these ratios. Disabled states use opacity 50% (exempt from contrast per WCAG). Error states use red (#DC2626) background with white (#FFFFFF) text for 4.8:1 contrast. FR-045 updated with specific ratios.

### Session 2026-02-14

- Q: Should we use placeholder graphics initially, or are official/representative gem icons available?  
  A: Source representative icons from community - More authentic experience, potential licensing considerations

- Q: What is the correct maximum gem slot configuration?  
  A: 8 base slots from gear + up to 16 resonance-unlocked wing slots (4 at 6000, 8 at 7000, 12 at 8000, 16 at 8500+ resonance) for a theoretical maximum of 24 total slots. Reference: docs/legendary-gems/upgrading.md#resonance-wings

- Q: How should the UI interface with the optimization algorithm?  
  A: Server-side API route (`/api/optimize`) - UI POSTs inputs, receives JSON results

- Q: What is the expected size of the gem catalog?  
  A: 50-100 gems

- Q: What WCAG accessibility compliance level should the UI target?  
  A: WCAG 2.1 AA (standard compliance for public web applications)

- Q: What defines a "duplicate" gem for FR-009?  
  A: Base 8 slots: only one gem ID allowed (duplicates ignored in calculation). Resonance wing slots: duplicate gem IDs allowed. This matches game behavior where multiple same gems can be equipped but only one activates in base slots. Note: Players can own unlimited copies of the same gem type and rank in-game; the app requires users to explicitly specify each gem in their inventory (quantity tracking). "Duplicate" in FR-009 refers to equipping restrictions, not inventory limitations—the app should allow users to record multiple copies of identical gems they own, even though only one can occupy a base slot during optimization.

- Q: What storage format should be used for session and build persistence?  
  A: Server-side database with JSON API. Session state stored in database keyed by anonymous identifier (device fingerprint). localStorage only stores device fingerprint for returning user recognition.

- Q: How is resonance determined?  
  A: Resonance is calculated automatically from equipped legendary gems; no manual input required. Legendary gems are the sole source of Resonance.

- Q: What error handling strategy should the UI implement for optimization failures?  
  A: Typed error handling - Define specific error types (validation, insufficient-resources, timeout, server-error) with tailored UI for each

- Q: What loading state pattern should the UI use for the gem catalog and optimization results?  
  A: Skeleton loaders - Gray placeholder shapes that mimic content layout, replaced when data arrives

- Q: When should input validation feedback be displayed to the user?  
  A: Debounced validation - Wait 300-500ms after user stops typing, then validate and show feedback

- Q: Should saved build names be required to be unique per user?  
  A: Unique names enforced - Prevent duplicate build names, prompt user to choose a different name

- Q: Should there be a maximum limit on the number of saved builds per user?  
  A: Tiered subscription model - Build capacity varies by subscription tier (free tier: limited, paid tiers: higher limits)

- Q: What should happen when a user has DI-Lab open in multiple browser tabs and makes conflicting build changes?  
  A: Optimistic UI with warning - Allow concurrent edits but show a non-blocking toast warning when changes are detected from another tab

- Q: What should be the default optimization mode when a user first loads the optimizer?  
  A: PVE as default - PVE content represents the majority of gameplay for most Diablo Immortal players

- Q: What timeout threshold should the UI use before offering a cancellation option during optimization?  
  A: 30 seconds - Provides sufficient time for complex calculations while giving users a reasonable bound

- Q: How should the gem catalog display the 50-100 gems for user browsing?  
  A: Tabbed category selector with full category load - Tabs for 1-star, 2-star, 5-star categories; load entire selected category at once; 5-star selected by default; infinite scroll batching not needed

- Q: What state management approach should the UI use for client-side state?  
  A: React useState/useContext - Sufficient for P1-P3 scope without over-engineering; avoids adding complexity without clear benefit

- Q: What should be the initial state when a user loads the optimizer?  
  A: Restore last session - Load previous gems/resources from server-side database for returning users, providing continuity and reducing friction

- Q: What should happen if a user navigates away from the optimizer with unsaved changes?  
  A: Show confirmation dialog - Prevent accidental data loss when user attempts to close tab or navigate away with unsaved changes

- Q: What UI control pattern should be used for quality (1-5) and rank (1-10) selection on equipped gem cards?  
  A: Dropdown select - Compact, mobile-friendly, familiar UX pattern with native accessibility support

- Q: What should be the specific build capacity limit for free tier users?  
  A: 5 builds - Provides meaningful value for free users while creating natural upgrade incentive

- Q: How frequently should session state be auto-persisted to localStorage?  
  A: On every change - Ensures users never lose data, simpler implementation without debounce edge cases

- Q: What mobile responsive breakpoint strategy should the UI use?  
  A: Tailwind defaults (sm:640px, md:768px, lg:1024px, xl:1280px, 2xl:1536px) - Industry-standard, well-tested, aligns with Tailwind CSS 4

- Q: What toast notification behavior should the UI use for multi-tab conflict warnings?  
  A: Auto-dismiss after 5 seconds with pause on hover - Users have enough time to read, can pause if needed, doesn't persist indefinitely

- Q: What API retry strategy should the UI use for transient optimization failures?  
  A: Single retry with fixed 1s delay - Resilience without over-complication (note: single retry only, not exponential backoff)

- Q: How should the gem catalog data be loaded by the UI?  
  A: Static JSON bundled at build time - Fastest load time, no API latency, works offline for viewing; updated via code deployment when game patches release

---

**Version**: 2.2.0 | **Last Updated**: 2026-02-18
