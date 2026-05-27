/**
 * Main optimization engine for gem upgrade recommendations
 * @module optimization/engine
 */

import type {
  EquippedGem,
  GameMode,
  LegendaryGem,
  OptimizationInput,
  OptimizationResult,
  UpgradeCandidate,
  UpgradeRecommendation,
  InfusionRecommendation,
  InfusionSourceGem,
  ExtendedOptimizationInput,
} from "./types";
import { getResonance } from "./constants";
import { calculateTotalResonance } from "./resonance";
import {
  getTierRanking,
  calculatePowerGain,
  calculatePriorityScore,
  generateReasoning,
} from "./scoring";
import {
  generatePossibleUpgrades,
  filterAffordableUpgrades,
  selectUpgradesWithinBudget,
  calculateTotalCost,
} from "./resources";

/**
 * Main optimization function implementing the weighted greedy algorithm
 *
 * Algorithm steps:
 * 1. Generate all possible upgrades
 * 2. Filter by resource constraints
 * 3. Calculate priority scores
 * 4. Sort by priority (greedy)
 * 5. Select within budget
 * 6. Generate reasoning text
 * 7. Generate infusion recommendations (if advanced strategies enabled)
 * 8. Return result with timing
 *
 * @param input - Optimization input with gems, resources, and mode
 * @returns Optimization result with recommendations
 */
export function optimize(input: OptimizationInput): OptimizationResult {
  const startTime = performance.now();

  // Handle empty input
  if (!input.gems || input.gems.length === 0) {
    return createEmptyResult(input.mode, startTime);
  }

  // Create or use provided gem database
  const gemDatabase = input.gemDatabase ?? new Map<string, LegendaryGem>();

  // Step 1: Generate all possible upgrades
  const possibleUpgrades = generatePossibleUpgrades(input.gems, gemDatabase);

  // Handle no upgrades possible
  if (possibleUpgrades.length === 0) {
    return createEmptyResult(input.mode, startTime);
  }

  // Step 2: Calculate current total resonance for threshold detection
  const currentTotalResonance = calculateTotalResonance(
    input.gems,
    gemDatabase,
  );

  // Step 3: Build upgrade candidates with priority scores
  const candidates: UpgradeCandidate[] = possibleUpgrades.map((upgrade) => {
    const gemDef = gemDatabase.get(upgrade.gemId);
    if (!gemDef) {
      throw new Error(`Gem definition not found for ID: ${upgrade.gemId}`);
    }

    const gem = input.gems.find((g) => g.slot === upgrade.slot);
    if (!gem) {
      throw new Error(`Gem not found in slot: ${upgrade.slot}`);
    }

    const tier = getTierRanking(gemDef, input.mode);
    const powerGain = calculatePowerGain(
      gemDef,
      upgrade.currentRank,
      upgrade.targetRank,
      gem.quality,
      input.mode,
      currentTotalResonance,
    );

    const priorityScore = calculatePriorityScore(
      powerGain,
      upgrade.gemPowerCost,
      upgrade.copiesRequired,
    );

    return {
      gemId: upgrade.gemId,
      slot: upgrade.slot,
      currentRank: upgrade.currentRank,
      targetRank: upgrade.targetRank,
      gemPowerCost: upgrade.gemPowerCost,
      copiesRequired: upgrade.copiesRequired,
      powerGain,
      priorityScore,
      tier,
    };
  });

  // Step 4: Filter by resource constraints
  const affordableCandidates = filterAffordableUpgrades(
    candidates,
    input.resources,
  );

  // Handle no affordable upgrades
  if (affordableCandidates.length === 0) {
    return createEmptyResult(input.mode, startTime);
  }

  // Step 5: Sort by priority score (descending - highest ROI first)
  affordableCandidates.sort((a, b) => b.priorityScore - a.priorityScore);

  // Step 6: Select upgrades within budget (greedy selection)
  const { selected } = selectUpgradesWithinBudget(
    affordableCandidates,
    input.resources,
  );

  // Step 7: Generate recommendations with reasoning
  const recommendations = generateRecommendations(
    selected,
    gemDatabase,
    input.gems,
    input.mode,
    currentTotalResonance,
  );

  // Step 8: Calculate totals
  const totalCost = calculateTotalCost(recommendations);
  let totalPowerGain = recommendations.reduce(
    (sum, rec) => sum + rec.powerGain,
    0,
  );

  // Step 9: Generate infusion recommendations if advanced strategies enabled (T100b - FR-037b)
  let infusionRecommendations: InfusionRecommendation[] | undefined;
  const extendedInput = input as ExtendedOptimizationInput;
  if (extendedInput.advancedStrategies) {
    infusionRecommendations = generateInfusionRecommendations(
      input.gems,
      gemDatabase,
      input.mode,
      input.resources.gemPower,
      currentTotalResonance,
    );

    // Add infusion power gains to total
    const infusionPowerGain = infusionRecommendations.reduce(
      (sum, rec) => sum + rec.powerGain,
      0,
    );
    totalPowerGain += infusionPowerGain;
  }

  const endTime = performance.now();

  return {
    recommendations,
    infusionRecommendations,
    totalPowerGain,
    totalResourceCost: totalCost,
    mode: input.mode,
    calculatedAt: new Date().toISOString(),
    processingTime: endTime - startTime,
  };
}

