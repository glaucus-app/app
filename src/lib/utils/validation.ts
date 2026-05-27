/**
 * Validation utilities and Zod schemas for DI-Lab
 * Provides runtime validation for all data types per spec
 */

import { z } from "zod";
import type {
  StarRating,
  Quality,
  Rank,
  TierRanking,
  EffectCategory,
  EffectType,
  SlotType,
} from "@/types";

// ============================================================================
// Enum Schemas
// ============================================================================

export const StarRatingSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(5),
]) as z.ZodType<StarRating>;

export const QualitySchema = z
  .number()
  .int()
  .min(1)
  .max(5) as z.ZodType<Quality>;

export const RankSchema = z.number().int().min(1).max(10) as z.ZodType<Rank>;

export const TierRankingSchema = z.enum([
  "S",
  "A",
  "B",
  "C",
  "D",
]) as z.ZodType<TierRanking>;

export const EffectCategorySchema = z.enum([
  "OFF",
  "DEF",
  "ALL",
  "DOT",
  "LOC",
  "TLOC",
  "Summon",
  "Conjure",
]) as z.ZodType<EffectCategory>;

export const EffectTypeSchema = z.string().min(1) as z.ZodType<EffectType>;

export const SlotTypeSchema = z.enum([
  "base",
  "wing",
  "awakened",
]) as z.ZodType<SlotType>;

// ============================================================================
// Gem Schemas
// ============================================================================

export const GemEffectSchema = z.object({
  category: EffectCategorySchema,
  type: EffectTypeSchema,
  description: z.string().min(1),
  maxValue: z.number().positive(),
  duration: z.number().positive().optional(),
  cooldown: z.number().positive().optional(),
  isStrifed: z.boolean(),
});

export const LegendaryGemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  starRating: StarRatingSchema,
  pvpTier: TierRankingSchema,
  pveTier: TierRankingSchema,
  source: z.string().optional(),
  effects: z.array(GemEffectSchema).min(1),
});

export const EquippedGemSchema = z.object({
  gemId: z.string().min(1),
  quality: QualitySchema,
  rank: RankSchema,
  slotPosition: z.number().int().min(1).max(24),
  slotType: SlotTypeSchema,
}) satisfies z.ZodType<{
  gemId: string;
  quality: Quality;
  rank: Rank;
  slotPosition: number;
  slotType: SlotType;
}>;

export const InventoryGemSchema = z.object({
  gemId: z.string().min(1),
  quality: QualitySchema,
  rank: RankSchema,
  quantity: z.number().int().min(1),
}) satisfies z.ZodType<{
  gemId: string;
  quality: Quality;
  rank: Rank;
  quantity: number;
}>;

// ============================================================================
// Resource Schemas
// ============================================================================

export const CrestCountsSchema = z.object({
  eternal: z.number().int().min(0).default(0),
  legendary: z.number().int().min(0).default(0),
  rare: z.number().int().min(0).default(0),
});

export const ResourceInventorySchema = z.object({
  gemPower: z.number().min(0).default(0),
  inventoryGems: z.array(InventoryGemSchema).default([]),
  telluricPearls: z.number().int().min(0).default(0),
  telluricFragments: z.number().int().min(0).default(0),
  fadingEmbers: z.number().int().min(0).default(0),
  platinum: z.number().int().min(0).default(0),
  crestCounts: CrestCountsSchema.default({ eternal: 0, legendary: 0, rare: 0 }),
  dawningEchoes: z.number().int().min(0).default(0),
});

// ============================================================================
// Build Schemas
// ============================================================================

export const SavedBuildSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  notes: z.string().max(500).optional(),
  equippedGems: z.array(EquippedGemSchema).max(24),
  resources: ResourceInventorySchema,
  awakenedSlots: z.number().int().min(0).max(12).default(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const SessionStateSchema = z.object({
  anonymousId: z.string().uuid(),
  equippedGems: z.array(EquippedGemSchema).max(24).default([]),
  resources: ResourceInventorySchema.default({
    gemPower: 0,
    inventoryGems: [],
    telluricPearls: 0,
    telluricFragments: 0,
    fadingEmbers: 0,
    platinum: 0,
    crestCounts: { eternal: 0, legendary: 0, rare: 0 },
    dawningEchoes: 0,
  }),
  awakenedSlots: z.number().int().min(0).max(12).default(0),
  lastSavedAt: z.coerce.date().optional(),
});

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate and parse data against a Zod schema
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns Validated data or throws ZodError
 */
export function validate<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safely validate data against a Zod schema
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns Object with success flag and data or error
 */
export function safeValidate<T>(
  schema: z.ZodType<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Validate an equipped gem
 * @param gem - The gem data to validate
 * @returns Validated EquippedGem or throws ZodError
 */
export function validateEquippedGem(gem: unknown) {
  return validate(EquippedGemSchema, gem);
}

/**
 * Validate resource inventory
 * @param resources - The resource data to validate
 * @returns Validated ResourceInventory or throws ZodError
 */
export function validateResources(resources: unknown) {
  return validate(ResourceInventorySchema, resources);
}

/**
 * Validate a saved build
 * @param build - The build data to validate
 * @returns Validated SavedBuild or throws ZodError
 */
export function validateBuild(build: unknown) {
  return validate(SavedBuildSchema, build);
}

/**
 * Validate an inventory gem entry
 * @param gem - The inventory gem data to validate
 * @returns Validated InventoryGem or throws ZodError
 */
export function validateInventoryGem(gem: unknown) {
  return validate(InventoryGemSchema, gem);
}

/**
 * Validate session state
 * @param session - The session data to validate
 * @returns Validated SessionState or throws ZodError
 */
export function validateSessionState(session: unknown) {
  return validate(SessionStateSchema, session);
}

/**
 * Format Zod validation errors for display
 * @param error - The Zod error
 * @returns Array of formatted error messages
 */
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

/**
 * Check if a value is a valid star rating
 */
export function isValidStarRating(value: unknown): value is StarRating {
  return value === 1 || value === 2 || value === 5;
}

/**
 * Check if a value is a valid quality level
 */
export function isValidQuality(value: unknown): value is Quality {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

/**
 * Check if a value is a valid rank
 */
export function isValidRank(value: unknown): value is Rank {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 10
  );
}

/**
 * Check if a value is a valid tier ranking
 */
export function isValidTierRanking(value: unknown): value is TierRanking {
  return ["S", "A", "B", "C", "D"].includes(value as string);
}

/**
 * Check if a value is a valid slot position
 */
export function isValidSlotPosition(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 24
  );
}

/**
 * Check if a slot position is a base slot (1-8)
 */
export function isBaseSlot(position: number): boolean {
  return position >= 1 && position <= 8;
}

/**
 * Check if a slot position is a wing slot (9-24)
 */
export function isWingSlot(position: number): boolean {
  return position >= 9 && position <= 24;
}

/**
 * Validate that a build name is unique within a list of builds
 * @param name - The build name to check
 * @param existingBuilds - Array of existing builds
 * @param excludeId - Optional build ID to exclude from check (for updates)
 * @returns true if name is unique
 */
export function isBuildNameUnique(
  name: string,
  existingBuilds: Array<{ name: string; id: string }>,
  excludeId?: string,
): boolean {
  const normalizedName = name.toLowerCase().trim();
  return !existingBuilds.some(
    (build) =>
      build.name.toLowerCase().trim() === normalizedName &&
      build.id !== excludeId,
  );
}

/**
 * Validate non-negative integer
 */
export function isNonNegativeInteger(value: unknown): boolean {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

/**
 * Validate positive integer
 */
export function isPositiveInteger(value: unknown): boolean {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}
