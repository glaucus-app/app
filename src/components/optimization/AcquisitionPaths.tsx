"use client";

import { Swords, ShoppingCart, Shuffle } from "lucide-react";
import {
  getAcquisitionPaths,
  type AcquisitionPath,
} from "@/lib/utils/acquisition";
import { cn } from "@/lib/utils/cn";

interface AcquisitionPathsProps {
  /** Currently selected path */
  selectedPath?: "farming" | "market" | "hybrid";
  /** Callback when path is selected */
  onPathSelect?: (path: "farming" | "market" | "hybrid") => void;
}

/**
 * Component showing the three main acquisition paths.
 * Provides concise overview with descriptions only.
 * (FR-052)
 */
export function AcquisitionPaths({
  selectedPath,
  onPathSelect,
}: AcquisitionPathsProps) {
  const paths = getAcquisitionPaths();

  const getIcon = (type: AcquisitionPath["type"]) => {
    switch (type) {
      case "farming":
        return <Swords className="w-6 h-6" />;
      case "market":
        return <ShoppingCart className="w-6 h-6" />;
      case "hybrid":
        return <Shuffle className="w-6 h-6" />;
    }
  };

  const getColorClass = (type: AcquisitionPath["type"]) => {
    switch (type) {
      case "farming":
        return "bg-[var(--success)]/10 border-[var(--success)]/30";
      case "market":
        return "bg-[var(--primary)]/10 border-[var(--primary)]/30";
      case "hybrid":
        return "bg-[var(--effect-all)]/10 border-[var(--effect-all)]/30";
    }
  };

  const getSelectedClass = (type: AcquisitionPath["type"]) => {
    if (selectedPath === type) {
      switch (type) {
        case "farming":
          return "ring-2 ring-[var(--success)]";
        case "market":
          return "ring-2 ring-[var(--primary)]";
        case "hybrid":
          return "ring-2 ring-[var(--effect-all)]";
      }
    }
    return "";
  };

  return (
    <div className="bg-[var(--card)] text-[var(--card-foreground)] rounded-lg shadow-[var(--shadow-md)] p-4">
      <h3 className="font-medium text-[var(--foreground)] mb-4">
        Acquisition Paths
      </h3>

      <div className="space-y-3">
        {paths.map((path) => (
          <button
            key={path.type}
            onClick={() => onPathSelect?.(path.type)}
            className={cn(
              "w-full text-left p-4 rounded-lg border transition-all",
              getColorClass(path.type),
              getSelectedClass(path.type),
              onPathSelect && "cursor-pointer hover:opacity-90",
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-[var(--muted-foreground)]">
                {getIcon(path.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-[var(--foreground)] mb-1">
                  {path.title}
                </h4>
                <p className="text-sm text-[var(--muted-foreground)] mb-2">
                  {path.description}
                </p>

                {/* Pros */}
                <div className="text-xs text-[var(--muted-foreground)]">
                  <span className="font-medium">Pros: </span>
                  {path.pros.slice(0, 2).join(", ")}
                </div>

                {/* Cons */}
                <div className="text-xs text-[var(--muted-foreground)] mt-1">
                  <span className="font-medium">Cons: </span>
                  {path.cons.slice(0, 2).join(", ")}
                </div>

                {/* Estimates */}
                <div className="flex gap-4 mt-2 text-xs">
                  {path.estimatedTime && (
                    <span className="text-[var(--muted-foreground)]">
                      ⏱️ {path.estimatedTime}
                    </span>
                  )}
                  {path.estimatedCost && (
                    <span className="text-[var(--muted-foreground)]">
                      💰 ~{path.estimatedCost.toLocaleString()} platinum
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Resource deficit display component.
 * Shows what resources are lacking and by how much.
 * (FR-051)
 */
interface ResourceDeficitProps {
  deficits: Record<string, number>;
  className?: string;
}

export function ResourceDeficit({ deficits, className }: ResourceDeficitProps) {
  const entries = Object.entries(deficits).filter(([_, amount]) => amount > 0);

  if (entries.length === 0) {
    return null;
  }

  const formatResourceName = (name: string): string => {
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div
      className={cn(
        "bg-[var(--warning)]/10 border border-[var(--warning)]/30 rounded-lg p-4",
        className,
      )}
    >
      <h4 className="font-medium text-[var(--warning)] mb-2">
        Resource Deficit
      </h4>
      <p className="text-sm text-[var(--warning)] mb-3">
        You need additional resources to complete all recommendations:
      </p>
      <ul className="space-y-1">
        {entries.map(([resource, amount]) => (
          <li
            key={resource}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-[var(--warning)]">
              {formatResourceName(resource)}
            </span>
            <span className="font-medium text-[var(--warning)]">
              {amount.toLocaleString()} needed
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
