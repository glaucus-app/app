"use client";

import { AlertCircle, TrendingUp, Clock, Zap } from "lucide-react";
import type { OptimizationResult } from "@/types/optimization";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { RecommendationCard } from "./RecommendationCard";

interface ResultsPanelProps {
  result: OptimizationResult | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Panel displaying optimization results with ranked recommendations.
 * Shows loading skeleton, error state, or recommendation cards.
 * (FR-018)
 */
export function ResultsPanel({ result, isLoading, error }: ResultsPanelProps) {
  // Sort recommendations by priority rank
  const recommendations = result?.recommendations ?? [];
  const sortedRecommendations = [...recommendations].sort(
    (a, b) => a.priorityRank - b.priorityRank,
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-[var(--card)] rounded-lg shadow-[var(--shadow-md)] p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            Optimization Results
          </h2>
          <p className="text-sm text-[var(--muted-foreground)]">
            Calculating best upgrade path...
          </p>
        </div>
        <SkeletonGrid count={3} variant="recommendation" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-[var(--card)] rounded-lg shadow-[var(--shadow-md)] p-6">
        <div className="flex items-start gap-3 text-[var(--destructive)]">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium">Optimization Failed</h3>
            <p className="text-sm text-[var(--destructive)]/80 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!result) {
    return (
      <div className="bg-[var(--card)] rounded-lg shadow-[var(--shadow-md)] p-6">
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 mx-auto text-[var(--muted-foreground)] mb-3" />
          <h3 className="text-[var(--muted-foreground)] font-medium">
            No results yet
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Configure your gems and resources, then click Optimize
          </p>
        </div>
      </div>
    );
  }

  // No recommendations found
  if (sortedRecommendations.length === 0) {
    return (
      <div className="bg-[var(--card)] rounded-lg shadow-[var(--shadow-md)] p-6">
        <div className="text-center py-8">
          <Zap className="w-12 h-12 mx-auto text-[var(--warning)] mb-3" />
          <h3 className="text-[var(--foreground)] font-medium">
            No upgrades available
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            All your gems are at maximum rank or resources are insufficient
          </p>
        </div>
      </div>
    );
  }

  // Format processing time
  const formatProcessingTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Format total power gain
  const formatPowerGain = (gain: number): string => {
    return `+${gain.toLocaleString()}`;
  };

  return (
    <div className="bg-[var(--card)] rounded-lg shadow-[var(--shadow-md)] p-6">
      {/* Header with summary stats */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
          Optimization Results
        </h2>
        <div className="flex flex-wrap gap-4">
          {/* Total Power Gain */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--success)]" />
            <span className="text-sm text-[var(--muted-foreground)]">
              Power Gain:
            </span>
            <span className="font-medium text-[var(--success)]">
              {formatPowerGain(result.totalPowerGain)}
            </span>
          </div>

          {/* Processing Time */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--muted-foreground)]" />
            <span className="text-sm text-[var(--muted-foreground)]">
              Time:
            </span>
            <span className="font-medium text-[var(--foreground)]">
              {formatProcessingTime(result.processingTime)}
            </span>
          </div>

          {/* Recommendations Count */}
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[var(--warning)]" />
            <span className="text-sm text-[var(--muted-foreground)]">
              Recommendations:
            </span>
            <span className="font-medium text-[var(--foreground)]">
              {sortedRecommendations.length}
            </span>
          </div>
        </div>
      </div>

      {/* Recommendation Cards */}
      <div className="space-y-3">
        {sortedRecommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
          />
        ))}
      </div>

      {/* Timestamp footer */}
      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--muted-foreground)]">
          Calculated: {new Date(result.calculatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
