/**
 * Optimize API Route for DI-Lab
 * POST endpoint for gem upgrade optimization (FR-015 to FR-022)
 *
 * @see specs/feature/PROJ-002-optimizer-ui/contracts/optimize-api.schema.json
 */

import { NextRequest, NextResponse } from "next/server";
import { optimize } from "@/lib/optimization/engine";
import type {
  EquippedGem as EngineEquippedGem,
  GameMode,
  LegendaryGem,
  OptimizationInput,
  UpgradeResources,
} from "@/lib/optimization/types";
import type { EquippedGem } from "@/types";
import type { OptimizeRequest, OptimizationError } from "@/types/optimization";
import gemsData from "@/data/gems.json";

// ============================================================================
// Gem Database Setup
// ============================================================================

// Build gem database map from static data
const gemDatabase = new Map<string, LegendaryGem>();

// Initialize gem database on module load
function initializeGemDatabase(): void {
  // Cast to unknown first to handle the JSON structure mismatch
  const data = gemsData as unknown as {
    gems: {
      "1-star": LegendaryGem[];
      "2-star": LegendaryGem[];
      "5-star": LegendaryGem[];
    };
  };

  // Flatten all gem categories into single map
  if (data.gems) {
    if (data.gems["1-star"]) {
      for (const gem of data.gems["1-star"]) {
        gemDatabase.set(gem.id, gem);
      }
    }
    if (data.gems["2-star"]) {
      for (const gem of data.gems["2-star"]) {
        gemDatabase.set(gem.id, gem);
      }
    }
    if (data.gems["5-star"]) {
      for (const gem of data.gems["5-star"]) {
        gemDatabase.set(gem.id, gem);
      }
    }
  }
}

initializeGemDatabase();

// ============================================================================
// Request Validation
// ============================================================================

interface ValidatedRequest {
  gems: EquippedGem[];
  gemPower: number;
  copyInventory: Record<string, number>;
  mode: "PVP" | "PVE";
}

function validateRequest(body: unknown): ValidatedRequest | OptimizationError {
  if (!body || typeof body !== "object") {
    return {
      type: "validation",
      title: "Invalid Input",
      message: "Request body is missing or invalid.",
      guidance: "Provide a valid JSON request body with gems and resources.",
    };
  }

  const request = body as Partial<OptimizeRequest>;

  // Validate gems array
  if (!Array.isArray(request.gems)) {
    return {
      type: "validation",
      title: "Invalid Input",
      message: "Gems must be an array.",
      guidance: "Provide an array of equipped gems.",
    };
  }

  if (request.gems.length === 0) {
    return {
      type: "validation",
      title: "No Gems Selected",
      message: "At least one gem is required for optimization.",
      guidance: "Add gems to your build before optimizing.",
    };
  }

  if (request.gems.length > 24) {
    return {
      type: "validation",
      title: "Too Many Gems",
      message: "Maximum of 24 gems allowed.",
      guidance: "Remove some gems from your build.",
    };
  }

  // Validate each gem
  const invalidGems: string[] = [];
  const errors: string[] = [];

  for (const gem of request.gems) {
    if (!gem.gemId || typeof gem.gemId !== "string") {
      invalidGems.push("unknown");
      errors.push("Gem ID is required");
      continue;
    }

    if (!gemDatabase.has(gem.gemId)) {
      invalidGems.push(gem.gemId);
      errors.push(`Unknown gem: ${gem.gemId}`);
    }

    if (gem.quality < 1 || gem.quality > 5) {
      invalidGems.push(gem.gemId);
      errors.push("Quality must be between 1 and 5");
    }

    if (gem.rank < 1 || gem.rank > 10) {
      invalidGems.push(gem.gemId);
      errors.push("Rank must be between 1 and 10");
    }
  }

  if (invalidGems.length > 0) {
    return {
      type: "validation",
      title: "Invalid Gem Configuration",
      message: "Your gem configuration has validation errors.",
      guidance:
        "Check your gem configuration and ensure all gems have valid quality and rank values.",
      details: {
        invalidGems,
        errors,
      },
    };
  }

  // Validate resources
  if (!request.resources) {
    return {
      type: "validation",
      title: "Missing Resources",
      message: "Resource inventory is required.",
      guidance: "Provide your available resources for optimization.",
    };
  }

  const { resources } = request;

  if (typeof resources.gemPower !== "number" || resources.gemPower < 0) {
    return {
      type: "validation",
      title: "Invalid Gem Power",
      message: "Gem Power must be a non-negative number.",
      guidance: "Enter a valid Gem Power amount.",
    };
  }

  // Validate mode
  const mode = request.mode || "PVE";
  if (mode !== "PVP" && mode !== "PVE") {
    return {
      type: "validation",
      title: "Invalid Mode",
      message: "Optimization mode must be PVP or PVE.",
      guidance: "Select a valid optimization mode.",
    };
  }

  return {
    gems: request.gems,
    gemPower: resources.gemPower,
    copyInventory: resources.copyInventory || {},
    mode,
  };
}

