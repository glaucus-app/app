"use client";

/**
 * ResourceInput component for DI-Lab
 * Input fields for all upgrade resources with validation and formatting (FR-010 to FR-014)
 */

import { useState, useCallback, useEffect, useRef } from "react";
import type { ResourceInventory, InventoryGem } from "@/types/build";
import type { LegendaryGem } from "@/types/gem";
import { Card, CardBody } from "@/components/ui";
import { Input, NumberInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatNumber } from "@/lib/utils/formatting";
import { RotateCcw, Gem, Coins, Package, Sparkles } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export interface ResourceInputProps {
  /** Current resource values */
  resources: ResourceInventory;
  /** Called when resources change (debounced) */
  onResourcesChange: (resources: ResourceInventory) => void;
  /** Gem database for inventory gem display */
  gemDatabase?: Map<string, LegendaryGem> | Record<string, LegendaryGem>;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Show inventory gems panel */
  showInventoryGems?: boolean;
  /** Optional maximum resource budget constraint (T099) */
  maxBudget?: number;
  /** Called when max budget changes */
  onMaxBudgetChange?: (budget: number | undefined) => void;
  /** Show advanced options */
  showAdvancedOptions?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const RESOURCE_CONFIG = {
  gemPower: {
    label: "Gem Power",
    icon: Sparkles,
    placeholder: "0",
    helperText: "Used to upgrade gems",
    min: 0,
  },
  telluricPearls: {
    label: "Telluric Pearls",
    icon: "💎",
    placeholder: "0",
    helperText: "Premium upgrade material",
    min: 0,
  },
  telluricFragments: {
    label: "Telluric Fragments",
    icon: "💠",
    placeholder: "0",
    helperText: "20 fragments = 1 pearl",
    min: 0,
  },
  fadingEmbers: {
    label: "Fading Embers",
    icon: "🔥",
    placeholder: "0",
    helperText: "From Elder Rift runs",
    min: 0,
  },
  platinum: {
    label: "Platinum",
    icon: Coins,
    placeholder: "0",
    helperText: "In-game currency",
    min: 0,
  },
  dawningEchoes: {
    label: "Dawning Echoes",
    icon: "🌟",
    placeholder: "0",
    helperText: "For awakening gems",
    min: 0,
  },
};

const CREST_CONFIG = {
  eternal: {
    label: "Eternal Crests",
    helperText: "Guaranteed legendary drop",
  },
  legendary: {
    label: "Legendary Crests",
    helperText: "High legendary chance",
  },
  rare: {
    label: "Rare Crests",
    helperText: "Low legendary chance",
  },
};

// ============================================================================
// Component
// ============================================================================

export default function ResourceInput({
  resources,
  onResourcesChange,
  gemDatabase,
  debounceMs = 300,
  showInventoryGems = true,
  maxBudget,
  onMaxBudgetChange,
  showAdvancedOptions = false,
}: ResourceInputProps) {
  // Local state for immediate display
  const [localResources, setLocalResources] = useState(resources);
  const [localMaxBudget, setLocalMaxBudget] = useState(maxBudget ?? 0);
  const [budgetEnabled, setBudgetEnabled] = useState(maxBudget !== undefined);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync with external state
  useEffect(() => {
    setLocalResources(resources);
  }, [resources]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle resource change with debounce
  const handleResourceChange = useCallback(
    <K extends keyof ResourceInventory>(
      key: K,
      value: ResourceInventory[K],
    ) => {
      const newResources = { ...localResources, [key]: value };
      setLocalResources(newResources);

      // Debounce the callback
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        onResourcesChange(newResources);
      }, debounceMs);
    },
    [localResources, onResourcesChange, debounceMs],
  );

  // Handle crest count change
  const handleCrestChange = useCallback(
    (type: "eternal" | "legendary" | "rare", value: number) => {
      handleResourceChange("crestCounts", {
        ...localResources.crestCounts,
        [type]: value,
      });
    },
    [localResources.crestCounts, handleResourceChange],
  );

  // Reset all resources
  const handleReset = useCallback(() => {
    const emptyResources: ResourceInventory = {
      gemPower: 0,
      inventoryGems: [],
      telluricPearls: 0,
      telluricFragments: 0,
      fadingEmbers: 0,
      platinum: 0,
      crestCounts: {
        eternal: 0,
        legendary: 0,
        rare: 0,
      },
      dawningEchoes: 0,
    };
    setLocalResources(emptyResources);
    onResourcesChange(emptyResources);
  }, [onResourcesChange]);

  // Calculate totals
  const totalCrests =
    localResources.crestCounts.eternal +
    localResources.crestCounts.legendary +
    localResources.crestCounts.rare;

  return (
    <div className="space-y-6">
      {/* Header with reset button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          Resources
        </h3>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* Main Resources Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Gem Power */}
        <ResourceField
          label={RESOURCE_CONFIG.gemPower.label}
          value={localResources.gemPower}
          onChange={(value) => handleResourceChange("gemPower", value)}
          placeholder={RESOURCE_CONFIG.gemPower.placeholder}
          helperText={RESOURCE_CONFIG.gemPower.helperText}
          min={0}
          debounceMs={debounceMs}
        />

        {/* Platinum */}
        <ResourceField
          label={RESOURCE_CONFIG.platinum.label}
          value={localResources.platinum}
          onChange={(value) => handleResourceChange("platinum", value)}
          placeholder={RESOURCE_CONFIG.platinum.placeholder}
          helperText={RESOURCE_CONFIG.platinum.helperText}
          min={0}
          debounceMs={debounceMs}
        />

        {/* Telluric Pearls */}
        <ResourceField
          label={RESOURCE_CONFIG.telluricPearls.label}
          value={localResources.telluricPearls}
          onChange={(value) => handleResourceChange("telluricPearls", value)}
          placeholder={RESOURCE_CONFIG.telluricPearls.placeholder}
          helperText={RESOURCE_CONFIG.telluricPearls.helperText}
          min={0}
          debounceMs={debounceMs}
        />

        {/* Telluric Fragments */}
        <ResourceField
          label={RESOURCE_CONFIG.telluricFragments.label}
          value={localResources.telluricFragments}
          onChange={(value) => handleResourceChange("telluricFragments", value)}
          placeholder={RESOURCE_CONFIG.telluricFragments.placeholder}
          helperText={RESOURCE_CONFIG.telluricFragments.helperText}
          min={0}
          debounceMs={debounceMs}
        />

        {/* Fading Embers */}
        <ResourceField
          label={RESOURCE_CONFIG.fadingEmbers.label}
          value={localResources.fadingEmbers}
          onChange={(value) => handleResourceChange("fadingEmbers", value)}
          placeholder={RESOURCE_CONFIG.fadingEmbers.placeholder}
          helperText={RESOURCE_CONFIG.fadingEmbers.helperText}
          min={0}
          debounceMs={debounceMs}
        />

        {/* Dawning Echoes */}
        <ResourceField
          label={RESOURCE_CONFIG.dawningEchoes.label}
          value={localResources.dawningEchoes}
          onChange={(value) => handleResourceChange("dawningEchoes", value)}
          placeholder={RESOURCE_CONFIG.dawningEchoes.placeholder}
          helperText={RESOURCE_CONFIG.dawningEchoes.helperText}
          min={0}
          debounceMs={debounceMs}
        />
      </div>

      {/* Crest Counts Section */}
      <div className="border-t border-[var(--border)] pt-4">
        <h4 className="text-sm font-medium text-[var(--foreground)] mb-3">
          Crest Inventory
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ResourceField
            label={CREST_CONFIG.eternal.label}
            value={localResources.crestCounts.eternal}
            onChange={(value) => handleCrestChange("eternal", value)}
            helperText={CREST_CONFIG.eternal.helperText}
            min={0}
            debounceMs={debounceMs}
          />
          <ResourceField
            label={CREST_CONFIG.legendary.label}
            value={localResources.crestCounts.legendary}
            onChange={(value) => handleCrestChange("legendary", value)}
            helperText={CREST_CONFIG.legendary.helperText}
            min={0}
            debounceMs={debounceMs}
          />
          <ResourceField
            label={CREST_CONFIG.rare.label}
            value={localResources.crestCounts.rare}
            onChange={(value) => handleCrestChange("rare", value)}
            helperText={CREST_CONFIG.rare.helperText}
            min={0}
            debounceMs={debounceMs}
          />
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          Total Crests: {formatNumber(totalCrests)}
        </p>
      </div>

      {/* Resource Summary */}
      <div className="bg-[var(--muted)] rounded-lg p-4">
        <h4 className="text-sm font-medium text-[var(--foreground)] mb-2">
          Resource Summary
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-[var(--muted-foreground)]">Gem Power</span>
            <p className="font-semibold text-[var(--foreground)]">
              {formatNumber(localResources.gemPower)}
            </p>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">Platinum</span>
            <p className="font-semibold text-[var(--foreground)]">
              {formatNumber(localResources.platinum)}
            </p>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">Pearls</span>
            <p className="font-semibold text-[var(--foreground)]">
              {formatNumber(localResources.telluricPearls)}
            </p>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">Total Crests</span>
            <p className="font-semibold text-[var(--foreground)]">
              {formatNumber(totalCrests)}
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Options - Budget Constraint (T099) */}
      {showAdvancedOptions && (
        <div className="border-t border-[var(--border)] pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-[var(--foreground)]">
              Budget Constraint
            </h4>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={budgetEnabled}
                onChange={(e) => {
                  setBudgetEnabled(e.target.checked);
                  if (!e.target.checked && onMaxBudgetChange) {
                    setLocalMaxBudget(0);
                    onMaxBudgetChange(undefined);
                  }
                }}
                className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <span className="text-sm text-[var(--muted-foreground)]">
                Enable
              </span>
            </label>
          </div>
          {budgetEnabled && (
            <ResourceField
              label="Maximum Gem Power Budget"
              value={localMaxBudget}
              onChange={(value) => {
                setLocalMaxBudget(value);
                if (onMaxBudgetChange) {
                  onMaxBudgetChange(value);
                }
              }}
              placeholder="No limit"
              helperText="Optimization will respect this budget limit"
              min={0}
              debounceMs={debounceMs}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

interface ResourceFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  helperText?: string;
  min?: number;
  max?: number;
  debounceMs?: number;
}

function ResourceField({
  label,
  value,
  onChange,
  placeholder = "0",
  helperText,
  min = 0,
  max,
  debounceMs = 300,
}: ResourceFieldProps) {
  // Local state for immediate display
  const [localValue, setLocalValue] = useState(value);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle change with debounce
  const handleChange = useCallback(
    (newValue: number) => {
      setLocalValue(newValue);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
    },
    [onChange, debounceMs],
  );

  return (
    <div>
      <NumberInput
        label={label}
        value={localValue}
        onChange={handleChange}
        min={min}
        max={max}
        placeholder={placeholder}
        fullWidth
      />
      {helperText && (
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {helperText}
        </p>
      )}
    </div>
  );
}
