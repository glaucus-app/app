"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Star,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import type { UpgradeRecommendation } from "@/types/optimization";
import type { TierRanking } from "@/types/gem";
import { cn } from "@/lib/utils/cn";

interface RecommendationCardProps {
  recommendation: UpgradeRecommendation;
}

/**
 * Card displaying a single upgrade recommendation.
 * Expandable to show details, alternatives, and resource breakdown.
 * (FR-019, FR-020)
 */
export function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    targetGem,
    currentRank,
    targetRank,
    resourceCost,
    powerGain,
    priorityRank,
    reasoning,
    alternatives,
  } = recommendation;

  // Priority badge styling
  const getPriorityBadgeClass = (rank: number): string => {
    if (rank === 1)
      return "bg-[var(--warning)]/10 text-[var(--warning)] dark:bg-[var(--warning)]/20 dark:text-[var(--warning)]";
    if (rank === 2)
      return "bg-[var(--muted)] text-[var(--foreground)] dark:bg-[var(--muted)] dark:text-[var(--foreground)]";
    if (rank === 3)
      return "bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--primary)]/20 dark:text-[var(--primary)]/80";
    return "bg-[var(--muted)] text-[var(--muted-foreground)] dark:bg-[var(--muted)] dark:text-[var(--muted-foreground)]";
  };

  const getPriorityIcon = (rank: number) => {
    if (rank === 1) return <Star className="w-3 h-3" />;
    if (rank === 2) return <Sparkles className="w-3 h-3" />;
    return null;
  };

  // Tier badge styling
  const getTierBadgeClass = (tier: TierRanking): string => {
    const classes: Record<TierRanking, string> = {
      S: "bg-[var(--success)]/10 text-[var(--success)] dark:bg-[var(--success)]/20 dark:text-[var(--success)]",
      A: "bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--primary)]/20 dark:text-[var(--primary)]",
      B: "bg-[var(--muted)] text-[var(--foreground)] dark:bg-[var(--muted)] dark:text-[var(--foreground)]",
      C: "bg-[var(--primary)]/10 text-[var(--primary)] dark:bg-[var(--primary)]/20 dark:text-[var(--primary)]",
      D: "bg-[var(--destructive)]/10 text-[var(--destructive)] dark:bg-[var(--destructive)]/20 dark:text-[var(--destructive)]",
    };
    return classes[tier];
  };

  // Format resource cost for display
  const formatResourceCost = (
    cost: Record<string, number | undefined>,
  ): string[] => {
    const items: string[] = [];
    if (cost.gemPower)
      items.push(`${cost.gemPower.toLocaleString()} Gem Power`);
    if (cost.copies) items.push(`${cost.copies} copies`);
    if (cost.platinum) items.push(`${cost.platinum.toLocaleString()} Platinum`);
    if (cost.telluricPearls)
      items.push(`${cost.telluricPearls} Telluric Pearls`);
    if (cost.telluricFragments)
      items.push(`${cost.telluricFragments} Fragments`);
    if (cost.fadingEmbers) items.push(`${cost.fadingEmbers} Fading Embers`);
    return items;
  };

  // Get gem name from gemId (placeholder - would need gem database lookup)
  const gemName = targetGem.gemId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Placeholder tier - would come from gem database lookup
  const tier: TierRanking = "A";

  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden">
      {/* Main Card Content */}
      <div
        className="p-4 cursor-pointer hover:bg-[var(--muted)]/50 transition-colors"
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
            {getPriorityIcon(priorityRank)}
            <span>#{priorityRank}</span>
          </div>

          {/* Gem Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-[var(--foreground)] truncate">
                {gemName}
              </h3>
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-xs font-medium",
                  getTierBadgeClass(tier),
                )}
              >
                {tier}
              </span>
            </div>

            {/* Upgrade Path */}
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <span>Rank {currentRank}</span>
              <ArrowRight className="w-4 h-4" />
              <span className="font-medium text-[var(--foreground)]">
                Rank {targetRank}
              </span>
            </div>

            {/* Power Gain */}
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-[var(--success)]" />
              <span className="font-medium text-[var(--success)]">
                +{powerGain.toLocaleString()} Power
              </span>
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
        <div className="px-4 pb-4 border-t border-[var(--border)] pt-4">
          {/* Reasoning */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-1">
              Reasoning
            </h4>
            <p className="text-sm text-[var(--foreground)]">{reasoning}</p>
          </div>

          {/* Resource Cost Breakdown */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
              Resource Cost
            </h4>
            <div className="flex flex-wrap gap-2">
              {formatResourceCost(
                resourceCost as Record<string, number | undefined>,
              ).map((item, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-[var(--muted)] rounded text-sm text-[var(--foreground)]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Alternatives */}
          {alternatives && alternatives.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
                Alternatives
              </h4>
              <div className="space-y-2">
                {alternatives.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-[var(--muted)]/50 rounded text-sm"
                  >
                    <p className="text-[var(--foreground)] mb-1">
                      {alt.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <span className="text-[var(--success)]">
                        +{alt.powerGain.toLocaleString()} Power
                      </span>
                      <span>•</span>
                      <span>{alt.tradeoff}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
