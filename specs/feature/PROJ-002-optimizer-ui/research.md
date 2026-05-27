# Research: Optimizer UI

**Branch**: `feature/PROJ-002-optimizer-ui` | **Date**: 2026-02-14

## Summary

This document captures research findings for the Optimizer UI implementation, resolving all technical unknowns and establishing best practices for key implementation decisions.

---

## Exact Package Versions

The following table lists the exact versions of key dependencies currently used in the project:

| Package              | Version        | Purpose                         |
| -------------------- | -------------- | ------------------------------- |
| next                 | ^16.1.3        | React framework with App Router |
| react                | ^19.2.3        | UI library                      |
| react-dom            | ^19.2.3        | React DOM rendering             |
| typescript           | ^5.9.3         | Type-safe JavaScript            |
| tailwindcss          | ^4.1.17        | Utility-first CSS framework     |
| @tailwindcss/postcss | ^4.1.17        | Tailwind CSS PostCSS plugin     |
| zod                  | ^4.3.6         | Schema validation               |
| lucide-react         | ^0.564.0       | Icon library                    |
| next-auth            | ^5.0.0-beta.30 | Authentication                  |
| drizzle-orm          | ^0.45.1        | Database ORM                    |
| better-sqlite3       | ^12.6.2        | SQLite database driver          |

---

## Research Topics

### 1. Gem Icon Assets

**Question**: Where to source representative gem icons from community? What licensing considerations apply?

**Decision**: Use placeholder icons initially with a plan to source community icons later.

**Rationale**:

- Project has existing gem data documentation but no icon assets
- Placeholder icons allow immediate development progress
- Community resources (diablo.tv, maxroll.gg) may have licensing restrictions
- Custom SVG placeholders provide consistent styling and are royalty-free

**Alternatives Considered**:

- Screenshot extraction from game: Not permitted (ToS violation)
- Community wiki images: Licensing unclear, may require attribution
- AI-generated icons: Inconsistent quality, potential style mismatch

**Implementation**:

- Create simple colored SVG placeholders based on star rating (gold for 5-star, silver for 2-star, bronze for 1-star)
- Add icon placeholder component that can be swapped later
- Document icon asset requirements for future sourcing

---

### 2. Resonance Calculation

**Question**: Confirm exact resonance values per gem type/quality/rank from game data.

**Decision**: Use documented resonance tables from `docs/legendary-gems/upgrading.md`.

**Findings**:

#### Resonance by Star Rating and Rank

| Rank | 1-Star Reso | 2-Star Reso | 5-Star 2/5 Reso | 5-Star 3/5 Reso | 5-Star 4/5 Reso | 5-Star 5/5 Reso |
| ---- | ----------- | ----------- | --------------- | --------------- | --------------- | --------------- |
| 1    | 15          | 30          | 30              | 60              | 90              | 100             |
| 2    | 30          | 60          | 110             | 140             | 180             | 200             |
| 3    | 45          | 90          | 190             | 230             | 270             | 300             |
| 4    | 60          | 120         | 280             | 320             | 360             | 400             |
| 5    | 75          | 150         | 370             | 410             | 450             | 500             |
| 6    | 90          | 180         | 460             | 500             | 540             | 600             |
| 7    | 105         | 210         | 550             | 590             | 630             | 700             |
| 8    | 120         | 240         | 640             | 680             | 720             | 800             |
| 9    | 135         | 270         | 730             | 770             | 810             | 900             |
| 10   | 150         | 300         | 820             | 860             | 900             | 1000            |

#### Wing Slot Thresholds (Auto-Calculated)

| Total Resonance | Unlocked Wing Slots |
| --------------- | ------------------- |
| 6000            | 4 slots             |
| 7000            | 8 slots             |
| 8000            | 12 slots            |
| 8500+           | 16 slots (max)      |

**Implementation**:

