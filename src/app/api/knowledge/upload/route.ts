import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { knowledgeItems, organizations } from "@/lib/db/schema";
import { PLAN_LIMITS, type PlanName } from "@/lib/plans";
import { generateEmbedding } from "@/lib/ai/embeddings";

const schema = z.object({
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
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { items } = parsed.data;

  // Get org to check plan limits
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, authCtx.orgId),
  });

  const planName = (org?.plan ?? "free") as PlanName;
  const limits = PLAN_LIMITS[planName];

  if (!limits.allowFileUpload) {
    return NextResponse.json(
      { error: "File upload is not available on your current plan. Please upgrade." },
      { status: 403 }
    );
  }

  // Count existing articles to enforce plan limits
  const existing = await db.query.knowledgeItems.findMany({
    where: eq(knowledgeItems.orgId, authCtx.orgId),
    columns: { id: true },
  });

  const totalAfter = existing.length + items.length;
  if (limits.maxArticles !== Infinity && totalAfter > limits.maxArticles) {
    return NextResponse.json(
      {
        error: `Article limit exceeded. Your ${planName} plan allows ${limits.maxArticles} articles. You have ${existing.length} and are trying to add ${items.length}.`,
      },
      { status: 400 }
    );
  }

  // Batch insert
  const newIds: string[] = [];
  const insertValues = items.map((item) => {
    const id = crypto.randomUUID();
    newIds.push(id);
    return {
      id,
      orgId: authCtx.orgId!,
      title: item.title,
      content: item.content,
      category: item.category ?? "general",
      metadata: { source: "file-upload" },
    };
  });

  await db.insert(knowledgeItems).values(insertValues);

  // Generate embeddings in the background (non-blocking)
  for (const val of insertValues) {
    generateEmbedding(`${val.title}\n${val.content}`)
      .then((embedding) => {
        if (embedding && db) {
          db.update(knowledgeItems)
            .set({ embedding })
            .where(eq(knowledgeItems.id, val.id))
            .then(() => {})
            .catch((err) => console.error("Failed to store embedding:", err));
        }
      })
      .catch((err) => console.error("Embedding generation failed:", err));
  }

  return NextResponse.json(
    { success: true, count: items.length },
    { status: 201 }
  );
}
