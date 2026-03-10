import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { affiliates } from "@/lib/db/schema";

// GET: Validate a referral code and set attribution cookie
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("ref");
  if (!code) {
    return NextResponse.json(
      { error: "Missing referral code" },
      { status: 400 }
    );
  }

  if (!db) {
    return NextResponse.json({ valid: false });
  }

  const affiliate = await db.query.affiliates.findFirst({
    where: eq(affiliates.referralCode, code),
  });

  if (!affiliate || affiliate.status !== "active") {
    return NextResponse.json({ valid: false });
  }

  // Set 90-day attribution cookie
  const res = NextResponse.json({
    valid: true,
    affiliateName: affiliate.company || affiliate.name,
  });

  res.cookies.set("resolvly_ref", code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 90, // 90 days
    path: "/",
  });

  return res;
}
