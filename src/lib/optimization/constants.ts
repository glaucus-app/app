/**
 * Tunable constants for the optimization engine
 * @module optimization/constants
 */

import type { TierRanking, ResonanceThreshold, StarRating } from "./types";

/**
 * Tier multipliers for power calculation
 * Higher tier = higher priority for upgrades
 */
export const TIER_MULTIPLIERS: Record<TierRanking, number> = {
  S: 1.5,
  A: 1.3,
  B: 1.1,
  C: 0.9,
  D: 0.7,
} as const;

/**
 * Weight for resonance in power calculation
 */
export const RESONANCE_WEIGHT = 1.0;

/**
 * Weight for Combat Rating in power calculation
 * CR is weighted higher as it directly impacts damage/output
 */
export const CR_WEIGHT = 2.0;

/**
 * Resonance thresholds for wing slot unlocks
 * Each threshold unlocks additional wing slots
 */
export const RESONANCE_THRESHOLDS: ResonanceThreshold[] = [
  { resonance: 6000, slots: 4 },
  { resonance: 7000, slots: 8 },
  { resonance: 8000, slots: 12 },
  { resonance: 8500, slots: 16 },
];

/**
 * Bonus multiplier when upgrade crosses a resonance threshold
 */
export const THRESHOLD_BONUS = 1.2;

/**
 * Diminishing returns factor per rank above 1
 * Each rank increase reduces the power gain slightly
 */
export const DIMINISHING_FACTOR_PER_RANK = 0.03;

/**
 * Minimum diminishing factor (floor)
 */
export const MIN_DIMINISHING_FACTOR = 0.5;

/**
 * Maximum number of gem slots
 */
export const MAX_GEMS = 24;

/**
 * Maximum rank for gems
 */
export const MAX_RANK = 10;

/**
 * Minimum rank for gems
 */
export const MIN_RANK = 1;

/**
 * Resonance table for 1-star gems by rank
 */
export const ONE_STAR_RESONANCE: Record<number, number> = {
  1: 15,
  2: 30,
  3: 45,
  4: 60,
  5: 75,
  6: 90,
  7: 105,
  8: 120,
  9: 135,
  10: 150,
};

/**
 * Resonance table for 2-star gems by rank
 */
export const TWO_STAR_RESONANCE: Record<number, number> = {
  1: 30,
  2: 60,
  3: 90,
  4: 120,
  5: 150,
  6: 180,
  7: 210,
  8: 240,
  9: 270,
  10: 300,
};

/**
 * Resonance table for 5-star gems by quality and rank
 */
export const FIVE_STAR_RESONANCE: Record<number, Record<number, number>> = {
  2: {
    1: 30,
    2: 110,
    3: 190,
    4: 280,
    5: 370,
    6: 460,
    7: 550,
    8: 640,
    9: 730,
    10: 820,
  },
  3: {
    1: 60,
    2: 140,
    3: 230,
    4: 320,
    5: 410,
    6: 500,
    7: 590,
    8: 680,
    9: 770,
    10: 860,
  },
  4: {
    1: 90,
    2: 180,
    3: 270,
    4: 360,
    5: 450,
    6: 540,
    7: 630,
    8: 720,
    9: 810,
    10: 900,
  },
  5: {
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
    6: 600,
    7: 700,
    8: 800,
    9: 900,
    10: 1000,
  },
};

/**
 * Combat Rating table for 1-star gems by rank
 * Formula: CR = 4 + (rank × 4)
 */
export const ONE_STAR_CR: Record<number, number> = {
  1: 8,
  2: 12,
  3: 16,
  4: 20,
  5: 24,
  6: 28,
  7: 32,
  8: 36,
  9: 40,
  10: 44,
};

/**
 * Combat Rating table for 2-star gems by rank
 * Formula: CR = 6 + (rank × 6)
 */
export const TWO_STAR_CR: Record<number, number> = {
  1: 12,
  2: 18,
  3: 24,
  4: 30,
  5: 36,
  6: 42,
  7: 48,
  8: 54,
  9: 60,
  10: 66,
};

/**
 * Combat Rating table for 5-star gems by quality and rank
 */
