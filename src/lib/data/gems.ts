/**
 * Gem data loader and transformer
 * Loads gems from gems.json and transforms them to LegendaryGem format
 */

import type {
  LegendaryGem,
  StarRating,
  EffectCategory,
  EffectType,
  GemEffect,
} from "@/types/gem";
import {
  ONE_STAR_RESONANCE,
  TWO_STAR_RESONANCE,
  FIVE_STAR_RESONANCE,
} from "@/lib/optimization/constants";

// Import the raw gems JSON
import gemsData from "@/data/gems.json";

// Raw gem structure from JSON
interface RawGemEffect {
  category: string;
  type: string;
  description: string;
  maxValue?: number;
  duration?: number;
  cooldown?: number;
  isStrifed: boolean;
}

interface RawGem {
  id: string;
  name: string;
  starRating: StarRating;
  pvpTier: string;
  pveTier: string;
  effects: RawGemEffect[];
  icon?: string;
}

interface GemsData {
  version: string;
  lastUpdated: string;
  source: string;
  gems: {
    "1-star": RawGem[];
    "2-star": RawGem[];
    "5-star": RawGem[];
  };
}

/**
 * Transform a raw gem from JSON to LegendaryGem format
 */
function transformGem(raw: RawGem): LegendaryGem {
  // Build resonance table based on star rating
  let resonanceTable: LegendaryGem["resonanceTable"];

  if (raw.starRating === 1) {
    resonanceTable = {
      byRank: { ...ONE_STAR_RESONANCE },
    };
  } else if (raw.starRating === 2) {
    resonanceTable = {
      byRank: { ...TWO_STAR_RESONANCE },
    };
  } else {
    // 5-star gems have quality-based resonance
    resonanceTable = {
      byQuality: {
        2: { ...FIVE_STAR_RESONANCE[2] },
        3: { ...FIVE_STAR_RESONANCE[3] },
        4: { ...FIVE_STAR_RESONANCE[4] },
        5: { ...FIVE_STAR_RESONANCE[5] },
      },
    };
  }

  // Extract effect categories
  const effectCategories = [
    ...new Set(raw.effects.map((e) => e.category as EffectCategory)),
  ];

  // Transform effects
  const effects: GemEffect[] = raw.effects.map((e) => {
    const maxValues: Record<string, string | number> =
      e.maxValue !== undefined ? { maxValue: e.maxValue } : {};
    return {
      category: e.category as EffectCategory,
      type: e.type as EffectType,
      description: e.description,
      maxValues,
      duration: e.duration,
      cooldown: e.cooldown,
      isStrifed: e.isStrifed,
    };
  });

  return {
    id: raw.id,
    name: raw.name,
    starRating: raw.starRating,
    effects,
    effectCategories,
    pvpTier: raw.pvpTier as LegendaryGem["pvpTier"],
    pveTier: raw.pveTier as LegendaryGem["pveTier"],
    upgradeCosts: [], // Will be calculated dynamically
    resonanceTable,
    icon: raw.icon,
  };
}

/**
 * Load all gems from the JSON file
 */
export function loadAllGems(): LegendaryGem[] {
  const data = gemsData as GemsData;
  const allGems: LegendaryGem[] = [];

  // Transform gems from each star rating category
  for (const gem of data.gems["1-star"]) {
    allGems.push(transformGem(gem));
  }
  for (const gem of data.gems["2-star"]) {
    allGems.push(transformGem(gem));
  }
  for (const gem of data.gems["5-star"]) {
    allGems.push(transformGem(gem));
  }

  return allGems;
}

/**
 * Get gems by star rating
 */
export function getGemsByStarRating(rating: StarRating): LegendaryGem[] {
  const data = gemsData as GemsData;
  const gems =
    rating === 1
      ? data.gems["1-star"]
      : rating === 2
        ? data.gems["2-star"]
        : data.gems["5-star"];

  return gems.map(transformGem);
}

/**
 * Create a map of gems by ID for quick lookup
 */
export function createGemMap(): Map<string, LegendaryGem> {
  const gems = loadAllGems();
  return new Map(gems.map((gem) => [gem.id, gem]));
}

// Pre-loaded gems for convenience
export const ALL_GEMS = loadAllGems();
export const GEM_MAP = createGemMap();
