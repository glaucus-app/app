# Testing Strategy — Glaucus App

> **Date:** 2026-06-05
> **Project:** Diablo Immortal Gem Optimizer (Glaucus)
> **Purpose:** Comprehensive testing strategy, TDD guidance, and quality gates for the Glaucus application

---

## Table of Contents

1. [Testing Pyramid](#1-testing-pyramid)
2. [TDD for Domain Layer](#2-tdd-for-domain-layer)
3. [Test Infrastructure](#3-test-infrastructure)
4. [Coverage Targets](#4-coverage-targets)
5. [E2E Test Scenarios](#5-e2e-test-scenarios)
6. [CI Integration](#6-ci-integration)
7. [Test Organization](#7-test-organization)
8. [Code Examples](#8-code-examples)

---

## 1. Testing Pyramid

```
         ┌───────────┐
         │    E2E    │  ~5% — Critical user journeys
         ├───────────┤
         │Integration│ ~15% — API routes, data flows, repository ops
         ├───────────┤
         │ Component │ ~20% — UI rendering, interaction, accessibility
         ├───────────┤
    ┌────┤   Unit    │ ~60% — Domain logic, utilities, validation schemas
    │    └───────────┘
    │
    └── Total coverage target: 80%+
```

| Layer                  | What                                                                                                | Framework                | Location                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------- |
| **Unit** (~60%)        | Domain services, scoring, resonance, resource calculations, validation schemas, utilities           | Vitest                   | `features/<feature>/__tests__/*.test.ts`                                                    |
| **Component** (~20%)   | UI primitives, feature components, forms, interaction states                                        | Vitest + Testing Library | `features/<feature>/__tests__/components/*.test.tsx`, `shared/ui/__tests__/*.test.tsx`      |
| **Integration** (~15%) | API routes, database queries, session management, cross-feature flows                               | Vitest + test DB         | `src/__tests__/integration/*.test.ts`, `features/<feature>/__tests__/*.integration.test.ts` |
| **E2E** (~5%)          | Full optimization flow, save/load builds, session persistence, mobile responsiveness, accessibility | Playwright               | `e2e/*.spec.ts`                                                                             |

### Why This Distribution

- **Unit tests are the foundation**: The optimization engine, scoring, and resonance calculations are pure functions — fast to test, high ROI for coverage.
- **Component tests verify behavior**: Testing Library encourages accessibility-first testing with role-based queries.
- **Integration tests verify contracts**: API routes must respond correctly to valid and invalid inputs.
- **E2E tests verify journeys**: Only the critical paths — not every edge case.

---

## 2. TDD for Domain Layer

The domain layer (`src/features/`) contains the core business logic. It must be framework-agnostic, testable in isolation, and developed test-first.

### 2.1 Red-Green-Refactor Workflow

Every domain function follows this cycle:

```
1. RED   — Write a failing test that describes the expected behavior
2. GREEN — Write the minimum code to make the test pass
3. REFACTOR — Clean up the code while keeping tests green
```

#### Example: Adding a New Resonance Calculation

```
Step 1 (RED): Write the test first
  → test: calculateResonanceBonus returns 0 for no matching gems
  → Run test: FAIL (function doesn't exist)

Step 2 (GREEN): Write minimum implementation
  → export function calculateResonanceBonus(gems) { return 0; }
  → Run test: PASS

Step 3 (GREEN): Add more cases
  → test: returns bonus for 2 matching gems
  → Run test: FAIL
  → Implement: check gem categories, return bonus
  → Run test: PASS

Step 4 (REFACTOR): Clean up
  → Extract threshold logic into helper
  → Add type annotations
  → Run all tests: PASS
```

### 2.2 TDD Rules for Domain Functions

1. **Never write production code without a failing test first**
2. **Tests must be deterministic** — no random data, no timing dependencies
3. **Test behavior, not implementation** — assert on outputs, not internal state
4. **One assertion concept per test** — each test verifies one thing
5. **Test names describe the scenario** — `should return zero bonus when no gems share a category`

### 2.3 What to TDD

| Module             | What to Test                                                                  | Priority |
| ------------------ | ----------------------------------------------------------------------------- | -------- |
| `engine.ts`        | Optimization algorithm correctness, tier prioritization, resource constraints | CRITICAL |
| `scoring.ts`       | Power calculations, ROI scoring, threshold bonuses                            | CRITICAL |
| `resonance.ts`     | Resonance thresholds, wing slot unlocks, category matching                    | CRITICAL |
| `resources.ts`     | Budget checks, affordability, copy inventory management                       | HIGH     |
| `schemas.ts` (Zod) | Valid/invalid inputs, error messages, edge cases                              | HIGH     |
| `repository.ts`    | CRUD operations, ownership checks, limit enforcement                          | HIGH     |
| `use-cases/`       | Orchestration logic, error handling, boundary conditions                      | MEDIUM   |

### 2.4 Property-Based Testing for Engine Invariants

The optimization engine has mathematical properties that should hold for **all** inputs, not just hand-picked test cases. Use `fast-check` to verify these invariants.

#### Engine Invariants to Test

| Invariant                | Description                                       |
| ------------------------ | ------------------------------------------------- |
| **Budget constraint**    | Total cost never exceeds available resources      |
| **Single assignment**    | Never assigns more than one gem upgrade per slot  |
| **Monotonicity**         | More resources → power score never decreases      |
| **Determinism**          | Identical inputs always produce identical outputs |
| **Non-negative results** | Power gain is never negative                      |
| **Max rank respected**   | Never recommends upgrading past rank 10           |

#### Why Property-Based Testing Matters

Example tests catch specific scenarios. Property tests catch **classes of bugs**. A greedy algorithm might work for your hand-crafted test cases but fail on edge cases with unusual resource distributions. Property tests generate hundreds of random inputs to find those edges automatically.

---

## 3. Test Infrastructure

### 3.1 Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      thresholds: {
        global: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
      include: ["src/"],
      exclude: [
        "src/**/*.d.ts",
        "src/test/**",
        "src/**/*.stories.tsx",
        "src/app/layout.tsx",
      ],
    },
  },
});
```

### 3.2 Testing Library Setup

```typescript
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";

// Mock next/navigation for components that use useRouter, usePathname
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image to render a plain img
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { src, alt, ...rest } = props as { src: string; alt: string };
    // biome-ignore lint/style/noUnusedTemplateLiteral: JSX requirement
    return `<img src="${src}" alt="${alt}" ${Object.entries(rest)
      .map(([k, v]) => `${k}="${v}"`)
      .join(" ")} />`;
  },
}));
```

### 3.3 Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  webServer: {
    command: "bun run build && bun run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

### 3.4 Test Fixtures

#### Gem Data Fixtures

```typescript
// src/test/fixtures/gems.ts
import type { LegendaryGem, EquippedGem } from "@/shared/types";

