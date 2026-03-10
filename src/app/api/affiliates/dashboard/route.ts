import { NextRequest, NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { affiliates, referrals, commissionPayouts } from "@/lib/db/schema";

// GET: Affiliate dashboard data (authenticated by email token in query)
export async function GET(req: NextRequest) {
  if (!db) {
    return NextResponse.json(
      { error: "Not available in demo mode" },
      { status: 503 }
    );
  }

  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json(
      { error: "Missing referral code" },
      { status: 400 }
    );
  }

  const affiliate = await db.query.affiliates.findFirst({
    where: eq(affiliates.referralCode, code),
  });

  if (!affiliate) {
    return NextResponse.json(
      { error: "Affiliate not found" },
      { status: 404 }
    );
  }

  // Get referral stats
  const refs = await db
    .select()
    .from(referrals)
    .where(eq(referrals.affiliateId, affiliate.id))
    .orderBy(desc(referrals.createdAt));

  const payouts = await db
    .select()
    .from(commissionPayouts)
    .where(eq(commissionPayouts.affiliateId, affiliate.id))
    .orderBy(desc(commissionPayouts.createdAt));

  // Calculate active monthly commission
  const activeRefs = refs.filter((r) => r.status === "converted");
  const monthlyCommission = activeRefs.reduce(
    (sum, r) => sum + (r.commissionAmount ?? 0),
    0
  );

  return NextResponse.json({
    affiliate: {
      id: affiliate.id,
      name: affiliate.name,
      email: affiliate.email,
      company: affiliate.company,
      referralCode: affiliate.referralCode,
      commissionRate: affiliate.commissionRate,
      status: affiliate.status,
      totalEarned: affiliate.totalEarned,
      totalPaid: affiliate.totalPaid,
      balance: affiliate.totalEarned - affiliate.totalPaid,
    },
    stats: {
      totalReferrals: refs.length,
      activeCustomers: activeRefs.length,
      monthlyCommission,
      pendingReferrals: refs.filter((r) => r.status === "pending").length,
    },
    referrals: refs.map((r) => ({
      id: r.id,
      customerEmail: r.customerEmail
        ? `${r.customerEmail.slice(0, 3)}***`
        : null,
      plan: r.plan,
      status: r.status,
      commissionAmount: r.commissionAmount,
      convertedAt: r.convertedAt,
      createdAt: r.createdAt,
    })),
    payouts: payouts.map((p) => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
      periodStart: p.periodStart,
      periodEnd: p.periodEnd,
      createdAt: p.createdAt,
    })),
  });
}
