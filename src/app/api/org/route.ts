import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { demoOrg } from "@/lib/demo-data";

export async function GET() {
  const ctx = await getAuthContext();

  // No auth configured or not logged in — return demo org
  if (!ctx) {
    return NextResponse.json({ org: demoOrg });
  }

  // Logged in but no org — need onboarding
  if (!ctx.orgId) {
    return NextResponse.json(
      { error: "No organization", redirect: "/onboarding" },
      { status: 404 }
    );
  }

  // Try real DB lookup
  if (db) {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, ctx.orgId),
    });
    if (org) return NextResponse.json({ org });
  }

  // Fallback — return org info from Clerk metadata
  return NextResponse.json({
    org: {
      id: ctx.orgId,
      name: (ctx as Record<string, unknown>).orgName ?? "Your Business",
      slug: ctx.orgSlug,
    },
  });
}
