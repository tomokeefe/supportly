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
  plan: z.enum(["starter", "pro", "business", "agency_25", "agency_50", "agency_100"]),
  orgId: z.string().uuid(),
  returnTo: z.enum(["onboarding", "dashboard", "agency"]).default("dashboard"),
  vertical: z.string().max(100).optional(),
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

  const { plan, orgId, returnTo, vertical } = parsed.data;
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

  try {
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

    // Build success/cancel URLs based on return context
    const origin = req.nextUrl.origin;
    let successUrl: string;
    let cancelUrl: string;

    if (returnTo === "onboarding") {
      const verticalParam = vertical ? `&vertical=${encodeURIComponent(vertical)}` : "";
      successUrl = `${origin}/onboarding?step=3&orgId=${orgId}&plan=${plan}${verticalParam}&checkout=success`;
      cancelUrl = `${origin}/onboarding?checkout=cancelled`;
    } else if (returnTo === "agency") {
      successUrl = `${origin}/agency?checkout=success`;
      cancelUrl = `${origin}/partners?checkout=cancelled`;
    } else {
      successUrl = `${origin}/dashboard?checkout=success`;
      cancelUrl = `${origin}/dashboard/billing?checkout=cancelled`;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: stripePriceId, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { orgId, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    const message =
      err instanceof Error ? err.message : "Stripe checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
