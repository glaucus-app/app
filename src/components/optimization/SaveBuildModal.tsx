"use client";

/**
 * Save Build Modal
 * FR-024: Save build with name and optional notes
 * FR-025: Unique build name prompt with duplicate rejection
 * FR-046: XSS prevention for user content
 */

import { useState, useEffect, useCallback } from "react";
import { Save, X, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { sanitizeUserContent } from "@/lib/utils/sanitization";
import { getOrCreateAnonymousId } from "@/lib/session/anonymous-session";
import type { SavedBuild, EquippedGem, ResourceInventory } from "@/types";

interface SaveBuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (build: SavedBuild) => void;
  gems: EquippedGem[];
  resources: ResourceInventory;
  optimizationMode: "PVP" | "PVE";
  awakenedSlots: number;
  existingBuildId?: string;
  existingBuildName?: string;
}

interface SaveBuildState {
  name: string;
  notes: string;
  isSubmitting: boolean;
  error: string | null;
  fieldErrors: {
    name?: string;
    notes?: string;
  };
}

export function SaveBuildModal({
  isOpen,
  onClose,
  onSave,
  gems,
  resources,
  optimizationMode,
  awakenedSlots,
  existingBuildId,
  existingBuildName,
}: SaveBuildModalProps) {
  const [state, setState] = useState<SaveBuildState>({
    name: existingBuildName ?? "",
    notes: "",
    isSubmitting: false,
    error: null,
    fieldErrors: {},
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setState({
        name: existingBuildName ?? "",
        notes: "",
        isSubmitting: false,
        error: null,
        fieldErrors: {},
      });
    }
  }, [isOpen, existingBuildName]);

  const validateForm = useCallback((): boolean => {
    const errors: SaveBuildState["fieldErrors"] = {};

    // Name validation
    if (!state.name.trim()) {
      errors.name = "Build name is required";
    } else if (state.name.length > 50) {
      errors.name = "Build name must be 50 characters or less";
    } else {
      // Check for HTML tags
      const sanitizedName = sanitizeUserContent(state.name);
      if (sanitizedName !== state.name) {
        errors.name = "Build name cannot contain HTML tags";
      }
    }

    // Notes validation
    if (state.notes && state.notes.length > 500) {
      errors.notes = "Notes must be 500 characters or less";
    }

    // Check for dangerous content in notes
    if (state.notes) {
      try {
        sanitizeUserContent(state.notes);
      } catch {
        errors.notes = "Notes contain forbidden content";
      }
    }

    setState((prev) => ({ ...prev, fieldErrors: errors }));
    return Object.keys(errors).length === 0;
  }, [state.name, state.notes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const anonymousId = getOrCreateAnonymousId();
      const sanitizedName = sanitizeUserContent(state.name);
      const sanitizedNotes = state.notes
        ? sanitizeUserContent(state.notes)
        : undefined;

      // If editing existing build
      if (existingBuildId) {
        const response = await fetch(`/api/builds/${existingBuildId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            anonymousId,
            name: sanitizedName,
            notes: sanitizedNotes,
            gems,
            resources,
            optimizationMode,
            awakenedSlots,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 409) {
            setState((prev) => ({
              ...prev,
              isSubmitting: false,
              fieldErrors: { name: errorData.message },
            }));
            return;
          }
          throw new Error(errorData.error ?? "Failed to update build");
        }

        const { build } = await response.json();
        onSave(build);
      } else {
        // Create new build
        const response = await fetch("/api/builds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            anonymousId,
            name: sanitizedName,
            notes: sanitizedNotes,
            gems,
            resources,
            optimizationMode,
            awakenedSlots,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 409) {
            setState((prev) => ({
              ...prev,
              isSubmitting: false,
              fieldErrors: { name: errorData.message },
            }));
            return;
          }
          if (response.status === 403) {
            setState((prev) => ({
              ...prev,
              isSubmitting: false,
              error: errorData.message,
            }));
            return;
          }
          throw new Error(errorData.error ?? "Failed to create build");
        }

        const { build } = await response.json();
        onSave(build);
      }

      onClose();
    } catch (error) {
      console.error("Error saving build:", error);
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save build. Please try again.",
      }));
    }
  };

  const handleNameChange = (value: string) => {
    setState((prev) => ({
      ...prev,
      name: value,
      fieldErrors: { ...prev.fieldErrors, name: undefined },
    }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState((prev) => ({
      ...prev,
      notes: e.target.value,
      fieldErrors: { ...prev.fieldErrors, notes: undefined },
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save Build">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* General error */}
        {state.error && (
          <div className="p-3 bg-[var(--destructive)]/10 border border-[var(--destructive)]/30 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-[var(--destructive)] flex-shrink-0 mt-0.5" />
            <p className="text-[var(--destructive)] text-sm">{state.error}</p>
          </div>
        )}

        {/* Build name */}
        <Input
          label="Build Name"
          placeholder="My Gem Build"
          value={state.name}
          onChange={handleNameChange}
          error={state.fieldErrors.name}
          required
          maxLength={50}
          disabled={state.isSubmitting}
        />
        <p className="text-xs text-[var(--muted-foreground)] -mt-2">
          {state.name.length}/50 characters
        </p>

        {/* Notes */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--foreground)]">
            Notes (optional)
          </label>
          <textarea
            value={state.notes}
            onChange={handleNotesChange}
            placeholder="Add notes about this build..."
            rows={3}
            maxLength={500}
            disabled={state.isSubmitting}
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {state.fieldErrors.notes && (
            <p className="text-sm text-[var(--destructive)]">
              {state.fieldErrors.notes}
            </p>
          )}
          <p className="text-xs text-[var(--muted-foreground)]">
            {state.notes.length}/500 characters
          </p>
        </div>

        {/* Gem count summary */}
        <div className="p-3 bg-[var(--card)] rounded-lg">
          <p className="text-sm text-[var(--muted-foreground)]">
            This build contains{" "}
            <span className="text-[var(--foreground)] font-medium">
              {gems.length} gems
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={state.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={state.isSubmitting || gems.length === 0}
            className="flex items-center gap-2"
          >
            {state.isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Build
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
