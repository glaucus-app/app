/**
 * Resource constraint handling for the optimization engine
 * @module optimization/resources
 */

import type {
  EquippedGem,
  LegendaryGem,
  UpgradeCandidate,
  UpgradeResources,
} from "./types";
import {
  getGemPowerCost,
  COPIES_REQUIRED_PER_RANK,
  MAX_RANK,
} from "./constants";

/**
 * Calculate the gem power cost for upgrading from one rank to another
 * @param starRating - Star rating of the gem
 * @param fromRank - Current rank
 * @param toRank - Target rank
 * @returns Total gem power cost
 */
export function calculateGemPowerCost(
  starRating: 1 | 2 | 5,
  fromRank: number,
  toRank: number,
): number {
  let totalCost = 0;
  for (let rank = fromRank; rank < toRank; rank++) {
    totalCost += getGemPowerCost(starRating, rank);
  }
  return totalCost;
}

/**
 * Calculate the number of copies required for an upgrade
 * @param fromRank - Current rank
 * @param toRank - Target rank
 * @returns Number of copies required
 */
export function calculateCopiesCost(fromRank: number, toRank: number): number {
  const rankDiff = toRank - fromRank;
  return rankDiff * COPIES_REQUIRED_PER_RANK;
}

/**
 * Check if an upgrade is affordable with available resources
 * @param gemPowerCost - Gem power required
 * @param copiesCost - Copies required
 * @param resources - Available resources
 * @param gemId - ID of the gem (for copy lookup)
 * @returns Whether the upgrade is affordable
 */
export function isAffordable(
  gemPowerCost: number,
  copiesCost: number,
  resources: UpgradeResources,
  gemId: string,
): boolean {
  // Check gem power
  if (gemPowerCost > resources.gemPower) {
    return false;
  }

  // Check copies
  const copiesAvailable = resources.copyInventory.get(gemId) ?? 0;
  if (copiesCost > copiesAvailable) {
    return false;
  }

  return true;
}

/**
 * Filter upgrade candidates by resource constraints
 * @param candidates - All possible upgrade candidates
 * @param resources - Available resources
 * @returns Only affordable candidates
 */
export function filterAffordableUpgrades(
  candidates: UpgradeCandidate[],
  resources: UpgradeResources,
): UpgradeCandidate[] {
  return candidates.filter((candidate) =>
    isAffordable(
      candidate.gemPowerCost,
      candidate.copiesRequired,
      resources,
      candidate.gemId,
    ),
  );
}

/**
 * Deduct resources for an upgrade
 * @param resources - Current resources (will be modified)
 * @param gemPowerCost - Gem power to deduct
 * @param copiesCost - Copies to deduct
 * @param gemId - ID of the gem
 * @returns Updated resources (new object)
 */
export function deductResources(
  resources: UpgradeResources,
  gemPowerCost: number,
  copiesCost: number,
  gemId: string,
): UpgradeResources {
  const newCopyInventory = new Map(resources.copyInventory);
  const currentCopies = newCopyInventory.get(gemId) ?? 0;
  newCopyInventory.set(gemId, currentCopies - copiesCost);

  return {
    gemPower: resources.gemPower - gemPowerCost,
    copyInventory: newCopyInventory,
  };
}

/**
 * Select upgrades within resource budget using greedy algorithm
 * @param candidates - All affordable candidates sorted by priority (descending)
 * @param resources - Available resources
 * @returns Selected upgrades and remaining resources
 */
export function selectUpgradesWithinBudget(
  candidates: UpgradeCandidate[],
  resources: UpgradeResources,
): {
  selected: UpgradeCandidate[];
  remainingResources: UpgradeResources;
} {
  const selected: UpgradeCandidate[] = [];
  let remainingResources = resources;

  for (const candidate of candidates) {
    // Check if still affordable with remaining resources
    if (
      candidate.gemPowerCost <= remainingResources.gemPower &&
      (remainingResources.copyInventory.get(candidate.gemId) ?? 0) >=
        candidate.copiesRequired
    ) {
      selected.push(candidate);
      remainingResources = deductResources(
        remainingResources,
        candidate.gemPowerCost,
        candidate.copiesRequired,
        candidate.gemId,
      );
    }
  }

  return { selected, remainingResources };
}

/**
 * Generate all possible single-rank upgrades for equipped gems
 * @param gems - Currently equipped gems
 * @param gemDatabase - Map of gem ID to gem definition
 * @returns List of possible upgrades
 */
export function generatePossibleUpgrades(
  gems: EquippedGem[],
  gemDatabase: Map<string, LegendaryGem>,
): Array<{
  gemId: string;
  slot: number;
  currentRank: number;
  targetRank: number;
  gemPowerCost: number;
  copiesRequired: number;
}> {
  const upgrades: Array<{
    gemId: string;
    slot: number;
    currentRank: number;
    targetRank: number;
    gemPowerCost: number;
    copiesRequired: number;
  }> = [];

  for (const gem of gems) {
    const gemDef = gemDatabase.get(gem.gemId);
    if (!gemDef) continue;

    // Can only upgrade if not at max rank
    if (gem.currentRank >= MAX_RANK) continue;

    // Generate single-rank upgrade
    const targetRank = gem.currentRank + 1;
    const gemPowerCost = getGemPowerCost(gemDef.starRating, gem.currentRank);
    const copiesRequired = COPIES_REQUIRED_PER_RANK;

    upgrades.push({
      gemId: gem.gemId,
      slot: gem.slot,
      currentRank: gem.currentRank,
      targetRank,
      gemPowerCost,
      copiesRequired,
    });
  }

  return upgrades;
}

/**
 * Calculate total resource cost for a list of recommendations
 * @param recommendations - List of upgrade recommendations
 * @returns Total resource cost
 */
export function calculateTotalCost(
  recommendations: Array<{
    gemPowerCost: number;
    copiesCost: number;
  }>,
): { gemPower: number; copies: number } {
  return recommendations.reduce(
    (total, rec) => ({
      gemPower: total.gemPower + rec.gemPowerCost,
      copies: total.copies + rec.copiesCost,
    }),
    { gemPower: 0, copies: 0 },
  );
}

/**
 * Create a copy inventory from a plain object
 * @param inventory - Plain object mapping gem ID to copy count
 * @returns Map-based copy inventory
 */
export function createCopyInventory(
  inventory: Record<string, number>,
): Map<string, number> {
  return new Map(Object.entries(inventory));
}

/**
 * Convert a Map-based copy inventory to a plain object
 * @param inventory - Map-based copy inventory
 * @returns Plain object mapping gem ID to copy count
 */
export function copyInventoryToObject(
  inventory: Map<string, number>,
): Record<string, number> {
  const obj: Record<string, number> = {};
  for (const [key, value] of inventory) {
    if (value > 0) {
      obj[key] = value;
    }
  }
  return obj;
}
