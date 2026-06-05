# Performance Strategy — Glaucus App

> **Date:** 2026-06-05
> **Project:** Diablo Immortal Gem Optimizer (Glaucus)
> **Purpose:** Define performance budgets, optimization strategies, benchmarks, and monitoring for the Glaucus application

---

## Table of Contents

1. [Performance Budget](#1-performance-budget)
2. [Core Web Vitals Targets](#2-core-web-vitals-targets)
3. [Optimization Engine Performance](#3-optimization-engine-performance)
4. [Caching Strategy](#4-caching-strategy)
5. [Rendering Optimization](#5-rendering-optimization)
6. [Database Performance](#6-database-performance)
7. [Monitoring & Measurement](#7-monitoring--measurement)
8. [Build Optimization](#8-build-optimization)
9. [Performance Regression Testing](#9-performance-regression-testing)
10. [Lighthouse CI Configuration](#10-lighthouse-ci-configuration)
11. [Bundle Analysis Workflow](#11-bundle-analysis-workflow)

---

## 1. Performance Budget

The performance budget defines hard limits for every asset type that ships to the browser. These are non-negotiable gates — any PR that exceeds them must include a justification and mitigation plan.

### 1.1 Budget Table

| Category        | What                                    | Limit                              | Current | Target  | Notes                                                                       |
| --------------- | --------------------------------------- | ---------------------------------- | ------- | ------- | --------------------------------------------------------------------------- |
| **JavaScript**  | Initial JS bundle (critical path)       | < 200KB (gzipped)                  | TBD     | < 150KB | Routes below `/optimize` must not load optimizer code                       |
| **JavaScript**  | Total JS bundle (all routes)            | < 500KB (gzipped)                  | TBD     | < 400KB | Includes Tesseract.js (lazy), lucide-react, Radix                           |
| **CSS**         | Total CSS bundle                        | < 50KB (gzipped)                   | TBD     | < 30KB  | Tailwind purges unused; no custom CSS frameworks                            |
| **Fonts**       | Font download weight                    | 0KB (system fonts)                 | 0KB     | 0KB     | Use system font stack — see [Rendering Optimization](#55-font-optimization) |
| **Images**      | Per-image (hero, class icons)           | < 50KB each                        | TBD     | < 30KB  | Use `next/image` with AVIF/WebP                                             |
| **Images**      | Total page weight (images)              | < 200KB per page                   | TBD     | < 150KB | Lazy-load below-the-fold images                                             |
| **Third-party** | Tesseract.js                            | < 2MB (lazy, not on critical path) | ~2MB    | < 1.5MB | Dynamic import only on OCR route                                            |
| **Third-party** | Stripe.js                               | On-demand only                     | N/A     | N/A     | Load only when billing page visited                                         |
| **Third-party** | LLM Gateway (AI chat)                   | Streaming connection               | N/A     | N/A     | No bulk download; SSE/WebSocket                                             |
| **Page weight** | Total initial page (HTML+JS+CSS+images) | < 500KB                            | TBD     | < 400KB | Home page and landing                                                       |
| **Requests**    | Initial HTTP requests                   | < 30                               | TBD     | < 20    | Minimize with bundling and inlining                                         |

### 1.2 Budget Enforcement

- **CI gate:** `@next/bundle-analyzer` review on every PR that touches dependencies
- **Bundle size check:** Fail CI if `next build` output exceeds budget (see [Bundle Analysis Workflow](#11-bundle-analysis-workflow))
- **Third-party audit:** Any new third-party dependency requires performance review before merge
- **Budget review:** Monthly review of actual vs. budget; adjust targets based on feature growth

---

## 2. Core Web Vitals Targets

These targets apply to all pages. They are measured on both synthetic (Lighthouse) and real-user (RUM) data.

### 2.1 Target Table

| Metric                              | Target           | Good             | Needs Improvement | Poor    | Tool                 |
| ----------------------------------- | ---------------- | ---------------- | ----------------- | ------- | -------------------- |
| **LCP** (Largest Contentful Paint)  | < 2.5s           | < 2.5s           | 2.5–4.0s          | > 4.0s  | Lighthouse, RUM      |
| **INP** (Interaction to Next Paint) | < 200ms          | < 200ms          | 200–500ms         | > 500ms | Lighthouse, RUM      |
| **CLS** (Cumulative Layout Shift)   | < 0.1            | < 0.1            | 0.1–0.25          | > 0.25  | Lighthouse, RUM      |
| **FCP** (First Contentful Paint)    | < 1.5s           | < 1.5s           | 1.5–3.0s          | > 3.0s  | Lighthouse, RUM      |
| **TTFB** (Time to First Byte)       | < 800ms (server) | < 200ms (cached) | 800ms–1.8s        | > 1.8s  | Chrome DevTools, RUM |
| **TTI** (Time to Interactive)       | < 3s             | < 3s             | 3–5s              | > 5s    | Lighthouse           |

### 2.2 Per-Page Targets

| Page                     | LCP    | FCP    | TTI    | Notes                                   |
| ------------------------ | ------ | ------ | ------ | --------------------------------------- |
| `/` (landing)            | < 2.0s | < 1.2s | < 2.5s | Static, server-rendered, heavily cached |
| `/optimize`              | < 2.5s | < 1.5s | < 3.0s | Interactive, client hydration needed    |
| `/builds`                | < 2.0s | < 1.5s | < 2.5s | Database-driven, cached queries         |
| Character pages (future) | < 2.5s | < 1.5s | < 3.0s | Auth-gated, SSR with streaming          |

### 2.3 Performance Budget Rationale

- **FCP < 1.5s** ensures users see content quickly, reducing bounce rate
- **LCP < 2.5s** aligns with Google's "good" threshold for SEO
- **INP < 200ms** ensures the optimizer UI feels responsive during interaction
- **CLS < 0.1** prevents layout jumps when gem cards and results load
- **TTFB < 800ms** accounts for serverless cold starts; cached should be < 200ms

---

## 3. Optimization Engine Performance

The greedy optimization engine is the core value proposition. It must be fast enough to feel instant.

### 3.1 Benchmark Targets

| Scenario               | Input                                          | Target | Current | Notes                                     |
| ---------------------- | ---------------------------------------------- | ------ | ------- | ----------------------------------------- |
| **Basic optimization** | 6 gems, 2 resources                            | < 1s   | < 100ms | Single-rank greedy, typical free-tier use |
| **Full catalog scan**  | 24 slots, all gems, typical resources          | < 5s   | < 100ms | 24 gems at various ranks, 10+ copy types  |
| **Complex scenario**   | 24 slots, multi-resource constraints, infusion | < 10s  | TBD     | Includes infusion recommendations         |
| **Empty input**        | 0 gems                                         | < 50ms | < 10ms  | Edge case, instant return                 |
| **Max rank input**     | 24 gems all at rank 10                         | < 50ms | < 10ms  | No upgrades possible, early exit          |

**Current state:** The existing performance test in `src/lib/optimization/engine.test.ts` validates < 100ms for 24 gems with generous resources — well within targets.

### 3.2 Benchmark Code Examples

#### Basic Benchmark (Vitest)

```typescript
// src/__tests__/performance/optimizer.bench.ts
import { describe, it, expect } from "vitest";
import { optimize } from "@/lib/optimization/engine";
import type {
  OptimizationInput,
  UpgradeResources,
  LegendaryGem,
} from "@/lib/optimization/types";

/**
 * BENCHMARK: Basic optimization (6 gems, 2 resources)
 * Target: < 1 second
 */
describe("Optimizer Benchmarks", () => {
  it("basic: should complete in < 1s for 6 gems, 2 resources", () => {
    const gemDatabase = createTestGemDatabase(6);
    const gems = createEquippedGems(6);
    const resources: UpgradeResources = {
      gemPower: 500,
      copyInventory: new Map([
        ["gem-0", 3],
        ["gem-1", 2],
      ]),
    };

    const input: OptimizationInput = {
      gems,
      resources,
      mode: "PVE",
      gemDatabase,
    };

    const start = performance.now();
    const result = optimize(input);
    const duration = performance.now() - start;

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(1000); // 1 second target
  });

  /**
   * BENCHMARK: Full catalog scan (24 slots)
   * Target: < 5 seconds
   */
  it("full-catalog: should complete in < 5s for 24 slots", () => {
    const gemDatabase = createTestGemDatabase(24);
    const gems = createEquippedGems(24);
    const resources: UpgradeResources = {
      gemPower: 10000,
      copyInventory: new Map(
        Array.from({ length: 24 }, (_, i) => [`gem-${i}`, 5] as const),
      ),
    };

    const input: OptimizationInput = {
      gems,
      resources,
      mode: "PVE",
      gemDatabase,
    };

    const start = performance.now();
    const result = optimize(input);
    const duration = performance.now() - start;

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(5000); // 5 second target
  });

  /**
   * BENCHMARK: Complex scenario (24 slots, multi-resource, infusion)
   * Target: < 10 seconds
   */
  it("complex: should complete in < 10s for 24 slots with infusion", () => {
    const gemDatabase = createTestGemDatabase(24);
    // Add 5-star gems that trigger infusion recommendations
    gemDatabase.set(
      "legendary-1",
      create5StarGem("legendary-1", "Legendary Gem"),
    );

    const gems = createEquippedGemsWithLegendaries(24);
    const resources: UpgradeResources = {
      gemPower: 50000,
      copyInventory: new Map(
        Array.from({ length: 24 }, (_, i) => [`gem-${i}`, 10] as const),
      ),
    };

    const input: OptimizationInput = {
      gems,
      resources,
      mode: "PVP",
      gemDatabase,
      infusionGems: ["legendary-1"],
    };

    const start = performance.now();
    const result = optimize(input);
    const duration = performance.now() - start;

    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(10000); // 10 second target
  });
});
```

### 3.3 Engine Caching Strategy

**Problem:** Identical optimization requests currently re-run the full algorithm.

**Solution:** Cache optimization results keyed by input hash.

```typescript
// src/lib/optimization/cache.ts
import { unstable_cache } from "next/cache";
import { createHash } from "crypto";
import { optimize } from "./engine";
import type { OptimizationInput, OptimizationResult } from "./types";

/**
 * Generate a deterministic cache key from optimization input.
 * Identical inputs produce identical keys.
 */
function generateCacheKey(input: OptimizationInput): string {
  const payload = JSON.stringify({
    gems: input.gems.map(
      (g) => `${g.gemId}:${g.slot}:${g.currentRank}:${g.quality}`,
    ),
    resources: {
      gemPower: input.resources.gemPower,
      copies: Array.from(input.resources.copyInventory.entries()).sort(),
    },
    mode: input.mode,
    gameMode: input.gameMode,
    infusionGems: input.infusionGems?.sort(),
  });

  return `optimize:${createHash("sha256").update(payload).digest("hex").slice(0, 16)}`;
}

/**
 * Cached optimization wrapper.
 * TTL: 5 minutes — fast enough for user experience,
 * fresh enough that inventory changes are reflected quickly.
 */
export const cachedOptimize = unstable_cache(
  async (input: OptimizationInput): Promise<OptimizationResult> => {
    return optimize(input);
  },
  ["gem-optimization"], // cache tag for invalidation
  { revalidate: 300, tags: ["optimization"] }, // 5 minute TTL
);
```

**Cache Key Design:**

- SHA-256 hash of normalized input (sorted keys, consistent serialization)
- Short hash (16 chars) for readability in cache inspection
- Includes: gem state, resource state, mode, game mode, infusion gems

**TTL Strategy:**
| Data Type | TTL | Invalidation |
|-----------|-----|--------------|
| Optimization results | 5 min | Tag-based: `revalidateTag('optimization')` on inventory change |
| Gem catalog | 24 hours | Version tag: `revalidateTag('gems-v${version}')` |
| User builds | 0 (never cached server-side) | Always fresh from database |

---

## 4. Caching Strategy

Glaucus uses a multi-layer caching approach. Each layer has a specific responsibility and invalidation strategy.

### 4.1 Cache Layer Overview

| Layer                  | Technology                    | Scope                                      | TTL                          | Invalidation                            |
| ---------------------- | ----------------------------- | ------------------------------------------ | ---------------------------- | --------------------------------------- |
| **CDN**                | Vercel Edge / custom CDN      | Static assets (JS, CSS, images)            | Long-lived (immutable)       | Cache bust via content hash in filename |
| **Server response**    | Next.js `fetch` cache         | API route responses, Server Component data | Configurable per route       | Tag-based + time-based                  |
| **Server computation** | `unstable_cache`              | Optimization results, gem catalog          | 5 min – 24 hours             | Tag-based                               |
| **Database query**     | In-memory LRU (future: Redis) | Frequent query results                     | 1–5 minutes                  | Time-based + mutation-triggered         |
| **Client state**       | React Query / SWR             | Server state in browser                    | Stale-while-revalidate (30s) | Mutation invalidation                   |
| **Client persistence** | localStorage                  | Anonymous ID, UI preferences               | Persistent                   | Manual (user action)                    |
| **Cross-tab sync**     | BroadcastChannel              | Active session state between tabs          | Real-time                    | Event-driven                            |

### 4.2 Server-Side Caching

#### 4.2.1 Next.js Fetch Cache (Static Data)

```typescript
// src/features/gems/loader.ts
import { loadGemsFromJSON } from "@/data/gems";

let gemCache: Map<string, any> | null = null;

/**
 * Load gem catalog with in-memory caching.
 * In serverless, this cache lives for the function lifetime.
 * In standalone deployment, it persists for the process lifetime.
 */
export async function getGemCatalog(): Promise<Map<string, any>> {
  if (gemCache) return gemCache;

  // Lazy-init: only parse JSON on first access
  const gems = await loadGemsFromJSON();
  gemCache = gems;
  return gems;
}

/**
 * Invalidate gem cache (called when gem data is updated).
 */
export function invalidateGemCache() {
  gemCache = null;
}
```

#### 4.2.2 Next.js `unstable_cache` (Computation Results)

```typescript
// src/app/api/gems/route.ts
import { NextResponse } from "next/server";
import { getGemCatalog } from "@/features/gems/loader";

export async function GET() {
  const gems = await getGemCatalog();
  const gemArray = Array.from(gems.values());

  return NextResponse.json(
    { data: gemArray },
    {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    },
  );
}
```

### 4.3 Client-Side Caching

#### 4.3.1 React Query Pattern (Future Implementation)

```typescript
// src/features/gems/hooks/useGems.ts
import { useQuery } from "@tanstack/react-query";

export function useGems() {
  return useQuery({
    queryKey: ["gems"],
    queryFn: () => fetch("/api/gems").then((r) => r.json()),
    staleTime: 30_000, // 30 seconds before refetch
    gcTime: 300_000, // 5 minutes in cache before garbage collection
    refetchOnWindowFocus: false,
    refetchOnMount: "always",
  });
}
```

#### 4.3.2 Optimization Result Caching

```typescript
// src/features/optimization/hooks/useOptimize.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useOptimize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: OptimizationInput) =>
      fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      // Cache the result for potential reuse
      queryClient.setQueryData(["optimization", data.cacheKey], data, {
        updatedAt: Date.now(),
      });
    },
  });
}
```

### 4.4 Database-Level Caching

#### 4.4.1 SQLite Query Patterns (Current)

```typescript
// src/data-access/build-repository.ts
import { db } from "./db";
import { savedBuilds } from "./schema";
import { eq, desc, and } from "drizzle-orm";

// Simple in-memory cache for build lists (process-scoped)
const buildListCache = new Map<string, { data: any[]; timestamp: number }>();
const BUILD_LIST_TTL = 60_000; // 1 minute

export async function getBuildsBySession(anonymousId: string) {
  const cacheKey = `builds:${anonymousId}`;
  const cached = buildListCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < BUILD_LIST_TTL) {
    return cached.data;
  }

  const builds = await db
    .select()
    .from(savedBuilds)
    .where(eq(savedBuilds.anonymousId, anonymousId))
    .orderBy(desc(savedBuilds.createdAt));

  buildListCache.set(cacheKey, { data: builds, timestamp: Date.now() });
  return builds;
}

// Always invalidate cache on mutation
export async function createBuild(data: NewBuild) {
  const result = await db.insert(savedBuilds).values(data).returning();
  buildListCache.delete(`builds:${data.anonymousId}`);
  return result[0];
}
```

#### 4.4.2 PostgreSQL Migration (Future)

When migrating to PostgreSQL (see [TARGET-ARCHITECTURE.md](./TARGET-ARCHITECTURE.md) section 4.1), add:

- **Redis cache layer** for session and gem data
- **Connection pooling** via PgBouncer (pool size: 10–20 per instance)
- **Query result caching** with Redis (TTL: 1–5 minutes)

### 4.5 CDN Strategy

| Asset Type                         | Cache-Control                                         | CDN Behavior                             |
| ---------------------------------- | ----------------------------------------------------- | ---------------------------------------- |
| `/_next/static/*` (JS/CSS)         | `public, max-age=31536000, immutable`                 | Forever cache (content-hashed filenames) |
| `/images/*` (gem icons, class art) | `public, max-age=86400, stale-while-revalidate=3600`  | 24 hours with SWR                        |
| `/api/gems`                        | `public, s-maxage=86400, stale-while-revalidate=3600` | CDN-cached for 24 hours                  |
| `/api/builds/*`                    | `private, no-store`                                   | Never cached (user-specific)             |
| HTML pages                         | `public, s-maxage=60, stale-while-revalidate=300`     | 1 minute, SWR 5 minutes                  |

### 4.6 Cache Invalidation Matrix

| Event                         | What to Invalidate              | How                                                     |
| ----------------------------- | ------------------------------- | ------------------------------------------------------- |
| Gem data update               | Gem catalog cache               | `revalidateTag('gems')` + `invalidateGemCache()`        |
| User saves build              | Build list cache, session cache | Delete from `buildListCache`, `revalidateTag('builds')` |
| User deletes build            | Build list cache                | Delete from `buildListCache`                            |
| User updates inventory        | Optimization cache              | `revalidateTag('optimization')`                         |
| Deployment (new version)      | All CDN caches                  | Content hash changes automatically                      |
| Game patch (gem stats change) | All gem-related caches          | Version bump: `revalidateTag('gems-v2')`                |

---

## 5. Rendering Optimization

### 5.1 Server Components by Default

**Rule:** Every component is a Server Component unless it requires client-side interactivity.

| Component              | Type                              | Rationale                                       |
| ---------------------- | --------------------------------- | ----------------------------------------------- |
| Page layouts           | Server                            | Static rendering, data fetching                 |
| Gem catalog list       | Server                            | Data-driven, SEO-friendly                       |
| Gem card (read-only)   | Server                            | Display only                                    |
| Gem selector dropdowns | Client                            | Interactive (`useState`, `onChange`)            |
| Optimization modal     | Client                            | Form inputs, real-time feedback                 |
| Results panel          | Client                            | Dynamic content after API call                  |
| Build save modal       | Client                            | Form with validation                            |
| Navigation header      | Server (with client login button) | Mostly static, login button needs click handler |

**Client component audit checklist:**

- [ ] Does this component use `useState` or `useReducer`?
- [ ] Does this component use `useEffect` or `useLayoutEffect`?
- [ ] Does this component handle browser events (`onClick`, `onChange`)?
- [ ] Does this component use browser APIs (`window`, `localStorage`, `navigator`)?

If **no** to all, remove `"use client"`.

### 5.2 Client Component Boundaries

Keep client islands small. Never wrap an entire page in `"use client"` when only a few components need interactivity.

**Bad:**

```tsx
// app/optimize/page.tsx — DON'T put "use client" here
"use client";
export default function OptimizePage() {
  // Entire page is client-side, ships all JS to browser
}
```

**Good:**

```tsx
// app/optimize/page.tsx — Server Component
import { OptimizationModal } from "@/features/optimization/components/OptimizationModal";
import { ResourceInput } from "@/features/optimization/components/ResourceInput";

export default async function OptimizePage() {
  const gems = await getGemCatalog(); // Server-side data fetch

  return (
    <div>
      <ResourceInput /> {/* Client island */}
      <OptimizationModal /> {/* Client island */}
    </div>
  );
}
```

### 5.3 Virtual Scrolling for Large Lists

When the gem catalog or inventory grows beyond ~50 items, implement virtual scrolling:

```typescript
// src/shared/components/VirtualList.tsx
'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  overscan = 5,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + overscan,
    items.length
  );

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const offsetY = visibleStart * itemHeight;

  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, i) => renderItem(item, visibleStart + i))}
        </div>
      </div>
    </div>
  );
}
```

**When to activate:**

- Gem catalog: > 30 items (already approaching with full DI catalog)
- Inventory: > 50 items
- Build list: > 20 items (unlikely with 5-build limit, but plan ahead)

### 5.4 Image Optimization

```tsx
// Use next/image for ALL images
import Image from 'next/image';

// Gem icon with proper sizing
<Image
  src={`/images/gems/${gem.id}.webp`}
  alt={`${gem.name} icon`}
  width={48}
  height={48}
  sizes="48px"
  priority={false} // Lazy-load, not critical path
/>

// Hero image with priority loading
<Image
  src="/images/hero.webp"
  alt="Glaucus — DI Gem Optimizer"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, 1200px"
  priority // Above the fold
/>
```

**Image rules:**

- Convert all PNGs to WebP/AVIF via `next/image`
- Use `sizes` attribute for responsive loading
- Mark above-the-fold images as `priority` (max 1 per page)
- Set explicit `width` and `height` to prevent CLS

### 5.5 Font Optimization

**Strategy:** Zero font downloads. Use system font stack.

```css
/* src/app/globals.css */
:root {
  --font-sans:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
  --font-mono: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace;
}

body {
  font-family: var(--font-sans);
}
```

**Benefits:**

- 0KB font download
- 0ms font loading delay
- No FOIT/FOUT
- Matches native OS feel

If a custom font is required in the future (e.g., for headers), use:

- `next/font` with `display: swap`
- Preload critical font in `<head>`
- Limit to 1 font family, 2 weights maximum

### 5.6 Code Splitting

#### Route-Based (Automatic with Next.js)

Next.js automatically code-splits by route. No configuration needed:

```
/_next/static/chunks/
  ├── app/page-<hash>.js          # Home page
  ├── app/optimize/page-<hash>.js # Optimize page (lazy)
  └── app/builds/page-<hash>.js   # Builds page (lazy)
```

#### Component-Level (Dynamic Imports)

Heavy components that are not on the critical path:

```tsx
// Tesseract.js OCR component — only loaded when user navigates to OCR feature
"use client";
import dynamic from "next/dynamic";

const OCRUploader = dynamic(
  () => import("@/features/ocr/components/OCRUploader"),
  {
    loading: () => <div className="animate-pulse">Loading OCR...</div>,
    ssr: false, // Tesseract.js requires browser APIs
  },
);

// Chart component for analytics (future, Tier 2)
const AnalyticsChart = dynamic(
  () => import("@/features/analytics/components/Chart"),
  { ssr: false },
);
```

#### Heavy Library Splitting

```typescript
// Tesseract.js — NEVER import at module scope in a shared component
// BAD: import { createWorker } from 'tesseract.js'; // Bundles everywhere

// GOOD: Dynamic import inside the component that needs it
async function processImage(imageFile: File) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker();
  // ... process
}
```

---

## 6. Database Performance

### 6.1 Index Strategy

All indexes should be created at schema definition time. For the current SQLite schema:

```typescript
// src/data-access/schema.ts
import {
  sqliteTable,
  text,
  integer,
  json,
  index,
} from "drizzle-orm/sqlite-core";

export const savedBuilds = sqliteTable(
  "savedBuilds",
  {
    id: text("id").primaryKey(),
    anonymousId: text("anonymousId").notNull(),
    name: text("name").notNull(),
    notes: text("notes"),
    equippedGems: json("equippedGems").notNull(),
    resources: json("resources").notNull(),
    awakenedSlots: json("awakenedSlots").$type<number>().default(0),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    // Foreign key lookup (most common query)
    index("idx_builds_anonymous_id").on(table.anonymousId),
    // Sort order (build list page)
    index("idx_builds_created_at").on(table.createdAt),
    // Unique constraint (build name per session)
    index("idx_builds_name_session").on(table.anonymousId, table.name),
  ],
);

export const anonymousSessions = sqliteTable(
  "anonymousSessions",
  {
    anonymousId: text("anonymousId").primaryKey(),
    email: text("email"),
    emailVerified: integer("emailVerified", { mode: "boolean" }),
    sessionState: json("sessionState").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    lastActive: integer("lastActive", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    // Session lookup by anonymous ID (primary access pattern)
    index("idx_sessions_last_active").on(table.lastActive),
    // For session cleanup (find expired sessions)
    index("idx_sessions_created_at").on(table.createdAt),
  ],
);
```

#### Future PostgreSQL Indexes

| Table          | Column(s)                  | Index Type                               | Rationale                  |
| -------------- | -------------------------- | ---------------------------------------- | -------------------------- |
| `saved_builds` | `user_id`                  | B-tree                                   | Primary lookup             |
| `saved_builds` | `user_id, created_at DESC` | Composite                                | Build list with pagination |
| `saved_builds` | `is_public`                | Partial index (`WHERE is_public = true`) | Public build discovery     |
| `build_gems`   | `build_id, slot_index`     | Composite                                | Equipment reconstruction   |
| `users`        | `email`                    | Unique (where not null)                  | Auth lookup                |
| `users`        | `provider_id`              | Unique (where not null)                  | OAuth lookup               |
| `users`        | `tier, last_active`        | Composite                                | Tier-based analytics       |

### 6.2 Query Optimization

#### Avoid N+1 Queries

```typescript
// BAD: N+1 pattern
const builds = await getBuildsBySession(anonymousId);
for (const build of builds) {
  const gems = await getBuildGems(build.id); // N queries
}

// GOOD: Eager loading
const builds = await db.query.savedBuilds.findMany({
  where: eq(savedBuilds.anonymousId, anonymousId),
  orderBy: [desc(savedBuilds.createdAt)],
  with: {
    gems: true, // Eager load in single query
    resources: true,
  },
});
```

#### Pagination for Build Lists

```typescript
// src/data-access/build-repository.ts
interface ListOptions {
  limit?: number;
  cursor?: string; // createdAt timestamp for cursor pagination
}

export async function getBuildsBySession(
  anonymousId: string,
  options: ListOptions = {},
) {
  const { limit = 20, cursor } = options;

  let query = db
    .select()
    .from(savedBuilds)
    .where(eq(savedBuilds.anonymousId, anonymousId))
    .orderBy(desc(savedBuilds.createdAt))
    .limit(limit);

  if (cursor) {
    query = query.where(lt(savedBuilds.createdAt, new Date(cursor)));
  }

  return query;
}
```

### 6.3 Connection Management

#### Current (SQLite)

```typescript
// src/data-access/db.ts
import { Database } from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// Async lazy-init: do NOT connect at module load
let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    const sqlite = new Database("./data/di-lab.db");
    sqlite.pragma("journal_mode = WAL"); // Better concurrent read performance
    sqlite.pragma("synchronous = NORMAL"); // Balance safety and performance
    sqlite.pragma("cache_size = -64000"); // 64MB cache
    _db = drizzle(sqlite, { schema });
  }
  return _db;
}
```

#### Future (PostgreSQL)

```typescript
// src/data-access/db.ts (PostgreSQL)
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Max connections per instance
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle(pool);
```

**Pool sizing guide:**
| Deployment | Pool Size | Rationale |
|------------|-----------|-----------|
| Single VPS | 5–10 | Low concurrency |
| 2–3 instances | 10–20 per instance | Moderate load |
| 5+ instances | 5–10 per instance + PgBouncer | High load, connection pooling at proxy level |

### 6.4 Migration Performance

**Rule:** Migrations must be backward-compatible. Deploy in phases:

1. **Phase 1:** Add new columns/tables (non-breaking)
2. **Phase 2:** Deploy code that reads/writes both old and new schema
3. **Phase 3:** Backfill data from old to new schema
4. **Phase 4:** Deploy code that reads/writes only new schema
5. **Phase 5:** Drop old columns (cleanup migration)

**Large data migration without downtime:**

```sql
-- For large tables, batch the migration
-- Process in chunks of 1000 rows
DO $$
DECLARE
  batch_size INTEGER := 1000;
  last_id TEXT := '';
BEGIN
  LOOP
    UPDATE saved_builds
    SET awakened_slots_json = json_build_array(
      json_build_object('count', awakened_slots)
    )
    WHERE id IN (
      SELECT id FROM saved_builds
      WHERE id > last_id
      ORDER BY id
      LIMIT batch_size
    );

    GET DIAGNOSTICS batch_size = ROW_COUNT;
    IF batch_size = 0 THEN
      EXIT;
    END IF;

    last_id := (SELECT MAX(id) FROM saved_builds WHERE awakened_slots_json IS NOT NULL);
    PERFORM pg_sleep(0.1); -- Brief pause to reduce load
  END LOOP;
END $$;
```

---

## 7. Monitoring & Measurement

### 7.1 Lighthouse CI

Run Lighthouse on every PR. Fail if any score drops below 90.

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v12
        with:
          urls: |
            http://localhost:3000/
            http://localhost:3000/optimize
            http://localhost:3000/builds
          configPath: "./.github/lighthouse/lighthouserc.json"
          uploadArtifacts: true
          temporaryPublicStorage: true
```

```json
// .github/lighthouse/lighthouserc.json
{
  "ci": {
    "collect": {
      "startServerCommand": "bun start",
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.9 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-byte-weight": ["error", { "maxNumericValue": 500000 }],
        "unused-javascript": ["warn", { "maxNumericValue": 150000 }],
        "render-blocking-resources": ["warn", { "maxNumericValue": 0 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### 7.2 Web Vitals (Real User Monitoring)

Instrument real user metrics using the `web-vitals` library:

```typescript
// src/app/layout.tsx
"use client";

import { useReportWebVitals } from "next/web-vitals";
import type { Metric } from "web-vitals";

export function WebVitalsReporter() {
  useReportWebVitals((metric: Metric) => {
    // Send to analytics endpoint
    if (typeof window !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/metrics",
        JSON.stringify({
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          navigationType: metric.navigationType,
        }),
      );
    }
  });

  return null;
}
```

**API endpoint for metrics collection:**

```typescript
// src/app/api/metrics/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const metric = await request.json();

    // In production, send to your analytics provider:
    // - Vercel Analytics
    // - Google Analytics 4
    // - Sentry Performance
    // - Custom data pipeline

    // For now, log for debugging (remove in production)
    console.log("[WebVital]", metric.name, metric.value, metric.rating);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid metric data" }, { status: 400 });
  }
}
```

### 7.3 API Response Time Monitoring

Log response times with percentiles:

```typescript
// src/shared/middleware/performance-logger.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const responseTimes: number[] = [];
const MAX_SAMPLES = 1000;

export async function logPerformance(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  const start = performance.now();

  try {
    const response = await handler();
    const duration = performance.now() - start;

    responseTimes.push(duration);
    if (responseTimes.length > MAX_SAMPLES) {
      responseTimes.shift();
    }

    // Log slow requests (> 500ms)
    if (duration > 500) {
      console.warn(
        `[SLOW] ${request.method} ${request.nextUrl.pathname} took ${duration.toFixed(0)}ms`,
      );
    }

    // Add timing header for debugging
    response.headers.set("X-Response-Time", `${duration.toFixed(0)}ms`);

    return response;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(
      `[ERROR] ${request.method} ${request.nextUrl.pathname} failed after ${duration.toFixed(0)}ms`,
      error,
    );
    throw error;
  }
}

export function getPerformanceStats() {
  if (responseTimes.length === 0) return { p50: 0, p95: 0, p99: 0 };

  const sorted = [...responseTimes].sort((a, b) => a - b);
  return {
    p50: sorted[Math.floor(sorted.length * 0.5)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)],
    count: sorted.length,
  };
}
```

### 7.4 Custom Metrics to Track

| Metric                    | How to Measure                         | Alert Threshold |
| ------------------------- | -------------------------------------- | --------------- |
| Optimization duration     | `processingTimeMs` in API response     | p95 > 5s        |
| Cache hit rate            | Counter: hits / (hits + misses)        | < 50%           |
| Bundle size               | `@next/bundle-analyzer` output         | Exceeds budget  |
| API error rate            | Error responses / total responses      | > 1%            |
| Database query time       | Drizzle query logging                  | p95 > 100ms     |
| Session invalidation rate | 410 responses / total session requests | > 5%            |

### 7.5 Error Tracking

Use Sentry or equivalent for production error tracking:

```typescript
// src/shared/errors/error-tracker.ts
interface ErrorEvent {
  type: string;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  userId?: string;
  url?: string;
}

// Placeholder for Sentry integration
export function trackError(event: ErrorEvent) {
  // In production: Sentry.captureException()
  console.error("[ErrorTracker]", event);
}

export function trackPerformanceIssue(
  metric: string,
  value: number,
  threshold: number,
) {
  if (value > threshold) {
    trackError({
      type: "PERFORMANCE_DEGRADATION",
      message: `${metric} exceeded threshold: ${value} > ${threshold}`,
      context: { metric, value, threshold },
    });
  }
}
```

---

## 8. Build Optimization

### 8.1 Bundle Analyzer Setup

Add the Next.js bundle analyzer for regular review:

```typescript
// next.config.ts
import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const analyze = process.env.ANALYZE === "true";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      "lucide-react", // Only import used icons
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-popover",
      "@radix-ui/react-tooltip",
    ],
  },
  // ... rest of config
};

export default analyze
  ? withBundleAnalyzer({ enabled: true })(nextConfig)
  : nextConfig;
```

**Dependencies:**

```bash
bun add -D @next/bundle-analyzer
```

**Run analysis:**

```bash
ANALYZE=true bun build
```

This opens an interactive treemap showing bundle composition.

### 8.2 Bundle Analysis Review Process

1. **Run analyzer** on every PR that adds or updates dependencies
2. **Review treemap** for:
   - Unexpectedly large packages
   - Duplicate dependencies
   - Unused code shipped to browser
3. **Compare** against previous build (save `bundle-stats.json`)
4. **Flag** any chunk > 100KB for review
5. **Document** bundle size in PR description

### 8.3 Tree-Shaking Verification

#### Verify lucide-react Tree-Shaking

```typescript
// CORRECT: Import only what you use
import { Sparkles, Search, X } from "lucide-react";

// WRONG: Imports ALL icons (~200KB)
import * as icons from "lucide-react";
```

**Verification:**

- Check bundle analyzer output for `lucide-react` chunk size
- Should be < 10KB for typical usage (10–20 icons)
- If > 50KB, check for wildcard imports

#### Verify Dead Code Elimination

```bash
# Check for unused exports
bunx publint .

# Check bundle for dead code
ANALYZE=true bun build
# Review the "unused code" section in bundle analyzer
```

### 8.4 Dynamic Imports

All heavy modules must be dynamically imported:

```typescript
// Tesseract.js — OCR feature (future)
const processOCR = async (image: File) => {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');
  const { data } = await worker.recognize(image);
  await worker.terminate();
  return data.text;
};

// Chart library — analytics feature (future, Tier 2)
const AnalyticsChart = dynamic(
  () => import('recharts').then(mod => mod.LineChart),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
```

### 8.5 Next.js Config Optimization

```typescript
// next.config.ts — Full optimization config
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // Package import optimization
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-popover",
      "@radix-ui/react-tooltip",
      "date-fns", // If added in future
    ],
  },

  // Transpile packages that need it
  transpilePackages: [], // Add packages here if needed

  // Output for Docker deployment
  output: "standalone",

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Headers (security + caching)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self';",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/gems",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=86400, stale-while-revalidate=3600",
          },
        ],
      },
    ];
  },

  // Redirects (future: old routes to new structure)
  async redirects() {
    return [];
  },
};

export default nextConfig;
```

### 8.6 Build Size Budget Script

Add a CI script that fails if bundle size exceeds budget:

```typescript
// scripts/check-bundle-size.ts
import { readFileSync } from "fs";
import { join } from "path";

interface BuildManifest {
  pages: Record<string, string[]>;
  ampFirstPages: string[];
}

const BUDGETS = {
  "pages/_app": 150_000, // 150KB for app shell
  "pages/": 200_000, // 200KB max per page chunk
  "chunks/": 500_000, // 500KB total shared chunks
};

export function checkBundleSizes() {
  const manifestPath = join(".next", "build-manifest.json");
  const manifest: BuildManifest = JSON.parse(
    readFileSync(manifestPath, "utf-8"),
  );

  for (const [pattern, budget] of Object.entries(BUDGETS)) {
    // Check matching files
    for (const [page, files] of Object.entries(manifest.pages)) {
      if (page.startsWith(pattern)) {
        for (const file of files) {
          const filePath = join(".next", file);
          try {
            const content = readFileSync(filePath);
            if (content.length > budget) {
              console.error(
                `BUDGET EXCEEDED: ${file} (${(content.length / 1024).toFixed(1)}KB > ${(budget / 1024).toFixed(1)}KB)`,
              );
              process.exit(1);
            }
          } catch {
            // File might be in a different location
          }
        }
      }
    }
  }

  console.log("Bundle size check passed");
}

checkBundleSizes();
```

Add to `package.json`:

```json
{
  "scripts": {
    "check-bundle-size": "bun run scripts/check-bundle-size.ts"
  }
}
```

---

## 9. Performance Regression Testing

### 9.1 CI Pipeline Integration

Performance benchmarks run on every PR via a dedicated workflow:

```yaml
# .github/workflows/performance.yml
name: Performance Benchmarks
on:
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 2 * * *" # Nightly run

jobs:
  benchmarks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile

      - name: Run optimizer benchmarks
        run: bun vitest run src/__tests__/performance/ --reporter=verbose

      - name: Check bundle sizes
        run: bun build && bun run check-bundle-size
```

### 9.2 Benchmark Suite Structure

```
src/__tests__/performance/
├── optimizer.bench.ts      # Optimization engine benchmarks
├── api.bench.ts            # API endpoint response time benchmarks
├── rendering.bench.ts      # Component render performance
└── bundle.bench.ts         # Bundle size assertions
```

### 9.3 Performance Regression Thresholds

| Benchmark          | Threshold     | Action if Exceeded             |
| ------------------ | ------------- | ------------------------------ |
| Basic optimization | > 1s          | Fail PR, require investigation |
| Full catalog scan  | > 5s          | Fail PR, require investigation |
| Complex scenario   | > 10s         | Fail PR, require investigation |
| Initial JS bundle  | > 200KB       | Warn, require justification    |
| Total JS bundle    | > 500KB       | Fail PR                        |
| API response time  | > 500ms (p95) | Fail PR                        |
| Lighthouse score   | < 90          | Fail PR                        |

---

## 10. Lighthouse CI Configuration

See [Section 7.1](#71-lighthouse-ci) for the full GitHub Actions workflow and configuration.

### 10.1 Local Lighthouse Testing

```bash
# Install Lighthouse CLI
bun add -D lighthouse

# Run against dev server
bunx lighthouse http://localhost:3000 --view --output=json --output-path=./lh-report.json

# Run against production build
bun start &
bunx lighthouse http://localhost:3000 --preset=desktop --output=json
```

### 10.2 Lighthouse Audit Checklist

For every significant UI change:

- [ ] Run Lighthouse on affected pages
- [ ] Performance score >= 90
- [ ] Accessibility score >= 90
- [ ] Best Practices score >= 90
- [ ] No new "Avoid enormous network payloads" warnings
- [ ] No new "Eliminate render-blocking resources" warnings
- [ ] No new "Reduce unused JavaScript" warnings
- [ ] CLS remains < 0.1
- [ ] LCP remains < 2.5s

---

## 11. Bundle Analysis Workflow

### 11.1 Setup

1. Install bundle analyzer:

   ```bash
   bun add -D @next/bundle-analyzer
   ```

2. Add to `next.config.ts` (see [Section 8.1](#81-bundle-analyzer-setup))

3. Add script to `package.json`:
   ```json
   {
     "scripts": {
       "analyze": "ANALYZE=true bun build"
     }
   }
   ```

### 11.2 Review Process

1. **Before adding a dependency:**
   - Check package size on [Bundlephobia](https://bundlephobia.com/)
   - Check if it supports tree-shaking
   - Check if a lighter alternative exists

2. **After adding a dependency:**

   ```bash
   bun analyze
   ```

   - Review the treemap that opens in browser
   - Identify the new package in the chart
   - Verify it's in the expected chunk (not in initial bundle)
   - Check total bundle size increase

3. **Document findings in PR:**

   ```markdown
   ## Bundle Impact

   - Added: `package-name` (12KB gzipped)
   - Chunk: `optimize/page` (lazy-loaded, not on critical path)
   - Total increase: +12KB to initial bundle
   - Treemap screenshot attached
   ```

### 11.3 Common Bundle Optimizations

| Issue                          | Solution                                              |
| ------------------------------ | ----------------------------------------------------- |
| Large lucide-react bundle      | Use named imports, not `*`                            |
| Tesseract.js in initial bundle | Dynamic import only where needed                      |
| Duplicate React versions       | Check `bun.lock` for version conflicts                |
| Source maps in production      | `productionBrowserSourceMaps: false` in next.config   |
| Unused CSS                     | Tailwind purges automatically; verify `content` paths |
| Large JSON in bundle           | Move to API endpoint, fetch at runtime                |

### 11.4 Bundle Size Trending

Save bundle stats after each release to track trends:

```bash
# Save stats
ANALYZE=true bun build > bundle-stats-$(date +%Y-%m-%d).json

# Compare with previous
bunx bundle-stats-diff bundle-stats-2026-06-01.json bundle-stats-2026-06-05.json
```

---

## Appendix A: Performance Anti-Patterns

| Anti-Pattern                           | Impact                       | Fix                                          |
| -------------------------------------- | ---------------------------- | -------------------------------------------- |
| Importing Tesseract.js at module scope | +2MB to every page           | Dynamic import in OCR component only         |
| `"use client"` on page components      | Ships all page JS to browser | Split into server container + client islands |
| Fetching data in `useEffect`           | Double render, slower FCP    | Use Server Components or React Query         |
| Loading fonts on critical path         | Blocks text rendering        | System fonts, or `font-display: swap`        |
| Images without dimensions              | Layout shift (CLS)           | Set `width`, `height`, use `next/image`      |
| Sync DB connection at module load      | Blocks cold start            | Async lazy-init                              |
| No pagination on list endpoints        | Degrades with data growth    | Cursor-based pagination                      |
| Caching user-specific responses        | Data leakage                 | Use `private` cache for user data            |
| Large inline styles                    | Blocks rendering             | Move to CSS, use Tailwind                    |

## Appendix B: Performance Testing Commands

| Command                                   | Purpose                          |
| ----------------------------------------- | -------------------------------- |
| `bun test:run src/__tests__/performance/` | Run all performance benchmarks   |
| `bun analyze`                             | Open bundle analyzer treemap     |
| `bun run check-bundle-size`               | Verify bundle against budget     |
| `bunx lighthouse http://localhost:3000`   | Run Lighthouse audit             |
| `bunx next analyze`                       | Next.js built-in bundle analysis |

## Appendix C: Quick Reference — Current Performance State

| Area                 | Current State               | Planned Improvement              | Phase   |
| -------------------- | --------------------------- | -------------------------------- | ------- |
| SQLite cold start    | Synchronous at module load  | Async lazy-init                  | Phase 3 |
| Query caching        | None                        | In-memory LRU + tag invalidation | Phase 3 |
| Bundle analysis      | Not configured              | `@next/bundle-analyzer`          | Phase 7 |
| Tesseract.js loading | Static import (future risk) | Dynamic import                   | Phase 7 |
| Font loading         | System fonts (good)         | Maintain                         | N/A     |
| Image optimization   | Not audited                 | `next/image` audit               | Phase 7 |
| Lighthouse CI        | Not configured              | GitHub workflow                  | Phase 7 |
| RUM                  | Not instrumented            | `web-vitals` + API               | Phase 7 |
| API monitoring       | None                        | Response time logging            | Phase 7 |
| Error tracking       | None                        | Sentry integration               | Phase 7 |
