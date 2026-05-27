"use client";

/**
 * Saved Builds Page
 * Displays list of saved builds with load, delete, and create options
 * FR-026: View saved builds with summary stats
 * FR-027: Load a saved build to restore state
 * FR-028: Delete a saved build with confirmation
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Download,
  Clock,
  Gem,
  Zap,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ToastProvider, useToastActions } from "@/components/ui/Toast";
import { getOrCreateAnonymousId } from "@/lib/session/anonymous-session";
import type { SavedBuild, EquippedGem } from "@/types";
import { formatNumber } from "@/lib/utils/formatting";
import { getResonance } from "@/lib/optimization/constants";
import gemData from "@/data/gems.json";

// Build a map of gems for quick lookup
function buildGemMap(): Map<
  string,
  { id: string; name: string; starRating: number }
> {
  const map = new Map<
    string,
    { id: string; name: string; starRating: number }
  >();
  for (const star of ["1-star", "2-star", "5-star"] as const) {
    for (const gem of gemData.gems[star]) {
      map.set(gem.id, {
        id: gem.id,
        name: gem.name,
        starRating: gem.starRating,
      });
    }
  }
  return map;
}

// Calculate total resonance from equipped gems using the simpler getResonance function
function calculateSimpleResonance(
  gems: EquippedGem[],
  gemMap: Map<string, { id: string; name: string; starRating: number }>,
): number {
  let total = 0;
  for (const gem of gems) {
    const gemInfo = gemMap.get(gem.gemId);
    if (gemInfo) {
      total += getResonance(
        gemInfo.starRating as 1 | 2 | 5,
        gem.rank,
        gem.quality,
      );
    }
  }
  return total;
}

// Types for the page
interface BuildSummary {
  id: string;
  name: string;
  gemCount: number;
  totalResonance: number;
  optimizationMode: "PVP" | "PVE";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

function BuildsPageContent() {
  const router = useRouter();
  const [builds, setBuilds] = useState<BuildSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { success, error: toastError } = useToastActions();

  // Load builds on mount
  useEffect(() => {
    loadBuilds();
  }, []);

  const loadBuilds = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const anonymousId = getOrCreateAnonymousId();
      const response = await fetch(`/api/builds?anonymousId=${anonymousId}`);

      if (!response.ok) {
        throw new Error("Failed to load builds");
      }

      const data = await response.json();
      const gemMap = buildGemMap();

      const buildSummaries: BuildSummary[] = data.builds.map(
        (build: SavedBuild) => ({
          id: build.id,
          name: build.name,
          gemCount: build.gems.length,
          totalResonance: calculateSimpleResonance(build.gems, gemMap),
          optimizationMode: build.optimizationMode,
          notes: build.notes,
          createdAt:
            build.createdAt instanceof Date
              ? build.createdAt.toISOString()
              : String(build.createdAt),
          updatedAt:
            build.updatedAt instanceof Date
              ? build.updatedAt.toISOString()
              : String(build.updatedAt),
        }),
      );

      setBuilds(buildSummaries);
    } catch (err) {
      console.error("Error loading builds:", err);
      setError("Failed to load saved builds. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadBuild = async (buildId: string) => {
    try {
      const anonymousId = getOrCreateAnonymousId();
      const response = await fetch(
        `/api/builds/${buildId}?anonymousId=${anonymousId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to load build");
      }

      const { build } = await response.json();

      // Store in sessionStorage for the optimize page to pick up
      sessionStorage.setItem("di-lab-load-build", JSON.stringify(build));

      success(`Build "${build.name}" loaded successfully`);

      // Navigate to optimize page
      setTimeout(() => {
        router.push("/optimize");
      }, 500);
    } catch (err) {
      console.error("Error loading build:", err);
      toastError("Failed to load build. Please try again.");
    }
  };

  const handleDeleteBuild = async () => {
    if (!deleteConfirmId) return;

    try {
      const anonymousId = getOrCreateAnonymousId();
      const response = await fetch(
        `/api/builds/${deleteConfirmId}?anonymousId=${anonymousId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete build");
      }

      setBuilds((prev) => prev.filter((b) => b.id !== deleteConfirmId));
      success("Build deleted successfully");
    } catch (err) {
      console.error("Error deleting build:", err);
      toastError("Failed to delete build. Please try again.");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Empty state
  if (!isLoading && builds.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">Saved Builds</h1>
            <p className="text-[var(--muted-foreground)] mt-2">
              Manage your legendary gem configurations
            </p>
          </header>

          <Card className="text-center py-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
                <Gem className="w-8 h-8 text-[var(--muted-foreground)]" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Saved Builds</h2>
              <p className="text-[var(--muted-foreground)] mb-6 max-w-md">
                Create your first build to save your gem configuration and
                resources for later use.
              </p>
              <Link href="/optimize">
                <Button variant="primary" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Build
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Saved Builds</h1>
            <p className="text-[var(--muted-foreground)] mt-2">
              {builds.length} of 5 builds used
            </p>
          </div>
          <Link href="/optimize">
            <Button variant="primary" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Build
            </Button>
          </Link>
        </header>

        {error && (
          <Card className="mb-6 bg-[var(--destructive)]/20 border-[var(--destructive)]">
            <div className="flex items-center gap-3 text-[var(--destructive)]">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadBuilds}
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          </Card>
        )}

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-6 bg-[var(--muted)] rounded w-1/2 mb-4" />
                <div className="h-4 bg-[var(--muted)] rounded w-3/4 mb-2" />
                <div className="h-4 bg-[var(--muted)] rounded w-1/2" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {builds.map((build) => (
              <Card
                key={build.id}
                className="hover:border-[var(--foreground)] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {build.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          build.optimizationMode === "PVP"
                            ? "bg-[var(--destructive)]/50 text-[var(--destructive)]"
                            : "bg-[var(--success)]/50 text-[var(--success)]"
                        }`}
                      >
                        {build.optimizationMode}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(build.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-[var(--muted-foreground)]">Gems</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Gem className="w-4 h-4 text-[var(--effect-all)]" />
                      {build.gemCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[var(--muted-foreground)]">Resonance</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Zap className="w-4 h-4 text-[var(--warning)]" />
                      {formatNumber(build.totalResonance)}
                    </p>
                  </div>
                </div>

                {build.notes && (
                  <p className="text-sm text-[var(--muted-foreground)] mb-4 line-clamp-2">
                    {build.notes}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-4 border-t border-[var(--border)]">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleLoadBuild(build.id)}
                    className="flex-1 flex items-center justify-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Load
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteConfirmId(build.id)}
                    className="flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Build limit warning */}
        {builds.length >= 5 && (
          <Card className="mt-6 bg-[var(--warning)]/20 border-[var(--warning)]">
            <div className="flex items-center gap-3 text-[var(--warning)]">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Build limit reached</p>
                <p className="text-sm text-[var(--warning)]/80">
                  Free tier allows up to 5 saved builds. Delete an existing
                  build to create a new one.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Build"
      >
        <div className="space-y-4">
          <p className="text-[var(--foreground)]">
            Are you sure you want to delete this build? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteBuild}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function BuildsPage() {
  return (
    <ToastProvider>
      <BuildsPageContent />
    </ToastProvider>
  );
}
