/**
 * Unit tests for the optimization engine
 * @module optimization/engine.test
 */

import { describe, it, expect, beforeEach } from "vitest";
import { optimize } from "./engine";
import type {
  EquippedGem,
  GameMode,
  LegendaryGem,
  OptimizationInput,
  UpgradeResources,
} from "./types";
import { createCopyInventory } from "./resources";

/**
 * Helper to create a test gem definition
 */
function createTestGem(
  id: string,
  name: string,
  starRating: 1 | 2 | 5,
  pvpTier: "S" | "A" | "B" | "C" | "D",
  pveTier: "S" | "A" | "B" | "C" | "D",
): LegendaryGem {
  return {
    id,
    name,
    starRating,
    pvpTier,
    pveTier,
    resonanceTable: {},
    crTable: {},
  };
}

/**
 * Helper to create test resources
 */
function createTestResources(
  gemPower: number,
  copies: Record<string, number> = {},
): UpgradeResources {
  return {
    gemPower,
    copyInventory: createCopyInventory(copies),
  };
}

/**
 * Helper to create an equipped gem
 */
function createEquippedGem(
  gemId: string,
  slot: number,
  currentRank: number,
  quality: number = 1,
): EquippedGem {
  return {
    gemId,
    slot,
    currentRank,
    quality,
  };
}

