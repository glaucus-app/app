/**
 * Skeleton component for loading states (FR-016, FR-016a)
 */

import { cn } from "@/lib/utils/cn";

// ============================================================================
// Types
// ============================================================================

export interface SkeletonProps {
  /** Additional CSS classes */
  className?: string;
  /** Animation variant */
  variant?: "pulse" | "wave" | "none";
}

// ============================================================================
// Component
// ============================================================================

export function Skeleton({ className, variant = "pulse" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-[var(--muted)] rounded",
        variant === "pulse" && "animate-pulse",
        variant === "wave" && "animate-shimmer",
        className,
      )}
      aria-hidden="true"
    />
  );
}

// ============================================================================
// Specialized Skeletons
// ============================================================================

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 border rounded-lg", className)}>
      <Skeleton className="h-6 w-1/2 mb-4" />
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonGemCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-3 border rounded-lg", className)}>
      <Skeleton className="w-12 h-12 rounded-lg mb-2" />
      <Skeleton className="h-4 w-20 mb-1" />
      <Skeleton className="h-3 w-12" />
    </div>
  );
}

export function SkeletonRecommendation({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 border rounded-lg space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-20 rounded" />
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonGrid({
  count = 6,
  variant = "gem",
  className,
}: {
  count?: number;
  variant?: "gem" | "recommendation";
  className?: string;
}) {
  const gridCols =
    variant === "recommendation" ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3";

  return (
    <div className={cn(`grid ${gridCols} gap-4`, className)}>
      {Array.from({ length: count }).map((_, i) =>
        variant === "recommendation" ? (
          <SkeletonRecommendation key={i} />
        ) : (
          <SkeletonGemCard key={i} />
        ),
      )}
    </div>
  );
}
