/**
 * GemDetail component for DI-Lab
 * Modal showing full gem information with close button, ESC key support, click-outside close (FR-030, FR-030a)
 * Enhanced with upgrade costs (FR-032), tier rankings (FR-033), and resonance values (T082-T084)
 */

"use client";

import type {
  LegendaryGem,
  TierRanking,
  GemEffect,
  StarRating,
  Quality,
} from "@/types";
import { Modal } from "@/components/ui";
import { formatStarRating } from "@/lib/utils/formatting";
import {
  ONE_STAR_RESONANCE,
  TWO_STAR_RESONANCE,
  FIVE_STAR_RESONANCE,
  ONE_STAR_CR,
  TWO_STAR_CR,
  FIVE_STAR_CR,
  GEM_POWER_COSTS,
} from "@/lib/optimization/constants";

// ============================================================================
// Types
// ============================================================================

export interface GemDetailProps {
  /** Gem to display */
  gem: LegendaryGem | null;
  /** Whether modal is open */
  isOpen: boolean;
  /** Called when modal should close */
  onClose: () => void;
  /** Called when user clicks "Add to Build" */
  onAdd?: (gem: LegendaryGem) => void;
  /** Show add button */
  showAddButton?: boolean;
}

// ============================================================================
// Styles
// ============================================================================

const tierColors: Record<TierRanking, string> = {
  S: "bg-[var(--primary)] text-[var(--primary-foreground)]",
  A: "bg-[var(--muted)] text-[var(--foreground)]",
  B: "bg-[var(--warning)] text-[var(--warning-foreground)]",
  C: "bg-[var(--muted)] text-[var(--foreground)]",
  D: "bg-[var(--muted)] text-[var(--foreground)]",
};

