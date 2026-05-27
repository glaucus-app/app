/**
 * Custom hook for optimistic UI updates with automatic rollback on failure
 * Implements FR-008a: Optimistic update pattern
 *
 * @module hooks/useOptimisticUpdate
 */

import { useState, useCallback, useRef } from "react";

/**
 * Result of an optimistic update operation
 */
interface OptimisticResult<T> {
  /** Whether the operation succeeded */
  success: boolean;
  /** Current state after the operation */
  state: T;
  /** Error message if the operation failed */
  error?: string;
}

/**
 * Options for optimistic updates
 */
interface OptimisticUpdateOptions<T> {
  /** Function to persist the state to the server */
  persistFn: (
    state: T,
  ) => Promise<{ success: true } | { success: false; error: string }>;
  /** Delay before considering the operation as failed (default: 10000ms) */
  timeout?: number;
  /** Callback when an operation fails after retry */
  onFailure?: (error: string, previousState: T) => void;
  /** Callback when rollback occurs */
  onRollback?: (previousState: T) => void;
}

/**
 * Return type for the useOptimisticUpdate hook
 */
interface UseOptimisticUpdateReturn<T> {
  /** Current state */
  state: T;
  /** Whether an operation is in progress */
  isPending: boolean;
  /** Error from the last failed operation */
  error: string | null;
  /** Perform an optimistic update */
  update: (newState: T) => Promise<OptimisticResult<T>>;
  /** Manually rollback to the previous state */
  rollback: () => void;
  /** Clear the error */
  clearError: () => void;
}

/**
 * Hook for managing optimistic UI updates with automatic rollback
 *
 * Usage:
 * ```tsx
 * const { state, update, isPending, error, rollback } = useOptimisticUpdate(
 *   initialState,
 *   { persistFn: saveToServer }
 * );
 *
 * // Optimistically update
 * await update(newState);
 * ```
 */
export function useOptimisticUpdate<T>(
  initialState: T,
  options: OptimisticUpdateOptions<T>,
): UseOptimisticUpdateReturn<T> {
  const { persistFn, timeout = 10000, onFailure, onRollback } = options;

  const [state, setState] = useState<T>(initialState);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store previous state for rollback
  const previousStateRef = useRef<T>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Clear any pending timeouts and abort controllers
   */
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Perform an optimistic update
   */
  const update = useCallback(
    async (newState: T): Promise<OptimisticResult<T>> => {
      // Clean up any previous operation
      cleanup();

      // Store previous state for potential rollback
      previousStateRef.current = state;

      // Optimistically update UI
      setState(newState);
      setIsPending(true);
      setError(null);

      // Create abort controller for this operation
      abortControllerRef.current = new AbortController();

      try {
        // Set timeout for the operation
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutRef.current = setTimeout(() => {
            reject(new Error("Operation timed out"));
          }, timeout);
        });

        // Race between persist and timeout
        const result = await Promise.race([
          persistFn(newState),
          timeoutPromise,
        ]);

        if (!result.success) {
          // Rollback on failure
          setState(previousStateRef.current);
          setError(result.error);

          if (onFailure) {
            onFailure(result.error, previousStateRef.current);
          }

          return {
            success: false,
            state: previousStateRef.current,
            error: result.error,
          };
        }

        return {
          success: true,
          state: newState,
        };
      } catch (err) {
        // Handle timeout or other errors
        const errorMessage =
          err instanceof Error ? err.message : "Operation failed";

        // Rollback
        setState(previousStateRef.current);
        setError(errorMessage);

        if (onFailure) {
          onFailure(errorMessage, previousStateRef.current);
        }

        return {
          success: false,
          state: previousStateRef.current,
          error: errorMessage,
        };
      } finally {
        setIsPending(false);
        cleanup();
      }
    },
    [state, persistFn, timeout, cleanup, onFailure],
  );

  /**
   * Manually rollback to the previous state
   */
  const rollback = useCallback(() => {
    cleanup();
    setState(previousStateRef.current);
    setIsPending(false);

    if (onRollback) {
      onRollback(previousStateRef.current);
    }
  }, [cleanup, onRollback]);

  /**
   * Clear the error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    state,
    isPending,
    error,
    update,
    rollback,
    clearError,
  };
}

/**
 * Create an optimistic update wrapper for gem operations
 * This is a factory function that creates pre-configured optimistic updates
 * for specific gem operations like add, remove, update quality/rank
 */
export function createOptimisticGemOperation<T>(
  currentState: T,
  operation: (state: T) => T,
  persistFn: (
    state: T,
  ) => Promise<{ success: true } | { success: false; error: string }>,
): {
  optimisticState: T;
  execute: () => Promise<{ success: boolean; error?: string }>;
} {
  const optimisticState = operation(currentState);

  return {
    optimisticState,
    execute: async () => {
      const result = await persistFn(optimisticState);
      return result;
    },
  };
}

export default useOptimisticUpdate;
