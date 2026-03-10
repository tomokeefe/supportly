import { NextResponse } from "next/server";
import { eq, and, gte, isNotNull, sql } from "drizzle-orm";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { demoDailyStats, demoConversations, demoMessages } from "@/lib/demo-data";

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

    // ── Advanced analytics: hourly breakdown ──
    const hourlyMap = new Map<number, number>();
    for (let h = 0; h < 24; h++) hourlyMap.set(h, 0);
    for (const conv of orgConversations) {
      const hour = conv.createdAt.getHours();
      hourlyMap.set(hour, (hourlyMap.get(hour) ?? 0) + 1);
    }
    const hourly = Array.from(hourlyMap.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour - b.hour);

    // ── Advanced analytics: channel breakdown ──
    const channelMap = new Map<string, number>();
    for (const conv of orgConversations) {
      channelMap.set(conv.channel, (channelMap.get(conv.channel) ?? 0) + 1);
    }
    const channels = Array.from(channelMap.entries()).map(([channel, count]) => ({
      channel,
      count,
    }));

    // ── Advanced analytics: daily confidence trend ──
    const orgMessages = await db
      .select({
        confidence: messages.confidence,
        createdAt: messages.createdAt,
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

    const confidenceByDate = new Map<
      string,
      { sum: number; count: number }
    >();
    for (const msg of orgMessages) {
      const dateStr = msg.createdAt.toISOString().split("T")[0];
      const existing = confidenceByDate.get(dateStr) || {
        sum: 0,
        count: 0,
      };
      existing.sum += msg.confidence ?? 0;
      existing.count += 1;
      confidenceByDate.set(dateStr, existing);
    }
    const confidenceTrend = Array.from(confidenceByDate.entries())
      .map(([date, { sum, count }]) => ({
        date,
        avgConfidence: parseFloat((sum / count).toFixed(2)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

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
      hourly,
      channels,
      confidenceTrend,
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

  // Demo hourly data — simulate peak hours at 10-11am and 2-3pm
  const demoHourly = Array.from({ length: 24 }, (_, h) => {
    let base = 5;
    if (h >= 9 && h <= 17) base = 20 + Math.floor(Math.random() * 15);
    if (h >= 10 && h <= 11) base = 35 + Math.floor(Math.random() * 10);
    if (h >= 14 && h <= 15) base = 30 + Math.floor(Math.random() * 10);
    if (h < 7 || h > 21) base = Math.floor(Math.random() * 3);
    return { hour: h, count: base };
  });

  // Demo channel breakdown
  const demoChannels = [
    { channel: "chat", count: Math.floor(totalConversations * 0.65) },
    { channel: "email", count: Math.floor(totalConversations * 0.25) },
    { channel: "sms", count: Math.floor(totalConversations * 0.08) },
    { channel: "voice", count: Math.floor(totalConversations * 0.02) },
  ];

  // Demo confidence trend
  const demoConfidenceTrend = stats.map((d) => ({
    date: d.date,
    avgConfidence: d.avgConfidence ?? 0.82,
  }));

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
    hourly: demoHourly,
    channels: demoChannels,
    confidenceTrend: demoConfidenceTrend,
  });
}
