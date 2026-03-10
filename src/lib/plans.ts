/**
 * Canonical plan definitions — single source of truth.
 *
 * Client-safe: no process.env references.
 * Stripe price IDs live in getStripePriceId() which is server-only.
 */

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    conversationLimit: 50,
    limit: "50 conversations/mo",
    features: [
      "50 conversations/mo",
      "1 knowledge base",
      "Chat widget",
      "Community support",
    ],
  },
  starter: {
    name: "Starter",
    price: 49,
    conversationLimit: 300,
    limit: "300 conversations/mo",
    features: [
      "300 conversations/mo",
      "1 knowledge base",
      "Chat + Email",
      "Basic analytics",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    price: 149,
    conversationLimit: 2000,
    limit: "2,000 conversations/mo",
    recommended: true as const,
    features: [
      "2,000 conversations/mo",
      "3 knowledge bases",
      "All channels",
      "Advanced analytics",
      "Custom AI persona",
      "Priority support",
    ],
  },
  business: {
    name: "Business",
    price: 399,
    conversationLimit: 10000,
    limit: "10,000 conversations/mo",
    features: [
      "10,000 conversations/mo",
      "Unlimited knowledge bases",
      "All channels + voice",
      "API access",
      "SLA guarantee",
      "Dedicated account manager",
    ],
  },
} as const;

export type PlanName = keyof typeof PLANS;

/** Structured feature gates per plan — used for onboarding + API enforcement */
export const PLAN_LIMITS = {
  free: { maxArticles: 10, allowFileUpload: false },
  starter: { maxArticles: 50, allowFileUpload: true },
  pro: { maxArticles: 250, allowFileUpload: true },
  business: { maxArticles: Infinity, allowFileUpload: true },
} as const;

export type PlanLimits = (typeof PLAN_LIMITS)[PlanName];

/** Affiliate commission rate (20% of monthly recurring revenue) */
export const AFFILIATE_COMMISSION_RATE = 0.20;

/** Commission amounts per plan (monthly) */
export const AFFILIATE_COMMISSIONS: Record<PlanName, number> = {
  free: 0,
  starter: PLANS.starter.price * AFFILIATE_COMMISSION_RATE,   // $9.80
  pro: PLANS.pro.price * AFFILIATE_COMMISSION_RATE,           // $29.80
  business: PLANS.business.price * AFFILIATE_COMMISSION_RATE, // $79.80
};

/** Returns the minimum plan required to unlock a gated feature */
export function getMinPlanForFeature(
  feature: "fileUpload"
): PlanName {
  switch (feature) {
    case "fileUpload":
      return "starter";
  }
}

/** Server-only: resolve Stripe price ID from env vars */
export function getStripePriceId(plan: PlanName): string | null {
  const map: Record<PlanName, string | undefined> = {
    free: undefined,
    starter: process.env.STRIPE_PRICE_STARTER,
    pro: process.env.STRIPE_PRICE_PRO,
    business: process.env.STRIPE_PRICE_BUSINESS,
  };
  return map[plan] || null;
}
