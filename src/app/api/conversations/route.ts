import { NextResponse } from "next/server";
import { eq, desc, sql, and, ne } from "drizzle-orm";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { demoConversations, demoMessages } from "@/lib/demo-data";

export async function GET() {
  const authCtx = await getAuthContext();

  // ── Real DB path ──
  if (db && authCtx?.orgId) {
    const orgConversations = await db.query.conversations.findMany({
      where: eq(conversations.orgId, authCtx.orgId),
      orderBy: [desc(conversations.updatedAt)],
      limit: 50,
    });

    const enriched = await Promise.all(
      orgConversations.map(async (conv) => {
        // Get last message
        const lastMessages = await db!
          .select()
          .from(messages)
          .where(eq(messages.conversationId, conv.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        // Get message count (exclude system messages)
        const countResult = await db!
          .select({ count: sql<number>`count(*)::int` })
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conv.id),
              ne(messages.role, "system")
            )
          );

        const last = lastMessages[0];
        return {
          ...conv,
          lastMessage: last
            ? {
                content:
                  last.content.length > 100
                    ? last.content.slice(0, 100) + "..."
                    : last.content,
                role: last.role,
                createdAt: last.createdAt,
              }
            : null,
          messageCount: countResult[0]?.count ?? 0,
        };
      })
    );

    return NextResponse.json({ conversations: enriched });
  }

  // ── Demo fallback ──
  const demoResult = demoConversations.map((conv) => {
    const msgs = demoMessages.filter((m) => m.conversationId === conv.id);
    const lastMessage = msgs[msgs.length - 1];
    const messageCount = msgs.filter((m) => m.role !== "system").length;

    return {
      ...conv,
      lastMessage: lastMessage
        ? {
            content:
              lastMessage.content.length > 100
                ? lastMessage.content.slice(0, 100) + "..."
                : lastMessage.content,
            role: lastMessage.role,
            createdAt: lastMessage.createdAt,
          }
        : null,
      messageCount,
    };
  });

  demoResult.sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return NextResponse.json({ conversations: demoResult });
}
