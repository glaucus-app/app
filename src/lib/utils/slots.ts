/**
 * Slot Management Utilities for DI-Lab
 * Handles slot configuration, validation, and duplicate prevention
 */

import type { EquippedGem } from "@/types/gem";

// Re-export for compatibility with optimization engine
export type { EquippedGem };

// ============================================================================
// Constants
// ============================================================================

/**
 * Slot configuration per FR-006
 * - 8 base slots (positions 1-8)
 * - Up to 16 wing slots (positions 9-24)
 * - Wing slots unlocked via resonance thresholds
 */
export const SLOT_CONFIG = {
  /** Total base slots always available */
  BASE_SLOTS: 8,
  /** Maximum wing slots that can be unlocked */
  MAX_WING_SLOTS: 16,
  /** Total maximum slots */
  MAX_TOTAL_SLOTS: 24,
  /** First wing slot position */
  FIRST_WING_SLOT: 9,
  /** Last wing slot position */
  LAST_WING_SLOT: 24,
} as const;

/**
 * Resonance thresholds for wing slot unlocking per FR-006
 */
export const RESONANCE_THRESHOLDS = {
  /** 6000 resonance = 4 wing slots unlocked (total 12) */
  TIER_1: { resonance: 6000, wingSlots: 4 },
  /** 7000 resonance = 8 wing slots unlocked (total 16) */
  TIER_2: { resonance: 7000, wingSlots: 8 },
  /** 8000 resonance = 12 wing slots unlocked (total 20) */
  TIER_3: { resonance: 8000, wingSlots: 12 },
  /** 8500+ resonance = 16 wing slots unlocked (total 24) */
  TIER_4: { resonance: 8500, wingSlots: 16 },
} as const;

// ============================================================================
// Types
// ============================================================================

export type SlotType = "base" | "wing";

export interface SlotInfo {
  position: number;
  type: SlotType;
  isUnlocked: boolean;
  isOccupied: boolean;
  gem?: EquippedGem;
}

// ============================================================================
// Slot Type Derivation
// ============================================================================

/**
 * Determine if a slot position is a base or wing slot
 */
export function getSlotType(position: number): SlotType {
  if (position < 1 || position > SLOT_CONFIG.MAX_TOTAL_SLOTS) {
    throw new Error(
      `Invalid slot position: ${position}. Must be 1-${SLOT_CONFIG.MAX_TOTAL_SLOTS}`,
    );
  }
  return position <= SLOT_CONFIG.BASE_SLOTS ? "base" : "wing";
}

/**
 * Check if a position is a base slot (positions 1-8)
 */
export function isBaseSlot(position: number): boolean {
  return position >= 1 && position <= SLOT_CONFIG.BASE_SLOTS;
}

/**
 * Check if a position is a wing slot (positions 9-24)
 */
export function isWingSlot(position: number): boolean {
  return (
    position >= SLOT_CONFIG.FIRST_WING_SLOT &&
    position <= SLOT_CONFIG.LAST_WING_SLOT
  );
}

// ============================================================================
// Position Validation
// ============================================================================

/**
 * Validate that a slot position is within valid range
 */
export function isValidSlotPosition(position: number): boolean {
  return (
    Number.isInteger(position) &&
    position >= 1 &&
    position <= SLOT_CONFIG.MAX_TOTAL_SLOTS
  );
}

/**
 * Get all valid slot positions
 */
export function getAllSlotPositions(): number[] {
  return Array.from({ length: SLOT_CONFIG.MAX_TOTAL_SLOTS }, (_, i) => i + 1);
}

/**
 * Get all base slot positions (1-8)
 */
export function getBaseSlotPositions(): number[] {
  return Array.from({ length: SLOT_CONFIG.BASE_SLOTS }, (_, i) => i + 1);
}

/**
 * Get all wing slot positions (9-24)
 */
export function getWingSlotPositions(): number[] {
  return Array.from(
    { length: SLOT_CONFIG.MAX_WING_SLOTS },
    (_, i) => i + SLOT_CONFIG.FIRST_WING_SLOT,
  );
}

// ============================================================================
// Wing Slot Unlocking
// ============================================================================

/**
 * Calculate number of unlocked wing slots based on total resonance
 */
