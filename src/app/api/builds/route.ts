/**
 * API Routes for Builds
 * GET: List all builds for a session
 * POST: Create a new build
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getBuildsBySession,
  createBuild,
  isBuildNameAvailable,
  getBuildCount,
} from "@/lib/db/queries";
import { sanitizeUserContent } from "@/lib/utils/sanitization";
import { z } from "zod";

// Validation schemas
const CreateBuildSchema = z.object({
  anonymousId: z.string().uuid(),
  name: z.string().min(1).max(50),
  notes: z.string().max(500).optional(),
  gems: z.array(
    z.object({
      gemId: z.string(),
      quality: z.number().int().min(1).max(5),
      rank: z.number().int().min(1).max(10),
      slotPosition: z.number().int().min(1).max(24),
      slotType: z.enum(["base", "wing"]),
    }),
  ),
  resources: z.object({
    gemPower: z.number().int().min(0),
    inventoryGems: z.array(z.any()),
    telluricPearls: z.number().int().min(0),
    telluricFragments: z.number().int().min(0),
    fadingEmbers: z.number().int().min(0),
    platinum: z.number().int().min(0),
    crestCounts: z.object({
      eternal: z.number().int().min(0),
      legendary: z.number().int().min(0),
      rare: z.number().int().min(0),
    }),
    dawningEchoes: z.number().int().min(0),
  }),
  optimizationMode: z.enum(["PVP", "PVE"]),
  awakenedSlots: z.number().int().min(0).optional(),
});

/**
 * GET /api/builds
 * List all builds for a session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const anonymousId = searchParams.get("anonymousId");

    if (!anonymousId) {
      return NextResponse.json(
        { error: "Missing anonymousId parameter" },
        { status: 400 },
      );
    }

    // Validate UUID format
    if (!z.string().uuid().safeParse(anonymousId).success) {
      return NextResponse.json(
        { error: "Invalid anonymousId format" },
        { status: 400 },
      );
    }

    const builds = await getBuildsBySession(anonymousId);

    // Transform for API response
    const response = {
      builds: builds.map((build) => ({
        id: build.id,
        name: build.name,
        notes: build.notes,
        gems: build.equippedGems.map((g) => ({
          ...g,
          quality: g.quality as 1 | 2 | 3 | 4 | 5,
        })),
        resources: build.resources,
        optimizationMode: "PVE" as const, // Default since not stored in DB
        awakenedSlots: [],
        createdAt: build.createdAt?.toISOString() ?? new Date().toISOString(),
        updatedAt: build.updatedAt?.toISOString() ?? new Date().toISOString(),
      })),
      total: builds.length,
      limit: 5,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching builds:", error);
    return NextResponse.json(
      { error: "Failed to fetch builds" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/builds
 * Create a new build
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const parseResult = CreateBuildSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.issues,
        },
        { status: 400 },
      );
    }

    const {
      anonymousId,
      name,
      notes,
      gems,
      resources,
      optimizationMode,
      awakenedSlots,
    } = parseResult.data;

    // Sanitize user content
    const sanitizedName = sanitizeUserContent(name);
    const sanitizedNotes = notes ? sanitizeUserContent(notes) : undefined;

    // Check build limit
    const buildCount = await getBuildCount(anonymousId);
    if (buildCount >= 5) {
      return NextResponse.json(
        {
          error: "Build limit reached",
          message: "Free tier allows up to 5 saved builds.",
        },
        { status: 403 },
      );
    }

    // Check name availability
    const nameAvailable = await isBuildNameAvailable(
      anonymousId,
      sanitizedName,
    );
    if (!nameAvailable) {
      return NextResponse.json(
        {
          error: "Duplicate name",
          message: `A build named "${sanitizedName}" already exists.`,
        },
        { status: 409 },
      );
    }

    // Create the build
    const build = await createBuild(anonymousId, {
      name: sanitizedName,
      notes: sanitizedNotes,
      gems: gems.map((g) => ({
        ...g,
        quality: g.quality as 1 | 2 | 3 | 4 | 5,
        rank: g.rank as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
      })),
      resources,
      optimizationMode,
      awakenedSlots: [],
    });

    return NextResponse.json(
      {
        build: {
          id: build.id,
          name: build.name,
          notes: build.notes,
          gems: build.equippedGems.map((g) => ({
            ...g,
            quality: g.quality as 1 | 2 | 3 | 4 | 5,
          })),
          resources: build.resources,
          optimizationMode,
          awakenedSlots: [],
          createdAt: build.createdAt?.toISOString() ?? new Date().toISOString(),
          updatedAt: build.updatedAt?.toISOString() ?? new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating build:", error);

    if (error instanceof Error) {
      if (error.message.includes("Build limit")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      if (error.message.includes("already exists")) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
    }

    return NextResponse.json(
      { error: "Failed to create build" },
      { status: 500 },
    );
  }
}
