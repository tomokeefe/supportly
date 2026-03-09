import { NextResponse } from "next/server";
import { demoDailyStats, demoConversations } from "@/lib/demo-data";

export async function GET() {
  const stats = demoDailyStats;

  // Aggregate totals
  const totalConversations = stats.reduce((s, d) => s + d.conversationsCount, 0);
  const totalResolved = stats.reduce((s, d) => s + d.resolvedCount, 0);
  const totalEscalated = stats.reduce((s, d) => s + d.escalatedCount, 0);
  const avgConfidence =
    stats.reduce((s, d) => s + (d.avgConfidence ?? 0), 0) / stats.length;

  return NextResponse.json({
    summary: {
      totalConversations,
      totalResolved,
      totalEscalated,
      resolutionRate: totalConversations > 0 ? totalResolved / totalConversations : 0,
      avgConfidence: parseFloat(avgConfidence.toFixed(2)),
      activeConversations: demoConversations.filter((c) => c.status === "active").length,
    },
    daily: stats,
  });
}
