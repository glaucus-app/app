/**
 * Drizzle SQLite Schema for DI-Lab
 * Server-side persistence for anonymous sessions and saved builds
 */

import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import type {
  SessionState,
  SavedBuild,
  EquippedGem,
  ResourceInventory,
} from "@/types";

// ============================================================================
// Anonymous Sessions Table
// ============================================================================

/**
 * Anonymous user sessions stored in server database
 * Uses UUID v4 from localStorage for identification
 */
export const anonymousSessions = sqliteTable("anonymous_sessions", {
  // Primary key - UUID v4 from localStorage
  anonymousId: text("anonymous_id").primaryKey(),

  // Optional email for notifications/recovery (FR-029c)
  email: text("email"),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false),

  // Current session state (auto-persisted per FR-023a)
  sessionState: text("session_state", { mode: "json" }).$type<SessionState>(),

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  lastActive: integer("last_active", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// ============================================================================
// Saved Builds Table
// ============================================================================

/**
 * Saved build configurations
 * Users can save up to 5 builds for free tier (FR-029a)
 */
export const savedBuilds = sqliteTable(
  "saved_builds",
  {
    // Primary key - UUID v4
    id: text("id").primaryKey(),

    // Foreign key to anonymous session
    anonymousId: text("anonymous_id")
      .notNull()
      .references(() => anonymousSessions.anonymousId, { onDelete: "cascade" }),

    // Build metadata
    name: text("name").notNull(),
    notes: text("notes"),

    // Build configuration
    equippedGems: text("equipped_gems", { mode: "json" })
      .notNull()
      .$type<EquippedGem[]>(),

    resources: text("resources", { mode: "json" })
      .notNull()
      .$type<ResourceInventory>(),

    // Awakened slots configuration
    awakenedSlots: integer("awakened_slots", { mode: "number" }).default(0),

    // Timestamps
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
      () => new Date(),
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
      () => new Date(),
    ),
  },
  (table) => ({
    // Index for looking up builds by anonymous ID
    anonymousIdIdx: index("saved_builds_anonymous_id_idx").on(
      table.anonymousId,
    ),
    // Index for sorting builds by creation date
    createdAtIdx: index("saved_builds_created_at_idx").on(table.createdAt),
  }),
);

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Type for inserting a new anonymous session
 */
export type InsertAnonymousSession = typeof anonymousSessions.$inferInsert;

/**
 * Type for selecting an anonymous session
 */
export type SelectAnonymousSession = typeof anonymousSessions.$inferSelect;

/**
 * Type for inserting a new saved build
 */
export type InsertSavedBuild = typeof savedBuilds.$inferInsert;

/**
 * Type for selecting a saved build
 */
export type SelectSavedBuild = typeof savedBuilds.$inferSelect;

// ============================================================================
// Database Configuration
// ============================================================================

/**
 * Database file path for SQLite
 */
export const DATABASE_PATH = process.env.DATABASE_PATH || "./data/di-lab.db";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a new UUID v4
 */
export function generateUuid(): string {
  return crypto.randomUUID();
}

/**
 * Check if a session has reached the build limit
 * Free tier allows up to 5 builds (FR-029a)
 */
export const MAX_BUILDS_FREE_TIER = 5;

/**
 * Check if build count is within limits
 */
export function isWithinBuildLimit(currentCount: number): boolean {
  return currentCount < MAX_BUILDS_FREE_TIER;
}

/**
 * Get remaining build slots
 */
export function getRemainingBuildSlots(currentCount: number): number {
  return Math.max(0, MAX_BUILDS_FREE_TIER - currentCount);
}
