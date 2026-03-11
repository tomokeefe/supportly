import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { isAgencyPlan, getMaxLicenses } from "@/lib/plans";

// ── GET: List child orgs for the agency ──────────────────────────────
export async function GET() {
  const auth = await getAuthContext();
  if (!auth?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!db) {
    return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  }

  // Verify caller is an agency
  const agency = await db.query.organizations.findFirst({
    where: eq(organizations.id, auth.orgId),
  });

  if (!agency || !isAgencyPlan(agency.plan)) {
    return NextResponse.json(
      { error: "Not an agency account" },
      { status: 403 }
    );
  }

  // Fetch child orgs
  const children = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      settings: organizations.settings,
      conversationLimit: organizations.conversationLimit,
      currentPeriodConversations: organizations.currentPeriodConversations,
      status: organizations.status,
      createdAt: organizations.createdAt,
    })
    .from(organizations)
    .where(eq(organizations.agencyId, agency.id));

  const maxLicenses = getMaxLicenses(agency.plan);

  return NextResponse.json({
    agency: {
      id: agency.id,
      name: agency.name,
      plan: agency.plan,
      maxLicenses,
      usedLicenses: children.length,
    },
    clients: children,
  });
}

// ── POST: Create a child org ─────────────────────────────────────────
const createClientSchema = z.object({
  name: z.string().min(1).max(255),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#2563eb"),
});

export async function POST(req: NextRequest) {
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
    return NextResponse.json(
      { error: "Not an agency account" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = createClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Check license limit
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(organizations)
    .where(eq(organizations.agencyId, agency.id));

  const currentCount = Number(countResult.count);
  const maxLicenses = getMaxLicenses(agency.plan);

  if (currentCount >= maxLicenses) {
    return NextResponse.json(
      { error: `License limit reached (${maxLicenses})` },
      { status: 409 }
    );
  }

  // Generate slug
  const { name, primaryColor } = parsed.data;
  const slugBase = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 8);
  const slug = `${slugBase}-${suffix}`;
  const orgId = crypto.randomUUID();

  await db.insert(organizations).values({
    id: orgId,
    name,
    slug,
    plan: "free",
    conversationLimit: 300,
    agencyId: agency.id,
    settings: {
      confidenceThreshold: 0.75,
      persona: "friendly and professional",
      greeting: `Hi! Welcome to ${name}. How can I help you today?`,
      escalationEmail: "",
      branding: { primaryColor, position: "bottom-right" },
    },
  });

  return NextResponse.json({
    success: true,
    client: { id: orgId, name, slug },
  });
}
