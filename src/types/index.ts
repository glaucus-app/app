/**
 * Type definitions index for DI-Lab
 * Re-exports all types for convenient imports
 */

// Gem types
export type {
  StarRating,
  Quality,
  Rank,
  TierRanking,
  EffectCategory,
  EffectType,
  SlotType,
  OptimizationMode,
  GemEffect,
  ResonanceTable,
  UpgradeCost,
  LegendaryGem,
  EquippedGem,
  InventoryGem,
} from "./gem";

export {
  SLOT_CONFIG,
  deriveSlotType,
  calculateUnlockedWingSlots,
  getTotalAvailableSlots,
  canEquipGem,
  isValidQuality,
  isValidRank,
  isValidStarRating,
} from "./gem";

// Optimization types
export type {
  OptimizationErrorType,
  OptimizationError,
  CrestCounts,
  ResourceInventory,
  InventoryGemForOptimization,
  AlternativeUpgrade,
  UpgradeRecommendation,
  OptimizationResult,
  OptimizeRequest,
  OptimizeResponse,
  OptimizeErrorResponse,
  AcquisitionPathType,
  RunRequirements,
  AcquisitionPath,
} from "./optimization";

export {
  CRAFTING_RATES,
  createEmptyResourceInventory,
  isOptimizationError,
} from "./optimization";

// Build types
export type {
  AwakenedSlot,
  SessionState,
  SavedBuild,
  AnonymousSession,
  LocalStorageSchema,
} from "./build";

export {
  MAX_AWAKENED_SLOTS,
  DAWNING_ECHO_COST_PLATINUM,
  BUILD_NAME_MIN_LENGTH,
  BUILD_NAME_MAX_LENGTH,
  BUILD_NOTES_MAX_LENGTH,
  MAX_BUILDS_PER_SESSION,
  STORAGE_KEY,
  createEmptySessionState,
  createDefaultAwakenedSlots,
  validateBuildName,
  validateBuildNotes,
  hasUnsavedNamedBuildChanges,
  sessionToSavedBuild,
  savedBuildToSession,
} from "./build";