```typescript
function calculateResonance(gem: EquippedGem): number {
  // Use lookup table based on starRating, quality, and rank
  return RESONANCE_TABLE[gem.starRating][gem.quality][gem.rank];
}

function calculateUnlockedSlots(totalResonance: number): number {
  if (totalResonance >= 8500) return 16;
  if (totalResonance >= 8000) return 12;
  if (totalResonance >= 7000) return 8;
  if (totalResonance >= 6000) return 4;
  return 0;
}
```

---

### 3. Tier Rankings Source

**Question**: Where to source PVP/PVE tier rankings?

**Decision**: Use tier rankings from existing `docs/legendary-gems/tier-lists.md`.

**Findings**:

- Project already has comprehensive PVP and PVE tier lists
- Rankings are maintained by the project author
- Tier values: S, A, B, C, D

**Data Structure**:

```typescript
type TierRanking = "S" | "A" | "B" | "C" | "D";

interface GemTierInfo {
  gemId: string;
  pvpTier: TierRanking;
  pveTier: TierRanking;
}
```

**Implementation**:

- Extract tier rankings from documentation into JSON data file
- Include tier data in static gem database (`src/data/gems.json`)
- Display tier badges on gem cards and detail views

---

### 4. Mobile Touch Patterns for Dropdowns

**Question**: Best practices for dropdown selects on mobile in React 19.

**Decision**: Use native HTML `<select>` elements with Tailwind styling.

**Rationale**:

- Native selects provide best mobile UX (native picker on iOS/Android)
- Full keyboard accessibility built-in
- No additional JavaScript library needed
- React 19 has excellent native select support

**Alternatives Considered**:

- Custom dropdown component: More control but requires complex mobile handling
- Radix UI Select: Better styling but heavier bundle, custom mobile behavior
- Headless UI Listbox: Good accessibility but native is still better for mobile

**Implementation**:

```tsx
// Quality selector (1-5)
<select
  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3"
  value={quality}
  onChange={(e) => onQualityChange(Number(e.target.value))}
>
  {[1, 2, 3, 4, 5].map(q => (
    <option key={q} value={q}>{q}/5</option>
  ))}
</select>

// Rank selector (1-10)
<select
  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3"
  value={rank}
  onChange={(e) => onRankChange(Number(e.target.value))}
>
  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => (
    <option key={r} value={r}>Rank {r}</option>
  ))}
</select>
```

---

### 5. localStorage Schema for Build Persistence

**Question**: Optimal structure for build persistence with versioning support.

**Decision**: JSON structure with version field and array of build objects.

**Schema** (CORRECTED - see T-02 findings):

```typescript
interface StoredBuild {
  id: string; // UUID for unique identification
  name: string; // User-provided build name
  gems: EquippedGem[]; // Array of equipped gems
  resources: {
    gemPower: number; // Primary upgrade currency
  };
  copyInventory: {
    [gemId: string]: number; // Gem copies available per gem type
  };
  optimizationMode: "PVP" | "PVE";
  notes?: string; // Optional user notes
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

interface LocalStorageSchema {
  version: 2; // Bumped for resource model correction
  builds: StoredBuild[];
  currentSession?: {
    // Auto-saved current work
    gems: EquippedGem[];
    resources: { gemPower: number };
    copyInventory: { [gemId: string]: number };
    optimizationMode: "PVP" | "PVE";
    updatedAt: string;
  };
}
```

**localStorage Key**: `di-lab-v2`

**Implementation**:

```typescript
const STORAGE_KEY = "di-lab-v2";

function loadFromStorage(): LocalStorageSchema {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return { version: 2, builds: [] };
  const parsed = JSON.parse(data);

  // Migration from v1 if needed
  if (parsed.version === 1) {
    return migrateFromV1(parsed);
  }

  return parsed;
}

function saveToStorage(data: LocalStorageSchema): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function autoSaveSession(session: CurrentSession): void {
  const data = loadFromStorage();
  data.currentSession = { ...session, updatedAt: new Date().toISOString() };
  saveToStorage(data);
}

// Migration helper for v1 → v2
function migrateFromV1(old: V1Schema): LocalStorageSchema {
  return {
    version: 2,
    builds: old.builds.map((build) => ({
      ...build,
      resources: { gemPower: 0 }, // Reset resources
      copyInventory: {}, // Empty copy inventory
    })),
  };
}
```

