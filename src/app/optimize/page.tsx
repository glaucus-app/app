"use client";

/**
 * Optimize Page - Gem Selection, Resource Input, and Optimization
 *
 * User Story 1: Gem Inventory Entry
 * - Select gems from catalog
 * - Configure quality and rank
 * - View equipped gems with resonance calculation
 *
 * User Story 2: Resource Specification
 * - Input available resources
 * - Session persistence
 */

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type {
  EquippedGem,
  LegendaryGem,
  Quality,
  Rank,
  StarRating,
} from "@/types/gem";
import type { ResourceInventory, SessionState, SavedBuild } from "@/types";
import { deriveSlotType } from "@/types/gem";
import { createEmptySessionState } from "@/types";
import GemCatalog from "@/components/gems/GemCatalog";
import GemDetail from "@/components/gems/GemDetail";
import ResourceInput from "@/components/optimization/ResourceInput";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import {
  getNextAvailableSlot,
  canAddGemToSlot,
  getTotalAvailableSlots,
  isAtMaxCapacity,
} from "@/lib/utils/slots";
import { getResonanceInfo } from "@/lib/utils/resonance";
import {
  getOrCreateAnonymousId,
  fetchSessionState,
  persistSessionState,
  handleSessionInvalidation,
} from "@/lib/session/anonymous-session";
import { ALL_GEMS, GEM_MAP } from "@/lib/data/gems";
import {
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
  Save,
  AlertTriangle,
  Sword,
  Shield,
  Zap,
} from "lucide-react";
import type { OptimizationMode } from "@/types/gem";

// ============================================================================
// Quality and Rank Options
// ============================================================================

const QUALITY_OPTIONS = [
  { value: "2", label: "2★" },
  { value: "3", label: "3★" },
  { value: "4", label: "4★" },
  { value: "5", label: "5★" },
];

const RANK_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `Rank ${i + 1}`,
}));

// ============================================================================
// Page Component
// ============================================================================

