/**
 * Optimization-related type definitions for DI-Lab
 * @see specs/feature/PROJ-002-optimizer-ui/data-model.md
 */

import type { EquippedGem, OptimizationMode } from "./gem";

// ============================================================================
// Error Types
// ============================================================================

/** Error types for optimization failures */
export type OptimizationErrorType =
  | "validation"
  | "insufficient-resources"
  | "timeout"
  | "server-error"
  | "rate-limited";

/** Structured error response */
export interface OptimizationError {
  type: OptimizationErrorType;
  title: string;
  message: string;
  guidance: string; // Actionable next step
  details?: Record<string, unknown>;
}

// ============================================================================
// Resource Types
// ============================================================================

/** Crest counts for Elder Rift runs */
export interface CrestCounts {
  eternal: number; // Eternal Legendary Crests (guaranteed 1-star+ drop, sellable)
  legendary: number; // Legendary Crests (guaranteed 1-star+ drop, bound)
  rare: number; // Rare Crests (5% chance for 1-star gem)
}

/** Full resource inventory for optimization */
export interface ResourceInventory {
  // Primary upgrade currency
  gemPower: number;

  // Inventory gems - gems owned but not equipped
  inventoryGems: InventoryGemForOptimization[];

  // Crafting materials
  telluricPearls: number; // For 5-star and event-exclusive 2-star gem crafting
  telluricFragments: number; // For 1-star and 2-star gem crafting
  fadingEmbers: number; // For gem crafting and Eternal Crests

  // Currency
  platinum: number; // For market purchases and awakening

  // Crests for Elder Rifts
  crestCounts: CrestCounts;

  // Awakening resources
  dawningEchoes: number; // For awakened slot tracking (10,000 Platinum or 1,000 Orbs each)
}

/** Inventory gem for optimization (minimal representation) */
export interface InventoryGemForOptimization {
  id: string; // Unique instance ID
  gemId: string; // Reference to LegendaryGem.id
  quality: number; // Quality rating (1-5, meaningful for 5-star gems only)
  rank: number; // Current rank (1-10)
}

// ============================================================================
// Optimization Result Types
// ============================================================================

/** Alternative upgrade option */
export interface AlternativeUpgrade {
  description: string;
  powerGain: number;
  resourceCost: Partial<ResourceInventory>;
  tradeoff: string; // Why this alternative might be preferred
}

/** Single upgrade recommendation */
export interface UpgradeRecommendation {
  id: string; // Unique recommendation ID
  targetGem: EquippedGem; // The gem to upgrade
  currentRank: number;
  targetRank: number;
  resourceCost: Partial<ResourceInventory>;
  powerGain: number; // Expected CR/resonance improvement
  priorityRank: number; // Position in sorted recommendations (1 = highest priority)
  reasoning: string; // Human-readable explanation
  alternatives?: AlternativeUpgrade[];
}

/** Complete optimization result */
export interface OptimizationResult {
  recommendations: UpgradeRecommendation[];
  totalPowerGain: number; // Sum of all power gains
  totalResourceCost: Partial<ResourceInventory>;
  mode: OptimizationMode;
  calculatedAt: string; // ISO timestamp
  processingTime: number; // milliseconds
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/** Optimization API request body (simplified resource model per API contract) */
export interface OptimizeRequest {
  gems: EquippedGem[];
  resources: {
    gemPower: number;
    copyInventory: Record<string, number>; // Map of gemId to R1 copy count
  };
  mode?: OptimizationMode;
}

/** Optimization API response (success) */
export interface OptimizeResponse {
  recommendations: UpgradeRecommendation[];
  totalPowerGain: number;
  totalResourceCost: {
    gemPower: number;
    copies: number;
  };
  mode: OptimizationMode;
  calculatedAt: string;
  processingTime: number;
}

/** Optimization API error response */
export interface OptimizeErrorResponse {
  type: OptimizationErrorType;
  title: string;
  message: string;
  guidance: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Acquisition Path Types
// ============================================================================

/** Acquisition path type for gem upgrades */
export type AcquisitionPathType =
  | "gem-power-upgrade"
  | "craft-pearl"
  | "craft-fragment"
  | "craft-ember"
  | "market-buy"
  | "crest-run";

/** Run requirements for crest-based acquisition */
export interface RunRequirements {
  crestType: "eternal" | "legendary" | "rare";
  runsNeeded: number;
  expectedGems: number;
}

/** Acquisition path for optimization recommendations */
export interface AcquisitionPath {
  type: AcquisitionPathType;
  description: string;
  resourceCost: Partial<ResourceInventory>;
  platinumEquivalent: number; // For cost comparison
  expectedOutcome: {
    gemId: string;
    rank: number;
    quality?: number;
  };
  runRequirements?: RunRequirements;
}

// ============================================================================
// Crafting Conversion Rates (per FR-054)
// ============================================================================

export const CRAFTING_RATES = {
  /** 20 Telluric Fragments = 1-star legendary gem */
  FRAGMENTS_TO_1STAR: 20,
  /** 80 Telluric Fragments = 2-star legendary gem */
  FRAGMENTS_TO_2STAR: 80,
  /** 320 Fading Embers = 1 Eternal Legendary Crest */
  EMBERS_TO_ETERNAL_CREST: 320,
  /** 5 Fading Embers = 1 Telluric Pearl (suboptimal) */
  EMBERS_TO_PEARL: 5,
  /** Dawning Echo cost for awakening (Platinum) */
  DAWNING_ECHO_PLATINUM: 10000,
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a default empty resource inventory
 */
export function createEmptyResourceInventory(): ResourceInventory {
  return {
    gemPower: 0,
    inventoryGems: [],
    telluricPearls: 0,
    telluricFragments: 0,
    fadingEmbers: 0,
    platinum: 0,
    crestCounts: {
      eternal: 0,
      legendary: 0,
      rare: 0,
    },
    dawningEchoes: 0,
  };
}

/**
 * Check if an error is an optimization error
 */
export function isOptimizationError(
  error: unknown,
): error is OptimizationError {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    "title" in error &&
    "message" in error &&
    "guidance" in error
  );
}
