import { NextResponse } from "next/server";
import { eq, and, gte, isNotNull, sql } from "drizzle-orm";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { demoDailyStats, demoConversations } from "@/lib/demo-data";

export async function GET() {
  const authCtx = await getAuthContext();

  // ── Real DB path ──
  if (db && authCtx?.orgId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all conversations in the last 30 days for this org
    const orgConversations = await db.query.conversations.findMany({
      where: and(
        eq(conversations.orgId, authCtx.orgId),
        gte(conversations.createdAt, thirtyDaysAgo)
      ),
    });

    const totalConversations = orgConversations.length;
    const totalResolved = orgConversations.filter(
      (c) => c.status === "resolved"
    ).length;
    const totalEscalated = orgConversations.filter(
      (c) => c.status === "escalated"
    ).length;
    const activeConversations = orgConversations.filter(
      (c) => c.status === "active"
    ).length;

    // Get average confidence from assistant messages
    const confidenceResult = await db
      .select({
        avg: sql<number>`coalesce(avg(${messages.confidence}), 0)`,
      })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(
        and(
          eq(conversations.orgId, authCtx.orgId),
          isNotNull(messages.confidence),
          gte(conversations.createdAt, thirtyDaysAgo)
        )
      );

    // Build daily breakdown by grouping conversations by date
    const dailyMap = new Map<
      string,
      {
        date: string;
        conversationsCount: number;
        resolvedCount: number;
        escalatedCount: number;
      }
    >();

    for (const conv of orgConversations) {
      const dateStr = conv.createdAt.toISOString().split("T")[0];
      const existing = dailyMap.get(dateStr) || {
        date: dateStr,
        conversationsCount: 0,
        resolvedCount: 0,
        escalatedCount: 0,
      };
      existing.conversationsCount += 1;
      if (conv.status === "resolved") existing.resolvedCount += 1;
      if (conv.status === "escalated") existing.escalatedCount += 1;
      dailyMap.set(dateStr, existing);
    }

    const daily = Array.from(dailyMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    return NextResponse.json({
      summary: {
        totalConversations,
        totalResolved,
        totalEscalated,
        resolutionRate:
          totalConversations > 0 ? totalResolved / totalConversations : 0,
        avgConfidence: parseFloat(
          (confidenceResult[0]?.avg ?? 0).toFixed(2)
        ),
        activeConversations,
      },
      daily,
    });
  }

  // ── Demo fallback ──
  const stats = demoDailyStats;
  const totalConversations = stats.reduce(
    (s, d) => s + d.conversationsCount,
    0
  );
  const totalResolved = stats.reduce((s, d) => s + d.resolvedCount, 0);
  const totalEscalated = stats.reduce((s, d) => s + d.escalatedCount, 0);
  const avgConfidence =
    stats.reduce((s, d) => s + (d.avgConfidence ?? 0), 0) / stats.length;

  return NextResponse.json({
    summary: {
      totalConversations,
      totalResolved,
      totalEscalated,
      resolutionRate:
        totalConversations > 0 ? totalResolved / totalConversations : 0,
      avgConfidence: parseFloat(avgConfidence.toFixed(2)),
      activeConversations: demoConversations.filter(
        (c) => c.status === "active"
      ).length,
    },
    daily: stats,
  });
}
