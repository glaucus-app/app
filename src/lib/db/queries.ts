/**
 * Database query functions for DI-Lab
 * CRUD operations for builds and sessions
 */

import { eq, and, desc } from "drizzle-orm";
import { db, savedBuilds, anonymousSessions, generateUuid } from "./index";
import type { InsertSavedBuild, SelectSavedBuild } from "./schema";
import type { SavedBuild, SessionState } from "@/types";
import { MAX_BUILDS_FREE_TIER } from "./schema";

// ============================================================================
// Build CRUD Operations
// ============================================================================

/**
 * Create a new saved build
 * @throws Error if build name already exists for this session
 * @throws Error if build limit reached (5 for free tier)
 */
export async function createBuild(
  anonymousId: string,
  build: Omit<SavedBuild, "id" | "anonymousId" | "createdAt" | "updatedAt">,
): Promise<SelectSavedBuild> {
  // Check build limit
  const existingBuilds = await getBuildsBySession(anonymousId);
  if (existingBuilds.length >= MAX_BUILDS_FREE_TIER) {
    throw new Error("Build limit reached. Free tier allows up to 5 builds.");
  }

  // Check for duplicate name
  const duplicateName = existingBuilds.find(
    (b) => b.name.toLowerCase() === build.name.toLowerCase(),
  );
  if (duplicateName) {
    throw new Error(`A build named "${build.name}" already exists.`);
  }

  const id = generateUuid();
  const now = new Date();

  // Convert awakenedSlots array to count for storage
  const awakenedSlotCount = build.awakenedSlots?.length ?? 0;

  const insertData: InsertSavedBuild = {
    id,
    anonymousId,
    name: build.name,
    notes: build.notes ?? null,
    equippedGems: build.gems,
    resources: build.resources,
    awakenedSlots: awakenedSlotCount,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(savedBuilds).values(insertData);

  // Return the inserted row by fetching it
  const inserted = await getBuildById(id, anonymousId);
  if (!inserted) {
    throw new Error("Failed to create build");
  }
  return inserted;
}

/**
 * Get all builds for a session, sorted by creation date (newest first)
 */
export async function getBuildsBySession(
  anonymousId: string,
): Promise<SelectSavedBuild[]> {
  const builds = await db
    .select()
    .from(savedBuilds)
    .where(eq(savedBuilds.anonymousId, anonymousId))
    .orderBy(desc(savedBuilds.createdAt));

  return builds;
}

/**
 * Get a single build by ID
 * Returns null if not found or doesn't belong to the session
 */
export async function getBuildById(
  id: string,
  anonymousId: string,
): Promise<SelectSavedBuild | null> {
  const [build] = await db
    .select()
    .from(savedBuilds)
    .where(
      and(eq(savedBuilds.id, id), eq(savedBuilds.anonymousId, anonymousId)),
    )
    .limit(1);

  return build ?? null;
}

/**
 * Update an existing build
 * @throws Error if build name already exists for this session (different ID)
 */
export async function updateBuild(
  id: string,
  anonymousId: string,
  updates: Partial<
    Omit<SavedBuild, "id" | "anonymousId" | "createdAt" | "updatedAt">
  >,
): Promise<SelectSavedBuild | null> {
  // Check if build exists and belongs to session
  const existing = await getBuildById(id, anonymousId);
  if (!existing) {
    return null;
  }

  // Check for duplicate name if name is being updated
  if (updates.name && updates.name !== existing.name) {
    const existingBuilds = await getBuildsBySession(anonymousId);
    const duplicateName = existingBuilds.find(
      (b) =>
        b.name.toLowerCase() === updates.name!.toLowerCase() && b.id !== id,
    );
    if (duplicateName) {
      throw new Error(`A build named "${updates.name}" already exists.`);
    }
  }

  const now = new Date();

  // Convert awakenedSlots array to count if provided
  const awakenedSlotCount =
    updates.awakenedSlots !== undefined
      ? updates.awakenedSlots.length
      : (existing.awakenedSlots ?? 0);

  await db
    .update(savedBuilds)
    .set({
      name: updates.name ?? existing.name,
      notes: updates.notes ?? existing.notes,
      equippedGems: updates.gems ?? existing.equippedGems,
      resources: updates.resources ?? existing.resources,
      awakenedSlots: awakenedSlotCount,
      updatedAt: now,
    })
    .where(eq(savedBuilds.id, id));

  // Fetch and return the updated row
  const updated = await getBuildById(id, anonymousId);
  return updated;
}

/**
 * Delete a build by ID
 * Returns true if deleted, false if not found
 */
export async function deleteBuild(
  id: string,
  anonymousId: string,
): Promise<boolean> {
  const existing = await getBuildById(id, anonymousId);
  if (!existing) {
    return false;
  }

  await db.delete(savedBuilds).where(eq(savedBuilds.id, id));
  return true;
}

/**
 * Check if a build name is available for a session
 */
export async function isBuildNameAvailable(
  anonymousId: string,
  name: string,
  excludeId?: string,
): Promise<boolean> {
  const builds = await getBuildsBySession(anonymousId);
  const duplicate = builds.find(
    (b) => b.name.toLowerCase() === name.toLowerCase() && b.id !== excludeId,
  );
  return !duplicate;
}

/**
 * Get build count for a session
 */
export async function getBuildCount(anonymousId: string): Promise<number> {
  const builds = await getBuildsBySession(anonymousId);
  return builds.length;
}

// ============================================================================
// Session CRUD Operations
// ============================================================================

/**
 * Create or update a session
 */
export async function upsertSession(
  anonymousId: string,
  sessionState?: SessionState,
): Promise<void> {
  const now = new Date();

  // Try to insert, if conflict on primary key, update instead
  const existing = await getSession(anonymousId);

  if (existing) {
    await db
      .update(anonymousSessions)
      .set({
        sessionState,
        lastActive: now,
      })
      .where(eq(anonymousSessions.anonymousId, anonymousId));
  } else {
    await db.insert(anonymousSessions).values({
      anonymousId,
      sessionState,
      createdAt: now,
      lastActive: now,
    });
  }
}

/**
 * Get a session by anonymous ID
 */
export async function getSession(
  anonymousId: string,
): Promise<{ anonymousId: string; sessionState: SessionState | null } | null> {
  const [session] = await db
    .select()
    .from(anonymousSessions)
    .where(eq(anonymousSessions.anonymousId, anonymousId))
    .limit(1);

  if (!session) {
    return null;
  }

  return {
    anonymousId: session.anonymousId,
    sessionState: session.sessionState ?? null,
  };
}

/**
 * Delete a session and all associated builds (cascade)
 */
export async function deleteSession(anonymousId: string): Promise<boolean> {
  const existing = await getSession(anonymousId);
  if (!existing) {
    return false;
  }

  // Cascade delete handled by SQLite foreign key constraint
  await db
    .delete(anonymousSessions)
    .where(eq(anonymousSessions.anonymousId, anonymousId));
  return true;
}

/**
 * Update session state (auto-persist)
 */
export async function updateSessionState(
  anonymousId: string,
  sessionState: SessionState,
): Promise<void> {
  const now = new Date();

  await db
    .update(anonymousSessions)
    .set({
      sessionState,
      lastActive: now,
    })
    .where(eq(anonymousSessions.anonymousId, anonymousId));
}