export const testGems: Map<string, LegendaryGem> = new Map([
  [
    "blood-soaked-jade",
    {
      id: "blood-soaked-jade",
      name: "Blood-Soaked Jade",
      starRating: 5,
      pvpTier: "S",
      pveTier: "S",
      resonanceTable: { 1: 100, 2: 200, 5: 500, 10: 1000 },
      crTable: { 1: 50, 5: 250, 10: 500 },
    },
  ],
  [
    "fervid-flashwing",
    {
      id: "fervid-flashwing",
      name: "Fervid Flashwing",
      starRating: 5,
      pvpTier: "A",
      pveTier: "A",
      resonanceTable: { 1: 80, 2: 160, 5: 400, 10: 800 },
      crTable: { 1: 40, 5: 200, 10: 400 },
    },
  ],
]);

export const createTestGem = (
  overrides: Partial<LegendaryGem>,
): LegendaryGem => ({
  id: "test-gem",
  name: "Test Gem",
  starRating: 2,
  pvpTier: "B",
  pveTier: "B",
  resonanceTable: {},
  crTable: {},
  ...overrides,
});

export const createEquippedGem = (
  gemId: string,
  slot: number,
  rank: number = 1,
  quality: number = 1,
): EquippedGem => ({
  gemId,
  slot,
  currentRank: rank,
  quality,
});
```

#### Build Fixtures

```typescript
// src/test/fixtures/builds.ts
import type { SavedBuild, SessionState } from "@/shared/types";

