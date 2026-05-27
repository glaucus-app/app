/**
 * Database connection for DI-Lab
 * Drizzle ORM with better-sqlite3
 */

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { DATABASE_PATH } from "./schema";
import { mkdirSync } from "fs";
import { dirname } from "path";

// Ensure the data directory exists
const dbDir = dirname(DATABASE_PATH);
try {
  mkdirSync(dbDir, { recursive: true });
} catch {
  // Directory already exists
}

// Create SQLite connection
const sqlite = new Database(DATABASE_PATH);

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Export schema for convenience
export * from "./schema";

// Export types
export type {
  InsertAnonymousSession,
  SelectAnonymousSession,
  InsertSavedBuild,
  SelectSavedBuild,
} from "./schema";