> **Note**: Schema version bumped to v2 due to resource model correction. See T-02 findings for details.

---

### 6. Error Handling Types for Optimization API

**Question**: Define specific error response structure for typed error handling.

**Decision**: Use discriminated union error types with actionable guidance.

**Error Types**:

```typescript
type OptimizationErrorType =
  | "validation"
  | "insufficient-resources"
  | "timeout"
  | "server-error";

interface OptimizationError {
  type: OptimizationErrorType;
  title: string;
  message: string;
  guidance: string; // Actionable next step for user
  details?: Record<string, unknown>;
}

// Example error responses
const errorExamples = {
  validation: {
    type: "validation",
    title: "Invalid Input",
    message: "Your gem configuration has validation errors.",
    guidance:
      "Check your gem configuration and ensure all gems have valid quality and rank values.",
    details: { invalidGems: ["gem-id-1"] },
  },
  "insufficient-resources": {
    type: "insufficient-resources",
    title: "Insufficient Resources",
    message: "Your current resources cannot fund any upgrades.",
    guidance:
      "Add more platinum or Telluric Pearls to enable upgrade recommendations.",
    details: { required: { platinum: 1000 }, available: { platinum: 500 } },
  },
  timeout: {
    type: "timeout",
    title: "Optimization Timeout",
    message: "The optimization calculation exceeded the time limit.",
    guidance:
      "Try reducing the number of gems or simplifying your configuration.",
  },
  "server-error": {
    type: "server-error",
    title: "Server Error",
    message: "An unexpected error occurred during optimization.",
    guidance: "Please try again. If the problem persists, contact support.",
  },
};
```

---

## Technology Best Practices

### React 19 + Next.js 16 Patterns

**Server Components by Default**:

- Use Server Components for data fetching (gem catalog from JSON)
- Use Client Components only for interactive elements (selectors, buttons)

**State Management**:

- `useState` for local component state
- `useContext` for shared state (optimization mode, user preferences)
- localStorage for persistence (builds, session state)

**Performance**:

- Bundle gem data statically (no API calls for catalog)
- Debounce input validation (300-500ms)
- Use skeleton loaders for perceived performance

### Tailwind CSS 4 Patterns

**Touch Targets**:

```html
<!-- Minimum 44x44px touch target -->
<button class="min-h-11 min-w-11 px-4 py-2"></button>
```

**Responsive Grid**:

```html
<div
  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
></div>
```

**Skeleton Loaders**:

```html
<div class="animate-pulse bg-gray-200 rounded-md h-24 w-full"></div>
```

### Accessibility (WCAG 2.1 AA)

**Required Patterns**:

- All interactive elements have visible focus indicators
- Form inputs have associated labels
- Error messages linked to inputs via `aria-describedby`
- Color contrast minimum 4.5:1 for text
- Skip links for main content

---

## Resolved Technical Context

All NEEDS CLARIFICATION items from the plan have been resolved:

| Item                  | Resolution                                 |
| --------------------- | ------------------------------------------ |
| Gem Icons             | SVG placeholders, community sourcing later |
| Resonance Calculation | Tables from upgrading.md                   |
| Tier Rankings         | From tier-lists.md                         |
| Mobile Dropdowns      | Native `<select>` elements                 |
| localStorage Schema   | Versioned JSON structure                   |
| Error Types           | Discriminated union with guidance          |

---

## Resolved Research Items

The following research items have been resolved through dedicated research subtasks:

### T-01: CR Calculation Tables - RESOLVED

**Status**: ✅ Data already exists in project documentation

**Source Locations**:

- [`docs/legendary-gems/upgrading.md`](docs/legendary-gems/upgrading.md:145-162) - CR formulas and tables
- [`docs/legendary-gems.csv`](docs/legendary-gems.csv:593-604) - Raw data export