export const createTestBuild = (
  overrides: Partial<SavedBuild> = {},
): SavedBuild => ({
  id: crypto.randomUUID(),
  anonymousId: "test-session-uuid",
  name: "Test Build",
  notes: "",
  equippedGems: [],
  resources: { gemPower: 1000, copies: {} },
  awakenedSlots: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

export const createTestSession = (
  overrides: Partial<SessionState> = {},
): SessionState => ({
  anonymousId: "test-session-uuid",
  equippedGems: [],
  resources: { gemPower: 500, copies: {} },
  awakenedSlots: 0,
  optimizationMode: "PVE",
  ...overrides,
});
```

### 3.5 Database Testing Strategy

Each integration test gets its own isolated in-memory SQLite database.

```typescript
// src/test/fixtures/database.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@/data-access/schema";

/**
 * Creates a fresh in-memory SQLite database for testing.
 * Call this in beforeEach to ensure test isolation.
 */
export function createTestDb() {
  const sqlite = new Database(":memory:");

  // Create schema from scratch
  sqlite.exec(`
    CREATE TABLE anonymousSessions (
      anonymousId TEXT PRIMARY KEY,
      email TEXT,
      emailVerified INTEGER DEFAULT 0,
      sessionState TEXT,
      createdAt INTEGER,
      lastActive INTEGER
    );

    CREATE TABLE savedBuilds (
      id TEXT PRIMARY KEY,
      anonymousId TEXT NOT NULL,
      name TEXT NOT NULL,
      notes TEXT,
      equippedGems TEXT,
      resources TEXT,
      awakenedSlots INTEGER DEFAULT 0,
      createdAt INTEGER,
      updatedAt INTEGER,
      FOREIGN KEY (anonymousId) REFERENCES anonymousSessions(anonymousId) ON DELETE CASCADE
    );

    CREATE INDEX idx_builds_session ON savedBuilds(anonymousId);
    CREATE INDEX idx_builds_created ON savedBuilds(createdAt DESC);
  `);

  return drizzle(sqlite, { schema });
}
```

**Usage in tests:**

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb } from "@/test/fixtures/database";
import { createBuildRepository } from "@/data-access/build-repository";

describe("BuildRepository", () => {
  let db: ReturnType<typeof createTestDb>;
  let repository: ReturnType<typeof createBuildRepository>;

  beforeEach(() => {
    db = createTestDb();
    repository = createBuildRepository(db);
  });

  it("should create a build", async () => {
    // ...
  });
});
```

### 3.6 Mock Implementations

#### Mock Repository

```typescript
// src/test/mocks/repository.mock.ts
import type {
  BuildRepository,
  SessionRepository,
  GemRepository,
} from "@/data-access/repository";

export function createMockBuildRepository(): jest.Mocked<BuildRepository> {
  const builds = new Map<string, SavedBuild>();

  return {
    findById: vi
      .fn()
      .mockImplementation(async (id: string) => builds.get(id) ?? null),
    findByUserId: vi
      .fn()
      .mockImplementation(async () => Array.from(builds.values())),
    create: vi.fn().mockImplementation(async (build: NewBuild) => {
      const newBuild = {
        ...build,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      builds.set(newBuild.id, newBuild);
      return newBuild;
    }),
    update: vi
      .fn()
      .mockImplementation(async (id: string, data: Partial<Build>) => {
        const existing = builds.get(id);
        if (!existing) throw new Error("Build not found");
        const updated = { ...existing, ...data, updatedAt: Date.now() };
        builds.set(id, updated);
        return updated;
      }),
    delete: vi.fn().mockImplementation(async (id: string) => {
      builds.delete(id);
    }),
  };
}
```

#### Mock External Services

```typescript
// src/test/mocks/services.mock.ts

// Battle.net OAuth mock
export const mockBattleNetAuth = {
  authenticate: vi.fn().mockResolvedValue({
    id: "battlenet-user-123",
    email: "player@battlenet.com",
    displayName: "TestPlayer#1234",
    tier: "free",
  }),
  refreshToken: vi
    .fn()
    .mockResolvedValue({ accessToken: "new-token", expiresIn: 3600 }),
  revokeToken: vi.fn().mockResolvedValue(true),
};

// Stripe mock
export const mockStripe = {
  createCheckoutSession: vi.fn().mockResolvedValue({
    id: "cs_test_123",
    url: "https://checkout.stripe.com/test",
  }),
  getSubscription: vi.fn().mockResolvedValue({
    id: "sub_123",
    status: "active",
    plan: "dolphin",
  }),
  cancelSubscription: vi.fn().mockResolvedValue({ status: "canceled" }),
};

// LLM Gateway mock
export const mockLLMGateway = {
  chat: vi.fn().mockResolvedValue({
    id: "chat-123",
    message:
      "Based on your current build, I recommend focusing on legendary gems first.",
    usage: { promptTokens: 150, completionTokens: 45 },
  }),
  stream: vi.fn().mockImplementation(async function* () {
    yield "Based on your";
    yield " current build,";
    yield " I recommend";
    yield " focusing on legendary gems.";
  }),
};
```

---

## 4. Coverage Targets

| Layer                          | Target   | Enforcement                          |
| ------------------------------ | -------- | ------------------------------------ |
| **Domain services**            | **95%+** | TDD-enforced — no code without tests |
| **Use cases**                  | **90%+** | Required in PR review                |
| **Repository implementations** | **85%+** | Vitest coverage thresholds           |
| **API routes**                 | **90%+** | Integration test per route           |
| **UI primitives**              | **80%+** | Component test per primitive         |
| **Feature components**         | **70%+** | Component test for key interactions  |
| **Overall**                    | **80%+** | CI gate — fails if below             |

### Coverage Enforcement

```json
// vitest.config.ts — coverage.thresholds
{
  "coverage": {
    "thresholds": {
      "global": 80,
      "branches": 75,
      "functions": 80,
      "lines": 80
    }
  }
}
```

### Coverage Exclusions (Justified)

| Excluded               | Reason                                      |
| ---------------------- | ------------------------------------------- |
| `src/test/`            | Test utilities — testing the tests          |
| `src/**/*.d.ts`        | Type declarations — no runtime code         |
| `src/**/*.stories.tsx` | Storybook stories — visual testing          |
| `src/app/layout.tsx`   | Root layout — providers and fonts, no logic |

### What NOT to Test

- **Type definitions** — TypeScript compiler validates types
- **Third-party libraries** — trust their own tests
- **Simple getters/setters** — no logic to verify
- **Console.log statements** — not user-facing behavior
- **Mock implementations** — test the mocks themselves sparingly

---

## 5. E2E Test Scenarios

E2E tests verify the **critical user journeys**. They run against a real browser with a real build of the application.

### 5.1 Scenario Matrix

| Scenario                               | Priority | File                         |
| -------------------------------------- | -------- | ---------------------------- |
| Full optimization flow                 | CRITICAL | `e2e/optimization.spec.ts`   |
| Anonymous-to-authenticated migration   | HIGH     | `e2e/auth-migration.spec.ts` |
| Character creation and management      | HIGH     | `e2e/characters.spec.ts`     |
| Build save/load/delete                 | HIGH     | `e2e/builds.spec.ts`         |
| Session persistence across page reload | MEDIUM   | `e2e/session.spec.ts`        |
| Mobile responsiveness                  | MEDIUM   | `e2e/responsive.spec.ts`     |
| Accessibility audit                    | MEDIUM   | `e2e/accessibility.spec.ts`  |

### 5.2 Full Optimization Flow

```
User journey:
1. Navigate to /optimize
2. Browse gem catalog → select 3 gems
3. Configure quality and rank for each gem
4. Set resource inventory (gem power, copies)
5. Click "Optimize"
6. Wait for results
7. Verify recommendations are displayed
8. Save the build
9. Verify build appears in /builds
```

### 5.3 Anonymous-to-Authenticated Migration

```
User journey:
1. Start as anonymous user
2. Add gems, set resources, save a build
3. Click "Sign in with Battle.net"
4. Complete OAuth flow (mocked in test)
5. Verify session data migrated to authenticated account
6. Verify builds are still accessible
7. Verify anonymous ID is linked to account
```

### 5.4 Accessibility Requirements

All E2E tests should verify:

- **Keyboard navigation** — all interactive elements reachable via Tab
- **Screen reader announcements** — loading states, errors, success messages announced
- **Color contrast** — no WCAG AA violations
- **Focus management** — focus moves logically after actions (modal open/close, page navigation)
- **ARIA attributes** — roles, labels, and states are correct

Use `axe-core` integration for automated accessibility audits:

```typescript
import { expect, test } from "@playwright/test";
import { injectAxe, checkA11y } from "axe-playwright";

test("page is accessible", async ({ page }) => {
  await page.goto("/optimize");
  await injectAxe(page);
  const violations = await checkA11y(page, null, { detailedReport: true });
  expect(violations.violations).toHaveLength(0);
});
```

---

## 6. CI Integration

### 6.1 Test Execution Strategy

| Trigger              | Tests Run                | Purpose                          |
| -------------------- | ------------------------ | -------------------------------- |
| Every commit (local) | Unit tests only          | Fast feedback during development |
| PR opened/updated    | Unit + Integration       | Gate for merge                   |
| PR merged to main    | Unit + Integration + E2E | Full validation before deploy    |
| Nightly              | Performance benchmarks   | Catch regressions                |

### 6.2 GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Type check
        run: bun typecheck

      - name: Lint
        run: bun lint

      - name: Run tests with coverage
        run: bun test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Install Playwright browsers
        run: bunx playwright install --with-deps

      - name: Build and run E2E tests
        run: bun test:e2e
        env:
          BASE_URL: http://localhost:3000

      - name: Upload E2E report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  performance:
    name: Performance Benchmarks
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule' || github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run performance benchmarks
        run: bun test:run -- --reporter=json --coverage=false src/__tests__/performance/
```

### 6.3 Coverage Threshold Enforcement

The Vitest coverage thresholds in `vitest.config.ts` enforce the 80% minimum. If coverage drops below the threshold, the test run fails.

```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    global: 80,    // Overall coverage must be >= 80%
    branches: 75,  // Branch coverage must be >= 75%
    functions: 80, // Function coverage must be >= 80%
    lines: 80,     // Line coverage must be >= 80%
  },
  // Fail the build if thresholds not met
  thresholds: {
    perFile: false,  // Set to true to enforce per-file thresholds
  },
}
```

### 6.4 Nightly Performance Benchmarks

```yaml
# .github/workflows/performance.yml
name: Performance Benchmarks

