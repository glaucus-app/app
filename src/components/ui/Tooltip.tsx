/**
 * Tooltip component for DI-Lab
 * Custom tooltip with backward compatibility
 */

"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback, useId } from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  showDelay?: number;
  hideDelay?: number;
  className?: string;
  maxWidth?: number | string;
  disabled?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

function CustomTooltip({
  trigger,
  content,
  position = "top",
  showDelay = 300,
  hideDelay = 200,
  className,
  maxWidth = 280,
  disabled = false,
  onOpen,
  onClose,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice] = useState(() => {
    if (typeof window === "undefined") return false;
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const showTooltip = useCallback(() => {
    if (disabled) return;
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      onOpen?.();
    }, showDelay);
  }, [disabled, showDelay, onOpen]);

  const hideTooltip = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, hideDelay);
  }, [hideDelay, onClose]);

  const toggleTooltip = useCallback(() => {
    if (disabled) return;
    if (isVisible) {
      hideTooltip();
    } else {
      showTooltip();
    }
  }, [disabled, isVisible, showTooltip, hideTooltip]);

  useEffect(() => {
    if (!isVisible || !isTouchDevice) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(target)
      ) {
        setIsVisible(false);
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isVisible, isTouchDevice, onClose]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape" && isVisible) {
      setIsVisible(false);
      onClose?.();
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleTooltip();
    }
  };

  const positionClasses: Record<string, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses: Record<string, string> = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-[var(--popover)] border-l-transparent border-r-transparent border-b-transparent",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-b-[var(--popover)] border-l-transparent border-r-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-[var(--popover)] border-t-transparent border-b-transparent border-r-transparent",
    right:
      "right-full top-1/2 -translate-y-1/2 border-r-[var(--popover)] border-t-transparent border-b-transparent border-l-transparent",
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={!isTouchDevice ? showTooltip : undefined}
      onMouseLeave={!isTouchDevice ? hideTooltip : undefined}
      onClick={isTouchDevice ? toggleTooltip : undefined}
      onKeyDown={handleKeyDown}
      onFocus={!isTouchDevice ? showTooltip : undefined}
      onBlur={!isTouchDevice ? hideTooltip : undefined}
      tabIndex={0}
      aria-describedby={isVisible ? tooltipId : undefined}
    >
      {trigger}

      {isVisible && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={cn(
            "absolute z-50 px-3 py-2",
            "bg-[var(--popover)] text-[var(--popover-foreground)] text-sm rounded-lg shadow-[var(--shadow-lg)]",
            "animate-in fade-in-0 zoom-in-95 duration-150",
            positionClasses[position],
            className,
          )}
          style={{ maxWidth }}
        >
          {content}
          <div
            className={cn(
              "absolute w-0 h-0",
              "border-4",
              arrowClasses[position],
            )}
          />
        </div>
      )}
    </div>
  );
}

// Gem Summary Tooltip
export interface GemSummaryTooltipProps {
  name: string;
  starRating: 1 | 2 | 5;
  pvpTier: string;
  pveTier: string;
  shortDescription?: string;
  source?: string;
  children: React.ReactNode;
}

function GemSummaryTooltipFn({
  name,
  starRating,
  pvpTier,
  pveTier,
  shortDescription,
  source,
  children,
}: GemSummaryTooltipProps) {
  const starDisplay = "★".repeat(starRating);

  return (
    <CustomTooltip
      trigger={children}
      content={
        <div className="space-y-1.5">
          <div className="font-medium">
            <span className="text-[var(--color-gem-5star)]">{starDisplay}</span>{" "}
            {name}
          </div>
          <div className="flex gap-2 text-xs">
            <span className="text-[var(--muted-foreground)]">
              PvP:{" "}
              <span className="text-[var(--foreground)] font-medium">
                {pvpTier}
              </span>
            </span>
            <span className="text-[var(--muted-foreground)]">
              PvE:{" "}
              <span className="text-[var(--foreground)] font-medium">
                {pveTier}
              </span>
            </span>
          </div>
          {shortDescription && (
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              {shortDescription}
            </p>
          )}
          {source && (
            <p className="text-xs text-[var(--muted-foreground)]">
              <span className="text-[var(--muted-foreground)]">Source:</span>{" "}
              {source}
            </p>
          )}
        </div>
      }
      position="top"
      maxWidth={250}
    />
  );
}

export default CustomTooltip;
export { GemSummaryTooltipFn as GemSummaryTooltip };
