"use client";

/**
 * InventorySlot — Tactical Minimalism game inventory slot component
 *
 * Design tokens:
 *   - Base: bg-black (pure black)
 *   - Borders: border-zinc-800 (1px solid)
 *   - Typography: font-sans labels, font-mono numeric data
 *   - Accent: #E11D48 (rose-600 / "Status Sanguine") for selected/equipped states
 *
 * Layering:
 *   1. Radial gradient background (#121212 → #000000)
 *   2. Gem image (children or src)
 *   3. Top-right: monospaced quantity digit
 *   4. Top-left: L-bracket equipped indicator (accent color)
 *   5. Bottom footer: 18px bar with "R[rank]" readout
 *   6. Left edge: 2px data-bar when selected
 */

import Image from "next/image";
import type { ReactNode } from "react";

// ============================================================================
// Types
// ============================================================================

export interface InventorySlotProps {
  /** Rank number displayed in footer as "R[n]" */
  rank?: number;
  /** Stack quantity shown in top-right corner */
  quantity?: number;
  /** Whether this gem is equipped (shows L-bracket indicator) */
  equipped?: boolean;
  /** Whether this slot is currently selected */
  selected?: boolean;
  /** Image src for the gem icon */
  src?: string;
  /** Alt text for the gem image */
  alt?: string;
  /** Children rendered as gem image layer (alternative to src) */
  children?: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Additional className */
  className?: string;
  /** Empty slot (dashed border, no content) */
  empty?: boolean;
  /** Aria label */
  "aria-label"?: string;
}

// ============================================================================
// Component
// ============================================================================

export default function InventorySlot({
  rank,
  quantity,
  equipped = false,
  selected = false,
  src,
  alt = "Gem",
  children,
  onClick,
  className = "",
  empty = false,
  "aria-label": ariaLabel,
}: InventorySlotProps) {
  if (empty) {
    return (
      <div
        className={`relative aspect-square overflow-hidden border border-dashed border-[var(--border)] bg-[var(--background)] ${className}`}
        aria-label={ariaLabel ?? "Empty slot"}
      />
    );
  }

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-label={ariaLabel}
      aria-pressed={selected}
      className={[
        // Base
        "relative aspect-square overflow-hidden",
        // Radial gradient background via inline style (see below)
        "bg-[var(--background)]",
        // Border
        selected
          ? "border border-[var(--border)] ring-1 ring-inset ring-[var(--primary)]"
          : "border border-[var(--border)]",
        // Hover
        onClick
          ? "cursor-pointer hover:border-[var(--primary)] hover:brightness-110 transition-all duration-150"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background:
          "radial-gradient(circle at center, var(--muted) 0%, var(--background) 100%)",
      }}
    >
      {/* Selected: left-edge 2px data-bar */}
      {selected && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--primary)] z-20" />
      )}

      {/* Equipped: top-left L-bracket in accent color */}
      {equipped && (
        <div
          className="absolute top-1 left-1 z-20 pointer-events-none"
          aria-hidden="true"
        >
          {/* L-bracket: two 1px lines forming an "L" */}
          <div
            style={{
              width: 10,
              height: 10,
              borderLeft: "1px solid var(--primary)",
              borderBottom: "1px solid var(--primary)",
            }}
          />
        </div>
      )}

      {/* Top-right: quantity badge */}
      {quantity !== undefined && quantity > 0 && (
        <div className="absolute top-1 right-1 z-20 pointer-events-none">
          <span className="font-mono text-[10px] leading-none text-[var(--foreground)] tabular-nums">
            {quantity}
          </span>
        </div>
      )}

      {/* Gem image layer */}
      <div className="absolute inset-0 flex items-center justify-center p-2 pb-5">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="80px"
            className="object-contain p-2 pb-5"
          />
        ) : (
          children
        )}
      </div>

      {/* Bottom footer: rank readout */}
      {rank !== undefined && (
        <div
          className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center"
          style={{ height: 18, background: "rgba(var(--muted-rgb), 0.85)" }}
        >
          <span className="font-mono text-[10px] uppercase tracking-tighter text-[var(--muted-foreground)] leading-none">
            R{rank}
          </span>
        </div>
      )}
    </div>
  );
}
