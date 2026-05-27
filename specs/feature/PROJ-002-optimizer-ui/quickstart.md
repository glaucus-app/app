# Quickstart: Optimizer UI Implementation

**Branch**: `feature/PROJ-002-optimizer-ui` | **Date**: 2026-02-17 | **Version**: 2.0.0

## Overview

This guide provides the implementation order and integration steps for building the Optimizer UI feature. Follow these steps sequentially to build a working implementation.

---

## Prerequisites

Before starting, ensure you have:

- [ ] Bun installed
- [ ] Project cloned and `bun install` completed
- [ ] Development server running (automatically handled by sandbox)
- [ ] Familiarity with Next.js App Router and React 19

---

## Implementation Order

### Phase 1: Foundation (P1)

#### 1.1 TypeScript Types

Create type definitions first to enable type-safe development.

**File**: `src/types/gem.ts`

```typescript
export type StarRating = 1 | 2 | 5;
export type Quality = 1 | 2 | 3 | 4 | 5;
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type TierRanking = "S" | "A" | "B" | "C" | "D";
export type EffectCategory = "OFF" | "DEF" | "ALL" | "DOT" | "LOC" | "TLOC";
export type EffectType =
  | "permanent"
  | "conditional"
  | "Buff"
  | "Debuff"
  | "DOT"
  | "LOC"
  | "Summon"
  | "Conjure"
  | "Damage"
  | "Heal";
export type SlotType = "base" | "wing";
export type OptimizationMode = "PVP" | "PVE";

// See data-model.md for complete type definitions
```

**Files to create**:

- `src/types/gem.ts` - Gem-related types
- `src/types/optimization.ts` - Optimization types
- `src/types/build.ts` - Build management types

---

#### 1.2 Static Gem Data

Create the bundled gem database.

**File**: `src/data/gems.json`

Start with a subset of gems from `docs/legendary-gems.csv`:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-02-14",
  "gems": [
    {
      "id": "berserkers-eye",
      "name": "Berserker's Eye",
      "starRating": 1,
      "effects": [...],
      "pvpTier": "S",
      "pveTier": "S",
      "resonanceTable": {
        "byRank": { "1": 15, "2": 30, ... }
      }
    }
  ]
}
```

**Data Loading Utility**: `src/lib/data/gems.ts`

```typescript
import gemsData from "@/data/gems.json";

export function getGemDatabase(): Map<string, LegendaryGem> {
  const map = new Map();
  for (const gem of gemsData.gems) {
    map.set(gem.id, gem);
  }
  return map;
}

export function getGemsByStarRating(rating: StarRating): LegendaryGem[] {
  return gemsData.gems.filter((gem) => gem.starRating === rating);
}
```

---

#### 1.3 Utility Functions

Create helper functions for calculations.

**File**: `src/lib/utils/calculations.ts`

```typescript
export function calculateResonance(
  gem: LegendaryGem,
  quality: Quality,
  rank: Rank,
): number {
  if (gem.starRating === 1 || gem.starRating === 2) {
    return gem.resonanceTable.byRank?.[rank] ?? 0;
  }
  // 5-star gems use quality-specific resonance
  return gem.resonanceTable.byQuality?.[quality]?.[rank] ?? 0;
}

export function calculateUnlockedWingSlots(totalResonance: number): number {
  if (totalResonance >= 8500) return 16;
  if (totalResonance >= 8000) return 12;
  if (totalResonance >= 7000) return 8;
  if (totalResonance >= 6000) return 4;
  return 0;
}

export function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return value.toLocaleString();
  }
  return String(value);
}
```

**File**: `src/lib/utils/validation.ts`

```typescript
export function validateResourceInput(value: string): number | null {
  const num = parseInt(value.replace(/,/g, ""), 10);
  if (isNaN(num) || num < 0) return null;
  return num;
}

export function canEquipGem(
  gemId: string,
  slotPosition: number,
  equippedGems: EquippedGem[],
): boolean {
  const slotType = slotPosition <= 8 ? "base" : "wing";

  if (slotType === "base") {
    // No duplicates in base slots
    const baseGems = equippedGems.filter((g) => g.slotPosition <= 8);
    return !baseGems.some((g) => g.gemId === gemId);
  }

  return true; // Duplicates allowed in wing slots
}
```

---

#### 1.4 localStorage Persistence

Create the storage layer.

**File**: `src/lib/storage/localStorage.ts`

```typescript
const STORAGE_KEY = "di-lab-v1";

interface LocalStorageSchema {
  version: 1;
  builds: SavedBuild[];
  currentSession?: SessionState;
}

export function loadFromStorage(): LocalStorageSchema {
  if (typeof window === "undefined") {
    return { version: 1, builds: [] };
  }

  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return { version: 1, builds: [] };

  try {
    return JSON.parse(data);
  } catch {
    return { version: 1, builds: [] };
  }
}

