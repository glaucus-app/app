/**
 * Session API Route for DI-Lab
 * GET: Restore session state from server database (FR-023)
 * POST: Auto-persist session state on every change (FR-023a)
 */

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, anonymousSessions, generateUuid } from "@/lib/db";
import { createEmptySessionState } from "@/types";
import type { SessionState } from "@/types";

// ============================================================================
// GET: Restore Session State
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const anonymousId = request.nextUrl.searchParams.get("anonymousId");

    if (!anonymousId) {
      return NextResponse.json(
        { error: "Missing anonymousId parameter" },
        { status: 400 },
      );
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(anonymousId)) {
      return NextResponse.json(
        { error: "Invalid anonymousId format" },
        { status: 400 },
      );
    }

    // Look up session in database
    const sessions = await db
      .select()
      .from(anonymousSessions)
      .where(eq(anonymousSessions.anonymousId, anonymousId))
      .limit(1);

    if (sessions.length === 0) {
      // Session not found - create new session
      const newSessionState = createEmptySessionState();

      await db.insert(anonymousSessions).values({
        anonymousId,
        sessionState: newSessionState,
        createdAt: new Date(),
        lastActive: new Date(),
      });

      return NextResponse.json({
        sessionState: newSessionState,
        isNew: true,
      });
    }

    const session = sessions[0];

    // Check if session has expired (optional: implement expiration logic)
    // For now, sessions don't expire

    // Update lastActive timestamp
    await db
      .update(anonymousSessions)
      .set({ lastActive: new Date() })
      .where(eq(anonymousSessions.anonymousId, anonymousId));

    return NextResponse.json({
      sessionState: session.sessionState || createEmptySessionState(),
      isNew: false,
    });
  } catch (error) {
    console.error("Session GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 },
    );
  }
}

// ============================================================================
// POST: Persist Session State
// ============================================================================

interface SessionPostBody {
  anonymousId: string;
  gems?: SessionState["gems"];
  resources?: SessionState["resources"];
  optimizationMode?: SessionState["optimizationMode"];
  awakenedSlots?: SessionState["awakenedSlots"];
  lastSavedBuildId?: SessionState["lastSavedBuildId"];
  hasUnsavedChanges?: SessionState["hasUnsavedChanges"];
}

export async function POST(request: NextRequest) {
  try {
    const body: SessionPostBody = await request.json();
    const { anonymousId, ...sessionUpdates } = body;

    if (!anonymousId) {
      return NextResponse.json(
        { error: "Missing anonymousId parameter" },
        { status: 400 },
      );
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(anonymousId)) {
      return NextResponse.json(
        { error: "Invalid anonymousId format" },
        { status: 400 },
      );
    }

    // Check if session exists
    const existingSessions = await db
      .select()
      .from(anonymousSessions)
      .where(eq(anonymousSessions.anonymousId, anonymousId))
      .limit(1);

    if (existingSessions.length === 0) {
      // Session doesn't exist - it may have been expired/deleted
      // Return 410 Gone to signal client to create new session
      return NextResponse.json(
        { error: "Session expired", code: "SESSION_EXPIRED" },
        { status: 410 },
      );
    }

    const existingSession = existingSessions[0];
    const currentSessionState =
      existingSession.sessionState || createEmptySessionState();

    // Merge updates with existing session state
    const updatedSessionState: SessionState = {
      ...currentSessionState,
      ...sessionUpdates,
      gems: sessionUpdates.gems ?? currentSessionState.gems,
      resources: sessionUpdates.resources ?? currentSessionState.resources,
      optimizationMode:
        sessionUpdates.optimizationMode ?? currentSessionState.optimizationMode,
      awakenedSlots:
        sessionUpdates.awakenedSlots ?? currentSessionState.awakenedSlots,
      lastSavedBuildId:
        sessionUpdates.lastSavedBuildId ?? currentSessionState.lastSavedBuildId,
      hasUnsavedChanges:
        sessionUpdates.hasUnsavedChanges ??
        currentSessionState.hasUnsavedChanges,
      updatedAt: new Date().toISOString(),
    };

    // Update session in database
    await db
      .update(anonymousSessions)
      .set({
        sessionState: updatedSessionState,
        lastActive: new Date(),
      })
      .where(eq(anonymousSessions.anonymousId, anonymousId));

    return NextResponse.json({
      success: true,
      updatedAt: updatedSessionState.updatedAt,
    });
  } catch (error) {
    console.error("Session POST error:", error);
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 },
    );
  }
}

// ============================================================================
// DELETE: Clear Session (optional, for testing)
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const anonymousId = request.nextUrl.searchParams.get("anonymousId");

    if (!anonymousId) {
      return NextResponse.json(
        { error: "Missing anonymousId parameter" },
        { status: 400 },
      );
    }

    await db
      .delete(anonymousSessions)
      .where(eq(anonymousSessions.anonymousId, anonymousId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 },
    );
  }
}