export const FIVE_STAR_CR: Record<number, Record<number, number>> = {
  2: {
    1: 12,
    2: 24,
    3: 36,
    4: 48,
    5: 60,
    6: 72,
    7: 84,
    8: 96,
    9: 108,
    10: 120,
  },
  3: {
    1: 16,
    2: 32,
    3: 48,
    4: 64,
    5: 80,
    6: 96,
    7: 112,
    8: 128,
    9: 144,
    10: 160,
  },
  4: {
    1: 20,
    2: 40,
    3: 60,
    4: 80,
    5: 100,
    6: 120,
    7: 140,
    8: 160,
    9: 180,
    10: 200,
  },
  5: {
    1: 24,
    2: 48,
    3: 72,
    4: 96,
    5: 120,
    6: 144,
    7: 168,
    8: 192,
    9: 216,
    10: 240,
  },
};

/**
 * Gem Power cost for upgrades by star rating and rank
 */
export const GEM_POWER_COSTS: Record<StarRating, Record<number, number>> = {
  1: {
    1: 15, // 1 → 2
    2: 30, // 2 → 3
    3: 45, // 3 → 4
    4: 60, // 4 → 5
    5: 75, // 5 → 6
    6: 90, // 6 → 7
    7: 105, // 7 → 8
    8: 120, // 8 → 9
    9: 135, // 9 → 10
  },
  2: {
    1: 30, // 1 → 2
    2: 60, // 2 → 3
    3: 90, // 3 → 4
    4: 120, // 4 → 5
    5: 150, // 5 → 6
    6: 180, // 6 → 7
    7: 210, // 7 → 8
    8: 240, // 8 → 9
    9: 270, // 9 → 10
  },
  5: {
    1: 60, // 1 → 2
    2: 120, // 2 → 3
    3: 180, // 3 → 4
    4: 240, // 4 → 5
    5: 300, // 5 → 6
    6: 360, // 6 → 7
    7: 420, // 7 → 8
    8: 480, // 8 → 9
    9: 540, // 9 → 10
  },
};

/**
 * Number of gem copies required for each rank upgrade
 * Currently all upgrades require 1 copy
 */
export const COPIES_REQUIRED_PER_RANK = 1;

/**
 * Get the gem power cost for upgrading from currentRank to currentRank + 1
 * @param starRating - Star rating of the gem (1, 2, or 5)
 * @param currentRank - Current rank (upgrade from this rank)
 * @returns Gem Power cost, or 0 if at max rank
 */
export function getGemPowerCost(
  starRating: StarRating,
  currentRank: number,
): number {
  if (currentRank >= MAX_RANK) return 0;
  return GEM_POWER_COSTS[starRating][currentRank] ?? 0;
}

/**
 * Get the resonance for a gem at a specific rank and quality
 * @param starRating - Star rating (1, 2, or 5)
 * @param rank - Current rank (1-10)
 * @param quality - Quality rating (1-5, only used for 5-star gems)
 * @returns Resonance value
 */
export function getResonance(
  starRating: StarRating,
  rank: number,
  quality: number = 1,
): number {
  switch (starRating) {
    case 1:
      return ONE_STAR_RESONANCE[rank] ?? 0;
    case 2:
      return TWO_STAR_RESONANCE[rank] ?? 0;
    case 5:
      // For 5-star gems, quality must be 2-5
      const q = Math.max(2, Math.min(5, quality)) as 2 | 3 | 4 | 5;
      return FIVE_STAR_RESONANCE[q][rank] ?? 0;
    default:
      return 0;
  }
}

/**
 * Get the Combat Rating for a gem at a specific rank and quality
 * @param starRating - Star rating (1, 2, or 5)
 * @param rank - Current rank (1-10)
 * @param quality - Quality rating (1-5, only used for 5-star gems)
 * @returns CR value
 */
export function getCR(
  starRating: StarRating,
  rank: number,
  quality: number = 1,
): number {
  switch (starRating) {
    case 1:
      return ONE_STAR_CR[rank] ?? 0;
    case 2:
      return TWO_STAR_CR[rank] ?? 0;
    case 5:
      // For 5-star gems, quality must be 2-5
      const q = Math.max(2, Math.min(5, quality)) as 2 | 3 | 4 | 5;
      return FIVE_STAR_CR[q][rank] ?? 0;
    default:
      return 0;
  }
}