export default function OptimizePage() {
  // Session state
  const [anonymousId, setAnonymousId] = useState<string>("");
  const [sessionState, setSessionState] = useState<SessionState>(() =>
    createEmptySessionState(),
  );
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Build management state (T078, T079, T081)
  const [loadedBuildId, setLoadedBuildId] = useState<string | null>(null);
  const [loadedBuildName, setLoadedBuildName] = useState<string | null>(null);
  const [deprecatedGems, setDeprecatedGems] = useState<EquippedGem[]>([]);

  // Debounced save timer ref
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State for gem detail modal
  const [selectedGemId, setSelectedGemId] = useState<string | null>(null);
  const [showGemDetail, setShowGemDetail] = useState(false);

  // State for gem catalog star rating tabs
  const [selectedStarRating, setSelectedStarRating] = useState<StarRating>(5);

  // Extract state from session
  const equippedGems = sessionState.gems;
  const resources = sessionState.resources;
  const optimizationMode = sessionState.optimizationMode;
  const advancedStrategies = sessionState.advancedStrategies ?? false;

  // ============================================================================
  // Session Management
  // ============================================================================

  // Initialize anonymous ID and load session on mount
  useEffect(() => {
    const initSession = async () => {
      const id = getOrCreateAnonymousId();
      setAnonymousId(id);

      try {
        const result = await fetchSessionState(id);
        if (result.success) {
          setSessionState(result.data);
        } else {
          // Session not found or expired - create new
          const newState = createEmptySessionState();
          setSessionState(newState);
          // Save the new session
          await persistSessionState(id, newState);
        }
      } catch (error) {
        console.error("Failed to load session:", error);
        setSessionError("Failed to load session");
      } finally {
        setIsLoadingSession(false);
      }
    };

    initSession();

    // Cleanup save timer on unmount
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  // T078: Load build from sessionStorage (from builds page)
  useEffect(() => {
    const loadBuildFromStorage = () => {
      const buildJson = sessionStorage.getItem("di-lab-load-build");
      if (!buildJson) return;

      try {
        const build: SavedBuild = JSON.parse(buildJson);

        // Detect deprecated gems (T081)
        const deprecated: EquippedGem[] = [];
        const validGems: EquippedGem[] = [];

        for (const gem of build.gems) {
          if (GEM_MAP.has(gem.gemId)) {
            validGems.push(gem);
          } else {
            deprecated.push(gem);
          }
        }

        if (deprecated.length > 0) {
          setDeprecatedGems(deprecated);
        }

        // Set session state with the loaded build
        setSessionState({
          gems: validGems,
          resources: build.resources,
          optimizationMode: build.optimizationMode,
          updatedAt: new Date().toISOString(),
        });

        setLoadedBuildId(build.id);
        setLoadedBuildName(build.name);

        // Clear sessionStorage after loading
        sessionStorage.removeItem("di-lab-load-build");
      } catch (error) {
        console.error("Failed to load build from sessionStorage:", error);
      }
    };

    loadBuildFromStorage();
  }, []);

  // T079: beforeunload confirmation for unsaved named builds
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show confirmation if a named build is loaded (has been explicitly saved)
      if (loadedBuildName) {
        e.preventDefault();
        // Standard requires returnValue to be set
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [loadedBuildName]);

  // Remove deprecated gem handler (T081)
  const handleRemoveDeprecatedGem = useCallback((gemId: string) => {
    setDeprecatedGems((prev) => prev.filter((g) => g.gemId !== gemId));
  }, []);

  // Clear all deprecated gems handler (T081)
  const handleClearDeprecatedGems = useCallback(() => {
    setDeprecatedGems([]);
  }, []);

  // Auto-save session state with debounce
  const saveSession = useCallback(
    (state: SessionState) => {
      // Cancel any pending save
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      // Debounce save by 500ms
      saveTimerRef.current = setTimeout(async () => {
        if (!anonymousId) return;

        const result = await persistSessionState(anonymousId, state);
        if (result.success) {
          setLastSaved(new Date());
        } else if (result.error === "Session expired") {
          // Handle session invalidation (T040a)
          const { anonymousId: newId, sessionState: newSession } =
            await handleSessionInvalidation(state);
          setAnonymousId(newId);
          setSessionState(newSession);
          setSessionError("Session expired. A new session has been created.");
          // Clear error after 5 seconds
          setTimeout(() => setSessionError(null), 5000);
        }
      }, 500);
    },
    [anonymousId],
  );

  // Update session state and trigger auto-save
  const updateSessionState = useCallback(
    (updates: Partial<SessionState>) => {
      const newState = {
        ...sessionState,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      setSessionState(newState);
      saveSession(newState);
    },
    [sessionState, saveSession],
  );

  // ============================================================================
  // Gem Management
  // ============================================================================

  // Calculate resonance info
  const resonanceInfo = useMemo(() => {
    return getResonanceInfo(equippedGems, GEM_MAP);
  }, [equippedGems]);

  // Check if at max capacity
  const atCapacity = useMemo(() => {
    return isAtMaxCapacity(equippedGems, resonanceInfo.total);
  }, [equippedGems, resonanceInfo.total]);

  // Get available slots count
  const availableSlotCount = useMemo(() => {
    const total = getTotalAvailableSlots(resonanceInfo.total);
    return total - equippedGems.length;
  }, [equippedGems.length, resonanceInfo.total]);

  // Handle adding a gem
  const handleAddGem = useCallback(
    (gemId: string) => {
      if (atCapacity) return;

      const nextSlot = getNextAvailableSlot(equippedGems, resonanceInfo.total);
      if (nextSlot === null) return;

      const gem = GEM_MAP.get(gemId);
      if (!gem) return;

      // Check duplicate rule for base slots
      const result = canAddGemToSlot(
        gemId,
        nextSlot,
        equippedGems,
        resonanceInfo.total,
      );
      if (!result.allowed) {
        console.warn(result.reason);
        return;
      }

      // Default quality: 5 for 5-star gems, 1 for others
      const defaultQuality: Quality = gem.starRating === 5 ? 5 : 1;

      const newGem: EquippedGem = {
        gemId,
        quality: defaultQuality,
        rank: 1,
        slotPosition: nextSlot,
        slotType: deriveSlotType(nextSlot),
      };

      updateSessionState({
        gems: [...equippedGems, newGem],
      });
    },
    [equippedGems, resonanceInfo.total, atCapacity, updateSessionState],
  );

  // Handle removing a gem
  const handleRemoveGem = useCallback(
    (slotPosition: number) => {
      updateSessionState({
        gems: equippedGems.filter((gem) => gem.slotPosition !== slotPosition),
      });
    },
    [equippedGems, updateSessionState],
  );

  // Handle quality change
  const handleQualityChange = useCallback(
    (slotPosition: number, quality: Quality) => {
      updateSessionState({
        gems: equippedGems.map((gem) =>
          gem.slotPosition === slotPosition ? { ...gem, quality } : gem,
        ),
      });
    },
    [equippedGems, updateSessionState],
  );

  // Handle rank change
  const handleRankChange = useCallback(
    (slotPosition: number, rank: Rank) => {
      updateSessionState({
        gems: equippedGems.map((gem) =>
          gem.slotPosition === slotPosition ? { ...gem, rank } : gem,
        ),
      });
    },
    [equippedGems, updateSessionState],
  );

  // Handle resource change
  const handleResourcesChange = useCallback(
    (newResources: ResourceInventory) => {
      updateSessionState({
        resources: newResources,
      });
    },
    [updateSessionState],
  );

  // Handle optimization mode change (T096)
  const handleOptimizationModeChange = useCallback(
    (mode: OptimizationMode) => {
      updateSessionState({
        optimizationMode: mode,
      });
    },
    [updateSessionState],
  );

  // Handle advanced strategies toggle (T100a - FR-037b)
  const handleAdvancedStrategiesChange = useCallback(
    (enabled: boolean) => {
      updateSessionState({
        advancedStrategies: enabled,
      });
    },
    [updateSessionState],
  );

  // Handle viewing gem details
  const handleViewGemDetail = useCallback((gemId: string) => {
    setSelectedGemId(gemId);
    setShowGemDetail(true);
  }, []);

  // Close gem detail modal
  const handleCloseGemDetail = useCallback(() => {
    setShowGemDetail(false);
    setSelectedGemId(null);
  }, []);

  // Get gem for detail view
  const selectedGem = selectedGemId ? GEM_MAP.get(selectedGemId) : null;

  // ============================================================================
  // Loading State
  // ============================================================================

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin mx-auto" />
          <p className="mt-4 font-mono text-xs text-[var(--muted-foreground)] uppercase">
            LOADING SESSION
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-[var(--border)] pb-4">
          <div>
            <h1 className="font-sans text-xl font-semibold text-[var(--foreground)] tracking-tight">
              Build Optimizer
            </h1>
            <p className="font-mono text-xs text-[var(--muted-foreground)] uppercase">
              LEGENDARY GEM CONFIGURATION
            </p>
          </div>
          {lastSaved && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] uppercase">
              <Save className="w-3 h-3" />
              <span>SAVED</span>
            </div>
          )}
        </div>

        {/* ── Session Error ────────────────────────────────────────────── */}
        {sessionError && (
          <div className="mb-3 px-3 py-2 border border-[var(--warning)]/60 bg-[var(--warning)]/30">
            <p className="font-mono text-xs text-[var(--warning)]">
              {sessionError}
            </p>
          </div>
        )}

        {/* ── Deprecated Gems Warning ──────────────────────────────────── */}
        {deprecatedGems.length > 0 && (
          <div className="mb-3 px-3 py-2 border border-[var(--destructive)]/60 bg-[var(--destructive)]/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[var(--destructive)] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-mono text-xs text-rose-400 uppercase mb-1">
                  DEPRECATED GEMS DETECTED
                </p>
                <ul className="space-y-0.5">
                  {deprecatedGems.map((gem) => (
                    <li key={gem.gemId} className="flex items-center gap-2">
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {gem.gemId}
                      </span>
                      <span className="text-xs text-[var(--foreground)]">
                        SLOT {gem.slotPosition}
                      </span>
                      <button
                        onClick={() => handleRemoveDeprecatedGem(gem.gemId)}
                        className="font-mono text-xs text-[var(--destructive)] hover:text-[var(--destructive)]/80 transition-colors"
                      >
                        REMOVE
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleClearDeprecatedGems}
                  className="mt-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] uppercase transition-colors"
                >
                  CLEAR ALL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Loaded Build Indicator ───────────────────────────────────── */}
        {loadedBuildName && (
          <div className="mb-3 px-3 py-2 border border-[var(--border)] flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-[var(--muted-foreground)]" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase">
              EDITING:{" "}
              <span className="text-[var(--foreground)]">
                {loadedBuildName}
              </span>
            </span>
          </div>
        )}

        {/* ── Main Content Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-[var(--border)]">
          {/* Left: Gem Catalog */}
          <div className="lg:col-span-2 bg-[var(--background)] p-4">
            <GemCatalog
              gems={ALL_GEMS}
              selectedStarRating={selectedStarRating}
              onStarRatingChange={setSelectedStarRating}
              onGemSelect={(gem: LegendaryGem) => handleAddGem(gem.id)}
            />
          </div>

          {/* Right: Stats + Equipped + Resources */}
          <div className="bg-[var(--background)] divide-y divide-[var(--border)]">
            {/* ── Build Stats ─────────────────────────────────────────── */}
            <div className="p-4 space-y-4">
              <p className="text-xs text-[var(--muted-foreground)] uppercase">
                BUILD STATS
              </p>

              {/* Mode toggle */}
              <div>
                <p className="font-mono text-xs text-[var(--muted-foreground)] uppercase mb-1.5">
                  MODE
                </p>
                <div className="flex border border-[var(--border)] divide-x divide-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => handleOptimizationModeChange("PVE")}
                    aria-pressed={optimizationMode === "PVE"}
                    className={[
                      "flex-1 flex items-center justify-center gap-1.5 py-2 font-mono text-xs uppercase transition-colors",
                      optimizationMode === "PVE"
                        ? "bg-[var(--muted)] text-[var(--foreground)]"
                        : "bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                    ].join(" ")}
                  >
                    <Shield className="w-3 h-3" />
                    PVE
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOptimizationModeChange("PVP")}
                    aria-pressed={optimizationMode === "PVP"}
                    className={[
                      "flex-1 flex items-center justify-center gap-1.5 py-2 font-mono text-xs uppercase transition-colors",
                      optimizationMode === "PVP"
                        ? "bg-[var(--muted)] text-[var(--foreground)]"
                        : "bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                    ].join(" ")}
                  >
                    <Sword className="w-3 h-3" />
                    PVP
                  </button>
                </div>
              </div>

              {/* Advanced strategies toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-[var(--muted-foreground)]" />
                  <span className="text-xs text-[var(--muted-foreground)] uppercase">
                    ADV. STRATEGIES
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={advancedStrategies}
                  onClick={() =>
                    handleAdvancedStrategiesChange(!advancedStrategies)
                  }
                  className={[
                    "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer border transition-colors duration-150 focus:outline-none",
                    advancedStrategies
                      ? "border-[var(--primary)] bg-[var(--primary)]/20"
                      : "border-[var(--border)] bg-[var(--background)]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-block h-3 w-3 m-0.5 bg-current transition-transform duration-150",
                      advancedStrategies
                        ? "translate-x-4 text-[var(--primary)]"
                        : "translate-x-0 text-[var(--muted-foreground)]",
                    ].join(" ")}
                  />
                </button>
              </div>

              {/* Resonance readout */}
              <div>
                <p className="font-mono text-xs text-[var(--muted-foreground)] uppercase">
                  RESONANCE
                </p>
                <p className="font-mono text-2xl text-[var(--foreground)] tabular-nums">
                  {resonanceInfo.total.toLocaleString()}
                </p>
              </div>

              {/* Slot counts */}
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-[var(--border)] p-2">
                  <p className="text-xs text-[var(--muted-foreground)] uppercase">
                    WING SLOTS
                  </p>
                  <p className="font-mono text-sm text-[var(--foreground)] tabular-nums">
                    {resonanceInfo.unlockedWingSlots}
                    <span className="text-[var(--muted-foreground)]">/16</span>
                  </p>
                </div>
                <div className="border border-[var(--border)] p-2">
                  <p className="text-xs text-[var(--muted-foreground)] uppercase">
                    OPEN SLOTS
                  </p>
                  <p className="font-mono text-sm text-[var(--foreground)] tabular-nums">
                    {availableSlotCount}
                    <span className="text-[var(--muted-foreground)]">
                      /{resonanceInfo.totalSlots}
                    </span>
                  </p>
                </div>
              </div>

              {/* Next threshold */}
              {resonanceInfo.nextThreshold && (
                <div className="border-t border-[var(--border)] pt-3">
                  <p className="text-xs text-[var(--muted-foreground)] uppercase">
                    NEXT THRESHOLD
                  </p>
                  <p className="font-mono text-sm text-[var(--foreground)] tabular-nums">
                    {resonanceInfo.nextThreshold.toLocaleString()}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    +{resonanceInfo.resonanceToNext.toLocaleString()} needed
                  </p>
                </div>
              )}
            </div>

            {/* ── Equipped Gems ────────────────────────────────────────── */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-[var(--muted-foreground)]">
                  EQUIPPED GEMS
                </p>
                <span className="text-sm text-[var(--muted-foreground)]">
                  {equippedGems.length}/{resonanceInfo.totalSlots}
                </span>
              </div>

              {equippedGems.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-[var(--border)]">
                  <AlertCircle className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-2" />
                  <p className="font-mono text-xs text-[var(--muted-foreground)] uppercase">
                    NO GEMS EQUIPPED
                  </p>
                </div>
              ) : (
                <div className="space-y-px">
                  {equippedGems.map((equipped) => {
                    const gem = GEM_MAP.get(equipped.gemId);
                    if (!gem) return null;
                    return (
                      <div
                        key={equipped.slotPosition}
                        className="flex items-center gap-2 px-2 py-1.5 bg-[var(--muted)] border border-[var(--border)] hover:border-[var(--foreground)] transition-colors"
                      >
                        {/* Slot number */}
                        <span className="text-sm text-[var(--muted-foreground)] w-4 flex-shrink-0">
                          {equipped.slotPosition}
                        </span>

                        {/* Gem name */}
                        <span className="flex-1 text-sm text-[var(--muted-foreground)] truncate">
                          {gem.name}
                        </span>

                        {/* Quality + Rank selectors */}
                        <div className="flex items-center gap-1">
                          {gem.starRating === 5 && (
                            <Select
                              value={String(equipped.quality)}
                              onChange={(value) =>
                                handleQualityChange(
                                  equipped.slotPosition,
                                  Number(value) as Quality,
                                )
                              }
                              options={QUALITY_OPTIONS}
                              className="text-sm bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)]"
                            />
                          )}
                          <Select
                            value={String(equipped.rank)}
                            onChange={(value) =>
                              handleRankChange(
                                equipped.slotPosition,
                                Number(value) as Rank,
                              )
                            }
                            options={RANK_OPTIONS}
                            className="text-sm bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)]"
                          />
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => handleRemoveGem(equipped.slotPosition)}
                          aria-label={`Remove ${gem.name}`}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Resources ───────────────────────────────────────────── */}
            <div className="p-4">
              <ResourceInput
                resources={resources}
                onResourcesChange={handleResourcesChange}
                gemDatabase={GEM_MAP}
                debounceMs={300}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Gem Detail Modal */}
      {selectedGem && (
        <GemDetail
          gem={selectedGem}
          isOpen={showGemDetail}
          onClose={handleCloseGemDetail}
          onAdd={(gem: LegendaryGem) => {
            handleAddGem(gem.id);
          }}
          showAddButton={
            !atCapacity && !equippedGems.some((g) => g.gemId === selectedGem.id)
          }
        />
      )}
    </div>
  );
}