on:
  schedule:
    - cron: "0 6 * * *" # Daily at 6 AM UTC
  workflow_dispatch: # Manual trigger

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun test:run src/__tests__/performance/
```

---

## 7. Test Organization

### 7.1 Directory Structure

```
src/
├── features/
│   ├── gems/
│   │   ├── catalog.ts
│   │   ├── scoring.ts
│   │   ├── resonance.ts
│   │   └── __tests__/
│   │       ├── catalog.test.ts
│   │       ├── scoring.test.ts
│   │       └── resonance.test.ts
│   │
│   ├── optimization/
│   │   ├── engine.ts
│   │   ├── resources.ts
│   │   └── __tests__/
│   │       ├── engine.test.ts
│   │       ├── engine.property.test.ts
│   │       └── resources.test.ts
│   │
│   └── builds/
│       ├── repository.ts
│       └── __tests__/
│           └── repository.test.ts
│
├── shared/
│   ├── ui/
│   │   ├── button.tsx
│   │   └── __tests__/
│   │       └── button.test.tsx
│   ├── utils/
│   │   ├── formatting.ts
│   │   └── __tests__/
│   │       └── formatting.test.ts
│   └── __tests__/
│       └── integration/
│           └── gem-addition-flow.test.ts
│
├── __tests__/
│   ├── integration/
│   │   ├── optimize-flow.test.ts
│   │   ├── session-flow.test.ts
│   │   └── build-flow.test.ts
│   └── performance/
│       └── optimizer.bench.ts
│
├── test/
│   ├── setup.ts              # Vitest setup (Testing Library, mocks)
│   ├── fixtures/
│   │   ├── gems.ts           # Gem data fixtures
│   │   ├── builds.ts         # Build/session fixtures
│   │   └── database.ts       # In-memory DB helper
│   └── mocks/
│       ├── repository.mock.ts # Mock repository implementations
│       ├── auth.mock.ts      # Mock Battle.net OAuth
│       ├── stripe.mock.ts    # Mock Stripe SDK
│       └── llm.mock.ts       # Mock LLM Gateway
│
└── app/
    └── api/
        └── optimize/
            └── __tests__/
                └── route.test.ts  # API route tests next to route
