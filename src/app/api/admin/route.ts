import { NextResponse } from "next/server";
import { desc, sql, eq } from "drizzle-orm";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  organizations,
  conversations,
  affiliates,
  referrals,
} from "@/lib/db/schema";

// Restrict to admin emails (comma-separated in env)
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);

function isAdmin(auth: { userId: string; email: string | null }): boolean {
  // Allow cookie-user in dev for testing
  if (process.env.NODE_ENV !== "production" && auth.userId === "cookie-user") return true;
  // Check email whitelist
  if (auth.email && ADMIN_EMAILS.includes(auth.email.toLowerCase())) return true;
  return false;
}

export async function GET() {
  const auth = await getAuthContext();
  if (!auth || !isAdmin(auth)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!db) {
    return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  }

  // Fetch all organizations with stats
  const orgs = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      plan: organizations.plan,
      conversationLimit: organizations.conversationLimit,
      currentPeriodConversations: organizations.currentPeriodConversations,
      stripeCustomerId: organizations.stripeCustomerId,
      status: organizations.status,
      affiliateCode: organizations.affiliateCode,
      agencyId: organizations.agencyId,
      createdAt: organizations.createdAt,
    })
    .from(organizations)
    .orderBy(desc(organizations.createdAt));

  // Count conversations per org
  const convCounts = await db
    .select({
      orgId: conversations.orgId,
      total: sql<number>`count(*)`.as("total"),
    })
    .from(conversations)
    .groupBy(conversations.orgId);

  const convMap = new Map(convCounts.map((c) => [c.orgId, Number(c.total)]));

  // Fetch all affiliates
  const allAffiliates = await db
    .select()
    .from(affiliates)
    .orderBy(desc(affiliates.createdAt));

  // Fetch referral counts per affiliate
  const refCounts = await db
    .select({
      affiliateId: referrals.affiliateId,
      total: sql<number>`count(*)`.as("total"),
      converted: sql<number>`count(*) filter (where status = 'converted')`.as(
        "converted"
      ),
    })
    .from(referrals)
    .groupBy(referrals.affiliateId);

  const refMap = new Map(
    refCounts.map((r) => [
      r.affiliateId,
      { total: Number(r.total), converted: Number(r.converted) },
    ])
  );

  // Platform totals
  const totalOrgs = orgs.length;
  const paidOrgs = orgs.filter((o) => o.plan !== "free").length;
  const totalConversations = convCounts.reduce((s, c) => s + Number(c.total), 0);

  // MRR calculation
  const PLAN_PRICES: Record<string, number> = {
    free: 0,
    starter: 49,
    pro: 149,
    business: 399,
    agency_25: 199,
    agency_50: 349,
    agency_100: 599,
  };
  const mrr = orgs.reduce((s, o) => s + (PLAN_PRICES[o.plan] ?? 0), 0);

  return NextResponse.json({
    stats: {
      totalOrgs,
      paidOrgs,
      totalConversations,
      mrr,
      totalAffiliates: allAffiliates.length,
    },
    organizations: orgs.map((o) => ({
      ...o,
      totalConversations: convMap.get(o.id) ?? 0,
    })),
    affiliates: allAffiliates.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      company: a.company,
      referralCode: a.referralCode,
      commissionRate: a.commissionRate,
      status: a.status,
      totalEarned: a.totalEarned,
      totalPaid: a.totalPaid,
      referrals: refMap.get(a.id) ?? { total: 0, converted: 0 },
      createdAt: a.createdAt,
    })),
  });
}
