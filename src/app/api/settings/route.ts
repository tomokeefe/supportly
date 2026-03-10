import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizations, type OrgSettings } from "@/lib/db/schema";

const settingsSchema = z.object({
  confidenceThreshold: z.number().min(0).max(1).optional(),
  persona: z.string().max(500).optional(),
  greeting: z.string().max(1000).optional(),
  branding: z
    .object({
      primaryColor: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional(),
      position: z.enum(["bottom-right", "bottom-left"]).optional(),
    })
    .optional(),
});

// GET: Return current org settings
export async function GET() {
  const authCtx = await getAuthContext();
  if (!authCtx?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json({
      settings: {
        confidenceThreshold: 0.75,
        persona: "friendly and professional",
        greeting: "Hi! How can I help you today?",
        branding: { primaryColor: "#DC4A2E", position: "bottom-right" },
      },
    });
  }

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, authCtx.orgId),
  });

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  return NextResponse.json({
    settings: org.settings,
    orgSlug: org.slug,
    orgName: org.name,
  });
}

// PUT: Update org settings
export async function PUT(req: NextRequest) {
  const authCtx = await getAuthContext();
  if (!authCtx?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json(
      { error: "Not available in demo mode" },
      { status: 503 }
    );
  }

  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Get current settings
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, authCtx.orgId),
  });

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const currentSettings = org.settings as OrgSettings;

  // Merge settings
  const newSettings: OrgSettings = {
    confidenceThreshold:
      parsed.data.confidenceThreshold ?? currentSettings.confidenceThreshold,
    persona: parsed.data.persona ?? currentSettings.persona,
    greeting: parsed.data.greeting ?? currentSettings.greeting,
    branding: {
      primaryColor:
        parsed.data.branding?.primaryColor ??
        currentSettings.branding.primaryColor,
      position:
        parsed.data.branding?.position ?? currentSettings.branding.position,
    },
  };

  await db
    .update(organizations)
    .set({ settings: newSettings, updatedAt: new Date() })
    .where(eq(organizations.id, authCtx.orgId));

  return NextResponse.json({ settings: newSettings });
}