export function saveToStorage(data: LocalStorageSchema): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function autoSaveSession(session: SessionState): void {
  const data = loadFromStorage();
  data.currentSession = { ...session, updatedAt: new Date().toISOString() };
  saveToStorage(data);
}

export function loadSession(): SessionState | null {
  const data = loadFromStorage();
  return data.currentSession ?? null;
}
```

---

### Phase 2: UI Components (P1)

#### 2.1 Base UI Components

Create reusable UI primitives.

**Files to create**:

- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Select.tsx`
- `src/components/ui/Modal.tsx`
- `src/components/ui/Skeleton.tsx`
- `src/components/ui/Toast.tsx`

---

#### 2.2 Gem Components

Create gem-related components.

**Files to create**:

- `src/components/gems/GemCatalog.tsx` - Tabbed catalog view
- `src/components/gems/GemCard.tsx` - Individual gem display
- `src/components/gems/GemDetail.tsx` - Detail modal/panel
- `src/components/gems/GemSelector.tsx` - Quality/rank selectors

---

#### 2.3 Optimization Components

Create optimization-related components.

**Files to create**:

- `src/components/optimization/OptimizeButton.tsx`
- `src/components/optimization/ResultsPanel.tsx`
- `src/components/optimization/RecommendationCard.tsx`
- `src/components/optimization/ResourceInput.tsx`

---

#### 2.4 Layout Components

Create layout components.

**Files to create**:

- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/Navigation.tsx`

---

### Phase 3: Pages (P1)

#### 3.1 Optimizer Page

**File**: `src/app/optimize/page.tsx`

Create the main optimizer page with session state management.

---

### Phase 4: API Routes (P1)

#### 4.1 Optimize API

**File**: `src/app/api/optimize/route.ts`

Create the optimization API endpoint with Zod validation.

---

### Phase 5: Build Management (P2)

#### 5.1 Builds Page

**File**: `src/app/builds/page.tsx`

Create the saved builds management page.

---

### Phase 6: Polish (P2-P3)

#### 6.1 Responsive Design

- Ensure all components work at 320px width
- Test touch targets on mobile (minimum 44x44px)
- Verify 60fps scrolling

#### 6.2 Accessibility

- Add ARIA labels
- Test keyboard navigation
- Verify color contrast ratios

#### 6.3 Error Handling

- Implement typed error handling
- Add toast notifications
- Create error boundaries

---

## Testing Checklist

After implementation, verify:

- [ ] Can select gems from catalog (1-star, 2-star, 5-star tabs)
- [ ] Can set quality and rank for equipped gems
- [ ] Resonance auto-calculates when gems are added/removed
- [ ] Wing slots unlock at correct resonance thresholds
- [ ] Cannot add duplicate gems to base slots
- [ ] Can add duplicate gems to wing slots
- [ ] Resource inputs validate correctly (non-negative integers)
- [ ] Optimize button triggers API call
- [ ] Results display with loading skeleton
- [ ] Error messages are specific and actionable
- [ ] Session auto-saves to localStorage
- [ ] Can save, load, and delete builds
- [ ] Mobile layout works without horizontal scrolling
- [ ] All interactive elements have 44x44px touch targets
- [ ] Keyboard navigation works for all controls

---

## Integration Steps

1. **Start with types**: Create all type definitions first
2. **Add static data**: Create gems.json with subset of data
3. **Build utilities**: Create calculation and storage functions
4. **Create UI primitives**: Build base components (Button, Card, Input, etc.)
5. **Build gem components**: Create GemCard, GemCatalog, GemSelector
6. **Create optimization components**: Build ResourceInput, ResultsPanel
7. **Create page**: Assemble components in optimize page
8. **Add API route**: Implement optimization endpoint
9. **Add persistence**: Implement save/load functionality
10. **Polish**: Add responsive design, accessibility, error handling

---

## Performance Targets

| Metric                 | Target | How to Verify    |
| ---------------------- | ------ | ---------------- |
| First Contentful Paint | < 1.5s | Lighthouse       |
| Time to Interactive    | < 3s   | Lighthouse       |
| Optimization API       | < 5s   | Network tab      |
| Mobile scroll          | 60fps  | Chrome DevTools  |
| Lighthouse Score       | > 90   | Lighthouse audit |

---

## Common Issues & Solutions

### Issue: Hydration mismatch with localStorage

**Solution**: Check for `typeof window !== 'undefined'` before accessing localStorage, or use useEffect for client-only code.

### Issue: Gem data not loading

**Solution**: Ensure gems.json is in `src/data/` and imported correctly. JSON imports work natively in Next.js.

### Issue: Select not working on mobile

**Solution**: Use native `<select>` elements with proper Tailwind classes for best mobile compatibility.

### Issue: Resonance not recalculating

**Solution**: Use useEffect to recalculate when gems array changes, or use useMemo for derived state.
