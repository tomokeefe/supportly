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
    price: 29,
    conversationLimit: 500,
    limit: "500 conversations/mo",
    features: [
      "500 conversations/mo",
      "1 knowledge base",
      "Chat + Email",
      "Basic analytics",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    price: 79,
    conversationLimit: 2500,
    limit: "2,500 conversations/mo",
    recommended: true as const,
    features: [
      "2,500 conversations/mo",
      "3 knowledge bases",
      "All channels",
      "Advanced analytics",
      "Custom AI persona",
      "Priority support",
    ],
  },
  business: {
    name: "Business",
    price: 199,
    conversationLimit: 999999,
    limit: "Unlimited conversations",
    features: [
      "Unlimited conversations",
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
