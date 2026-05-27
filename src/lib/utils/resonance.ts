/**
 * Resonance utilities for UI components
 * Wraps the optimization engine resonance functions with UI-friendly interfaces
 */

import type {
  EquippedGem,
  LegendaryGem,
  StarRating,
  Quality,
} from "@/types/gem";
import type {
  EquippedGem as OptEquippedGem,
  LegendaryGem as OptLegendaryGem,
} from "@/lib/optimization/types";
import { getResonance as getOptimizationResonance } from "@/lib/optimization/constants";
import {
  calculateTotalResonance as calculateOptimizationTotalResonance,
  calculateUnlockedSlots,
  getNextResonanceThreshold,
  getResonanceToNextThreshold,
} from "@/lib/optimization/resonance";
import { RESONANCE_THRESHOLDS } from "@/lib/optimization/constants";

// Re-export threshold constants for convenience
export { RESONANCE_THRESHOLDS };

// ============================================================================
// Types
// ============================================================================

export interface ResonanceInfo {
  total: number;
  unlockedWingSlots: number;
  totalSlots: number;
  nextThreshold: number | null;
  resonanceToNext: number;
}

export interface GemResonanceDetail {
  gemId: string;
  gemName: string;
  starRating: StarRating;
  quality: Quality;
  rank: number;
  resonance: number;
}

// ============================================================================
// Type Conversion Helpers
// ============================================================================

/**
 * Convert UI EquippedGem to optimization engine format
 */
function toOptimizationGem(gem: EquippedGem): OptEquippedGem {
  return {
    gemId: gem.gemId,
    slot: gem.slotPosition - 1, // Convert 1-indexed to 0-indexed
    currentRank: gem.rank,
    quality: gem.quality,
  };
}

/**
 * Convert UI LegendaryGem to optimization engine format
 */
function toOptimizationGemDef(gem: LegendaryGem): OptLegendaryGem {
  return {
    id: gem.id,
    name: gem.name,
    starRating: gem.starRating,
    pvpTier: gem.pvpTier,
    pveTier: gem.pveTier,
    resonanceTable: gem.resonanceTable,
    crTable: gem.resonanceTable, // Use resonance table structure for CR (simplified)
  };
}

// ============================================================================
// Resonance Calculation
// ============================================================================

/**
 * Get resonance for a single gem at a specific rank and quality
 */
export function getResonanceForGem(
  starRating: StarRating,
  rank: number,
  quality: Quality,
): number {
  return getOptimizationResonance(starRating, rank, quality);
}

/**
 * Calculate total resonance from equipped gems
 * @param equippedGems - Array of equipped gems
 * @param gemDatabase - Map or record of gem definitions
 */
export function calculateTotalResonance(
  equippedGems: EquippedGem[],
  gemDatabase: Map<string, LegendaryGem> | Record<string, LegendaryGem>,
): number {
  // Convert Record to Map if needed
  const gemMap =
    gemDatabase instanceof Map
      ? gemDatabase
      : new Map(Object.entries(gemDatabase));

  // Convert UI types to optimization types
  const optGems = equippedGems.map(toOptimizationGem);
  const optGemMap = new Map<string, OptLegendaryGem>();

  for (const [id, gem] of gemMap) {
    optGemMap.set(id, toOptimizationGemDef(gem));
  }

  return calculateOptimizationTotalResonance(optGems, optGemMap);
}

/**
 * Get comprehensive resonance information for UI display
 */
export function getResonanceInfo(
  equippedGems: EquippedGem[],
  gemDatabase: Map<string, LegendaryGem> | Record<string, LegendaryGem>,
): ResonanceInfo {
  const total = calculateTotalResonance(equippedGems, gemDatabase);
  const unlockedWingSlots = calculateUnlockedSlots(total);
  const nextThresholdInfo = getNextResonanceThreshold(total);

  return {
    total,
    unlockedWingSlots,
    totalSlots: 8 + unlockedWingSlots, // 8 base + unlocked wing slots
    nextThreshold: nextThresholdInfo?.resonance ?? null,
    resonanceToNext: getResonanceToNextThreshold(total),
  };
}

/**
 * Get resonance breakdown for each equipped gem
 */
export function getResonanceBreakdown(
  equippedGems: EquippedGem[],
  gemDatabase: Map<string, LegendaryGem> | Record<string, LegendaryGem>,
): GemResonanceDetail[] {
  // Convert Record to Map if needed
  const gemMap =
    gemDatabase instanceof Map
      ? gemDatabase
      : new Map(Object.entries(gemDatabase));

  const details: GemResonanceDetail[] = [];

  for (const gem of equippedGems) {
    const gemDef = gemMap.get(gem.gemId);
    if (!gemDef) continue;

    details.push({
      gemId: gem.gemId,
      gemName: gemDef.name,
      starRating: gemDef.starRating,
      quality: gem.quality,
      rank: gem.rank,
      resonance: getResonanceForGem(gemDef.starRating, gem.rank, gem.quality),
    });
  }

  // Sort by resonance descending
  return details.sort((a, b) => b.resonance - a.resonance);
}

// ============================================================================
// Wing Slot Helpers
// ============================================================================

/**
 * Get number of unlocked wing slots for a given resonance total
 */
export function getUnlockedWingSlots(totalResonance: number): number {
  return calculateUnlockedSlots(totalResonance);
}

/**
 * Get total available slots (base + wing) for a given resonance
 */
export function getTotalAvailableSlots(totalResonance: number): number {
  return 8 + calculateUnlockedSlots(totalResonance);
}

/**
 * Get information about the next resonance threshold
 */
