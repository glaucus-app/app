"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Sparkles,
  Zap,
  Gem,
} from "lucide-react";
import type { InfusionRecommendation } from "@/lib/optimization/types";
import { cn } from "@/lib/utils/cn";

interface InfusionRecommendationCardProps {
  recommendation: InfusionRecommendation;
  gemName?: string;
}

/**
 * Card displaying an infusion recommendation for dormant 5-star gems.
 * Shows source gems, GP requirements, and resonance gain.
 * (T100c - FR-037b)
 */
export function InfusionRecommendationCard({
  recommendation,
  gemName,
}: InfusionRecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    slot,
    gemId,
    currentRank,
    quality,
    sourceGems,
    totalGemPower,
    additionalResonance,
    powerGain,
    priorityRank,
    reasoning,
  } = recommendation;

  // Format gem name from ID if not provided
  const displayName =
    gemName ??
    gemId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  // Priority badge styling
  const getPriorityBadgeClass = (rank: number): string => {
    if (rank === 1)
      return "bg-[var(--warning)]/10 text-[var(--warning)] dark:bg-[var(--warning)]/20 dark:text-[var(--warning)]";
    if (rank === 2)
      return "bg-[var(--effect-all)]/10 text-[var(--effect-all)] dark:bg-[var(--effect-all)]/20 dark:text-[var(--effect-all)]";
    return "bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--primary)]/20 dark:text-[var(--primary)]";
  };

  // Format source gem display
  const formatSourceGem = (gem: (typeof sourceGems)[0]): string => {
    const starLabel = gem.starRating === 2 ? "2★" : "5★";
    return `${starLabel} R${gem.rank}`;
  };

  return (
    <div className="border border-[var(--effect-all)]/30 rounded-lg overflow-hidden bg-gradient-to-r from-[var(--effect-all)]/10 to-transparent">
      {/* Main Card Content */}
      <div
        className="p-4 cursor-pointer hover:bg-[var(--effect-all)]/10 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => e.key === "Enter" && setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
      >
        <div className="flex items-start gap-3">
          {/* Priority Badge */}
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              getPriorityBadgeClass(priorityRank),
            )}
          >
            <Zap className="w-3 h-3" />
            <span>#{priorityRank}</span>
          </div>

          {/* Gem Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-[var(--foreground)] truncate">
                {displayName}
              </h3>
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-[var(--warning)]/10 text-[var(--warning)]">
                5★
              </span>
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-[var(--effect-all)]/10 text-[var(--effect-all)]">
                INFUSION
              </span>
            </div>

            {/* Infusion Summary */}
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Gem className="w-4 h-4" />
              <span>
                Slot {slot} • R{currentRank} {quality}/5
              </span>
            </div>

            {/* Resonance Gain */}
            <div className="flex items-center gap-3 mt-2 text-sm">
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-[var(--effect-all)]" />
                <span className="font-medium text-[var(--effect-all)]">
                  +{additionalResonance} Resonance
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-[var(--success)]" />
                <span className="font-medium text-[var(--success)]">
                  +{powerGain.toLocaleString()} Power
                </span>
              </div>
            </div>
          </div>

          {/* Expand Toggle */}
          <button
            className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-[var(--effect-all)]/30 pt-4">
          {/* Reasoning */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-1">
              Strategy
            </h4>
            <p className="text-sm text-[var(--foreground)]">{reasoning}</p>
          </div>

          {/* Source Gems Required */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
              Source Gems ({sourceGems.length} slots)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sourceGems.map((gem, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 bg-[var(--background)] rounded border border-[var(--border)]"
                >
                  <Gem className="w-4 h-4 text-[var(--effect-all)]" />
                  <div className="text-sm">
                    <span className="font-medium text-[var(--foreground)]">
                      {formatSourceGem(gem)}
                    </span>
                    <span className="text-[var(--muted-foreground)] ml-1">
                      (+{gem.resonanceContributed} res)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gem Power Cost */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
              Gem Power Required
            </h4>
            <div className="p-3 bg-[var(--muted)] dark:bg-[var(--effect-all)]/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">
                  Total GP for Infusion
                </span>
                <span className="font-medium text-[var(--effect-all)]">
                  {totalGemPower.toLocaleString()} GP
                </span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                Additional resonance = Socketed GP ÷ 200 (max{" "}
                {additionalResonance} for R10)
              </p>
            </div>
          </div>

          {/* Infusion Benefits */}
          <div className="p-3 bg-[var(--success)]/10 rounded-lg border border-[var(--success)]/30">
            <h4 className="text-xs font-medium text-[var(--success)] uppercase tracking-wide mb-2">
              Benefits
            </h4>
            <ul className="space-y-1 text-sm text-[var(--success)]">
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>+{additionalResonance} additional resonance</span>
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>+{powerGain.toLocaleString()} power gain</span>
              </li>
              <li className="flex items-center gap-2">
                <Gem className="w-4 h-4" />
                <span>Re-awakens dormant gem effects</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
