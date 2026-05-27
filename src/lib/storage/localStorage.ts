/**
 * LocalStorage Utilities for DI-Lab
 * Versioned storage helpers for anonymous ID only
 * Session state is persisted to server database
 */

import { STORAGE_KEY } from "@/lib/session/anonymous-session";

// ============================================================================
// Storage Version
// ============================================================================

/**
 * Current storage schema version
 * Increment when making breaking changes to force migration
 */
const STORAGE_VERSION = 1;

/**
 * Storage version key for tracking schema migrations
 */
const VERSION_KEY = "di-lab-version";

// ============================================================================
// Types
// ============================================================================

/**
 * Minimal localStorage schema - only stores anonymous ID
 * All other data is persisted to server database
 */
interface LocalStorageSchema {
  anonymousId: string;
}

/**
 * Storage migration result
 */
interface MigrationResult {
  success: boolean;
  migrated: boolean;
  error?: string;
}

// ============================================================================
// Storage Availability
// ============================================================================

/**
 * Check if localStorage is available
 * Handles private browsing and disabled storage scenarios
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = "__di_lab_test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage availability info
 */
export function getStorageInfo(): {
  available: boolean;
  version: number | null;
  hasAnonymousId: boolean;
} {
  const available = isStorageAvailable();
  let version: number | null = null;
  let hasAnonymousId = false;

  if (available) {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    version = storedVersion ? parseInt(storedVersion, 10) : null;
    hasAnonymousId = localStorage.getItem(STORAGE_KEY) !== null;
  }

  return { available, version, hasAnonymousId };
}

// ============================================================================
// Core Storage Operations
// ============================================================================

/**
 * Get anonymous ID from localStorage
 * Returns null if not found or storage unavailable
 */
export function getAnonymousId(): string | null {
  if (!isStorageAvailable()) {
    return null;
  }
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Set anonymous ID in localStorage
 * Returns true if successful
 */
export function setAnonymousId(id: string): boolean {
  if (!isStorageAvailable()) {
    return false;
  }
  try {
    localStorage.setItem(STORAGE_KEY, id);
    return true;
  } catch {
    return false;
  }
}

/**
 * Remove anonymous ID from localStorage
 */
export function removeAnonymousId(): boolean {
  if (!isStorageAvailable()) {
    return false;
  }
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Version Management
// ============================================================================

/**
 * Initialize storage version
 * Should be called on app startup
 */
export function initializeStorageVersion(): void {
  if (!isStorageAvailable()) {
    return;
  }

  const currentVersion = localStorage.getItem(VERSION_KEY);
  if (!currentVersion) {
    localStorage.setItem(VERSION_KEY, STORAGE_VERSION.toString());
  }
}

/**
 * Get current storage version
 */
export function getStorageVersion(): number | null {
  if (!isStorageAvailable()) {
    return null;
  }

  const version = localStorage.getItem(VERSION_KEY);
  return version ? parseInt(version, 10) : null;
}

/**
 * Check if storage needs migration
 */
export function needsMigration(): boolean {
  const version = getStorageVersion();
  return version !== null && version < STORAGE_VERSION;
}

// ============================================================================
// Migration
// ============================================================================

/**
 * Run storage migrations
 * Currently a no-op since we're at version 1
 */
export function runMigrations(): MigrationResult {
  if (!isStorageAvailable()) {
    return { success: false, migrated: false, error: "Storage unavailable" };
  }

  const currentVersion = getStorageVersion();

  // No migrations needed for v1
  if (currentVersion === STORAGE_VERSION) {
    return { success: true, migrated: false };
  }

  // First time initialization
  if (currentVersion === null) {
    initializeStorageVersion();
    return { success: true, migrated: false };
  }

  // Future migrations would go here
  // Example:
  // if (currentVersion < 2) {
  //   migrateV1toV2();
  // }

  return { success: true, migrated: true };
}

// ============================================================================
// Clear Operations
// ============================================================================

/**
 * Clear all DI-Lab data from localStorage
 * Preserves anonymous ID by default
 */
export function clearStorage(
  options: { preserveAnonymousId?: boolean } = {},
): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  const { preserveAnonymousId = true } = options;
  const anonymousId = preserveAnonymousId ? getAnonymousId() : null;

  try {
    localStorage.removeItem(VERSION_KEY);
    if (!preserveAnonymousId) {
      localStorage.removeItem(STORAGE_KEY);
    }

    // Re-initialize
    initializeStorageVersion();
    if (preserveAnonymousId && anonymousId) {
      setAnonymousId(anonymousId);
    }

    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Storage Quota
// ============================================================================

/**
 * Get localStorage usage info
 * Returns null if API not supported
 */
export function getStorageQuota(): {
  used: number;
  available: number;
  total: number;
} | null {
  if (!isStorageAvailable()) {
    return null;
  }

  // Estimate storage usage (not all browsers support this)
  if ("storage" in navigator && "estimate" in navigator.storage) {
    // Use the Storage API if available
    // This is async, so we return null here and suggest using getStorageQuotaAsync
    return null;
  }

  // Fallback: estimate based on localStorage string length
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        used += key.length + value.length;
      }
    }
  }

  // Typical localStorage limit is 5MB
  const total = 5 * 1024 * 1024;
  return { used, available: total - used, total };
}

/**
 * Get localStorage quota asynchronously
 * More accurate than sync version
 */
export async function getStorageQuotaAsync(): Promise<{
  used: number;
  available: number;
  total: number;
} | null> {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage ?? 0,
        available: (estimate.quota ?? 0) - (estimate.usage ?? 0),
        total: estimate.quota ?? 0,
      };
    } catch {
      // Fall through to sync fallback
    }
  }

  return getStorageQuota();
}

// ============================================================================
// Export Types
// ============================================================================

export type { LocalStorageSchema };
