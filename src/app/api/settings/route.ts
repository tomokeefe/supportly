import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizations, type OrgSettings } from "@/lib/db/schema";
import { demoOrg } from "@/lib/demo-data";

const settingsSchema = z.object({
  confidenceThreshold: z.number().min(0).max(1).optional(),
  persona: z.string().max(500).optional(),
  greeting: z.string().max(1000).optional(),
  escalationEmail: z.string().email().or(z.literal("")).optional(),
  branding: z
    .object({
      primaryColor: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional(),
      position: z.enum(["bottom-right", "bottom-left"]).optional(),
    })
    .optional(),
  orgName: z.string().min(1).max(255).optional(),
});

// GET: Return current org settings
export async function GET() {
  const authCtx = await getAuthContext();

  // Real DB path
  if (db && authCtx?.orgId) {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, authCtx.orgId),
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      settings: org.settings,
      orgSlug: org.slug,
      orgName: org.name,
    });
  }

  // Demo fallback — return demo org settings so the page always works
  const settings = demoOrg.settings as OrgSettings;
  return NextResponse.json({
    settings,
    orgSlug: demoOrg.slug,
    orgName: demoOrg.name,
  });
}

// PUT: Update org settings
export async function PUT(req: NextRequest) {
  const authCtx = await getAuthContext();

  if (!db) {
    return NextResponse.json(
      {
        error:
          "Database not configured. Settings cannot be saved in demo mode.",
      },
      { status: 503 }
    );
  }

  if (!authCtx?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Get current org
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, authCtx.orgId),
  });

  if (!org) {
    return NextResponse.json(
      { error: "Organization not found" },
      { status: 404 }
    );
  }

  const currentSettings = org.settings as OrgSettings;

  // Merge settings
  const newSettings: OrgSettings = {
    confidenceThreshold:
      parsed.data.confidenceThreshold ?? currentSettings.confidenceThreshold,
    persona: parsed.data.persona ?? currentSettings.persona,
    greeting: parsed.data.greeting ?? currentSettings.greeting,
    escalationEmail:
      parsed.data.escalationEmail !== undefined
        ? parsed.data.escalationEmail
        : (currentSettings.escalationEmail ?? ""),
    branding: {
      primaryColor:
        parsed.data.branding?.primaryColor ??
        currentSettings.branding.primaryColor,
      position:
        parsed.data.branding?.position ?? currentSettings.branding.position,
    },
  };

  // Build update payload
  const updatePayload: Record<string, unknown> = {
    settings: newSettings,
    updatedAt: new Date(),
  };

  if (parsed.data.orgName) {
    updatePayload.name = parsed.data.orgName;
  }

  await db
    .update(organizations)
    .set(updatePayload)
    .where(eq(organizations.id, authCtx.orgId));

  return NextResponse.json({
    settings: newSettings,
    orgName: parsed.data.orgName ?? org.name,
  });
}