const effectCategoryColors: Record<string, string> = {
  OFF: "bg-[var(--effect-offense)] text-[var(--effect-offense-fg)] border-[var(--effect-offense)]",
  DEF: "bg-[var(--effect-defense)] text-[var(--effect-defense-fg)] border-[var(--effect-defense)]",
  ALL: "bg-[var(--effect-all)] text-[var(--effect-all-fg)] border-[var(--effect-all)]",
  DOT: "bg-[var(--effect-utility)] text-[var(--effect-utility-fg)] border-[var(--effect-utility)]",
  LOC: "bg-[var(--effect-cc)] text-[var(--effect-cc-fg)] border-[var(--effect-cc)]",
  TLOC: "bg-[var(--effect-cc)] text-[var(--effect-cc-fg)] border-[var(--effect-cc)]",
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get resonance value for a gem at a specific rank and quality
 */
function getResonanceValue(
  starRating: StarRating,
  rank: number,
  quality?: number,
): number {
  switch (starRating) {
    case 1:
      return ONE_STAR_RESONANCE[rank] ?? 0;
    case 2:
      return TWO_STAR_RESONANCE[rank] ?? 0;
    case 5:
      const q = (quality ?? 2) as 2 | 3 | 4 | 5;
      return FIVE_STAR_RESONANCE[q]?.[rank] ?? 0;
    default:
      return 0;
  }
}

/**
 * Get CR value for a gem at a specific rank and quality
 */
function getCRValue(
  starRating: StarRating,
  rank: number,
  quality?: number,
): number {
  switch (starRating) {
    case 1:
      return ONE_STAR_CR[rank] ?? 0;
    case 2:
      return TWO_STAR_CR[rank] ?? 0;
    case 5:
      const q = (quality ?? 2) as 2 | 3 | 4 | 5;
      return FIVE_STAR_CR[q]?.[rank] ?? 0;
    default:
      return 0;
  }
}

/**
 * Get gem power cost for upgrading to next rank
 */
function getGemPowerCost(starRating: StarRating, fromRank: number): number {
  return GEM_POWER_COSTS[starRating]?.[fromRank] ?? 0;
}

// ============================================================================
// Component
// ============================================================================

/**
 * GemDetail displays comprehensive information about a legendary gem
 * including effects, tier rankings, and upgrade costs (FR-031, FR-032, FR-033)
 *
 * @example
 * ```tsx
 * <GemDetail
 *   gem={selectedGem}
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onAdd={(gem) => addToBuild(gem)}
 * />
 * ```
 */
export default function GemDetail({
  gem,
  isOpen,
  onClose,
  onAdd,
  showAddButton = true,
}: GemDetailProps) {
  if (!gem) return null;

  const starDisplay = "★".repeat(gem.starRating);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={gem.name}
      size="lg"
      footer={
        showAddButton && onAdd ? (
          <button
            onClick={() => {
              onAdd(gem);
              onClose();
            }}
            className="
              px-4 py-2 rounded-lg
              bg-[var(--primary)] text-[var(--primary-foreground)] font-medium
              hover:bg-[var(--primary)]/90
              focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
              transition-colors
            "
          >
            Add to Build
          </button>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            {/* Star Rating */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[var(--warning)] text-xl">
                {starDisplay}
              </span>
              <span className="text-sm text-[var(--muted-foreground)]">
                {formatStarRating(gem.starRating)} Gem
              </span>
            </div>

            {/* Source */}
            {gem.source && (
              <p className="text-sm text-[var(--muted-foreground)]">
                Source: {gem.source}
              </p>
            )}
          </div>

          {/* Tier Badges */}
          <div className="flex gap-2">
            <div
              className={`px-3 py-1 rounded-lg text-sm font-medium ${tierColors[gem.pvpTier]}`}
            >
              PVP: {gem.pvpTier}
            </div>
            <div
              className={`px-3 py-1 rounded-lg text-sm font-medium ${tierColors[gem.pveTier]}`}
            >
              PVE: {gem.pveTier}
            </div>
          </div>
        </div>

        {/* Effects Section */}
        <div>
          <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">
            Gem Effects
          </h4>
          <div className="space-y-3">
            {gem.effects.map((effect, index) => (
              <EffectCard key={index} effect={effect} />
            ))}
          </div>
        </div>

        {/* Resonance Values Table (T084) */}
        <div>
          <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">
            Resonance Values by Rank
          </h4>
          <ResonanceTable starRating={gem.starRating} />
        </div>

        {/* Upgrade Costs Table (T082) */}
        <div>
          <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">
            Gem Power Upgrade Costs
          </h4>
          <UpgradeCostTable starRating={gem.starRating} />
        </div>

        {/* Info Box */}
        {gem.starRating === 5 && (
          <div className="bg-[var(--muted)] border border-[var(--border)] rounded-lg p-4">
            <p className="text-sm text-[var(--foreground)]">
              <strong>5-Star Gem:</strong> Quality affects resonance values.
              Higher quality gems provide more resonance at each rank.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

interface EffectCardProps {
  effect: GemEffect;
}

function EffectCard({ effect }: EffectCardProps) {
  const categoryColor =
    effectCategoryColors[effect.category] ||
    "bg-[var(--muted)] text-[var(--foreground)] border-[var(--border)]";

  // Get max value from maxValues record
  const maxValueEntry = Object.entries(effect.maxValues)[0];
  const maxValue = maxValueEntry ? maxValueEntry[1] : null;

  return (
    <div className="border border-[var(--border)] rounded-lg p-3 bg-[var(--card)]">
      {/* Category Badge */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium border ${categoryColor}`}
        >
          {effect.category}
        </span>
        <span className="text-xs text-[var(--muted-foreground)]">
          {effect.type}
        </span>
        {effect.isStrifed && (
          <span className="text-xs text-[var(--accent-foreground)] bg-[var(--accent)] px-1.5 py-0.5 rounded">
            Strifed
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--foreground)]">{effect.description}</p>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 mt-2 text-xs text-[var(--muted-foreground)]">
        {maxValue !== null && (
          <span>
            <span className="font-medium">Max:</span>{" "}
            {typeof maxValue === "number" ? `${maxValue}%` : maxValue}
          </span>
        )}
        {effect.duration && (
          <span>
            <span className="font-medium">Duration:</span> {effect.duration}s
          </span>
        )}
        {effect.cooldown && (
          <span>
            <span className="font-medium">Cooldown:</span> {effect.cooldown}s
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Resonance Table Component (T084)
// ============================================================================

interface ResonanceTableProps {
  starRating: StarRating;
}

function ResonanceTable({ starRating }: ResonanceTableProps) {
  const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  if (starRating === 5) {
    // 5-star gems have different resonance per quality
    const qualities: Quality[] = [2, 3, 4, 5];
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border border-[var(--border)] rounded-lg">
          <thead className="bg-[var(--muted)]/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)] border-b">
                Rank
              </th>
              {qualities.map((q) => (
                <th
                  key={q}
                  className="px-3 py-2 text-center font-medium text-[var(--muted-foreground)] border-b"
                >
                  Q{q}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranks.map((rank, idx) => (
              <tr
                key={rank}
                className={
                  idx % 2 === 0
                    ? "bg-[var(--background)]"
                    : "bg-[var(--muted)]/30"
                }
              >
                <td className="px-3 py-2 font-medium text-[var(--foreground)] border-b">
                  {rank}
                </td>
                {qualities.map((q) => (
                  <td
                    key={q}
                    className="px-3 py-2 text-center text-[var(--muted-foreground)] border-b"
                  >
                    {getResonanceValue(5, rank, q).toLocaleString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 1-star and 2-star gems have flat resonance per rank
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border border-[var(--border)] rounded-lg">
        <thead className="bg-[var(--muted)]">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)] border-b">
              Rank
            </th>
            <th className="px-3 py-2 text-center font-medium text-[var(--muted-foreground)] border-b">
              Resonance
            </th>
            <th className="px-3 py-2 text-center font-medium text-[var(--muted-foreground)] border-b">
              CR
            </th>
          </tr>
        </thead>
        <tbody>
          {ranks.map((rank, idx) => (
            <tr
              key={rank}
              className={
                idx % 2 === 0 ? "bg-[var(--background)]" : "bg-[var(--muted)]"
              }
            >
              <td className="px-3 py-2 font-medium text-[var(--foreground)] border-b">
                {rank}
              </td>
              <td className="px-3 py-2 text-center text-[var(--muted-foreground)] border-b">
                {getResonanceValue(starRating, rank).toLocaleString()}
              </td>
              <td className="px-3 py-2 text-center text-[var(--muted-foreground)] border-b">
                {getCRValue(starRating, rank).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Upgrade Cost Table Component (T082)
// ============================================================================

interface UpgradeCostTableProps {
  starRating: StarRating;
}

function UpgradeCostTable({ starRating }: UpgradeCostTableProps) {
  const ranks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const costs = GEM_POWER_COSTS[starRating];

  if (!costs) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">
        Upgrade costs not available for this gem type.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border border-[var(--border)] rounded-lg">
        <thead className="bg-[var(--muted)]">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)] border-b">
              From Rank
            </th>
            <th className="px-3 py-2 text-center font-medium text-[var(--muted-foreground)] border-b">
              To Rank
            </th>
            <th className="px-3 py-2 text-center font-medium text-[var(--muted-foreground)] border-b">
              Gem Power Cost
            </th>
          </tr>
        </thead>
        <tbody>
          {ranks.slice(0, -1).map((rank, idx) => (
            <tr
              key={rank}
              className={
                idx % 2 === 0 ? "bg-[var(--background)]" : "bg-[var(--muted)]"
              }
            >
              <td className="px-3 py-2 font-medium text-[var(--foreground)] border-b">
                {rank}
              </td>
              <td className="px-3 py-2 text-center text-[var(--muted-foreground)] border-b">
                {rank + 1}
              </td>
              <td className="px-3 py-2 text-center text-[var(--muted-foreground)] border-b">
                {(costs[rank] ?? 0).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
