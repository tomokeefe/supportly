import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { organizations, affiliates, referrals } from "@/lib/db/schema";
import { PLANS, AFFILIATE_COMMISSIONS, type PlanName } from "@/lib/plans";

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
    // ── New subscription created via checkout ──
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

        // Track affiliate conversion — update referral to "converted" and record commission
        const org = await db.query.organizations.findFirst({
          where: eq(organizations.id, orgId),
        });
        if (org?.affiliateCode) {
          const affiliate = await db.query.affiliates.findFirst({
            where: eq(affiliates.referralCode, org.affiliateCode),
          });
          if (affiliate) {
            const commissionCents = Math.round(
              AFFILIATE_COMMISSIONS[plan] * 100
            );
            // Update existing pending referral or create new one
            const existingRef = await db.query.referrals.findFirst({
              where: and(
                eq(referrals.affiliateId, affiliate.id),
                eq(referrals.orgId, orgId)
              ),
            });
            if (existingRef) {
              await db
                .update(referrals)
                .set({
                  status: "converted",
                  plan,
                  commissionAmount: commissionCents,
                  convertedAt: new Date(),
                })
                .where(eq(referrals.id, existingRef.id));
            } else {
              await db.insert(referrals).values({
                affiliateId: affiliate.id,
                orgId,
                plan,
                status: "converted",
                commissionAmount: commissionCents,
                convertedAt: new Date(),
              });
            }
            // Increment affiliate total earned
            await db
              .update(affiliates)
              .set({
                totalEarned: affiliate.totalEarned + commissionCents,
                updatedAt: new Date(),
              })
              .where(eq(affiliates.id, affiliate.id));
          }
        }
      }
      break;
    }

    // ── Plan changed via Stripe billing portal ──
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.toString();

      if (customerId && subscription.items?.data?.[0]?.price?.id) {
        const priceId = subscription.items.data[0].price.id;

        // Find which plan matches this price ID
        const matchedPlan = (Object.keys(PLANS) as PlanName[]).find(
          (key) =>
            key !== "free" &&
            process.env[
              `STRIPE_PRICE_${key.toUpperCase()}` as keyof NodeJS.ProcessEnv
            ] === priceId
        );

        if (matchedPlan) {
          await db
            .update(organizations)
            .set({
              plan: matchedPlan,
              conversationLimit: PLANS[matchedPlan].conversationLimit,
              updatedAt: new Date(),
            })
            .where(eq(organizations.stripeCustomerId, customerId));
        }
      }
      break;
    }

    // ── Subscription cancelled ──
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

    // ── Invoice paid — reset conversation counter for new billing period ──
    case "invoice.paid": {
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

    // ── Payment failed — could trigger email/notification in future ──
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      console.warn(
        `Payment failed for customer ${invoice.customer}, invoice ${invoice.id}`
      );
      // Future: send notification email, show banner in dashboard
      break;
    }
  }

  return NextResponse.json({ received: true });
}
