/**
 * Acquisition path utilities for gem resources.
 * @see specs/feature/PROJ-002-optimizer-ui/data-model.md
 */

// ============================================================================
// Crafting Conversion Rates (FR-054)
// ============================================================================

export const CRAFTING_RATES = {
  /** 20 Telluric Fragments = 1-star legendary gem */
  FRAGMENTS_TO_1STAR: 20,
  /** 80 Telluric Fragments = 2-star legendary gem */
  FRAGMENTS_TO_2STAR: 80,
  /** 320 Fading Embers = 1 Eternal Legendary Crest */
  EMBERS_TO_ETERNAL_CREST: 320,
  /** 5 Fading Embers = 1 Telluric Pearl (suboptimal) */
  EMBERS_TO_PEARL: 5,
  /** Dawning Echo cost for awakening (Platinum) */
  DAWNING_ECHO_PLATINUM: 10000,
} as const;

// ============================================================================
// Run Requirements Calculator (FR-053)
// ============================================================================

export interface RunRequirements {
  /** Type of crest to use */
  crestType: "eternal" | "legendary" | "rare";
  /** Number of Elder Rift runs needed */
  runsNeeded: number;
  /** Expected number of gems from runs */
  expectedGems: number;
  /** Estimated telluric fragments from runs */
  estimatedFragments: number;
  /** Estimated fading embers from runs */
  estimatedEmbers: number;
}

/**
 * Calculate run requirements to obtain gems or resources.
 * (FR-053)
 */
export function calculateRunRequirements(options: {
  targetGems?: number;
  targetFragments?: number;
  targetEmbers?: number;
  crestType: "eternal" | "legendary" | "rare";
}): RunRequirements {
  const { crestType } = options;

  // Drop rates per crest type (approximate)
  const dropRates = {
    eternal: { gemChance: 1.0, fragmentsPerRun: 8, embersPerRun: 12 },
    legendary: { gemChance: 1.0, fragmentsPerRun: 6, embersPerRun: 8 },
    rare: { gemChance: 0.05, fragmentsPerRun: 2, embersPerRun: 2 },
  };

  const rates = dropRates[crestType];

  // Calculate runs needed based on target
  let runsNeeded = 0;

  if (options.targetGems) {
    runsNeeded = Math.ceil(options.targetGems / rates.gemChance);
  }

  if (options.targetFragments) {
    const fragmentRuns = Math.ceil(
      options.targetFragments / rates.fragmentsPerRun,
    );
    runsNeeded = Math.max(runsNeeded, fragmentRuns);
  }

  if (options.targetEmbers) {
    const emberRuns = Math.ceil(options.targetEmbers / rates.embersPerRun);
    runsNeeded = Math.max(runsNeeded, emberRuns);
  }

  return {
    crestType,
    runsNeeded,
    expectedGems: Math.floor(runsNeeded * rates.gemChance),
    estimatedFragments: runsNeeded * rates.fragmentsPerRun,
    estimatedEmbers: runsNeeded * rates.embersPerRun,
  };
}

/**
 * Calculate gems needed to craft using fragments.
 */
export function calculateFragmentCrafting(
  target1StarGems: number,
  target2StarGems: number,
): { fragmentsNeeded: number } {
  const fragmentsNeeded =
    target1StarGems * CRAFTING_RATES.FRAGMENTS_TO_1STAR +
    target2StarGems * CRAFTING_RATES.FRAGMENTS_TO_2STAR;

  return { fragmentsNeeded };
}

/**
 * Calculate Eternal Crests from Fading Embers.
 */
export function calculateEmberToCrests(embers: number): {
  crests: number;
  remainingEmbers: number;
} {
  const crests = Math.floor(embers / CRAFTING_RATES.EMBERS_TO_ETERNAL_CREST);
  const remainingEmbers = embers % CRAFTING_RATES.EMBERS_TO_ETERNAL_CREST;
  return { crests, remainingEmbers };
}

/**
 * Calculate Telluric Pearls from Fading Embers.
 * Note: This is suboptimal - not recommended.
 */
export function calculateEmberToPearls(embers: number): {
  pearls: number;
  remainingEmbers: number;
} {
  const pearls = Math.floor(embers / CRAFTING_RATES.EMBERS_TO_PEARL);
  const remainingEmbers = embers % CRAFTING_RATES.EMBERS_TO_PEARL;
  return { pearls, remainingEmbers };
}

// ============================================================================
// Acquisition Paths (FR-052)
// ============================================================================

export interface AcquisitionPath {
  type: "farming" | "market" | "hybrid";
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  estimatedTime?: string;
  estimatedCost?: number; // Platinum equivalent
}

/**
 * Get the three main acquisition paths.
 * (FR-052)
 */
export function getAcquisitionPaths(): AcquisitionPath[] {
  return [
    {
      type: "farming",
      title: "Farming Elder Rifts",
      description:
        "Run Elder Rifts using crests to obtain gems and crafting materials.",
      pros: [
        "No platinum cost if using free crests",
        "Earns multiple resource types",
        "Can get lucky with 5-star drops",
      ],
      cons: [
        "Time-intensive",
        "RNG-dependent results",
        "Limited by crest availability",
      ],
      estimatedTime: "2-4 hours per gem",
    },
    {
      type: "market",
      title: "Market Purchases",
      description: "Buy gems directly from the in-game market using platinum.",
      pros: [
        "Instant acquisition",
        "Guaranteed specific gem",
        "No RNG involved",
      ],
      cons: [
        "Requires significant platinum",
        "Market prices fluctuate",
        "Limited gem availability",
      ],
      estimatedCost: 5000, // Average, varies by gem
    },
    {
      type: "hybrid",
      title: "Hybrid Approach",
      description:
        "Combine farming for materials with strategic market purchases.",
      pros: [
        "Balanced time and cost",
        "Flexible based on resources",
        "Optimizes efficiency",
      ],
      cons: [
        "Requires planning",
        "Still needs some platinum",
        "Complex to optimize",
      ],
      estimatedTime: "1-2 hours per gem",
      estimatedCost: 2000,
    },
  ];
}