/**
 * Generate upgrade recommendations with reasoning text
 */
function generateRecommendations(
  candidates: UpgradeCandidate[],
  gemDatabase: Map<string, LegendaryGem>,
  gems: EquippedGem[],
  mode: GameMode,
  currentTotalResonance: number,
): UpgradeRecommendation[] {
  const recommendations: UpgradeRecommendation[] = [];
  let runningResonance = currentTotalResonance;

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    const gemDef = gemDatabase.get(candidate.gemId);
    const gem = gems.find((g) => g.slot === candidate.slot);

    if (!gemDef || !gem) continue;

    // Check for threshold bonus
    const resonanceBefore = runningResonance;
    const resonanceGain = calculateResonanceGain(
      gemDef,
      gem.quality,
      candidate.currentRank,
      candidate.targetRank,
    );
    const resonanceAfter = resonanceBefore + resonanceGain;

    // Check if this crosses a threshold
    let thresholdBonus = false;
    const thresholds = [6000, 7000, 8000, 8500];
    for (const threshold of thresholds) {
      if (resonanceBefore < threshold && resonanceAfter >= threshold) {
        thresholdBonus = true;
        break;
      }
    }

    // Generate reasoning
    const reasoning = generateReasoning(
      gemDef.name,
      candidate.currentRank,
      candidate.targetRank,
      candidate.powerGain,
      candidate.tier,
      thresholdBonus,
    );

    recommendations.push({
      gemId: candidate.gemId,
      slot: candidate.slot,
      fromRank: candidate.currentRank,
      toRank: candidate.targetRank,
      powerGain: candidate.powerGain,
      gemPowerCost: candidate.gemPowerCost,
      copiesCost: candidate.copiesRequired,
      priorityRank: i + 1,
      reasoning,
    });

    // Update running resonance
    runningResonance = resonanceAfter;
  }

  return recommendations;
}

/**
 * Calculate resonance gain from an upgrade
 */
function calculateResonanceGain(
  gemDef: LegendaryGem,
  quality: number,
  fromRank: number,
  toRank: number,
): number {
  const before = getResonance(gemDef.starRating, fromRank, quality);
  const after = getResonance(gemDef.starRating, toRank, quality);
  return after - before;
}

// ============================================================================
// Infusion Recommendations (T100b - FR-037b)
// ============================================================================

/**
 * Infusion slot configuration for dormant 5-star gems
 * Based on docs/legendary-gems/upgrading.md
 */
const INFUSION_SLOTS: Record<number, { slots: number; maxResonance: number }> =
  {
    4: { slots: 2, maxResonance: 40 },
    5: { slots: 2, maxResonance: 40 },
    6: { slots: 3, maxResonance: 60 },
    7: { slots: 4, maxResonance: 170 },
    8: { slots: 5, maxResonance: 280 },
    9: { slots: 5, maxResonance: 280 },
    10: { slots: 5, maxResonance: 280 },
  };

/**
 * Resonance contributed by source gems based on star rating and rank
 * 2-star: 2 resonance per rank, 5-star: 10 resonance per rank (from docs)
 */
function getSourceGemResonance(starRating: number, rank: number): number {
  if (starRating === 2) {
    return 2 * rank;
  } else if (starRating === 5) {
    return 10 * rank;
  }
  // 1-star gems don't provide meaningful infusion resonance
  return 0;
}

/**
 * Generate infusion recommendations for dormant 5-star gems
 * (T100b - FR-037b)
 *
 * Dormant 5-star gems can gain additional resonance by socketing
 * source gems (2-star or 5-star) and infusing with Gem Power.
 * Only R10 5-star gems can gain additional resonance from infusion.
 */
