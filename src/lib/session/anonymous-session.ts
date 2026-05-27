/**
 * Anonymous Session Management for DI-Lab
 * Server-side session sync with localStorage UUID identification (FR-029, FR-029b)
 */

import type {
  SessionState,
  EquippedGem,
  ResourceInventory,
  AwakenedSlot,
} from "@/types";
import { createEmptySessionState, STORAGE_KEY } from "@/types";

// Re-export STORAGE_KEY for external use
export { STORAGE_KEY };

// ============================================================================
// Constants
// ============================================================================

/**
 * Server API endpoints
 */
const API_ENDPOINTS = {
  session: "/api/session",
} as const;

// ============================================================================
// Client-Side ID Management
// ============================================================================

/**
 * Check if localStorage is available
 * Handles private browsing and disabled storage scenarios (FR-029b)
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = "__di_lab_test__";
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate a new UUID v4
 */
export function generateUuid(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create anonymous ID from localStorage
 * Returns the existing ID or creates a new one if not present
 */
export function getOrCreateAnonymousId(): string {
  // Check localStorage availability
  if (!isLocalStorageAvailable()) {
    // Return a session-scoped ID in memory
    // This will be lost on page refresh, but server session cookie provides fallback
    if (typeof window !== "undefined") {
      if (
        !(window as Window & { __diLabSessionId?: string }).__diLabSessionId
      ) {
        (window as Window & { __diLabSessionId?: string }).__diLabSessionId =
          generateUuid();
      }
      return (window as Window & { __diLabSessionId?: string })
        .__diLabSessionId!;
    }
    return generateUuid();
  }

  // Try to get existing ID
  let id = localStorage.getItem(STORAGE_KEY);

  if (!id) {
    // Create new ID
    id = generateUuid();
    localStorage.setItem(STORAGE_KEY, id);
  }

  return id;
}

/**
 * Clear the anonymous ID (for testing or reset)
 */
export function clearAnonymousId(): void {
  if (isLocalStorageAvailable()) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// ============================================================================
// Session State Factory
// ============================================================================

// Re-export from types for convenience
export { createEmptySessionState };

// ============================================================================
// Server-Side Session Sync
// ============================================================================

/**
 * Options for session sync
 */
interface SessionSyncOptions {
  signal?: AbortSignal;
  retryCount?: number;
}

/**
 * Fetch session state from server
 * Returns null if session doesn't exist (404) or is invalid (410)
 */
export async function fetchSessionState(
  anonymousId: string,
  options?: SessionSyncOptions,
): Promise<
  | { success: true; data: SessionState }
  | { success: false; status: number; error: string }
> {
  try {
    const response = await fetch(
      `${API_ENDPOINTS.session}?anonymousId=${encodeURIComponent(anonymousId)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: options?.signal,
      },
    );

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error:
          response.status === 404
            ? "Session not found"
            : response.status === 410
              ? "Session expired"
              : "Failed to fetch session",
      };
    }

    const data = await response.json();
    return { success: true, data: data.sessionState };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { success: false, status: 0, error: "Request cancelled" };
    }
    return { success: false, status: 0, error: "Network error" };
  }
}

/**
 * Persist session state to server
 * Auto-saves on every change per FR-023a
 */
export async function persistSessionState(
  anonymousId: string,
  sessionState: SessionState,
  options?: SessionSyncOptions,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const response = await fetch(API_ENDPOINTS.session, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonymousId, ...sessionState }),
      signal: options?.signal,
    });

    if (!response.ok) {
      return {
        success: false,
        error:
          response.status === 404
            ? "Session expired"
            : response.status === 410
              ? "Session expired"
              : "Failed to save session",
      };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { success: false, error: "Request cancelled" };
    }
    return { success: false, error: "Network error" };
  }
}

/**
 * Handle session invalidation (FR-029d)
 * Creates a new session with new UUID, preserves local UI state
 */
export async function handleSessionInvalidation(
  currentState: SessionState,
): Promise<{ anonymousId: string; sessionState: SessionState }> {
  // Clear the old ID
  clearAnonymousId();

  // Generate new ID
  const newAnonymousId = getOrCreateAnonymousId();

  // Create new session state with preserved UI state
  const newSessionState: SessionState = {
    ...currentState,
    updatedAt: new Date().toISOString(),
  };

  // Sync to new session
  await persistSessionState(newAnonymousId, newSessionState);

  return { anonymousId: newAnonymousId, sessionState: newSessionState };
}

// ============================================================================
// Session State Update Helpers
// ============================================================================

/**
 * Update equipped gems in session state
 */
export function updateEquippedGems(
  currentState: SessionState,
  gems: EquippedGem[],
): SessionState {
  return {
    ...currentState,
    gems,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Update resources in session state
 */
export function updateResources(
  currentState: SessionState,
  resources: Partial<ResourceInventory>,
): SessionState {
  return {
    ...currentState,
    resources: {
      ...currentState.resources,
      ...resources,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Update awakened slots in session state
 */
export function updateAwakenedSlots(
  currentState: SessionState,
  awakenedSlots: AwakenedSlot[],
): SessionState {
  return {
    ...currentState,
    awakenedSlots,
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Auto-Save Debounced Handler
// ============================================================================

let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;
let autoSaveAbortController: AbortController | null = null;

/**
 * Auto-save session state with debouncing
 * Debounces rapid changes to avoid excessive API calls
 */
export function autoSaveSessionState(
  anonymousId: string,
  sessionState: SessionState,
  delay: number = 500,
): Promise<{ success: true } | { success: false; error: string }> {
  // Cancel any pending save
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  // Cancel any in-flight request
  if (autoSaveAbortController) {
    autoSaveAbortController.abort();
  }

  return new Promise((resolve) => {
    autoSaveTimeout = setTimeout(async () => {
      autoSaveAbortController = new AbortController();
      const result = await persistSessionState(anonymousId, sessionState, {
        signal: autoSaveAbortController.signal,
      });
      autoSaveTimeout = null;
      autoSaveAbortController = null;
      resolve(result);
    }, delay);
  });
}

/**
 * Cancel any pending auto-save
 */
export function cancelAutoSave(): void {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = null;
  }
  if (autoSaveAbortController) {
    autoSaveAbortController.abort();
    autoSaveAbortController = null;
  }
}