describe("optimize", () => {
  let gemDatabase: Map<string, LegendaryGem>;

  beforeEach(() => {
    // Create a test gem database with various tier gems
    gemDatabase = new Map<string, LegendaryGem>();

    // S-tier 5-star gem
    gemDatabase.set(
      "s-tier-gem",
      createTestGem("s-tier-gem", "S-Tier Power Gem", 5, "S", "S"),
    );

    // A-tier 5-star gem
    gemDatabase.set(
      "a-tier-gem",
      createTestGem("a-tier-gem", "A-Tier Support Gem", 5, "A", "A"),
    );

    // B-tier 2-star gem
    gemDatabase.set(
      "b-tier-gem",
      createTestGem("b-tier-gem", "B-Tier Utility Gem", 2, "B", "B"),
    );

    // D-tier 1-star gem
    gemDatabase.set(
      "d-tier-gem",
      createTestGem("d-tier-gem", "D-Tier Starter Gem", 1, "D", "D"),
    );
  });

  describe("empty input handling", () => {
    it("should return empty recommendations for empty gems array", () => {
      const input: OptimizationInput = {
        gems: [],
        resources: createTestResources(1000),
        mode: "PVE",
        gemDatabase,
      };

      const result = optimize(input);

      expect(result.recommendations).toHaveLength(0);
      expect(result.totalPowerGain).toBe(0);
      expect(result.totalResourceCost.gemPower).toBe(0);
      expect(result.totalResourceCost.copies).toBe(0);
    });

    it("should return empty recommendations for no gems input", () => {
      const input = {
        gems: undefined as unknown as EquippedGem[],
        resources: createTestResources(1000),
        mode: "PVE" as GameMode,
        gemDatabase,
      };

      const result = optimize(input);

      expect(result.recommendations).toHaveLength(0);
    });
  });

  describe("tier prioritization", () => {
    it("should prioritize S-tier gems over D-tier gems with same cost", () => {
      // Both gems at rank 1, same quality
      const gems: EquippedGem[] = [
        createEquippedGem("s-tier-gem", 0, 1, 5),
        createEquippedGem("d-tier-gem", 1, 1, 1),
      ];

      const input: OptimizationInput = {
        gems,
        resources: createTestResources(100, {
          "s-tier-gem": 1,
          "d-tier-gem": 1,
        }),
        mode: "PVE",
        gemDatabase,
      };

      const result = optimize(input);

      // S-tier should be prioritized first
      expect(result.recommendations.length).toBeGreaterThan(0);
      if (result.recommendations.length > 0) {
        expect(result.recommendations[0].gemId).toBe("s-tier-gem");
      }
    });

    it("should rank S-tier recommendation first in PVP mode", () => {
      const gems: EquippedGem[] = [
        createEquippedGem("s-tier-gem", 0, 1, 5),
        createEquippedGem("a-tier-gem", 1, 1, 5),
      ];

      const input: OptimizationInput = {
        gems,
        resources: createTestResources(200, {
          "s-tier-gem": 1,
          "a-tier-gem": 1,
        }),
        mode: "PVP",
        gemDatabase,
      };

      const result = optimize(input);

      expect(result.recommendations.length).toBeGreaterThan(0);
      if (result.recommendations.length > 0) {
        expect(result.recommendations[0].gemId).toBe("s-tier-gem");
        expect(result.recommendations[0].priorityRank).toBe(1);
      }
    });
  });

  describe("resource constraints", () => {
    it("should return empty recommendations when no resources available", () => {
      const gems: EquippedGem[] = [createEquippedGem("s-tier-gem", 0, 1, 5)];

      const input: OptimizationInput = {
        gems,
        resources: createTestResources(0, {}), // No resources
        mode: "PVE",
        gemDatabase,
      };

      const result = optimize(input);

      expect(result.recommendations).toHaveLength(0);
    });

    it("should respect gem power constraints", () => {
      const gems: EquippedGem[] = [
        createEquippedGem("s-tier-gem", 0, 1, 5), // 5-star, rank 1→2 costs 60 GP
      ];

      const input: OptimizationInput = {
        gems,
        resources: createTestResources(30, { "s-tier-gem": 1 }), // Only 30 GP, need 60
        mode: "PVE",
        gemDatabase,
      };

      const result = optimize(input);

      // Should not be able to afford the upgrade
      expect(result.recommendations).toHaveLength(0);
    });

    it("should respect copy constraints", () => {
      const gems: EquippedGem[] = [createEquippedGem("s-tier-gem", 0, 1, 5)];

      const input: OptimizationInput = {
        gems,
        resources: createTestResources(1000, {}), // Plenty GP, but no copies
        mode: "PVE",
        gemDatabase,
      };

      const result = optimize(input);

      // Should not be able to upgrade without copies
      expect(result.recommendations).toHaveLength(0);
    });

    it("should correctly calculate total resource cost", () => {
      const gems: EquippedGem[] = [
        createEquippedGem("s-tier-gem", 0, 1, 5), // 60 GP for rank 1→2
      ];

      const input: OptimizationInput = {
        gems,
        resources: createTestResources(100, { "s-tier-gem": 1 }),
        mode: "PVE",
        gemDatabase,
      };

      const result = optimize(input);

      if (result.recommendations.length > 0) {
        expect(result.totalResourceCost.gemPower).toBe(60);
        expect(result.totalResourceCost.copies).toBe(1);
      }
    });
  });

  describe("result structure", () => {
    it("should include processing time", () => {
      const input: OptimizationInput = {
        gems: [],
        resources: createTestResources(1000),
        mode: "PVE",
        gemDatabase,
      };

      const result = optimize(input);

      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it("should include calculatedAt timestamp", () => {
      const input: OptimizationInput = {
        gems: [],
        resources: createTestResources(1000),
        mode: "PVE",
        gemDatabase,
      };

      const result = optimize(input);

      expect(result.calculatedAt).toBeDefined();
      expect(new Date(result.calculatedAt).toISOString()).toBe(
        result.calculatedAt,
      );
    });

    it("should include mode in result", () => {
      const input: OptimizationInput = {
        gems: [],
        resources: createTestResources(1000),
        mode: "PVP",
        gemDatabase,
      };

      const result = optimize(input);

      expect(result.mode).toBe("PVP");
    });

    it("should include reasoning in recommendations", () => {
      const gems: EquippedGem[] = [createEquippedGem("s-tier-gem", 0, 1, 5)];

      const input: OptimizationInput = {
        gems,
        resources: createTestResources(100, { "s-tier-gem": 1 }),
        mode: "PVE",
        gemDatabase,
      };

      const result = optimize(input);

      if (result.recommendations.length > 0) {
        expect(result.recommendations[0].reasoning).toBeDefined();
        expect(typeof result.recommendations[0].reasoning).toBe("string");
      }
    });
  });

  describe("edge cases", () => {
    it("should handle max rank gems (no upgrade possible)", () => {
      const gems: EquippedGem[] = [
        createEquippedGem("s-tier-gem", 0, 10, 5), // Already at max rank
      ];

      const input: OptimizationInput = {
        gems,
        resources: createTestResources(1000, { "s-tier-gem": 10 }),
        mode: "PVE",
        gemDatabase,
      };

      const result = optimize(input);

      // Cannot upgrade past rank 10
      expect(result.recommendations).toHaveLength(0);
    });

    it("should work without provided gemDatabase", () => {
      const input: OptimizationInput = {
        gems: [],
        resources: createTestResources(1000),
        mode: "PVE",
        // No gemDatabase provided
      };

      const result = optimize(input);

      expect(result).toBeDefined();
      expect(result.recommendations).toHaveLength(0);
    });
  });
});

describe("performance", () => {
  it("should complete optimization in under 100ms for typical input", () => {
    const gemDatabase = new Map<string, LegendaryGem>();

    // Create 24 gems (max slots)
    for (let i = 0; i < 24; i++) {
      gemDatabase.set(
        `gem-${i}`,
        createTestGem(`gem-${i}`, `Gem ${i}`, 2, "B", "B"),
      );
    }

    const gems: EquippedGem[] = Array.from({ length: 24 }, (_, i) =>
      createEquippedGem(`gem-${i}`, i, 5, 1),
    );

    const resources: UpgradeResources = {
      gemPower: 10000,
      copyInventory: new Map(
        Array.from({ length: 24 }, (_, i) => [`gem-${i}`, 5]),
      ),
    };

    const input: OptimizationInput = {
      gems,
      resources,
      mode: "PVE",
      gemDatabase,
    };

    const startTime = performance.now();
    const result = optimize(input);
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(100);
    expect(result).toBeDefined();
  });
});