function generateInfusionRecommendations(
  gems: EquippedGem[],
  gemDatabase: Map<string, LegendaryGem>,
  mode: GameMode,
  availableGemPower: number,
  currentTotalResonance: number,
): InfusionRecommendation[] {
  const recommendations: InfusionRecommendation[] = [];

  // Find 5-star gems that could benefit from infusion (R7+ only have slots)
  const eligibleGems = gems.filter((gem) => {
    const gemDef = gemDatabase.get(gem.gemId);
    return gemDef?.starRating === 5 && gem.currentRank >= 7;
  });

  for (const gem of eligibleGems) {
    const gemDef = gemDatabase.get(gem.gemId);
    if (!gemDef) continue;

    const slotConfig = INFUSION_SLOTS[gem.currentRank];
    if (!slotConfig) continue;

    // Calculate current resonance from the gem
    const currentResonance = getResonance(5, gem.currentRank, gem.quality);

    // Check if additional resonance can be gained (only R10 can get additional)
    // For R7-R9, infusion provides normal resonance from socketed gems
    // For R10, additional resonance = socketed gem GP / 200
    const canGainAdditionalResonance = gem.currentRank === 10;

    // Calculate potential infusion benefit
    // Max additional resonance for R10 is 80 (from docs)
    const maxAdditionalResonance = canGainAdditionalResonance ? 80 : 0;

    if (maxAdditionalResonance === 0) {
      // For R7-R9, infusion is more about filling slots for future ranks
      // Skip recommendation if no immediate power gain
      continue;
    }

    // Generate source gem recommendation
    // For simplicity, recommend 2-star R1 gems as they're the most cost-effective
    const sourceGems: InfusionSourceGem[] = [];
    let totalGemPower = 0;
    let totalResonance = 0;

    // Calculate GP needed for max additional resonance
    // Additional resonance = GP / 200, so GP = resonance * 200
    const gpForMaxResonance = maxAdditionalResonance * 200;

    // Check if affordable
    if (availableGemPower >= gpForMaxResonance) {
      // Recommend filling the infusion slots
      for (let i = 0; i < slotConfig.slots; i++) {
        // Use 2-star R1 gems as source (most common/affordable)
        sourceGems.push({
          gemId: "generic-2star",
          starRating: 2,
          rank: 1,
          gemPowerContributed: gpForMaxResonance / slotConfig.slots,
          resonanceContributed: 2, // 2 resonance per rank for 2-star
        });
      }
      totalGemPower = gpForMaxResonance;
      totalResonance = maxAdditionalResonance;
    }

    if (totalResonance > 0) {
      const tier = getTierRanking(gemDef, mode);
      // Power gain is based on resonance increase
      const powerGain = totalResonance * getTierMultiplier(tier);

      recommendations.push({
        slot: gem.slot,
        gemId: gem.gemId,
        currentRank: gem.currentRank,
        quality: gem.quality,
        sourceGems,
        totalGemPower,
        additionalResonance: totalResonance,
        powerGain,
        priorityRank: 0, // Will be set after sorting
        reasoning: `Infuse ${gemDef.name} with ${slotConfig.slots} source gems for +${totalResonance} resonance. This R10 5-star gem can gain additional resonance from socketed gem power.`,
      });
    }
  }

  // Sort by power gain and assign priority ranks
  recommendations.sort((a, b) => b.powerGain - a.powerGain);
  recommendations.forEach((rec, index) => {
    rec.priorityRank = index + 1;
  });

  return recommendations;
}

/**
 * Get tier multiplier for power calculation
 */
function getTierMultiplier(tier: string): number {
  const multipliers: Record<string, number> = {
    S: 1.3,
    A: 1.2,
    B: 1.1,
    C: 1.0,
    D: 0.9,
  };
  return multipliers[tier] ?? 1.0;
}

/**
 * Create an empty optimization result
 */
function createEmptyResult(
  mode: GameMode,
  startTime: number,
): OptimizationResult {
  const endTime = performance.now();
  return {
    recommendations: [],
    totalPowerGain: 0,
    totalResourceCost: { gemPower: 0, copies: 0 },
    mode,
    calculatedAt: new Date().toISOString(),
    processingTime: endTime - startTime,
  };
}

/**
 * Re-export types for convenience
 */
export type {
  OptimizationInput,
  OptimizationResult,
  UpgradeRecommendation,
  EquippedGem,
  GameMode,
  LegendaryGem,
} from "./types";

/**
 * Re-export constants for external use
 */
export {
  TIER_MULTIPLIERS,
  RESONANCE_THRESHOLDS,
  MAX_RANK,
  MAX_GEMS,
} from "./constants";
