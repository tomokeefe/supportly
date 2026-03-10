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
  // Try to get Clerk auth context (optional — works without Clerk)
  let userId: string | null = null;
  try {
    const { auth, clerkClient } = await import("@clerk/nextjs/server");
    const authResult = await auth();
    userId = authResult.userId;

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
      branding: { primaryColor: widgetColor, position: "bottom-right" },
    };

    // Insert org (KB items are added separately via /api/onboarding/knowledge)
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

    // Store org info in Clerk user metadata (if authenticated)
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

    return NextResponse.json({ orgSlug: slug, orgId });
  } catch {
    // Clerk not configured — still process the request
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const { business, plan, widgetColor } = parsed.data;
    const slugBase = business.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
    const suffix = Math.random().toString(36).slice(2, 8);
    const slug = `${slugBase}-${suffix}`;
    const orgId = crypto.randomUUID();

    if (db) {
      await db.insert(organizations).values({
        id: orgId,
        name: business.name,
        slug,
        settings: {
          confidenceThreshold: 0.75,
          persona: "friendly and professional",
          greeting: `Hi! Welcome to ${business.name}. How can I help you today?`,
          branding: { primaryColor: widgetColor, position: "bottom-right" },
        },
        plan: plan as PlanName,
        conversationLimit: PLANS[plan as PlanName].conversationLimit,
      });
    }

    return NextResponse.json({ orgSlug: slug, orgId });
  }
}
