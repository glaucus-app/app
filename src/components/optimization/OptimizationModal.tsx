"use client";

import { useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { SkeletonText } from "@/components/ui/Skeleton";

interface OptimizationModalProps {
  isOpen: boolean;
  elapsedSeconds: number;
  onCancel: () => void;
}

/**
 * Modal overlay shown during optimization processing.
 * Displays elapsed time and provides cancel functionality.
 * (FR-017)
 */
export function OptimizationModal({
  isOpen,
  elapsedSeconds,
  onCancel,
}: OptimizationModalProps) {
  // Handle Escape key cancellation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  // Handle click outside to cancel
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        onCancel();
      }
    },
    [onCancel],
  );

  if (!isOpen) return null;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isLongRunning = elapsedSeconds >= 20;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-lg shadow-[var(--shadow-xl)] p-6 max-w-sm w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-[var(--foreground)]"
          >
            Optimizing...
          </h2>
          <button
            onClick={onCancel}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            aria-label="Cancel optimization"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mb-4">
          <div className="flex items-center justify-center mb-4">
            {/* Spinning loader */}
            <div className="w-12 h-12 border-4 border-[var(--primary)]/30 dark:border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
          </div>

          {/* Elapsed time */}
          <div className="text-center">
            <span className="text-3xl font-mono text-[var(--foreground)]">
              {formatTime(elapsedSeconds)}
            </span>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              elapsed
            </p>
          </div>
        </div>

        {/* Long running warning */}
        {isLongRunning && (
          <div className="mb-4 p-3 bg-[var(--warning)]/10 rounded-md">
            <p className="text-sm text-[var(--warning)]">
              Still processing... This is taking longer than expected.
            </p>
          </div>
        )}

        {/* Loading details skeleton */}
        <div className="mb-4 space-y-2">
          <SkeletonText lines={2} />
        </div>

        {/* Cancel button */}
        <button
          onClick={onCancel}
          className="w-full px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--secondary)] rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
        >
          Cancel
        </button>

        {/* Keyboard hint */}
        <p className="mt-2 text-xs text-center text-[var(--muted-foreground)]">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-[var(--secondary)] rounded text-xs font-mono">
            Esc
          </kbd>{" "}
          to cancel
        </p>
      </div>
    </div>
  );
}