```

### 7.2 Colocation Rules

1. **Co-locate tests** next to the code they test in `__tests__/` directories
2. **Name test files** `<module>.test.ts` (or `<module>.spec.ts` for E2E)
3. **Property-based tests** in separate files: `<module>.property.test.ts`
4. **Integration tests** for a feature: `<module>.integration.test.ts`
5. **Component tests**: `__tests__/components/<ComponentName>.test.tsx`

### 7.3 Test Naming Conventions

| Pattern          | Example                                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| Unit test        | `describe("scoring", () => { describe("calculatePower", () => { it("should return 0 for rank 0", () => {...}) }) })` |
| Component test   | `describe("GemCard", () => { it("displays gem name and star rating", () => {...}) })`                                |
| Integration test | `describe("POST /api/optimize", () => { it("returns recommendations for valid input", () => {...}) })`               |
| E2E test         | `test("full optimization flow", async ({ page }) => {...})`                                                          |
| Property test    | `it("always returns results within budget (property)", () => {...})`                                                 |

### 7.4 Test File Naming

| Test Type        | Suffix                 | Example                          |
| ---------------- | ---------------------- | -------------------------------- |
| Unit test        | `.test.ts`             | `scoring.test.ts`                |
| Component test   | `.test.tsx`            | `GemCard.test.tsx`               |
| Integration test | `.integration.test.ts` | `repository.integration.test.ts` |
| Property test    | `.property.test.ts`    | `engine.property.test.ts`        |
| Benchmark        | `.bench.ts`            | `optimizer.bench.ts`             |
| E2E spec         | `.spec.ts`             | `optimization.spec.ts`           |

---

## 8. Code Examples

### 8.1 Property-Based Test for Optimization Engine

```typescript
// src/features/optimization/__tests__/engine.property.test.ts
import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { optimize } from "../engine";
import type {
  OptimizationInput,
  LegendaryGem,
  EquippedGem,
} from "@/shared/types";

// Arbitraries for property-based testing
const gemIdArbitrary = fc
  .string({ minLength: 1, maxLength: 20 })
  .map((s) => `gem-${s}`);

