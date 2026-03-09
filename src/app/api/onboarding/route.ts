import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { organizations, knowledgeItems } from "@/lib/db/schema";

const onboardingSchema = z.object({
  business: z.object({
    name: z.string().min(1).max(255),
    vertical: z.string().min(1).max(100),
    websiteUrl: z.string().max(500).optional().default(""),
  }),
  faqs: z
    .array(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
      })
    )
    .default([]),
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

    const { business, faqs, widgetColor } = parsed.data;

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

    // Insert into DB if available
    if (db) {
      await db.insert(organizations).values({
        id: orgId,
        name: business.name,
        slug,
        settings: orgSettings,
      });

      if (faqs.length > 0) {
        await db.insert(knowledgeItems).values(
          faqs.map((faq) => ({
            id: crypto.randomUUID(),
            orgId,
            title: faq.title,
            content: faq.content,
            category: "general",
            metadata: {},
          }))
        );
      }
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

    const { business, widgetColor } = parsed.data;
    const slugBase = business.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
    const suffix = Math.random().toString(36).slice(2, 8);
    const slug = `${slugBase}-${suffix}`;
    const orgId = crypto.randomUUID();

    return NextResponse.json({ orgSlug: slug, orgId });
  }
}
