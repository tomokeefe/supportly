import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { PLANS, type PlanName } from "@/lib/plans";

export async function POST(req: NextRequest) {
  if (!stripe || !db) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const orgId = session.metadata?.orgId;
      const plan = session.metadata?.plan as PlanName | undefined;

      if (orgId && plan && plan in PLANS) {
        await db
          .update(organizations)
          .set({
            plan,
            stripeSubscriptionId:
              typeof session.subscription === "string"
                ? session.subscription
                : null,
            conversationLimit: PLANS[plan].conversationLimit,
            currentPeriodStart: new Date(),
            currentPeriodConversations: 0,
            updatedAt: new Date(),
          })
          .where(eq(organizations.id, orgId));
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.toString();

      if (customerId) {
        await db
          .update(organizations)
          .set({
            plan: "free",
            stripeSubscriptionId: null,
            conversationLimit: PLANS.free.conversationLimit,
            updatedAt: new Date(),
          })
          .where(eq(organizations.stripeCustomerId, customerId));
      }
      break;
    }

    case "invoice.paid": {
      // Reset conversation counter at the start of each billing period
      const invoice = event.data.object;
      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.toString();

      if (customerId) {
        await db
          .update(organizations)
          .set({
            currentPeriodConversations: 0,
            currentPeriodStart: new Date(),
          })
          .where(eq(organizations.stripeCustomerId, customerId));
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