const legendaryGemArbitrary: fc.Arbitrary<LegendaryGem> = fc.record({
  id: gemIdArbitrary,
  name: fc.string({ minLength: 1, maxLength: 30 }),
  starRating: fc.oneof(fc.constant(1), fc.constant(2), fc.constant(5)),
  pvpTier: fc.oneof(
    fc.constant("S"),
    fc.constant("A"),
    fc.constant("B"),
    fc.constant("C"),
    fc.constant("D"),
  ),
  pveTier: fc.oneof(
    fc.constant("S"),
    fc.constant("A"),
    fc.constant("B"),
    fc.constant("C"),
    fc.constant("D"),
  ),
  resonanceTable: fc.dictionary(fc.nat({ max: 10 }), fc.nat({ max: 1000 })),
  crTable: fc.dictionary(fc.nat({ max: 10 }), fc.nat({ max: 500 })),
});

const equippedGemArbitrary = fc.record({
  gemId: gemIdArbitrary,
  slot: fc.nat({ max: 23 }),
  currentRank: fc.nat({ min: 1, max: 10 }),
  quality: fc.nat({ min: 1, max: 5 }),
});

const optimizationInputArbitrary = fc
  .record({
    gems: fc.array(equippedGemArbitrary, { maxLength: 24 }),
    resources: fc.record({
      gemPower: fc.nat({ max: 50000 }),
      copyInventory: fc.dictionary(gemIdArbitrary, fc.nat({ max: 20 })),
    }),
    mode: fc.oneof(fc.constant("PVE"), fc.constant("PVP")),
  })
  .map((input) => ({
    ...input,
    resources: {
      ...input.resources,
      copyInventory: new Map(Object.entries(input.resources.copyInventory)),
    },
  }));

