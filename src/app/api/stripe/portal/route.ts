import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  const authCtx = await getAuthContext();
  if (!authCtx?.orgId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!stripe || !db) {
    return NextResponse.json(
      { error: "Billing not configured" },
      { status: 503 }
    );
  }

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, authCtx.orgId),
  });

  if (!org?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account found. Please upgrade from the billing page." },
      { status: 400 }
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${req.nextUrl.origin}/dashboard/billing`,
  });

  return NextResponse.json({ url: session.url });
}
