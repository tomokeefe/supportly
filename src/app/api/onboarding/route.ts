import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { PLANS, type PlanName } from "@/lib/plans";

const onboardingSchema = z.object({
  business: z.object({
    name: z.string().min(1).max(255),
    vertical: z.string().min(1).max(100),
    websiteUrl: z.string().max(500).optional().default(""),
  }),
  plan: z.enum(["free", "starter", "pro", "business"]).default("free"),
  widgetColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#DC4A2E"),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { business, plan, widgetColor } = parsed.data;

  // Generate slug from business name
  const slugBase = business.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const suffix = Math.random().toString(36).slice(2, 8);
  const slug = `${slugBase}-${suffix}`;
  const orgId = crypto.randomUUID();

  const orgSettings = {
    confidenceThreshold: 0.75,
    persona: "friendly and professional",
    greeting: `Hi! Welcome to ${business.name}. How can I help you today?`,
    escalationEmail: "",
    branding: { primaryColor: widgetColor, position: "bottom-right" },
  };

  // Try to get Clerk auth context (optional)
  let userId: string | null = null;
  try {
    const { auth, clerkClient } = await import("@clerk/nextjs/server");
    const authResult = await auth();
    userId = authResult.userId;

    // Store org info in Clerk user metadata
    if (userId) {
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          orgId,
          orgSlug: slug,
          orgName: business.name,
          vertical: business.vertical,
        },
      });
    }
  } catch {
    // Clerk not configured — continue without it
  }

  // Insert org into DB
  if (db) {
    await db.insert(organizations).values({
      id: orgId,
      name: business.name,
      slug,
      settings: orgSettings,
      plan: plan as PlanName,
      conversationLimit: PLANS[plan as PlanName].conversationLimit,
      clerkUserId: userId,
    });
  }

  // Set orgId cookie so the dashboard can find this org without Clerk
  const response = NextResponse.json({ orgSlug: slug, orgId });
  response.cookies.set("resolvly_org_id", orgId, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  response.cookies.set("resolvly_org_slug", slug, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
