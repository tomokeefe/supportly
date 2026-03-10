import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { knowledgeItems } from "@/lib/db/schema";
import { generateEmbedding } from "@/lib/ai/embeddings";

const createSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1),
  category: z.string().max(100).optional(),
});

// GET: List all knowledge items for the authenticated org
export async function GET() {
  const authCtx = await getAuthContext();
  if (!authCtx?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json({ items: [] });
  }

  const items = await db.query.knowledgeItems.findMany({
    where: eq(knowledgeItems.orgId, authCtx.orgId),
    orderBy: [desc(knowledgeItems.updatedAt)],
  });

  return NextResponse.json({ items });
}

// POST: Create a new knowledge item
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
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [item] = await db
    .insert(knowledgeItems)
    .values({
      orgId: authCtx.orgId,
      title: parsed.data.title,
      content: parsed.data.content,
      category: parsed.data.category ?? "general",
    })
    .returning();

  // Auto-generate embedding (non-blocking)
  generateEmbedding(`${parsed.data.title}\n${parsed.data.content}`)
    .then((embedding) => {
      if (embedding && db) {
        db.update(knowledgeItems)
          .set({ embedding })
          .where(eq(knowledgeItems.id, item.id))
          .then(() => {})
          .catch((err) => console.error("Failed to store embedding:", err));
      }
    })
    .catch((err) => console.error("Embedding generation failed:", err));

  return NextResponse.json({ item }, { status: 201 });
}
