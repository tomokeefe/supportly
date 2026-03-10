import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { getStripePriceId, type PlanName } from "@/lib/plans";
import { currentUser } from "@clerk/nextjs/server";

const checkoutSchema = z.object({
  plan: z.enum(["starter", "pro", "business"]),
  orgId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const authCtx = await getAuthContext();
  if (!authCtx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Billing not configured" },
      { status: 503 }
    );
  }

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { plan, orgId } = parsed.data;
  const stripePriceId = getStripePriceId(plan as PlanName);

  if (!stripePriceId) {
    return NextResponse.json(
      { error: "Stripe price not configured for this plan" },
      { status: 503 }
    );
  }

  // Verify org ownership — org must belong to the authenticated user
  let customerId: string | null = null;

  if (db) {
    const org = await db.query.organizations.findFirst({
      where: and(
        eq(organizations.id, orgId),
        eq(organizations.clerkUserId, authCtx.userId)
      ),
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    customerId = org.stripeCustomerId ?? null;
  }

  // Get user email for Stripe customer
  let userEmail: string | undefined;
  try {
    const user = await currentUser();
    userEmail =
      user?.emailAddresses?.[0]?.emailAddress ?? undefined;
  } catch {
    // Clerk not available — proceed without email
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: { orgId, clerkUserId: authCtx.userId },
    });
    customerId = customer.id;

    if (db) {
      await db
        .update(organizations)
        .set({ stripeCustomerId: customerId })
        .where(eq(organizations.id, orgId));
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: stripePriceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${req.nextUrl.origin}/dashboard?checkout=success`,
    cancel_url: `${req.nextUrl.origin}/dashboard/billing?checkout=cancelled`,
    metadata: { orgId, plan },
  });

  return NextResponse.json({ url: session.url });
}
