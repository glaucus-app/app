/**
 * GemSelector component for DI-Lab
 * Quality and rank dropdown selectors for equipped gems (FR-005a)
 */

"use client";

import { useCallback } from "react";
import type { Quality, Rank, LegendaryGem } from "@/types";
import {
  Select,
  createNumberOptions,
  type SelectOption,
} from "@/components/ui";

// ============================================================================
// Types
// ============================================================================

export interface GemSelectorProps {
  /** Gem being configured */
  gem: LegendaryGem | null;
  /** Current quality (only for 5-star gems) */
  quality: Quality;
  /** Current rank */
  rank: Rank;
  /** Called when quality changes */
  onQualityChange?: (quality: Quality) => void;
  /** Called when rank changes */
  onRankChange?: (rank: Rank) => void;
  /** Show quality selector (only meaningful for 5-star gems) */
  showQuality?: boolean;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: "sm" | "md";
}

// ============================================================================
// Constants
// ============================================================================

/** Quality options with star display */
const QUALITY_OPTIONS: SelectOption[] = [
  { value: 1, label: "1★ Quality" },
  { value: 2, label: "2★ Quality" },
  { value: 3, label: "3★ Quality" },
  { value: 4, label: "4★ Quality" },
  { value: 5, label: "5★ Quality" },
];

/** Rank options */
const RANK_OPTIONS: SelectOption[] = createNumberOptions(
  1,
  10,
  (n) => `Rank ${n}`,
);

// ============================================================================
// Component
// ============================================================================

/**
 * GemSelector provides quality and rank dropdowns for gem configuration
 * Quality only applies to 5-star gems (FR-005a)
 *
 * @example
 * ```tsx
 * <GemSelector
 *   gem={equippedGem}
 *   quality={quality}
 *   rank={rank}
 *   onQualityChange={setQuality}
 *   onRankChange={setRank}
 *   showQuality={gem?.starRating === 5}
 * />
 * ```
 */
export default function GemSelector({
  gem,
  quality,
  rank,
  onQualityChange,
  onRankChange,
  showQuality = true,
  disabled = false,
  size = "md",
}: GemSelectorProps) {
  // Only show quality for 5-star gems
  const shouldShowQuality = showQuality && gem?.starRating === 5;

  // Handle quality change
  const handleQualityChange = useCallback(
    (value: string) => {
      const newQuality = parseInt(value, 10) as Quality;
      if (newQuality >= 1 && newQuality <= 5) {
        onQualityChange?.(newQuality);
      }
    },
    [onQualityChange],
  );

  // Handle rank change
  const handleRankChange = useCallback(
    (value: string) => {
      const newRank = parseInt(value, 10) as Rank;
      if (newRank >= 1 && newRank <= 10) {
        onRankChange?.(newRank);
      }
    },
    [onRankChange],
  );

  return (
    <div className="flex items-center gap-2">
      {/* Quality selector - only for 5-star gems */}
      {shouldShowQuality && (
        <Select
          label="Quality"
          options={QUALITY_OPTIONS}
          value={quality}
          onChange={handleQualityChange}
          disabled={disabled}
          className="min-w-[120px]"
        />
      )}

      {/* Rank selector */}
      <Select
        label="Rank"
        options={RANK_OPTIONS}
        value={rank}
        onChange={handleRankChange}
        disabled={disabled}
        className="min-w-[100px]"
      />
    </div>
  );
}

// ============================================================================
// Compact Variant
// ============================================================================

export interface CompactGemSelectorProps {
  /** Current quality */
  quality: Quality;
  /** Current rank */
  rank: Rank;
  /** Whether this is a 5-star gem */
  isFiveStar: boolean;
  /** Called when quality changes */
  onQualityChange?: (quality: Quality) => void;
  /** Called when rank changes */
  onRankChange?: (rank: Rank) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * Compact inline selector for equipped gem slots
 */
export function CompactGemSelector({
  quality,
  rank,
  isFiveStar,
  onQualityChange,
  onRankChange,
  disabled = false,
}: CompactGemSelectorProps) {
  const handleQualityChange = useCallback(
    (value: string) => {
      const newQuality = parseInt(value, 10) as Quality;
      if (newQuality >= 1 && newQuality <= 5) {
        onQualityChange?.(newQuality);
      }
    },
    [onQualityChange],
  );

  const handleRankChange = useCallback(
    (value: string) => {
      const newRank = parseInt(value, 10) as Rank;
      if (newRank >= 1 && newRank <= 10) {
        onRankChange?.(newRank);
      }
    },
    [onRankChange],
  );

  return (
    <div className="flex items-center gap-1">
      {isFiveStar && (
        <select
          value={quality}
          onChange={(e) => handleQualityChange(e.target.value)}
          disabled={disabled}
          className="
            px-2 py-1 text-sm
            border border-[var(--border)] rounded
            bg-[var(--background)] text-[var(--foreground)]
            focus:outline-none focus:ring-1 focus:ring-[var(--primary)]
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          aria-label="Quality"
        >
          {QUALITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.value}★
            </option>
          ))}
        </select>
      )}

      <select
        value={rank}
        onChange={(e) => handleRankChange(e.target.value)}
        disabled={disabled}
        className="
          px-2 py-1 text-sm
          border border-[var(--border)] rounded
          bg-[var(--background)] text-[var(--foreground)]
          focus:outline-none focus:ring-1 focus:ring-[var(--primary)]
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        aria-label="Rank"
      >
        {RANK_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            R{opt.value}
          </option>
        ))}
      </select>
    </div>
  );
}
