/**
 * Scoring functions for the optimization engine
 * @module optimization/scoring
 */

import type {
  EquippedGem,
  GameMode,
  LegendaryGem,
  PowerBreakdown,
  TierRanking,
} from "./types";
import {
  getResonance,
  getCR,
  TIER_MULTIPLIERS,
  RESONANCE_WEIGHT,
  CR_WEIGHT,
  DIMINISHING_FACTOR_PER_RANK,
  MIN_DIMINISHING_FACTOR,
  MAX_RANK,
} from "./constants";
import {
  getResonanceThresholdBonus,
  calculateTotalResonance,
  calculateTotalResonanceWithUpgrades,
} from "./resonance";

/**
 * Get the tier ranking for a gem in a specific game mode
 * @param gemDefinition - The gem definition
 * @param mode - Game mode (PVP or PVE)
 * @returns Tier ranking
 */
export function getTierRanking(
  gemDefinition: LegendaryGem,
  mode: GameMode,
): TierRanking {
  return mode === "PVP" ? gemDefinition.pvpTier : gemDefinition.pveTier;
}

/**
 * Calculate the power value for a gem at a specific rank
 * Power = (Resonance × RESONANCE_WEIGHT + CR × CR_WEIGHT) × tierMultiplier × thresholdBonus × diminishingFactor
 *
 * @param gemDefinition - The gem definition
 * @param rank - Rank to calculate power for
 * @param quality - Quality rating
 * @param mode - Game mode
 * @param totalResonance - Current total resonance (for threshold calculation)
 * @returns Power value
 */
export function calculatePower(
  gemDefinition: LegendaryGem,
  rank: number,
  quality: number,
  mode: GameMode,
  totalResonance: number = 0,
): number {
  const breakdown = calculatePowerBreakdown(
    gemDefinition,
    rank,
    quality,
    mode,
    totalResonance,
  );
  return breakdown.finalPower;
}

/**
 * Calculate a detailed power breakdown for debugging
 * @param gemDefinition - The gem definition
 * @param rank - Rank to calculate power for
 * @param quality - Quality rating
 * @param mode - Game mode
 * @param totalResonance - Current total resonance (for threshold calculation)
 * @returns Detailed power breakdown
 */
export function calculatePowerBreakdown(
  gemDefinition: LegendaryGem,
  rank: number,
  quality: number,
  mode: GameMode,
  totalResonance: number = 0,
): PowerBreakdown {
  // Get base stats
  const resonance = getResonance(gemDefinition.starRating, rank, quality);
  const cr = getCR(gemDefinition.starRating, rank, quality);

  // Calculate base power
  const basePower = resonance * RESONANCE_WEIGHT + cr * CR_WEIGHT;

  // Get tier multiplier
  const tier = getTierRanking(gemDefinition, mode);
  const tierMultiplier = TIER_MULTIPLIERS[tier];

  // Calculate threshold bonus (this will be computed in context of full build)
  // For now, use 1.0 as baseline
  const thresholdBonus = 1.0;

  // Calculate diminishing returns
  const diminishingFactor = Math.max(
    MIN_DIMINISHING_FACTOR,
    1 - (rank - 1) * DIMINISHING_FACTOR_PER_RANK,
  );

  // Final power
  const finalPower =
    basePower * tierMultiplier * thresholdBonus * diminishingFactor;

  return {
    resonance,
    cr,
    basePower,
    tierMultiplier,
    thresholdBonus,
    diminishingFactor,
    finalPower,
  };
}

/**
 * Calculate the power gain from upgrading a gem
 * @param gemDefinition - The gem definition
 * @param fromRank - Current rank
 * @param toRank - Target rank
 * @param quality - Quality rating
 * @param mode - Game mode
 * @param currentTotalResonance - Current total resonance before upgrade
 * @param gemDatabase - Map of gem ID to gem definition (for threshold calculation)
 * @param gems - All equipped gems (for threshold calculation)
 * @param upgradesMap - Map of slot to new rank for pending upgrades
 * @returns Power gain value
 */
