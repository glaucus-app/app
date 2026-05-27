/**
 * Gem-related type definitions for DI-Lab
 * @see specs/feature/PROJ-002-optimizer-ui/data-model.md
 */

// ============================================================================
// Enum Types
// ============================================================================

/** Star rating/tier of legendary gems */
export type StarRating = 1 | 2 | 5;

/** Quality rating for 5-star gems (1-5 stars) */
export type Quality = 1 | 2 | 3 | 4 | 5;

/** Gem rank (1-10) */
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/** Tier ranking for PVP/PVE content */
export type TierRanking = "S" | "A" | "B" | "C" | "D";

/** Effect category classification */
export type EffectCategory =
  | "OFF" // Offensive
  | "DEF" // Defensive
  | "ALL" // Affects multiple stats
  | "DOT" // Damage over time
  | "LOC" // Loss of control
  | "TLOC"; // Targeted loss of control

/** Effect type classification */
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

/** Slot type - base slots (1-8) vs wing slots (9-24) */
export type SlotType = "base" | "wing";

/** Optimization mode for tier ranking priorities */
export type OptimizationMode = "PVP" | "PVE";

// ============================================================================
// Slot Configuration
// ============================================================================

/** Slot configuration constants per FR-006 */
export const SLOT_CONFIG = {
  /** Base gear slots (positions 1-8) */
  BASE_SLOTS: 8,
  /** First wing slot position */
  WING_SLOTS_START: 9,
  /** Maximum wing slots (positions 9-24) */
  MAX_WING_SLOTS: 16,
  /** Total maximum slots (8 base + 16 wing) */
  MAX_TOTAL_SLOTS: 24,
  /** Resonance thresholds for wing slot unlocks */
  RESONANCE_THRESHOLDS: {
    6000: 4,
    7000: 8,
    8000: 12,
    8500: 16,
  } as const,
} as const;

// ============================================================================
// Gem Data Interfaces
// ============================================================================

/** Gem effect definition */
export interface GemEffect {
  category: EffectCategory;
  type: EffectType;
  description: string;
  maxValues: Record<string, string | number>;
  duration?: number; // Effect duration in seconds
  cooldown?: number; // Cooldown in seconds
  isStrifed: boolean; // Affected by BG strife (70% reduction)
}

/** Resonance table structure - varies by star rating */
export interface ResonanceTable {
  /** For 1-star and 2-star gems: single resonance per rank */
  byRank?: Record<number, number>;
  /** For 5-star gems: resonance varies by quality */
  byQuality?: {
    2: Record<number, number>; // 2/5 quality
    3: Record<number, number>; // 3/5 quality
    4: Record<number, number>; // 4/5 quality
    5: Record<number, number>; // 5/5 quality
  };
}

/** Upgrade cost for a rank increase */
export interface UpgradeCost {
  fromRank: number;
  toRank: number;
  gemPower: number;
  copies: number; // Additional R1 copies needed
}

/** Legendary gem definition from static database */
export interface LegendaryGem {
  // Identity
  id: string; // Unique identifier (e.g., "blood-soaked-jade")
  name: string; // Display name (e.g., "Blood Soaked Jade")
  starRating: StarRating;

  // Effect Information
  effects: GemEffect[];
  effectCategories: EffectCategory[];

  // Tier Rankings
  pvpTier: TierRanking;
  pveTier: TierRanking;

  // Upgrade Costs (per rank)
  upgradeCosts: UpgradeCost[];

  // Resonance Data
  resonanceTable: ResonanceTable;

  // Metadata
  source?: string; // Acquisition source (e.g., "Battle Pass", "Event")
  isAuxiliary?: boolean; // Whether this is an auxiliary gem
  icon?: string; // Path to icon image (e.g., "/icons/gems/blood-soaked-jade.png")
}

// ============================================================================
// Equipped Gem Interfaces
// ============================================================================

/** Gem equipped in a build slot */
export interface EquippedGem {
  gemId: string; // Reference to LegendaryGem.id
  quality: Quality; // Quality rating (only meaningful for 5-star gems)
  rank: Rank; // Current rank
  slotPosition: number; // Position in grid (1-24)
  slotType: SlotType; // Derived from slotPosition
  quantity?: number; // For inventory tracking (optional)
}

/** Gem instance in inventory (not equipped) */
export interface InventoryGem {
  id: string; // Unique instance ID
  gemId: string; // Reference to LegendaryGem.id
  quality: Quality; // Quality rating (meaningful for 5-star gems only)
  rank: Rank; // Current rank
}

// ============================================================================
// Helper Functions (Type Guards & Utilities)
// ============================================================================

/**
 * Derive slot type from position
 * @param position - Slot position (1-24)
 * @returns 'base' for positions 1-8, 'wing' for positions 9-24
 */
export function deriveSlotType(position: number): SlotType {
  return position <= SLOT_CONFIG.BASE_SLOTS ? "base" : "wing";
}

/**
 * Check if a quality value is valid
 */
export function isValidQuality(value: number): value is Quality {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

/**
 * Check if a rank value is valid
 */
export function isValidRank(value: number): value is Rank {
  return Number.isInteger(value) && value >= 1 && value <= 10;
}

/**
 * Check if a star rating value is valid
 */
export function isValidStarRating(value: number): value is StarRating {
  return value === 1 || value === 2 || value === 5;
}

/**
 * Calculate unlocked wing slots based on total resonance
 * @param totalResonance - Sum of all equipped gem resonance
 * @returns Number of unlocked wing slots (0-16)
 */
export function calculateUnlockedWingSlots(totalResonance: number): number {
  if (totalResonance >= 8500) return 16;
  if (totalResonance >= 8000) return 12;
  if (totalResonance >= 7000) return 8;
  if (totalResonance >= 6000) return 4;
  return 0;
}

/**
 * Get total available slots (base + unlocked wing)
 */
export function getTotalAvailableSlots(totalResonance: number): number {
  return SLOT_CONFIG.BASE_SLOTS + calculateUnlockedWingSlots(totalResonance);
}

/**
 * Check if a gem can be equipped in a slot (duplicate check)
 * @param gemId - Gem ID to check
 * @param slotPosition - Target slot position
 * @param equippedGems - Currently equipped gems
 * @returns true if gem can be equipped
 */
export function canEquipGem(
  gemId: string,
  slotPosition: number,
  equippedGems: EquippedGem[],
): boolean {
  const slotType = deriveSlotType(slotPosition);

  if (slotType === "base") {
    // No duplicates allowed in base slots
    const baseGems = equippedGems.filter(
      (g) => deriveSlotType(g.slotPosition) === "base",
    );
    return !baseGems.some((g) => g.gemId === gemId);
  }

  // Duplicates allowed in wing slots
  return true;
}