export function getUnlockedWingSlots(totalResonance: number): number {
  if (totalResonance >= RESONANCE_THRESHOLDS.TIER_4.resonance) {
    return RESONANCE_THRESHOLDS.TIER_4.wingSlots;
  }
  if (totalResonance >= RESONANCE_THRESHOLDS.TIER_3.resonance) {
    return RESONANCE_THRESHOLDS.TIER_3.wingSlots;
  }
  if (totalResonance >= RESONANCE_THRESHOLDS.TIER_2.resonance) {
    return RESONANCE_THRESHOLDS.TIER_2.wingSlots;
  }
  if (totalResonance >= RESONANCE_THRESHOLDS.TIER_1.resonance) {
    return RESONANCE_THRESHOLDS.TIER_1.wingSlots;
  }
  return 0;
}

/**
 * Calculate total available slots (base + unlocked wing)
 */
export function getTotalAvailableSlots(totalResonance: number): number {
  return SLOT_CONFIG.BASE_SLOTS + getUnlockedWingSlots(totalResonance);
}

/**
 * Check if a specific wing slot position is unlocked
 */
export function isWingSlotUnlocked(
  position: number,
  totalResonance: number,
): boolean {
  if (!isWingSlot(position)) {
    return false; // Not a wing slot
  }

  const unlockedWingSlots = getUnlockedWingSlots(totalResonance);
  const wingSlotIndex = position - SLOT_CONFIG.FIRST_WING_SLOT; // 0-indexed within wing slots

  return wingSlotIndex < unlockedWingSlots;
}

/**
 * Check if a slot position is available (valid and unlocked)
 */
export function isSlotAvailable(
  position: number,
  totalResonance: number,
): boolean {
  if (!isValidSlotPosition(position)) {
    return false;
  }

  if (isBaseSlot(position)) {
    return true; // Base slots always available
  }

  return isWingSlotUnlocked(position, totalResonance);
}

/**
 * Get list of all unlocked slot positions
 */
export function getUnlockedSlotPositions(totalResonance: number): number[] {
  const baseSlots = getBaseSlotPositions();
  const unlockedWingSlots = getUnlockedWingSlots(totalResonance);
  const wingSlots = getWingSlotPositions().slice(0, unlockedWingSlots);

  return [...baseSlots, ...wingSlots];
}

/**
 * Get next available slot position for adding a gem
 * Returns null if no slots available
 */
export function getNextAvailableSlot(
  equippedGems: EquippedGem[],
  totalResonance: number,
): number | null {
  const occupiedPositions = new Set(
    equippedGems.map((gem) => gem.slotPosition),
  );
  const unlockedPositions = getUnlockedSlotPositions(totalResonance);

  for (const position of unlockedPositions) {
    if (!occupiedPositions.has(position)) {
      return position;
    }
  }

  return null; // No available slots
}

// ============================================================================
// Duplicate Prevention (FR-009)
// ============================================================================

/**
 * Check if a gem can be added to a specific slot without violating duplicate rules
 *
 * FR-009: Base slots (1-8) do not allow duplicate gemId
 *         Wing slots (9-24) allow duplicates
 */
export function canAddGemToSlot(
  gemId: string,
  position: number,
  equippedGems: EquippedGem[],
  totalResonance: number,
): { allowed: boolean; reason?: string } {
  // Check if slot is available
  if (!isSlotAvailable(position, totalResonance)) {
    return { allowed: false, reason: "Slot is not unlocked" };
  }

  // Check if slot is already occupied
  const existingGem = equippedGems.find((gem) => gem.slotPosition === position);
  if (existingGem) {
    return { allowed: false, reason: "Slot is already occupied" };
  }

  // For base slots, check for duplicates
  if (isBaseSlot(position)) {
    const duplicateInBaseSlots = equippedGems.some(
      (gem) => isBaseSlot(gem.slotPosition) && gem.gemId === gemId,
    );
    if (duplicateInBaseSlots) {
      return {
        allowed: false,
        reason: "Cannot equip duplicate gem in base slots (1-8)",
      };
    }
  }

  // Wing slots allow duplicates
  return { allowed: true };
}

/**
 * Find all valid slots where a gem can be added
 */
export function findValidSlotsForGem(
  gemId: string,
  equippedGems: EquippedGem[],
  totalResonance: number,
): number[] {
  const unlockedPositions = getUnlockedSlotPositions(totalResonance);
  const occupiedPositions = new Set(
    equippedGems.map((gem) => gem.slotPosition),
  );

  return unlockedPositions.filter((position) => {
    // Skip occupied slots
    if (occupiedPositions.has(position)) {
      return false;
    }

    // For base slots, check duplicate rule
    if (isBaseSlot(position)) {
      const duplicateInBaseSlots = equippedGems.some(
        (gem) => isBaseSlot(gem.slotPosition) && gem.gemId === gemId,
      );
      return !duplicateInBaseSlots;
    }

    // Wing slots allow duplicates
    return true;
  });
}

