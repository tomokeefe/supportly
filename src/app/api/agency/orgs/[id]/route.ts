import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { isAgencyPlan } from "@/lib/plans";

// ── PATCH: Update a child org ────────────────────────────────────────
const updateClientSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthContext();
  if (!auth?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!db) {
    return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  }

  // Verify caller is agency
  const agency = await db.query.organizations.findFirst({
    where: eq(organizations.id, auth.orgId),
  });
  if (!agency || !isAgencyPlan(agency.plan)) {
    return NextResponse.json({ error: "Not an agency account" }, { status: 403 });
  }

  // Verify child belongs to this agency
  const child = await db.query.organizations.findFirst({
    where: and(
      eq(organizations.id, id),
      eq(organizations.agencyId, agency.id)
    ),
  });
  if (!child) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.name) updates.name = parsed.data.name;

  // Update branding color in settings if provided
  if (parsed.data.primaryColor) {
    const currentSettings = child.settings as Record<string, unknown>;
    const branding = (currentSettings.branding ?? {}) as Record<string, unknown>;
    updates.settings = {
      ...currentSettings,
      branding: { ...branding, primaryColor: parsed.data.primaryColor },
    };
  }

  if (parsed.data.name) {
    // Also update greeting with new name
    const currentSettings = (updates.settings ?? child.settings) as Record<string, unknown>;
    updates.settings = {
      ...currentSettings,
      greeting: `Hi! Welcome to ${parsed.data.name}. How can I help you today?`,
    };
  }

  await db
    .update(organizations)
    .set(updates)
    .where(eq(organizations.id, id));

  return NextResponse.json({ success: true });
}

// ── DELETE: Remove a child org ───────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getAuthContext();
  if (!auth?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!db) {
    return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  }

  const agency = await db.query.organizations.findFirst({
    where: eq(organizations.id, auth.orgId),
  });
  if (!agency || !isAgencyPlan(agency.plan)) {
    return NextResponse.json({ error: "Not an agency account" }, { status: 403 });
  }

  // Verify child belongs to this agency
  const child = await db.query.organizations.findFirst({
    where: and(
      eq(organizations.id, id),
      eq(organizations.agencyId, agency.id)
    ),
  });
  if (!child) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  await db.delete(organizations).where(eq(organizations.id, id));

  return NextResponse.json({ success: true, deleted: child.slug });
}
