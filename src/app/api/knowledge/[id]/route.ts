import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { knowledgeItems } from "@/lib/db/schema";
import { generateEmbedding } from "@/lib/ai/embeddings";

const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  category: z.string().max(100).optional(),
});

// PUT: Update a knowledge item
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authCtx = await getAuthContext();

  if (!authCtx?.orgId || !db) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Verify ownership
  const existing = await db.query.knowledgeItems.findFirst({
    where: and(
      eq(knowledgeItems.id, id),
      eq(knowledgeItems.orgId, authCtx.orgId)
    ),
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(knowledgeItems)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(knowledgeItems.id, id))
    .returning();

  // Regenerate embedding if title or content changed (non-blocking)
  if (parsed.data.title || parsed.data.content) {
    const title = parsed.data.title ?? existing.title;
    const content = parsed.data.content ?? existing.content;
    generateEmbedding(`${title}\n${content}`)
      .then((embedding) => {
        if (embedding && db) {
          db.update(knowledgeItems)
            .set({ embedding })
            .where(eq(knowledgeItems.id, id))
            .then(() => {})
            .catch((err) => console.error("Failed to store embedding:", err));
        }
      })
      .catch((err) => console.error("Embedding generation failed:", err));
  }

  return NextResponse.json({ item: updated });
}

// DELETE: Remove a knowledge item
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authCtx = await getAuthContext();

  if (!authCtx?.orgId || !db) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const existing = await db.query.knowledgeItems.findFirst({
    where: and(
      eq(knowledgeItems.id, id),
      eq(knowledgeItems.orgId, authCtx.orgId)
    ),
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(knowledgeItems).where(eq(knowledgeItems.id, id));

  return NextResponse.json({ success: true });
}