describe("Optimization Engine — Property Tests", () => {
  it("always returns results within budget", () => {
    fc.assert(
      fc.property(optimizationInputArbitrary, (input: OptimizationInput) => {
        const result = optimize(input);

        for (const rec of result.recommendations) {
          expect(rec.totalResourceCost.gemPower).toBeLessThanOrEqual(
            input.resources.gemPower,
          );
          expect(rec.totalResourceCost.copies).toBeGreaterThanOrEqual(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("never assigns more than one upgrade per slot", () => {
    fc.assert(
      fc.property(optimizationInputArbitrary, (input: OptimizationInput) => {
        const result = optimize(input);
        const slots = new Set(result.recommendations.map((r) => r.slot));

        // Each slot should appear at most once in recommendations
        expect(result.recommendations.length).toBeLessThanOrEqual(slots.size);
      }),
      { numRuns: 100 },
    );
  });

  it("power score is monotonically non-decreasing with more resources", () => {
    fc.assert(
      fc.property(
        fc.array(equippedGemArbitrary, { maxLength: 8 }),
        fc.nat({ max: 100 }),
        (gems: EquippedGem[], basePower: number) => {
          const gemDatabase = new Map<string, LegendaryGem>();
          const input: OptimizationInput = {
            gems,
            resources: { gemPower: basePower, copyInventory: new Map() },
            mode: "PVE",
            gemDatabase,
          };

          const resultA = optimize(input);
          const resultB = optimize({
            ...input,
            resources: { ...input.resources, gemPower: basePower + 1000 },
          });

          expect(resultB.totalPowerGain).toBeGreaterThanOrEqual(
            resultA.totalPowerGain,
          );
        },
      ),
      { numRuns: 50 },
    );
  });

  it("identical inputs produce identical outputs (determinism)", () => {
    fc.assert(
      fc.property(optimizationInputArbitrary, (input: OptimizationInput) => {
        const resultA = optimize(input);
        const resultB = optimize(input);

        expect(resultA.recommendations.length).toBe(
          resultB.recommendations.length,
        );
        for (let i = 0; i < resultA.recommendations.length; i++) {
          expect(resultA.recommendations[i].gemId).toBe(
            resultB.recommendations[i].gemId,
          );
          expect(resultA.recommendations[i].slot).toBe(
            resultB.recommendations[i].slot,
          );
          expect(resultA.recommendations[i].fromRank).toBe(
            resultB.recommendations[i].fromRank,
          );
          expect(resultA.recommendations[i].toRank).toBe(
            resultB.recommendations[i].toRank,
          );
          expect(resultA.recommendations[i].powerGain).toBe(
            resultB.recommendations[i].powerGain,
          );
        }
      }),
      { numRuns: 100 },
    );
  });
});
```

### 8.2 API Route Integration Test with Mock Repository

```typescript
// src/app/api/optimize/__tests__/route.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "../route";
import { createMockBuildRepository } from "@/test/mocks/repository.mock";
import { testGems } from "@/test/fixtures/gems";

describe("POST /api/optimize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with recommendations for valid input", async () => {
    const request = new Request("http://localhost/api/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anonymousId: "test-session-uuid",
        equippedGems: [
          { gemId: "blood-soaked-jade", slotPosition: 1, quality: 1, rank: 1 },
          { gemId: "fervid-flashwing", slotPosition: 2, quality: 1, rank: 1 },
        ],
        resources: { gemPower: 500, copies: { "blood-soaked-jade": 3 } },
        mode: "PVE",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toBeDefined();
    expect(data.meta).toBeDefined();
    expect(data.meta.timestamp).toBeDefined();
  });

  it("returns 400 for missing required fields", async () => {
    const request = new Request("http://localhost/api/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Missing anonymousId and equippedGems
        resources: { gemPower: 100 },
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
    expect(data.error.type).toBe("validation_error");
  });

  it("returns 400 for invalid gem ID", async () => {
    const request = new Request("http://localhost/api/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anonymousId: "test-session-uuid",
        equippedGems: [
          { gemId: "nonexistent-gem", slotPosition: 1, quality: 1, rank: 1 },
        ],
        resources: { gemPower: 100 },
        mode: "PVE",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("returns 429 when rate limit exceeded", async () => {
    // Simulate rapid successive requests
    const requests = Array.from(
      { length: 15 },
      (_, i) =>
        new Request("http://localhost/api/optimize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Forwarded-For": "192.168.1.1",
          },
          body: JSON.stringify({
            anonymousId: `test-session-${i}`,
            equippedGems: [],
            resources: { gemPower: 0 },
            mode: "PVE",
          }),
        }),
    );

    const responses = await Promise.all(requests.map((req) => POST(req)));
    const statusCodes = responses.map((r) => r.status);

    expect(statusCodes).toContain(429);
  });

  it("includes processing time in response", async () => {
    const request = new Request("http://localhost/api/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anonymousId: "test-session-uuid",
        equippedGems: [],
        resources: { gemPower: 0 },
        mode: "PVE",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.data.processingTimeMs).toBeGreaterThanOrEqual(0);
    expect(data.data.processingTimeMs).toBeLessThan(5000); // Must complete under 5s
  });
});
```

### 8.3 Component Test with Testing Library

```typescript
// src/features/gems/__tests__/components/GemCard.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GemCard } from "../../components/GemCard";
import type { LegendaryGem } from "@/shared/types";

describe("GemCard", () => {
  const testGem: LegendaryGem = {
    id: "blood-soaked-jade",
    name: "Blood-Soaked Jade",
    starRating: 5,
    pvpTier: "S",
    pveTier: "S",
    resonanceTable: {},
    crTable: {},
  };

  it("displays gem name and star rating", () => {
    render(<GemCard gem={testGem} onSelect={vi.fn()} />);

    expect(screen.getByText("Blood-Soaked Jade")).toBeInTheDocument();
    // Star rating should be visible (e.g., as stars or text)
    expect(screen.getByRole("img", { name: /5 star/i })).toBeInTheDocument();
  });

  it("calls onSelect when clicked", () => {
    const onSelect = vi.fn();
    render(<GemCard gem={testGem} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: /select blood-soaked jade/i }));
    expect(onSelect).toHaveBeenCalledWith(testGem);
  });

  it("shows tier badges for PvP and PvE", () => {
    render(<GemCard gem={testGem} onSelect={vi.fn()} />);

    expect(screen.getByText("S")).toBeInTheDocument(); // Tier badge
  });

  it("is accessible with proper ARIA attributes", () => {
    render(<GemCard gem={testGem} onSelect={vi.fn()} />);

    const card = screen.getByRole("button", { name: /select blood-soaked jade/i });
    expect(card).toHaveAttribute("aria-label");
  });

  it("shows different styling for legendary vs normal gems", () => {
    const normalGem: LegendaryGem = {
      id: "test-normal",
      name: "Normal Gem",
      starRating: 1,
      pvpTier: "D",
      pveTier: "D",
      resonanceTable: {},
      crTable: {},
    };

    render(<GemCard gem={normalGem} onSelect={vi.fn()} />);
    expect(screen.getByText("Normal Gem")).toBeInTheDocument();
    // 1-star gem should have different visual treatment
    expect(screen.getByRole("img", { name: /1 star/i })).toBeInTheDocument();
  });
});
```

### 8.4 Playwright E2E Test for Optimization Flow

```typescript
// e2e/optimization.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Optimization Flow", () => {
  test("full optimization: select gems → run optimizer → view results → save build", async ({
    page,
  }) => {
    // 1. Navigate to optimization page
    await page.goto("/optimize");
    await expect(page).toHaveURL(/\/optimize/);

    // 2. Verify page loads with gem catalog
    await expect(
      page.getByRole("heading", { name: /gem optimization/i }),
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: "5-star" })).toBeVisible();

    // 3. Select a gem from the catalog
    await page.getByRole("tab", { name: "5-star" }).click();
    await page
      .getByRole("button", { name: /blood-soaked jade/i })
      .first()
      .click();

    // 4. Configure the gem (quality and rank should be configurable)
    await expect(
      page.getByRole("combobox", { name: /quality/i }),
    ).toBeVisible();
    await expect(page.getByRole("combobox", { name: /rank/i })).toBeVisible();

    // 5. Set resources (gem power and copies)
    await page.getByRole("textbox", { name: /gem power/i }).fill("500");
    await page.getByRole("textbox", { name: /copies/i }).fill("3");

    // 6. Run optimization
    await page.getByRole("button", { name: /optimize/i }).click();

    // 7. Wait for results (loading state → results)
    await expect(page.getByRole("progressbar")).toBeVisible();
    await expect(page.getByRole("progressbar")).not.toBeVisible({
      timeout: 10_000,
    });

    // 8. Verify recommendations are displayed
    await expect(
      page.getByRole("heading", { name: /recommendations/i }),
    ).toBeVisible();
    await expect(page.getByText(/blood-soaked jade/i)).toBeVisible();

    // 9. Save the build
    await page.getByRole("button", { name: /save build/i }).click();

    // 10. Fill in build name and save
    await page
      .getByRole("textbox", { name: /build name/i })
      .fill("Test Optimization Build");
    await page.getByRole("button", { name: /confirm save/i }).click();

    // 11. Verify success message
    await expect(page.getByText(/build saved/i)).toBeVisible({
      timeout: 5_000,
    });

    // 12. Navigate to builds page and verify build exists
    await page.goto("/builds");
    await expect(page.getByText("Test Optimization Build")).toBeVisible();
  });

  test("handles empty gem selection gracefully", async ({ page }) => {
    await page.goto("/optimize");

    // Try to optimize without selecting any gems
    await page.getByRole("textbox", { name: /gem power/i }).fill("100");
    await page.getByRole("button", { name: /optimize/i }).click();

    // Should show empty state or informative message
    await expect(
      page.getByText(/no gems selected/i).or(page.getByText(/select gems/i)),
    ).toBeVisible({ timeout: 3_000 });
  });

  test("displays error when resources are insufficient", async ({ page }) => {
    await page.goto("/optimize");

    // Select a gem that requires more resources than available
    await page.getByRole("tab", { name: "5-star" }).click();
    await page
      .getByRole("button", { name: /blood-soaked jade/i })
      .first()
      .click();

    // Set very low resources
    await page.getByRole("textbox", { name: /gem power/i }).fill("0");

    await page.getByRole("button", { name: /optimize/i }).click();

    // Should show empty recommendations or informative message
    await expect(
      page
        .getByText(/no affordable upgrades/i)
        .or(page.getByText(/insufficient/i)),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("respects responsive breakpoints", async ({ page }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/optimize");

    // Key elements should still be accessible on mobile
    await expect(
      page.getByRole("heading", { name: /gem optimization/i }),
    ).toBeVisible();

    // Gem catalog should be usable (may be collapsed behind a button)
    const gemSelector = page
      .getByRole("button", { name: /browse gems/i })
      .or(page.getByRole("tab", { name: "5-star" }));
    await expect(gemSelector).toBeVisible();
  });
});
```

---

## Appendix A: Test Writing Checklist

Before merging a PR with new code, verify:

- [ ] Unit tests exist for all new domain functions
- [ ] Tests cover happy path and at least 2 error cases
- [ ] Test names describe the scenario being tested
- [ ] No `any` types in test files
- [ ] Tests use fixtures from `src/test/fixtures/`
- [ ] Mocks are in `src/test/mocks/`
- [ ] Component tests use role-based queries (`getByRole`)
- [ ] API route tests validate both success and error responses
- [ ] Integration tests use isolated test databases
- [ ] Coverage has not decreased (run `bun test:coverage`)
- [ ] All tests pass locally (`bun test:run`)

## Appendix B: Fast-Check Installation

Property-based testing requires `fast-check`:

```bash
bun add -D fast-check @types/fast-check
```

## Appendix C: Common Test Patterns

### Testing Async Functions

```typescript
it("should handle async operations", async () => {
  await expect(asyncFunction()).resolves.toEqual(expected);
  await expect(asyncFunctionThatFails()).rejects.toThrow("Expected error");
});
```

### Testing Hooks

```typescript
import { renderHook } from "@testing-library/react";

it("should return initial state", () => {
  const { result } = renderHook(() => useOptimize());
  expect(result.current.isOptimizing).toBe(false);
});
```

### Testing with User Events

```typescript
import { userEvent } from "@testing-library/user-event";

it("should handle user interaction", async () => {
  const user = userEvent.setup();
  render(<MyComponent />);
  await user.type(screen.getByRole("textbox"), "hello");
  await user.click(screen.getByRole("button"));
  expect(screen.getByText("Submitted")).toBeInTheDocument();
});
```
