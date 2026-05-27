/**
 * Resonance calculation functions for the optimization engine
 * @module optimization/resonance
 */

import type { EquippedGem, LegendaryGem } from "./types";
import {
  getResonance,
  RESONANCE_THRESHOLDS,
  THRESHOLD_BONUS,
} from "./constants";

/**
 * Calculate the resonance gain from upgrading a gem
 * @param gem - The equipped gem being upgraded
 * @param gemDefinition - The gem definition with resonance tables
 * @param fromRank - Current rank
 * @param toRank - Target rank after upgrade
 * @returns The resonance increase from the upgrade
 */
export function getResonanceGain(
  gem: EquippedGem,
  gemDefinition: LegendaryGem,
  fromRank: number,
  toRank: number,
): number {
  const currentResonance = getResonance(
    gemDefinition.starRating,
    fromRank,
    gem.quality,
  );
  const newResonance = getResonance(
    gemDefinition.starRating,
    toRank,
    gem.quality,
  );
  return newResonance - currentResonance;
}

/**
 * Calculate total resonance for all equipped gems
 * @param gems - Array of equipped gems
 * @param gemDatabase - Map of gem ID to gem definition
 * @returns Total resonance value
 */
export function calculateTotalResonance(
  gems: EquippedGem[],
  gemDatabase: Map<string, LegendaryGem>,
): number {
  return gems.reduce((total, gem) => {
    const gemDef = gemDatabase.get(gem.gemId);
    if (!gemDef) return total;
    return (
      total + getResonance(gemDef.starRating, gem.currentRank, gem.quality)
    );
  }, 0);
}

/**
 * Calculate total resonance after applying upgrades
 * @param gems - Array of equipped gems
 * @param gemDatabase - Map of gem ID to gem definition
 * @param upgrades - Map of slot to new rank
 * @returns Total resonance value with upgrades applied
 */
export function calculateTotalResonanceWithUpgrades(
  gems: EquippedGem[],
  gemDatabase: Map<string, LegendaryGem>,
  upgrades: Map<number, number>,
): number {
  return gems.reduce((total, gem) => {
    const gemDef = gemDatabase.get(gem.gemId);
    if (!gemDef) return total;
    const effectiveRank = upgrades.get(gem.slot) ?? gem.currentRank;
    return total + getResonance(gemDef.starRating, effectiveRank, gem.quality);
  }, 0);
}

/**
 * Check if an upgrade crosses a resonance threshold
 * @param currentResonance - Total resonance before upgrade
 * @param newResonance - Total resonance after upgrade
 * @returns The threshold bonus multiplier (1.0 or THRESHOLD_BONUS)
 */
export function getResonanceThresholdBonus(
  currentResonance: number,
  newResonance: number,
): number {
  for (const threshold of RESONANCE_THRESHOLDS) {
    // Check if upgrade crosses this threshold
    if (
      currentResonance < threshold.resonance &&
      newResonance >= threshold.resonance
    ) {
      return THRESHOLD_BONUS;
    }
  }
  return 1.0;
}

/**
 * Get the next resonance threshold above the current value
 * @param currentResonance - Current total resonance
 * @returns The next threshold to reach, or null if at max
 */
export function getNextResonanceThreshold(
  currentResonance: number,
): { resonance: number; slots: number } | null {
  for (const threshold of RESONANCE_THRESHOLDS) {
    if (currentResonance < threshold.resonance) {
      return threshold;
    }
  }
  return null;
}

/**
 * Calculate how many wing slots are unlocked at a given resonance
 * @param totalResonance - Total resonance value
 * @returns Number of unlocked wing slots
 */
export function calculateUnlockedSlots(totalResonance: number): number {
  let unlockedSlots = 0;
  for (const threshold of RESONANCE_THRESHOLDS) {
    if (totalResonance >= threshold.resonance) {
      unlockedSlots = threshold.slots;
    }
  }
  return unlockedSlots;
}

/**
 * Check if an upgrade would unlock new wing slots
 * @param currentResonance - Total resonance before upgrade
 * @param newResonance - Total resonance after upgrade
 * @returns Object with slots before and after, and whether new slots are unlocked
 */
export function checkWingSlotUnlock(
  currentResonance: number,
  newResonance: number,
): {
  slotsBefore: number;
  slotsAfter: number;
  newSlotsUnlocked: boolean;
} {
  const slotsBefore = calculateUnlockedSlots(currentResonance);
  const slotsAfter = calculateUnlockedSlots(newResonance);
  return {
    slotsBefore,
    slotsAfter,
    newSlotsUnlocked: slotsAfter > slotsBefore,
  };
}

/**
 * Calculate the resonance needed to reach the next threshold
 * @param currentResonance - Current total resonance
 * @returns Resonance needed, or 0 if at max
 */
export function getResonanceToNextThreshold(currentResonance: number): number {
  const nextThreshold = getNextResonanceThreshold(currentResonance);
  if (!nextThreshold) return 0;
  return nextThreshold.resonance - currentResonance;
}
