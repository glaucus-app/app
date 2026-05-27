/**
 * Type definitions for the optimization engine
 * @module optimization/types
 */

/**
 * Tier ranking for gem power calculation
 */
export type TierRanking = "S" | "A" | "B" | "C" | "D";

/**
 * Game mode for optimization context
 */
export type GameMode = "PVP" | "PVE";

/**
 * Star rating for legendary gems (1, 2, or 5 stars)
 */
export type StarRating = 1 | 2 | 5;

/**
 * Quality rating for 5-star gems (2-5 out of 5)
 */
export type QualityRating = 1 | 2 | 3 | 4 | 5;

/**
 * Resonance lookup table by rank and quality
 */
export interface ResonanceTable {
  /** Direct rank-to-resonance mapping for 1-star and 2-star gems */
  byRank?: Record<number, number>;
  /** Quality-specific resonance for 5-star gems */
  byQuality?: {
    2: Record<number, number>;
    3: Record<number, number>;
    4: Record<number, number>;
    5: Record<number, number>;
  };
}

/**
 * Combat Rating lookup table by rank and quality
 */
export interface CRTable {
  /** Direct rank-to-CR mapping for 1-star and 2-star gems */
  byRank?: Record<number, number>;
  /** Quality-specific CR for 5-star gems */
  byQuality?: {
    2: Record<number, number>;
    3: Record<number, number>;
    4: Record<number, number>;
    5: Record<number, number>;
  };
}

/**
 * Complete legendary gem definition
 */
export interface LegendaryGem {
  /** Unique identifier for the gem */
  id: string;
  /** Display name */
  name: string;
  /** Star rating (1, 2, or 5) */
  starRating: StarRating;
  /** Tier ranking for PVP content */
  pvpTier: TierRanking;
  /** Tier ranking for PVE content */
  pveTier: TierRanking;
  /** Resonance values by rank/quality */
  resonanceTable: ResonanceTable;
  /** Combat Rating values by rank/quality */
  crTable: CRTable;
}

/**
 * Gem equipped in a character slot
 */
export interface EquippedGem {
  /** Reference to the gem definition */
  gemId: string;
  /** Slot position (0-23) */
  slot: number;
  /** Current rank (1-10) */
  currentRank: number;
  /** Quality rating (1 for 1-star, 1 for 2-star, 2-5 for 5-star) */
  quality: number;
}

/**
 * Available resources for upgrades
 */
export interface UpgradeResources {
  /** Gem Power available for upgrades */
  gemPower: number;
  /** Map of gem ID to number of copies available */
  copyInventory: Map<string, number>;
}

/**
 * Input for the optimization algorithm
 */
export interface OptimizationInput {
  /** Currently equipped gems */
  gems: EquippedGem[];
  /** Available resources */
  resources: UpgradeResources;
  /** Game mode context (PVP or PVE) */
  mode: GameMode;
  /** Optional gem database for lookups */
  gemDatabase?: Map<string, LegendaryGem>;
}

/**
 * Single upgrade recommendation
 */
export interface UpgradeRecommendation {
  /** ID of the gem to upgrade */
  gemId: string;
  /** Slot position of the gem */
  slot: number;
  /** Current rank before upgrade */
  fromRank: number;
  /** Target rank after upgrade */
  toRank: number;
  /** Calculated power gain from upgrade */
  powerGain: number;
  /** Gem Power cost for upgrade */
  gemPowerCost: number;
  /** Number of gem copies required */
  copiesCost: number;
  /** Priority rank (1 = highest priority) */
  priorityRank: number;
  /** Human-readable explanation */
  reasoning: string;
}

/**
 * Complete optimization result
 */
export interface OptimizationResult {
  /** Ordered list of upgrade recommendations */
  recommendations: UpgradeRecommendation[];
  /** Infusion recommendations for dormant 5-star gems (T100b - FR-037b) */
  infusionRecommendations?: InfusionRecommendation[];
  /** Total power gain from all recommendations */
  totalPowerGain: number;
  /** Total resource cost for all recommendations */
  totalResourceCost: {
    gemPower: number;
    copies: number;
  };
  /** Game mode used for optimization */
  mode: GameMode;
  /** ISO timestamp of calculation */
  calculatedAt: string;
  /** Processing time in milliseconds */
  processingTime: number;
}

/**
 * Internal candidate for upgrade evaluation
 */
export interface UpgradeCandidate {
  /** ID of the gem to upgrade */
  gemId: string;
  /** Slot position */
  slot: number;
  /** Current rank */
  currentRank: number;
  /** Target rank after upgrade */
  targetRank: number;
  /** Gem Power cost */
  gemPowerCost: number;
  /** Copies required */
  copiesRequired: number;
  /** Raw power gain */
  powerGain: number;
  /** Priority score (ROI) */
  priorityScore: number;
  /** Tier ranking in current mode */
  tier: TierRanking;
}

/**
 * Resonance threshold configuration
 */
export interface ResonanceThreshold {
  /** Total resonance required */
  resonance: number;
  /** Number of wing slots unlocked */
  slots: number;
}

/**
 * Power calculation components for debugging
 */
export interface PowerBreakdown {
  /** Base resonance value */
  resonance: number;
  /** Combat Rating value */
  cr: number;
  /** Base power (resonance + CR × 2) */
  basePower: number;
  /** Tier multiplier applied */
  tierMultiplier: number;
  /** Threshold bonus (1.0 or 1.2) */
  thresholdBonus: number;
  /** Diminishing returns factor */
  diminishingFactor: number;
  /** Final calculated power */
  finalPower: number;
}

/**
 * Source gem for infusion into a dormant 5-star gem (T100b - FR-037b)
 */
export interface InfusionSourceGem {
  /** Gem ID of the source gem */
  gemId: string;
  /** Star rating of source gem (1, 2, or 5) */
  starRating: StarRating;
  /** Rank of the source gem */
  rank: number;
  /** Gem Power contributed by this source */
  gemPowerContributed: number;
  /** Resonance contributed by this source */
  resonanceContributed: number;
}

/**
 * Infusion recommendation for dormant 5-star gems (T100b - FR-037b)
 */
export interface InfusionRecommendation {
  /** Slot position of the dormant 5-star gem */
  slot: number;
  /** Gem ID of the dormant 5-star gem */
  gemId: string;
  /** Current rank of the dormant gem */
  currentRank: number;
  /** Quality of the dormant gem (2-5) */
  quality: number;
  /** Source gems to infuse */
  sourceGems: InfusionSourceGem[];
  /** Total Gem Power from infusion */
  totalGemPower: number;
  /** Additional resonance gained from infusion */
  additionalResonance: number;
  /** Power gain from the infusion */
  powerGain: number;
  /** Priority rank */
  priorityRank: number;
  /** Human-readable reasoning */
  reasoning: string;
}

/**
 * Extended optimization input with advanced strategies support (T100b - FR-037b)
 */
export interface ExtendedOptimizationInput extends OptimizationInput {
  /** Whether advanced strategies are enabled */
  advancedStrategies?: boolean;
  /** Number of awakened slots available */
  awakenedSlots?: number;
}