export function calculatePowerGain(
  gemDefinition: LegendaryGem,
  fromRank: number,
  toRank: number,
  quality: number,
  mode: GameMode,
  currentTotalResonance: number,
  gemDatabase?: Map<string, LegendaryGem>,
  gems?: EquippedGem[],
  upgradesMap?: Map<number, number>,
): number {
  // Calculate power at current rank
  const currentPower = calculatePower(gemDefinition, fromRank, quality, mode);

  // Calculate power at new rank
  const newPower = calculatePower(gemDefinition, toRank, quality, mode);

  // Calculate base power gain
  let powerGain = newPower - currentPower;

  // Check for resonance threshold bonus
  if (gemDatabase && gems) {
    // Calculate resonance before this upgrade
    const resonanceBefore = upgradesMap
      ? calculateTotalResonanceWithUpgrades(gems, gemDatabase, upgradesMap)
      : currentTotalResonance;

    // Calculate resonance after this upgrade
    const resonanceGain =
      getResonance(gemDefinition.starRating, toRank, quality) -
      getResonance(gemDefinition.starRating, fromRank, quality);
    const resonanceAfter = resonanceBefore + resonanceGain;

    // Apply threshold bonus if crossing a threshold
    const thresholdBonus = getResonanceThresholdBonus(
      resonanceBefore,
      resonanceAfter,
    );
    if (thresholdBonus > 1.0) {
      // Bonus applies to the entire gem's power, not just the gain
      powerGain *= thresholdBonus;
    }
  }

  return powerGain;
}

/**
 * Calculate the priority score (ROI) for an upgrade
 * Higher score = better return on investment
 *
 * @param powerGain - Power gain from upgrade
 * @param gemPowerCost - Gem Power cost
 * @param copiesCost - Copies cost
 * @returns Priority score (higher = better)
 */
export function calculatePriorityScore(
  powerGain: number,
  gemPowerCost: number,
  copiesCost: number,
): number {
  // Avoid division by zero
  if (gemPowerCost === 0 && copiesCost === 0) return 0;

  // Weight the costs (gem power is more accessible than copies)
  const weightedCost = gemPowerCost + copiesCost * 100;

  // ROI = power gain per resource unit
  return powerGain / Math.max(1, weightedCost);
}

/**
 * Calculate the priority score for a specific upgrade
 * @param gem - The equipped gem to upgrade
 * @param gemDefinition - The gem definition
 * @param toRank - Target rank
 * @param mode - Game mode
 * @param currentTotalResonance - Current total resonance
 * @param gemPowerCost - Gem Power cost for the upgrade
 * @param copiesAvailable - Number of copies available for this gem
 * @param gemDatabase - Map of gem ID to gem definition
 * @param gems - All equipped gems
 * @param upgradesMap - Map of slot to new rank for pending upgrades
 * @returns Priority score and power gain
 */
export function calculateUpgradePriority(
  gem: EquippedGem,
  gemDefinition: LegendaryGem,
  toRank: number,
  mode: GameMode,
  currentTotalResonance: number,
  gemPowerCost: number,
  copiesAvailable: number,
  gemDatabase?: Map<string, LegendaryGem>,
  gems?: EquippedGem[],
  upgradesMap?: Map<number, number>,
): { score: number; powerGain: number } {
  // Check if we have enough copies
  const copiesRequired = toRank - gem.currentRank;
  if (copiesRequired > copiesAvailable) {
    return { score: 0, powerGain: 0 };
  }

  // Calculate power gain
  const powerGain = calculatePowerGain(
    gemDefinition,
    gem.currentRank,
    toRank,
    gem.quality,
    mode,
    currentTotalResonance,
    gemDatabase,
    gems,
    upgradesMap,
  );

  // Calculate priority score
  const score = calculatePriorityScore(powerGain, gemPowerCost, copiesRequired);

  return { score, powerGain };
}

/**
 * Check if a gem can be upgraded further
 * @param currentRank - Current rank of the gem
 * @returns Whether the gem can be upgraded
 */
export function canUpgrade(currentRank: number): boolean {
  return currentRank < MAX_RANK;
}

/**
 * Generate reasoning text for an upgrade recommendation
 * @param gemName - Name of the gem
 * @param fromRank - Current rank
 * @param toRank - Target rank
 * @param powerGain - Power gain from upgrade
 * @param tier - Tier ranking
 * @param thresholdBonus - Whether a threshold bonus was applied
 * @returns Human-readable reasoning
 */
export function generateReasoning(
  gemName: string,
  fromRank: number,
  toRank: number,
  powerGain: number,
  tier: TierRanking,
  thresholdBonus: boolean,
): string {
  const parts: string[] = [];

  // Rank change
  parts.push(`Upgrade ${gemName} from rank ${fromRank} to ${toRank}`);

  // Tier context
  const tierEmoji = tier === "S" ? "⭐" : tier === "A" ? "🟢" : "";
  parts.push(`${tierEmoji} ${tier}-tier gem in current mode`);

  // Power gain
  parts.push(`Expected power gain: +${powerGain.toFixed(1)}`);

  // Threshold bonus
  if (thresholdBonus) {
    parts.push("🎯 Crosses resonance threshold for wing slot unlock");
  }

  return parts.join(". ") + ".";
}
