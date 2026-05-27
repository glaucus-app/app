/**
 * API Routes for Individual Build Operations
 * GET: Get a single build by ID
 * PATCH: Update a build by ID
 * DELETE: Delete a build by ID
 */

import { NextRequest, NextResponse } from "next/server";
import { getBuildById, deleteBuild, updateBuild } from "@/lib/db/queries";
import { sanitizeUserContent } from "@/lib/utils/sanitization";
import { z } from "zod";

// Validation schema
const BuildIdSchema = z.string().uuid();

/**
 * GET /api/builds/[id]
 * Get a single build by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const anonymousId = searchParams.get("anonymousId");

    // Validate ID format
    if (!BuildIdSchema.safeParse(id).success) {
      return NextResponse.json(
        { error: "Invalid build ID format" },
        { status: 400 },
      );
    }

    if (!anonymousId) {
      return NextResponse.json(
        { error: "Missing anonymousId parameter" },
        { status: 400 },
      );
    }

    // Validate anonymousId format
    if (!z.string().uuid().safeParse(anonymousId).success) {
      return NextResponse.json(
        { error: "Invalid anonymousId format" },
        { status: 400 },
      );
    }

    const build = await getBuildById(id, anonymousId);

    if (!build) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }

    // Transform for API response
    const response = {
      build: {
        id: build.id,
        name: build.name,
        notes: build.notes,
        gems: build.equippedGems.map((g) => ({
          ...g,
          quality: g.quality as 1 | 2 | 3 | 4 | 5,
        })),
        resources: build.resources,
        optimizationMode: "PVE" as const, // Default since not stored in DB schema
        awakenedSlots: [],
        createdAt: build.createdAt?.toISOString() ?? new Date().toISOString(),
        updatedAt: build.updatedAt?.toISOString() ?? new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching build:", error);
    return NextResponse.json(
      { error: "Failed to fetch build" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/builds/[id]
 * Delete a build by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const anonymousId = searchParams.get("anonymousId");

    // Validate ID format
    if (!BuildIdSchema.safeParse(id).success) {
      return NextResponse.json(
        { error: "Invalid build ID format" },
        { status: 400 },
      );
    }

    if (!anonymousId) {
      return NextResponse.json(
        { error: "Missing anonymousId parameter" },
        { status: 400 },
      );
    }

    // Validate anonymousId format
    if (!z.string().uuid().safeParse(anonymousId).success) {
      return NextResponse.json(
        { error: "Invalid anonymousId format" },
        { status: 400 },
      );
    }

    const deleted = await deleteBuild(id, anonymousId);

    if (!deleted) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Build deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting build:", error);
    return NextResponse.json(
      { error: "Failed to delete build" },
      { status: 500 },
    );
  }
}

// Validation schema for update
const UpdateBuildSchema = z.object({
  anonymousId: z.string().uuid(),
  name: z.string().min(1).max(50).optional(),
  notes: z.string().max(500).optional(),
  gems: z
    .array(
      z.object({
        gemId: z.string(),
        quality: z.number().int().min(1).max(5),
        rank: z.number().int().min(1).max(10),
        slotPosition: z.number().int().min(1).max(24),
        slotType: z.enum(["base", "wing"]),
      }),
    )
    .optional(),
  resources: z
    .object({
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
    })
    .optional(),
  awakenedSlots: z.number().int().min(0).optional(),
});

/**
 * PATCH /api/builds/[id]
 * Update a build by ID
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate ID format
    if (!BuildIdSchema.safeParse(id).success) {
      return NextResponse.json(
        { error: "Invalid build ID format" },
        { status: 400 },
      );
    }

    // Validate request body
    const parseResult = UpdateBuildSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { anonymousId, name, notes, gems, resources, awakenedSlots } =
      parseResult.data;

    // Sanitize user content
    const sanitizedName = name ? sanitizeUserContent(name) : undefined;
    const sanitizedNotes =
      notes !== undefined
        ? notes
          ? sanitizeUserContent(notes)
          : notes
        : undefined;

    // Update the build
    const updatedBuild = await updateBuild(id, anonymousId, {
      name: sanitizedName,
      notes: sanitizedNotes,
      gems: gems?.map((g) => ({
        ...g,
        quality: g.quality as 1 | 2 | 3 | 4 | 5,
        rank: g.rank as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10,
      })),
      resources,
      awakenedSlots: [],
    });

    if (!updatedBuild) {
      return NextResponse.json({ error: "Build not found" }, { status: 404 });
    }

    return NextResponse.json({
      build: {
        id: updatedBuild.id,
        name: updatedBuild.name,
        notes: updatedBuild.notes,
        gems: updatedBuild.equippedGems.map((g) => ({
          ...g,
          quality: g.quality as 1 | 2 | 3 | 4 | 5,
        })),
        resources: updatedBuild.resources,
        optimizationMode: "PVE" as const,
        awakenedSlots: [],
        createdAt:
          updatedBuild.createdAt?.toISOString() ?? new Date().toISOString(),
        updatedAt:
          updatedBuild.updatedAt?.toISOString() ?? new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating build:", error);

    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
    }

    return NextResponse.json(
      { error: "Failed to update build" },
      { status: 500 },
    );
  }
}