export function getNextThresholdInfo(totalResonance: number): {
  resonance: number;
  wingSlots: number;
  resonanceNeeded: number;
} | null {
  const next = getNextResonanceThreshold(totalResonance);
  if (!next) return null;

  return {
    resonance: next.resonance,
    wingSlots: next.slots,
    resonanceNeeded: next.resonance - totalResonance,
  };
}

/**
 * Check if adding a gem would unlock new wing slots
 */
export function wouldUnlockNewSlots(
  currentResonance: number,
  gemResonance: number,
): boolean {
  const currentSlots = calculateUnlockedSlots(currentResonance);
  const newSlots = calculateUnlockedSlots(currentResonance + gemResonance);
  return newSlots > currentSlots;
}

// ============================================================================
// Resonance Progress
// ============================================================================

/**
 * Get progress percentage to next threshold (for progress bars)
 */
export function getThresholdProgress(totalResonance: number): number {
  const currentSlots = calculateUnlockedSlots(totalResonance);

  // If at max slots, return 100%
  if (currentSlots >= 16) return 100;

  // Find current and next threshold
  const thresholds = [{ resonance: 0, slots: 0 }, ...RESONANCE_THRESHOLDS];

  let currentThreshold = 0;
  let nextThreshold = RESONANCE_THRESHOLDS[0].resonance;

  for (let i = 0; i < RESONANCE_THRESHOLDS.length; i++) {
    if (totalResonance >= RESONANCE_THRESHOLDS[i].resonance) {
      currentThreshold = RESONANCE_THRESHOLDS[i].resonance;
      nextThreshold =
        RESONANCE_THRESHOLDS[i + 1]?.resonance ??
        RESONANCE_THRESHOLDS[i].resonance;
    }
  }

  // Calculate progress between current and next threshold
  if (nextThreshold === currentThreshold) return 100;

  const progress =
    ((totalResonance - currentThreshold) / (nextThreshold - currentThreshold)) *
    100;
  return Math.min(100, Math.max(0, progress));
}

// ============================================================================
// Awakened Slot Resonance Impact (FR-050)
// ============================================================================

/**
 * Calculate resonance bonus from awakened slots
 * Each awakened gem gains a 10% resonance bonus
 * @param baseResonance - Base resonance of the gem
 * @param isAwakened - Whether the slot is awakened
 */
export function calculateAwakenedResonance(
  baseResonance: number,
  isAwakened: boolean,
): number {
  if (!isAwakened) return baseResonance;
  return Math.floor(baseResonance * 1.1); // 10% bonus, rounded down
}

/**
 * Calculate total resonance with awakened slot bonuses
 * @param equippedGems - Array of equipped gems
 * @param gemDatabase - Map or record of gem definitions
 * @param awakenedSlots - Set of slot positions that are awakened (1-indexed)
 */
export function calculateTotalResonanceWithAwakened(
  equippedGems: EquippedGem[],
  gemDatabase: Map<string, LegendaryGem> | Record<string, LegendaryGem>,
  awakenedSlots: Set<number>,
): number {
  // Convert Record to Map if needed
  const gemMap =
    gemDatabase instanceof Map
      ? gemDatabase
      : new Map(Object.entries(gemDatabase));

  let totalResonance = 0;

  for (const gem of equippedGems) {
    const gemDef = gemMap.get(gem.gemId);
    if (!gemDef) continue;

    const baseResonance = getResonanceForGem(
      gemDef.starRating,
      gem.rank,
      gem.quality,
    );

    // Check if this slot is awakened
    const isAwakened = awakenedSlots.has(gem.slotPosition);
    totalResonance += calculateAwakenedResonance(baseResonance, isAwakened);
  }

  return totalResonance;
}

/**
 * Get resonance bonus breakdown for awakened slots
 */
export interface AwakenedBonusDetail {
  slotPosition: number;
  gemId: string;
  gemName: string;
  baseResonance: number;
  bonusResonance: number;
  totalResonance: number;
}

/**
 * Get breakdown of awakened slot bonuses
 */
export function getAwakenedBonusBreakdown(
  equippedGems: EquippedGem[],
  gemDatabase: Map<string, LegendaryGem> | Record<string, LegendaryGem>,
  awakenedSlots: Set<number>,
): AwakenedBonusDetail[] {
  // Convert Record to Map if needed
  const gemMap =
    gemDatabase instanceof Map
      ? gemDatabase
      : new Map(Object.entries(gemDatabase));

  const details: AwakenedBonusDetail[] = [];

  for (const gem of equippedGems) {
    if (!awakenedSlots.has(gem.slotPosition)) continue;

    const gemDef = gemMap.get(gem.gemId);
    if (!gemDef) continue;

    const baseResonance = getResonanceForGem(
      gemDef.starRating,
      gem.rank,
      gem.quality,
    );
    const totalResonance = calculateAwakenedResonance(baseResonance, true);
    const bonusResonance = totalResonance - baseResonance;

    details.push({
      slotPosition: gem.slotPosition,
      gemId: gem.gemId,
      gemName: gemDef.name,
      baseResonance,
      bonusResonance,
      totalResonance,
    });
  }

  return details.sort((a, b) => b.bonusResonance - a.bonusResonance);
}

/**
 * Calculate total resonance bonus from all awakened slots
 */
export function calculateTotalAwakenedBonus(
  equippedGems: EquippedGem[],
  gemDatabase: Map<string, LegendaryGem> | Record<string, LegendaryGem>,
  awakenedSlots: Set<number>,
): number {
  const breakdown = getAwakenedBonusBreakdown(
    equippedGems,
    gemDatabase,
    awakenedSlots,
  );
  return breakdown.reduce((sum, detail) => sum + detail.bonusResonance, 0);
}