**Findings**:

#### Combat Rating (CR) by Star Rating and Rank

| Rank | 1-Star CR | 2-Star CR | 5-Star 2/5 CR | 5-Star 3/5 CR | 5-Star 4/5 CR | 5-Star 5/5 CR |
| ---- | --------- | --------- | ------------- | ------------- | ------------- | ------------- |
| 1    | 8         | 12        | 12            | 16            | 20            | 24            |
| 2    | 12        | 18        | 24            | 32            | 40            | 48            |
| 3    | 16        | 24        | 36            | 48            | 60            | 72            |
| 4    | 20        | 30        | 48            | 64            | 80            | 96            |
| 5    | 24        | 36        | 60            | 80            | 100           | 120           |
| 6    | 28        | 42        | 72            | 96            | 120           | 144           |
| 7    | 32        | 48        | 84            | 112           | 140           | 168           |
| 8    | 36        | 54        | 96            | 128           | 160           | 192           |
| 9    | 40        | 60        | 108           | 144           | 180           | 216           |
| 10   | 44        | 66        | 120           | 160           | 200           | 240           |

#### CR Formulas

```typescript
// 1-Star gems: CR = 4 + (rank × 4)
function calculate1StarCR(rank: number): number {
  return 4 + rank * 4; // R1=8, R10=44
}

// 2-Star gems: CR = 6 + (rank × 6)
function calculate2StarCR(rank: number): number {
  return 6 + rank * 6; // R1=12, R10=66
}

// 5-Star gems: Quality-dependent lookup table
function calculate5StarCR(rank: number, quality: Quality): number {
  return FIVE_STAR_CR_TABLE[quality][rank]; // R1: 12-24, R10: 120-240
}
```

**Implementation Guidance**:

- Create `src/lib/calculations/cr.ts` with lookup tables and formulas
- Export `calculateCR(gem: EquippedGem): number` function
- Unit tests to verify all values match documentation

---

### T-02: Gem Power Conversion - CRITICAL FINDING

**Status**: 🚨 Data model correction required

**Issue**: The original data model incorrectly assumed Platinum and Telluric Pearls are used for gem upgrades. **This is incorrect.**

**Correct Resources**:

- **Gem Power**: Primary upgrade currency
- **Gem Copies**: Required for rank upgrades (duplicates of the same gem)

**Correction Required**:

The localStorage schema in Section 5 must be updated:

```typescript
// CORRECTED RESOURCE MODEL
interface GemResources {
  gemPower: number; // Primary upgrade currency
  // Gem copies are tracked per gem, not as global resources
}

// Per-gem copy tracking
interface GemCopyInventory {
  [gemId: string]: number; // Number of copies available per gem
}
```

**Upgrade Cost Tables** (from `docs/legendary-gems/upgrading.md`):

| Rank → Rank+1 | 1-Star GP | 2-Star GP | 5-Star GP |
| ------------- | --------- | --------- | --------- |
| 1 → 2         | 15        | 30        | 60        |
| 2 → 3         | 30        | 60        | 120       |
| 3 → 4         | 45        | 90        | 180       |
| 4 → 5         | 60        | 120       | 240       |
| 5 → 6         | 75        | 150       | 300       |
| 6 → 7         | 90        | 180       | 360       |
| 7 → 8         | 105       | 210       | 420       |
| 8 → 9         | 120       | 240       | 480       |
| 9 → 10        | 135       | 270       | 540       |

**Gem Copy Requirements**:

- All upgrades require 1 gem copy (duplicate) regardless of star rating
- Exception: Some rank thresholds may require additional copies (verify in-game)

**Implementation Guidance**:

1. Update `data-model.md` to remove platinum/telluricPearls
2. Add `gemPower: number` to resources
3. Add per-gem copy tracking to user inventory
4. Create `src/lib/calculations/upgrade-costs.ts` with cost lookup tables

---

### T-03: Optimization Algorithm - RESOLVED

**Status**: ✅ Algorithm designed and documented

