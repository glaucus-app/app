"use client";

/**
 * GemCard — Tactical Minimalism catalog card
 *
 * Uses InventorySlot for the icon area, with gem name and tier badges
 * rendered below in a minimal dark style.
 */

import type { LegendaryGem, TierRanking } from "@/types";
import { Plus, Info } from "lucide-react";
import { GemSummaryTooltip } from "@/components/ui";
import InventorySlot from "./InventorySlot";

// ============================================================================
// Types
// ============================================================================

export interface GemCardProps {
  gem: LegendaryGem;
  onClick?: () => void;
  onInfoClick?: () => void;
  compact?: boolean;
  selected?: boolean;
  showAddButton?: boolean;
  showTooltip?: boolean;
  shortDescription?: string;
  className?: string;
}

// ============================================================================
// Tier badge colors — muted, monochrome-first
// ============================================================================

const tierTextColors: Record<TierRanking, string> = {
  S: "text-[var(--primary)]",
  A: "text-[var(--foreground)]",
  B: "text-[var(--warning)]",
  C: "text-[var(--muted-foreground)]",
  D: "text-[var(--muted-foreground)]/70",
};

// ============================================================================
// Component
// ============================================================================

export default function GemCard({
  gem,
  onClick,
  onInfoClick,
  compact = false,
  selected = false,
  showAddButton = true,
  showTooltip = false,
  shortDescription,
  className = "",
}: GemCardProps) {
  const starLabel =
    gem.starRating === 5 ? "5★" : gem.starRating === 2 ? "2★" : "1★";

  // ── Compact variant ──────────────────────────────────────────────────────
  if (compact) {
    const compactEl = (
      <div
        onClick={onClick}
        className={[
          "flex items-center gap-2 px-2 py-1.5",
          "border border-[var(--border)] bg-[var(--background)]",
          selected ? "ring-1 ring-inset ring-[var(--primary)]" : "",
          onClick
            ? "cursor-pointer hover:border-[var(--primary)] transition-colors"
            : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="font-sans text-xs text-[var(--foreground)] truncate">
          {gem.name}
        </span>
        <span className="font-mono text-[10px] text-[var(--muted-foreground)] flex-shrink-0">
          {starLabel}
        </span>
      </div>
    );
    return compactEl;
  }

  // ── Full catalog card ────────────────────────────────────────────────────
  const cardEl = (
    <div
      className={[
        "flex flex-col bg-[var(--background)] border border-[var(--border)]",
        "rounded-[var(--radius)] overflow-hidden",
        selected ? "ring-1 ring-inset ring-[var(--primary)]" : "",
        onClick
          ? "cursor-pointer hover:border-[var(--primary)] transition-colors group"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Inventory slot — square icon area */}
      <InventorySlot
        src={gem.icon ?? undefined}
        alt={gem.name}
        selected={selected}
        className="w-full"
      >
        {/* Fallback gem placeholder */}
        <div className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)] text-lg select-none">
          ◆
        </div>
      </InventorySlot>

      {/* Metadata footer */}
      <div className="px-2 py-1.5 border-t border-[var(--border)] space-y-1">
        {/* Gem name */}
        <p className="font-sans text-[11px] text-[var(--foreground)] leading-tight line-clamp-2 min-h-[2.2em]">
          {gem.name}
        </p>

        {/* Star rating + tier row */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
            {starLabel}
          </span>
          <div className="flex items-center gap-1">
            <span
              className={`font-mono text-[10px] ${tierTextColors[gem.pvpTier]}`}
              title="PVP Tier"
            >
              P:{gem.pvpTier}
            </span>
            <span
              className={`font-mono text-[10px] ${tierTextColors[gem.pveTier]}`}
              title="PVE Tier"
            >
              E:{gem.pveTier}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        {(showAddButton || onInfoClick) && (
          <div className="flex items-center justify-end gap-1 pt-0.5">
            {onInfoClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInfoClick();
                }}
                className="flex items-center justify-center w-6 h-6 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                aria-label={`View ${gem.name} details`}
              >
                <Info size={12} />
              </button>
            )}
            {showAddButton && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.();
                }}
                className="flex items-center justify-center w-6 h-6 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                aria-label={`Add ${gem.name}`}
              >
                <Plus size={12} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (showTooltip && !compact) {
    return (
      <GemSummaryTooltip
        name={gem.name}
        starRating={gem.starRating}
        pvpTier={gem.pvpTier}
        pveTier={gem.pveTier}
        shortDescription={shortDescription}
        source={gem.source}
      >
        {cardEl}
      </GemSummaryTooltip>
    );
  }

  return cardEl;
}
