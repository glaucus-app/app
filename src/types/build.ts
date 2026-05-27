/**
 * Build management type definitions for DI-Lab
 * @see specs/feature/PROJ-002-optimizer-ui/data-model.md
 */

import type { EquippedGem, OptimizationMode, InventoryGem } from "./gem";
import type { ResourceInventory } from "./optimization";

// Re-export types needed by components
export type { InventoryGem } from "./gem";
export type { ResourceInventory } from "./optimization";

// ============================================================================
// Awakened Slot Types
// ============================================================================

/** Awakened equipment slot for additional resonance capacity */
export interface AwakenedSlot {
  slotPosition: number; // Which gear slot is awakened (1-12 possible slots)
  isAwakened: boolean; // Whether this slot has been awakened
  dawningEchoCost: number; // 10,000 Platinum or 1,000 Orbs per awakening
  resonanceBonus: number; // Additional resonance from awakened gem in this slot
}

/** Maximum awakened slots in the game */
export const MAX_AWAKENED_SLOTS = 12;

/** Dawning Echo cost per awakening (Platinum) */
export const DAWNING_ECHO_COST_PLATINUM = 10000;

// ============================================================================
// Session Types
// ============================================================================

/**
 * Current work-in-progress session state
 * Auto-saved to server database on every change (per FR-023a)
 */
export interface SessionState {
  gems: EquippedGem[];
  resources: ResourceInventory;
  optimizationMode: OptimizationMode;
  advancedStrategies?: boolean; // FR-037b: Enable advanced strategies like infusion
  updatedAt: string; // ISO timestamp
  lastSavedBuildId?: string; // Reference to last saved/loaded build (if any)
  hasUnsavedChanges?: boolean; // True if named build was modified after save
  awakenedSlots?: AwakenedSlot[]; // Awakened slot configuration
}

// ============================================================================
// Saved Build Types
// ============================================================================

/**
 * Persisted build configuration stored in server database
 * Maximum 5 builds for free tier (per FR-029a)
 */
export interface SavedBuild {
  id: string; // UUID for unique identification
  anonymousId: string; // Reference to owning session
  name: string; // User-provided build name (unique per session, 1-50 chars)
  gems: EquippedGem[];
  resources: ResourceInventory;
  optimizationMode: OptimizationMode;
  advancedStrategies?: boolean; // FR-037b: Advanced strategies toggle
  notes?: string; // Optional user notes (0-500 chars)
  createdAt: Date;
  updatedAt: Date;
  awakenedSlots?: AwakenedSlot[];
}

/** Build name constraints */
export const BUILD_NAME_MIN_LENGTH = 1;
export const BUILD_NAME_MAX_LENGTH = 50;

/** Build notes constraints */
export const BUILD_NOTES_MAX_LENGTH = 500;

/** Maximum builds per session (free tier) */
export const MAX_BUILDS_PER_SESSION = 5;

// ============================================================================
// Anonymous Session Types (Server-Side)
// ============================================================================

/**
 * Anonymous user session stored in server database
 * Identified by UUID stored in localStorage
 */
export interface AnonymousSession {
  // Identification
  anonymousId: string; // UUID v4 stored in localStorage

  // Optional Email (FR-029c)
  email?: string; // Opt-in email for notifications/recovery
  emailVerified?: boolean; // Whether email has been verified

  // Session State (auto-persisted per FR-023a)
  sessionState?: SessionState;

  // Timestamps
  createdAt: Date;
  lastActive: Date;
}

// ============================================================================
// LocalStorage Schema
// ============================================================================

/**
 * localStorage schema - only stores anonymous ID for server lookup
 * All session data and builds are persisted to server database
 */
export interface LocalStorageSchema {
  anonymousId: string; // UUID v4 for server session lookup
}

/** localStorage key for anonymous ID */
export const STORAGE_KEY = "di-lab-anon-id";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a default empty session state
 */
export function createEmptySessionState(): SessionState {
  return {
    gems: [],
    resources: {
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
    },
    optimizationMode: "PVE",
    advancedStrategies: false, // FR-037b: Default off
    updatedAt: new Date().toISOString(),
    awakenedSlots: [],
  };
}

/**
 * Create a default awakened slots configuration
 */
export function createDefaultAwakenedSlots(): AwakenedSlot[] {
  return Array.from({ length: MAX_AWAKENED_SLOTS }, (_, i) => ({
    slotPosition: i + 1,
    isAwakened: false,
    dawningEchoCost: DAWNING_ECHO_COST_PLATINUM,
    resonanceBonus: 0,
  }));
}

/**
 * Validate build name
 * @param name - Build name to validate
 * @returns true if valid, error message if invalid
 */
export function validateBuildName(name: string): true | string {
  if (!name || name.trim().length === 0) {
    return "Build name is required";
  }
  if (name.length < BUILD_NAME_MIN_LENGTH) {
    return `Build name must be at least ${BUILD_NAME_MIN_LENGTH} character`;
  }
  if (name.length > BUILD_NAME_MAX_LENGTH) {
    return `Build name must be at most ${BUILD_NAME_MAX_LENGTH} characters`;
  }
  return true;
}

/**
 * Validate build notes
 * @param notes - Build notes to validate
 * @returns true if valid, error message if invalid
 */
export function validateBuildNotes(notes: string | undefined): true | string {
  if (notes && notes.length > BUILD_NOTES_MAX_LENGTH) {
    return `Notes must be at most ${BUILD_NOTES_MAX_LENGTH} characters`;
  }
  return true;
}

/**
 * Check if a session has unsaved changes to a named build
 */
export function hasUnsavedNamedBuildChanges(
  sessionState: SessionState,
): boolean {
  return (
    sessionState.lastSavedBuildId !== undefined &&
    sessionState.hasUnsavedChanges === true
  );
}

/**
 * Convert session state to saved build format
 */
export function sessionToSavedBuild(
  sessionState: SessionState,
  anonymousId: string,
  name: string,
  notes?: string,
): Omit<SavedBuild, "id" | "createdAt" | "updatedAt"> {
  return {
    anonymousId,
    name: name.trim(),
    gems: sessionState.gems,
    resources: sessionState.resources,
    optimizationMode: sessionState.optimizationMode,
    advancedStrategies: sessionState.advancedStrategies,
    notes: notes?.trim(),
    awakenedSlots: sessionState.awakenedSlots,
  };
}

/**
 * Convert saved build to session state format
 */
export function savedBuildToSession(build: SavedBuild): SessionState {
  return {
    gems: build.gems,
    resources: build.resources,
    optimizationMode: build.optimizationMode,
    advancedStrategies: build.advancedStrategies,
    updatedAt: new Date().toISOString(),
    lastSavedBuildId: build.id,
    hasUnsavedChanges: false,
    awakenedSlots: build.awakenedSlots,
  };
}