**Approach**: Weighted Greedy Algorithm with O(n log n) complexity

**Algorithm Overview**:

```typescript
interface OptimizationInput {
  gems: EquippedGem[];
  resources: GemResources;
  copyInventory: GemCopyInventory;
  mode: "PVP" | "PVE";
}

interface OptimizationResult {
  recommendations: UpgradeRecommendation[];
  expectedPowerGain: number;
  resourceUsage: GemResources;
}

interface UpgradeRecommendation {
  gemId: string;
  currentRank: number;
  targetRank: number;
  cost: { gemPower: number; copies: number };
  powerGain: number;
  priority: number; // Higher = better ROI
}
```

**Power Calculation Formula**:

```typescript
function calculatePower(gem: EquippedGem, mode: "PVP" | "PVE"): number {
  const resonance = calculateResonance(gem);
  const cr = calculateCR(gem);
  const tier = getTierRanking(gem.gemId, mode);

  // Base power from stats
  const basePower = resonance * 1.0 + cr * 2.0;

  // Tier multiplier
  const tierMultiplier = TIER_WEIGHTS[tier]; // S=1.5, A=1.3, B=1.1, C=0.9, D=0.7

  // Threshold bonus (wing slots unlocked)
  const thresholdBonus = calculateThresholdBonus(gem);

  // Diminishing returns for high ranks
  const diminishingFactor = Math.max(0.5, 1 - (gem.rank - 1) * 0.05);

  return basePower * tierMultiplier * thresholdBonus * diminishingFactor;
}
```

**Tier Weights**:

| Tier | Weight |
| ---- | ------ |
| S    | 1.5    |
| A    | 1.3    |
| B    | 1.1    |
| C    | 0.9    |
| D    | 0.7    |

**Algorithm Steps**:

1. **Calculate Current Power**: For each equipped gem
2. **Identify Upgrade Candidates**: Gems that can be upgraded with available resources
3. **Calculate ROI**: Power gain per resource cost for each candidate
4. **Sort by ROI**: Descending order
5. **Greedy Selection**: Pick highest ROI upgrade, deduct resources, repeat
6. **Return Recommendations**: Sorted list with expected power gains

**Complexity Analysis**:

- Time: O(n log n) for sorting n candidates
- Space: O(n) for candidate list
- Suitable for real-time calculation (< 100ms for typical inputs)

**File Structure**:

```
src/lib/optimization/
├── engine.ts      # Main optimization entry point
├── scoring.ts     # Power calculation functions
├── resources.ts   # Resource management utilities
└── types.ts       # Shared type definitions
```

**Implementation Guidance**:

1. Implement scoring functions first (unit test thoroughly)
2. Build resource checking utilities
3. Implement greedy algorithm with sorted candidates
4. Add edge case handling (no upgrades possible, max rank gems)

---

### B-01: Testing Framework - RESOLVED

**Status**: ✅ Recommendation complete

**Recommended Stack**:

- **Unit/Integration**: Vitest + React Testing Library
- **End-to-End**: Playwright

**Rationale**:

- Vitest: Native Bun compatibility, fast execution, Jest-compatible API
- React Testing Library: Industry standard for React component testing
- Playwright: Cross-browser E2E testing, excellent debugging tools