/**
 * Check if a gem move/swap operation is valid
 */
export function canMoveGemToSlot(
  gem: EquippedGem,
  newPosition: number,
  equippedGems: EquippedGem[],
  totalResonance: number,
): { allowed: boolean; reason?: string } {
  // Check if slot is available
  if (!isSlotAvailable(newPosition, totalResonance)) {
    return { allowed: false, reason: "Target slot is not unlocked" };
  }

  // Find existing gem at target position
  const targetGem = equippedGems.find((g) => g.slotPosition === newPosition);

  // If moving to empty slot
  if (!targetGem) {
    // For base slots, check duplicate rule (excluding current position)
    if (isBaseSlot(newPosition)) {
      const duplicateInBaseSlots = equippedGems.some(
        (g) =>
          isBaseSlot(g.slotPosition) &&
          g.gemId === gem.gemId &&
          g.slotPosition !== gem.slotPosition,
      );
      if (duplicateInBaseSlots) {
        return {
          allowed: false,
          reason: "Cannot place duplicate gem in base slots",
        };
      }
    }
    return { allowed: true };
  }

  // Swap operation - need to validate both positions
  // For now, just allow swaps (more complex validation can be added)
  return { allowed: true };
}

// ============================================================================
// Slot Info Helpers
// ============================================================================

/**
 * Get detailed info for all slots
 */
export function getAllSlotInfo(
  equippedGems: EquippedGem[],
  totalResonance: number,
): SlotInfo[] {
  const allPositions = getAllSlotPositions();

  return allPositions.map((position) => {
    const type = getSlotType(position);
    const isUnlocked = isSlotAvailable(position, totalResonance);
    const gem = equippedGems.find((g) => g.slotPosition === position);

    return {
      position,
      type,
      isUnlocked,
      isOccupied: !!gem,
      gem,
    };
  });
}

/**
 * Get count of equipped gems
 */
export function getEquippedGemCount(equippedGems: EquippedGem[]): number {
  return equippedGems.length;
}

/**
 * Get count of available (empty, unlocked) slots
 */
export function getAvailableSlotCount(
  equippedGems: EquippedGem[],
  totalResonance: number,
): number {
  const unlockedPositions = getUnlockedSlotPositions(totalResonance);
  const occupiedPositions = new Set(
    equippedGems.map((gem) => gem.slotPosition),
  );

  return unlockedPositions.filter((pos) => !occupiedPositions.has(pos)).length;
}

/**
 * Check if user has reached maximum gem capacity
 */
export function isAtMaxCapacity(
  equippedGems: EquippedGem[],
  totalResonance: number,
): boolean {
  return getAvailableSlotCount(equippedGems, totalResonance) === 0;
}

// ============================================================================
// Resonance Tier Info
// ============================================================================

/**
 * Get current resonance tier info
 */
export function getResonanceTierInfo(totalResonance: number): {
  currentTier: number;
  currentWingSlots: number;
  nextThreshold: number | null;
  slotsUntilNext: number;
} {
  const thresholds = [
    RESONANCE_THRESHOLDS.TIER_1,
    RESONANCE_THRESHOLDS.TIER_2,
    RESONANCE_THRESHOLDS.TIER_3,
    RESONANCE_THRESHOLDS.TIER_4,
  ];

  let currentTier = 0;
  let currentWingSlots = 0;
  let nextThreshold: number | null = null;

  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalResonance >= thresholds[i].resonance) {
      currentTier = i + 1;
      currentWingSlots = thresholds[i].wingSlots;
      nextThreshold =
        i < thresholds.length - 1 ? thresholds[i + 1].resonance : null;
      break;
    }
  }

  const maxWingSlots = SLOT_CONFIG.MAX_WING_SLOTS;
  const slotsUntilNext = nextThreshold
    ? (thresholds.find((t) => t.resonance === nextThreshold)?.wingSlots ??
        maxWingSlots) - currentWingSlots
    : 0;

  return {
    currentTier,
    currentWingSlots,
    nextThreshold,
    slotsUntilNext,
  };
}
