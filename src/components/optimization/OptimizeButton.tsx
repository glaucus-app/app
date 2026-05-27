/**
 * OptimizeButton component - triggers optimization with loading states (FR-015)
 */

"use client";

import { Button } from "@/components/ui/Button";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ============================================================================
// Types
// ============================================================================

export interface OptimizeButtonProps {
  /** Whether optimization is in progress */
  isLoading?: boolean;
  /** Whether the button should be disabled */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Processing time elapsed in seconds */
  elapsedSeconds?: number;
}

// ============================================================================
// Component
// ============================================================================

export function OptimizeButton({
  isLoading = false,
  disabled = false,
  onClick,
  className,
  size = "lg",
  elapsedSeconds,
}: OptimizeButtonProps) {
  const showWarning = elapsedSeconds !== undefined && elapsedSeconds >= 20;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <Button
        variant="primary"
        size={size}
        onClick={onClick}
        disabled={disabled || isLoading}
        className={cn("min-w-[200px]", isLoading && "cursor-wait")}
        aria-busy={isLoading}
        aria-label={isLoading ? "Optimizing..." : "Run optimization"}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Optimizing...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Optimize Build
          </>
        )}
      </Button>

      {/* Processing time indicator */}
      {isLoading && elapsedSeconds !== undefined && (
        <div className="text-sm text-[var(--muted-foreground)]">
          <span
            className={cn(showWarning && "text-[var(--warning)] font-medium")}
          >
            {elapsedSeconds}s elapsed
          </span>
        </div>
      )}

      {/* 20-second warning */}
      {showWarning && (
        <p className="text-sm text-[var(--warning)] animate-pulse">
          Still processing... This is taking longer than expected.
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Helper Hook for Timing
// ============================================================================

import { useState, useEffect, useRef } from "react";

export function useOptimizeTimer(isLoading: boolean) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear interval helper
  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  };

  // Start/stop timer based on loading state
  useEffect(() => {
    if (isLoading) {
      // Start timer
      startTimeRef.current = Date.now();

      intervalRef.current = setInterval(() => {
        if (startTimeRef.current !== null) {
          const elapsed = Math.floor(
            (Date.now() - startTimeRef.current) / 1000,
          );
          setElapsedSeconds(elapsed);
        }
      }, 1000);
    }

    return () => {
      clearTimer();
    };
  }, [isLoading]);

  return isLoading ? elapsedSeconds : 0;
}