**Setup Configuration**:

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["node_modules/", "tests/"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

```json
// package.json scripts
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test"
}
```

**Test File Structure**:

```
src/
├── lib/
│   ├── calculations/
│   │   ├── cr.ts
│   │   ├── cr.test.ts       # Co-located unit tests
│   │   ├── resonance.ts
│   │   └── resonance.test.ts
│   └── optimization/
│       ├── engine.ts
│       └── engine.test.ts
├── components/
│   └── gems/
│       ├── GemSelector.tsx
│       └── GemSelector.test.tsx
tests/
├── setup.ts                  # Testing library setup
├── fixtures/                 # Test data
└── e2e/                      # Playwright E2E tests
    └── optimize.spec.ts
```

**Dependencies to Add**:

```bash
bun add -d vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
bun add -d @playwright/test
```

**Implementation Guidance**:

1. Create `vitest.config.ts` at project root
2. Add test scripts to `package.json`
3. Create `tests/setup.ts` with testing library configuration
4. Start with unit tests for calculation functions (CR, resonance)
5. Add component tests for UI elements
6. Add E2E tests for critical user flows

---

## Data Model Corrections

### Resource Types Correction

**Original (Incorrect)**:

```typescript
interface Resources {
  platinum: number;
  telluricPearls: number;
}
```

**Corrected**:

```typescript
interface Resources {
  gemPower: number;
}

interface GemCopyInventory {
  [gemId: string]: number;
}
```

**Impact**:

- Update localStorage schema (Section 5)
- Update API contracts (`contracts/optimize-api.schema.json`)
- Update data model (`data-model.md`)
- Update all UI components that reference old resources

---

### T-04: Anonymous Session Strategy - Device Fingerprinting vs Registration Form

**Status**: 🔍 Research Required

**Question**: Should the application use device fingerprinting for anonymous identification or implement a registration form for user authentication? Battle.net Auth and account linking is out of this iteration scope.

**Context**:

- FR-029 specifies device fingerprinting for anonymous session identification
- FR-029c adds opt-in email collection for notifications
- Battle.net OAuth is explicitly out of scope for this iteration
- Users need to save builds and restore sessions across visits

#### Option A: Device Fingerprinting (Current Spec)

**How It Works**:

```typescript
// Generate fingerprint from browser characteristics
async function generateFingerprint(): Promise<string> {
  const components = await FingerprintJS.load();
  const result = await components.get();
  return result.visitorId; // e.g., "a1b2c3d4e5f6g7h8"
}

// Store in localStorage for returning user recognition
function storeFingerprint(fingerprint: string): void {
  localStorage.setItem("di-lab-device-id", fingerprint);
}

// Session data linked to fingerprint in database
interface AnonymousSession {
  sessionId: string; // UUID
  deviceFingerprint: string; // From FingerprintJS
  email?: string; // Optional opt-in
  sessionState: SessionState;
  createdAt: Date;
  lastActive: Date;
}
```

**Pros**:

- ✅ **Zero friction**: No user action required to start using the app
- ✅ **Instant session**: Immediate access to all features
- ✅ **No password management**: No reset flows, no forgotten passwords
- ✅ **Lower barrier to entry**: Users can try the app without commitment
- ✅ **Privacy-friendly**: No PII required for basic usage
- ✅ **Spec aligned**: Current FR-029 already specifies this approach

**Cons**:

- ❌ **Fingerprint instability**: Browser updates, setting changes can change fingerprint
- ❌ **Data loss risk**: User clears localStorage → loses session recognition
- ❌ **Cross-device limitation**: Can't access same data on phone + desktop
- ❌ **Privacy concerns**: Some users block fingerprinting scripts
- ❌ **GDPR/ePrivacy**: May require consent for fingerprinting in EU
- ❌ **No account recovery**: If fingerprint lost, data is inaccessible

**Reliability Analysis**:

- FingerprintJS reports 40-60% stability over 30 days
- Major changes: Browser updates (20%), clearing storage (15%), private browsing (10%)
- Fallback needed: When fingerprint changes, show "Welcome back?" prompt with merge option

**Implementation Complexity**: Medium

- FingerprintJS library (~15KB gzipped)
- Server-side session management
- Fingerprint change detection and migration logic

#### Option B: Registration Form (Email + Password)

**How It Works**:

```typescript
// Traditional registration flow
interface RegisteredUser {
  userId: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  builds: SavedBuild[];
  sessionState: SessionState;
  createdAt: Date;
  lastActive: Date;
}

// Registration form required before saving
async function register(email: string, password: string): Promise<User> {
  // Validate email format
  // Check for duplicates
  // Hash password with bcrypt
  // Send verification email
  // Create user record
}
```

**Pros**:

- ✅ **Stable identification**: Email is reliable long-term identifier
- ✅ **Account recovery**: Password reset flow available
- ✅ **Cross-device access**: Same account works on any device
- ✅ **Email communication**: Can send notifications, updates
- ✅ **User trust**: Familiar pattern, users understand it
- ✅ **No privacy concerns**: No fingerprinting, clear data ownership

**Cons**:

- ❌ **High friction**: Users must register before saving builds
- ❌ **Password management**: Reset flows, forgotten passwords, security concerns
- ❌ **Email verification**: Additional step before full access
- ❌ **Higher abandonment**: Registration forms cause 20-30% drop-off
- ❌ **Implementation overhead**: Auth flows, email service, security
- ❌ **Out of scope complexity**: Battle.net auth deferred, but registration adds similar complexity

**Implementation Complexity**: High

- Password hashing (bcrypt/argon2)
- Email service (Resend/SendGrid)
- Verification token flow
- Password reset flow
- Session management with next-auth

#### Option C: Hybrid Approach (Recommended)

**How It Works**:

```typescript
// Tiered identification strategy
interface UserSession {
  // Tier 1: Anonymous (always available)
  anonymousId: string; // Random UUID in localStorage

  // Tier 2: Device Fingerprint (optional enhancement)
  deviceFingerprint?: string; // For returning user recognition

  // Tier 3: Email Opt-in (optional, FR-029c)
  email?: string; // For notifications/recovery
  emailVerified?: boolean;

  // Tier 4: Battle.net (future, out of scope)
  battlenetId?: string;
}

// Progressive enhancement
function identifyUser(): UserSession {
  // 1. Check localStorage for existing anonymous ID
  let anonymousId = localStorage.getItem("di-lab-anon-id");

  // 2. If not found, create new
  if (!anonymousId) {
    anonymousId = crypto.randomUUID();
    localStorage.setItem("di-lab-anon-id", anonymousId);
  }

  // 3. Optionally enhance with fingerprint (with consent)
  const fingerprint = await checkFingerprintConsent();

  // 4. Check for opt-in email
  const email = await getStoredEmail();

  return { anonymousId, deviceFingerprint: fingerprint, email };
}
```

**Pros**:

- ✅ **Zero friction start**: Anonymous ID works immediately
- ✅ **Progressive enhancement**: Users can add email later
- ✅ **Data recovery option**: Email enables cross-device access
- ✅ **Privacy-first**: Fingerprinting only with consent
- ✅ **Best of both worlds**: Low barrier + recovery option
- ✅ **GDPR compliant**: No fingerprinting without consent

**Cons**:

- ⚠️ **More complex logic**: Multiple identification tiers
- ⚠️ **Migration complexity**: Need to handle tier upgrades
- ⚠️ **Still no password auth**: Email is opt-in only

**Implementation Complexity**: Medium-High

- Anonymous ID generation and storage
- Optional fingerprinting with consent
- Email opt-in flow (simpler than full registration)
- Session merge logic

#### Recommendation: Hybrid Approach (Modified Option A)

**Decision**: Use **localStorage-based anonymous ID** as primary identification, with **optional email opt-in** for recovery/notifications. **Defer fingerprinting** to avoid privacy/GDPR concerns.

**Rationale**:

1. **Simplicity**: localStorage anonymous ID is simpler than fingerprinting
2. **Privacy**: No fingerprinting = no GDPR consent required
3. **Friction**: Zero friction to start, optional email for committed users
4. **Recovery**: Email opt-in provides account recovery path
5. **Spec alignment**: Still satisfies FR-029 goals with lower complexity

**Implementation**:

```typescript
// src/lib/session/anonymous-session.ts

const ANONYMOUS_ID_KEY = "di-lab-anon-id";

export function getOrCreateAnonymousId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(ANONYMOUS_ID_KEY);

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANONYMOUS_ID_KEY, id);
  }

  return id;
}

export interface AnonymousSession {
  anonymousId: string;
  email?: string;
  emailVerified?: boolean;
  builds: SavedBuild[];
  sessionState: SessionState;
  createdAt: Date;
  lastActive: Date;
}

// Server-side API to get/create session
export async function getOrCreateSession(
  anonymousId: string,
): Promise<AnonymousSession> {
  const response = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ anonymousId }),
  });
  return response.json();
}

// Email opt-in (FR-029c)
export async function addEmailToSession(email: string): Promise<void> {
  const anonymousId = getOrCreateAnonymousId();

  // Validate email format
  // Send verification email
  // Store pending email in session

  await fetch("/api/session/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ anonymousId, email }),
  });
}
```

**Database Schema**:

```typescript
// drizzle schema
export const anonymousSessions = sqliteTable("anonymous_sessions", {
  anonymousId: text("anonymous_id").primaryKey(),
  email: text("email"),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),
  sessionState: text("session_state", { mode: "json" }).$type<SessionState>(),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  lastActive: integer("last_active", { mode: "timestamp" }).defaultNow(),
});

export const savedBuilds = sqliteTable("saved_builds", {
  id: text("id").primaryKey(),
  anonymousId: text("anonymous_id").references(
    () => anonymousSessions.anonymousId,
  ),
  name: text("name").notNull(),
  gems: text("gems", { mode: "json" }).$type<EquippedGem[]>(),
  resources: text("resources", { mode: "json" }).$type<Resources>(),
  optimizationMode: text("optimization_mode", { mode: "json" }).$type<
    "PVP" | "PVE"
  >(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).defaultNow(),
});
```

**Edge Case Handling**:

| Scenario                   | Solution                                                                        |
| -------------------------- | ------------------------------------------------------------------------------- |
| User clears localStorage   | Generate new anonymous ID, prompt "Returning user?" with email input to recover |
| User uses multiple devices | Add email to link sessions across devices                                       |
| localStorage unavailable   | Use server-side session ID (cookie-based)                                       |
| Email already registered   | Prompt "Already have an account?" with merge option                             |
| Private browsing           | Session works but not persisted; show one-time notice                           |

**Comparison Summary**:

| Criterion        | Fingerprinting   | Registration | Hybrid (Recommended)           |
| ---------------- | ---------------- | ------------ | ------------------------------ |
| Friction         | None             | High         | None (start), Optional (email) |
| Stability        | 40-60% / 30 days | High         | High (with email)              |
| Cross-device     | No               | Yes          | Yes (with email)               |
| Privacy          | Concerns         | None         | None                           |
| GDPR Compliant   | Requires consent | Yes          | Yes                            |
| Implementation   | Medium           | High         | Medium                         |
| Account Recovery | No               | Yes          | Yes (with email)               |

**Spec Updates Required**:

Update FR-029 to reflect simplified approach:

> **FR-029 (Revised)**: System MUST provide anonymous session identification via localStorage-based anonymous ID:
>
> - Generate unique identifier (UUID) on first visit
> - Store identifier in localStorage for returning user recognition
> - Link session data to anonymous identifier in database
> - Handle localStorage unavailability gracefully (server-side session)
>
> **FR-029c (Unchanged)**: System MUST provide opt-in email collection for notifications and account recovery.

---

## Next Steps

Proceed to Phase 1:

1. ~~Generate `data-model.md` with entity definitions~~ ✅ Complete (needs resource correction)
2. ~~Generate `contracts/` with API schemas~~ ✅ Complete (needs resource correction)
3. ~~Generate `quickstart.md` with implementation guide~~ ✅ Complete

**Immediate Actions Required**:

1. Update `data-model.md` with corrected resource types (gemPower + copies)
2. Update `contracts/optimize-api.schema.json` with corrected resource schema
3. ~~Implement calculation functions (`src/lib/calculations/`)~~ ✅ Complete
4. ~~Implement optimization engine (`src/lib/optimization/`)~~ ✅ Complete
5. Add testing framework configuration
6. **NEW**: Update FR-029 to use localStorage anonymous ID (not fingerprinting)
7. **NEW**: Implement anonymous session management
