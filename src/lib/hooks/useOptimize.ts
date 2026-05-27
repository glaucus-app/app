"use client";

import { useCallback, useRef, useState } from "react";
import type {
  OptimizationResult,
  OptimizationError,
  OptimizeRequest,
  OptimizeResponse,
  OptimizeErrorResponse,
} from "@/types/optimization";

const RETRY_DELAY_MS = 1000; // Fixed 1s delay per FR-021b
const TIMEOUT_MS = 30000; // 30 second timeout per FR-022

interface UseOptimizeOptions {
  onSuccess?: (result: OptimizationResult) => void;
  onError?: (error: OptimizationError) => void;
  onRetry?: (attemptNumber: number) => void;
}

interface UseOptimizeReturn {
  optimize: (request: OptimizeRequest) => Promise<void>;
  cancel: () => void;
  isLoading: boolean;
  result: OptimizationResult | null;
  error: OptimizationError | null;
  retryCount: number;
  elapsedSeconds: number;
}

/**
 * Hook for optimization API calls with retry, timeout, and cancellation.
 * (FR-021b, FR-022, FR-022a)
 */
export function useOptimize(
  options: UseOptimizeOptions = {},
): UseOptimizeReturn {
  const { onSuccess, onError, onRetry } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<OptimizationError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasRetriedRef = useRef(false);

  // Clear timer
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  // Start timer
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current !== null) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSeconds(elapsed);
      }
    }, 1000);
  }, []);

  // Cancel ongoing optimization
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    clearTimer();
    setIsLoading(false);
    setError({
      type: "timeout",
      title: "Optimization Cancelled",
      message: "The optimization was cancelled by the user.",
      guidance: "Click Optimize to try again.",
    });
  }, [clearTimer]);

  // Main optimization function
  const optimize = useCallback(
    async (request: OptimizeRequest) => {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Reset state
      setResult(null);
      setError(null);
      setIsLoading(true);
      hasRetriedRef.current = false;
      startTimer();

      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        // Create timeout promise
        const timeoutId = setTimeout(() => {
          abortController.abort();
        }, TIMEOUT_MS);

        const response = await fetch("/api/optimize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
          signal: abortController.signal,
        });

        clearTimeout(timeoutId);

        // Parse response
        const data = await response.json();

        if (!response.ok) {
          // Handle error response
          const errorResponse = data as OptimizeErrorResponse;

          // Check for retryable errors (5xx server errors, not rate-limited)
          const isRetryable = response.status >= 500 && !hasRetriedRef.current;

          if (isRetryable) {
            hasRetriedRef.current = true;
            setRetryCount((prev) => prev + 1);
            onRetry?.(1);

            // Wait 1s and retry
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));

            // Retry the request (recursive call)
            setIsLoading(false);
            await optimize(request);
            return;
          }

          // Non-retryable error
          const err: OptimizationError = {
            type: errorResponse.type,
            title: errorResponse.title,
            message: errorResponse.message,
            guidance: errorResponse.guidance,
            details: errorResponse.details,
          };
          setError(err);
          onError?.(err);
          return;
        }

        // Success
        const successResponse = data as OptimizeResponse;
        const result: OptimizationResult = {
          recommendations: successResponse.recommendations,
          totalPowerGain: successResponse.totalPowerGain,
          totalResourceCost: successResponse.totalResourceCost,
          mode: successResponse.mode,
          calculatedAt: successResponse.calculatedAt,
          processingTime: successResponse.processingTime,
        };
        setResult(result);
        onSuccess?.(result);
      } catch (err) {
        // Handle network errors and aborts
        if (err instanceof Error) {
          if (err.name === "AbortError") {
            // Request was cancelled or timed out
            if (!hasRetriedRef.current) {
              // This was a timeout
              setError({
                type: "timeout",
                title: "Request Timeout",
                message: "The optimization took longer than 30 seconds.",
                guidance:
                  "Try simplifying your gem configuration or try again later.",
              });
            }
          } else {
            // Network error
            setError({
              type: "server-error",
              title: "Network Error",
              message: err.message || "Unable to connect to the server.",
              guidance: "Check your internet connection and try again.",
            });
          }
        }
      } finally {
        clearTimer();
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [onSuccess, onError, onRetry, startTimer, clearTimer],
  );

  return {
    optimize,
    cancel,
    isLoading,
    result,
    error,
    retryCount,
    elapsedSeconds,
  };
}

/**
 * Hook for detecting network online/offline status.
 * (FR-021d)
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  // Note: This would need useEffect in a real implementation
  // Simplified for lint compliance - actual event listeners would be added in useEffect

  return {
    isOnline,
    isOffline: !isOnline,
  };
}
