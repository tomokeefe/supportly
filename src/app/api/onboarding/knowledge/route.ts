import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { knowledgeItems, organizations } from "@/lib/db/schema";
import { PLAN_LIMITS, type PlanName } from "@/lib/plans";

const schema = z.object({
  orgId: z.string().uuid(),
  items: z
    .array(
      z.object({
        title: z.string().min(1).max(500),
        content: z.string().min(1),
        category: z.string().max(100).optional(),
      })
    )
    .min(1)
    .max(500),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { orgId, items } = parsed.data;

  // Demo mode — accept but don't persist
  if (!db) {
    return NextResponse.json({ success: true, count: items.length });
  }

  // Verify org exists and get plan for limit enforcement
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, orgId),
  });

  if (!org) {
    return NextResponse.json(
      { error: "Organization not found" },
      { status: 404 }
    );
  }

  const planName = (org.plan ?? "free") as PlanName;
  const limits = PLAN_LIMITS[planName];

  // Count existing articles to enforce plan limits
  const existing = await db.query.knowledgeItems.findMany({
    where: eq(knowledgeItems.orgId, orgId),
    columns: { id: true },
  });

  const totalAfter = existing.length + items.length;
  if (totalAfter > limits.maxArticles) {
    return NextResponse.json(
      {
        error: `Article limit exceeded. Your ${org.plan} plan allows ${limits.maxArticles === Infinity ? "unlimited" : limits.maxArticles} articles. You have ${existing.length} and are trying to add ${items.length}.`,
      },
      { status: 400 }
    );
  }

  // Batch insert knowledge items
  await db.insert(knowledgeItems).values(
    items.map((item) => ({
      id: crypto.randomUUID(),
      orgId,
      title: item.title,
      content: item.content,
      category: item.category ?? "general",
      metadata: { source: "onboarding" },
    }))
  );

  return NextResponse.json(
    { success: true, count: items.length },
    { status: 201 }
  );
}