// ============================================================================
// Type Conversion
// ============================================================================

function toEngineInput(request: ValidatedRequest): OptimizationInput {
  // Convert UI gems to engine format
  const engineGems: EngineEquippedGem[] = request.gems.map((gem) => ({
    gemId: gem.gemId,
    slot: gem.slotPosition - 1, // Convert 1-indexed to 0-indexed
    currentRank: gem.rank,
    quality: gem.quality,
  }));

  // Convert copyInventory object to Map for engine
  const copyInventory = new Map<string, number>();
  for (const [gemId, count] of Object.entries(request.copyInventory)) {
    copyInventory.set(gemId, count);
  }

  const engineResources: UpgradeResources = {
    gemPower: request.gemPower,
    copyInventory,
  };

  return {
    gems: engineGems,
    resources: engineResources,
    mode: request.mode as GameMode,
    gemDatabase,
  };
}

// ============================================================================
// API Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          type: "validation",
          title: "Invalid JSON",
          message: "Request body is not valid JSON.",
          guidance: "Ensure your request body is properly formatted JSON.",
        } as OptimizationError,
        { status: 400 },
      );
    }

    // Validate request
    const validated = validateRequest(body);
    if ("type" in validated && "title" in validated) {
      // It's an error
      return NextResponse.json(validated, { status: 400 });
    }

    // Convert to engine input
    const engineInput = toEngineInput(validated);

    // Check for timeout (30 seconds per FR-022)
    const TIMEOUT_MS = 30000;
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("TIMEOUT"));
      }, TIMEOUT_MS);
    });

    // Run optimization with timeout
    let result;
    try {
      result = await Promise.race([
        Promise.resolve(optimize(engineInput)),
        timeoutPromise,
      ]);
    } catch (error) {
      if (error instanceof Error && error.message === "TIMEOUT") {
        return NextResponse.json(
          {
            type: "timeout",
            title: "Optimization Timeout",
            message: "The optimization calculation exceeded the time limit.",
            guidance:
              "Try reducing the number of gems or simplifying your configuration.",
          } as OptimizationError,
          { status: 408 },
        );
      }
      throw error;
    }

    // Check for insufficient resources
    if (result.recommendations.length === 0) {
      return NextResponse.json(
        {
          type: "insufficient-resources",
          title: "Insufficient Resources",
          message: "Your current resources cannot fund any upgrades.",
          guidance:
            "Add more Gem Power or gem copies to enable upgrade recommendations.",
          details: {
            available: {
              gemPower: validated.gemPower,
              copies: validated.copyInventory,
            },
          },
        } as OptimizationError,
        { status: 422 },
      );
    }

    // Transform result for API response
    const response = {
      recommendations: result.recommendations.map((rec) => ({
        id: `rec-${rec.gemId}-${rec.fromRank}-${rec.toRank}`,
        targetGem: {
          gemId: rec.gemId,
          slotPosition: rec.slot + 1, // Convert back to 1-indexed
          rank: rec.fromRank,
          quality:
            validated.gems.find((g) => g.slotPosition === rec.slot + 1)
              ?.quality || 1,
        },
        currentRank: rec.fromRank,
        targetRank: rec.toRank,
        resourceCost: {
          gemPower: rec.gemPowerCost,
          copies: rec.copiesCost,
        },
        powerGain: rec.powerGain,
        priorityRank: rec.priorityRank,
        reasoning: rec.reasoning,
      })),
      totalPowerGain: result.totalPowerGain,
      totalResourceCost: result.totalResourceCost,
      mode: result.mode,
      calculatedAt: result.calculatedAt,
      processingTime: result.processingTime,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Optimization error:", error);

    return NextResponse.json(
      {
        type: "server-error",
        title: "Server Error",
        message: "An unexpected error occurred during optimization.",
        guidance: "Please try again. If the problem persists, contact support.",
      } as OptimizationError,
      { status: 500 },
    );
  }
}
