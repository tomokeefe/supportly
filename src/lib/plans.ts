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
  agency_25: {
    name: "Agency 25",
    price: 199,
    conversationLimit: 300,
    maxLicenses: 25,
    limit: "25 client licenses",
    features: [
      "25 client licenses",
      "300 conversations/mo per client",
      "Independent branding per client",
      "Agency dashboard",
      "Priority support",
    ],
  },
  agency_50: {
    name: "Agency 50",
    price: 349,
    conversationLimit: 300,
    maxLicenses: 50,
    limit: "50 client licenses",
    features: [
      "50 client licenses",
      "300 conversations/mo per client",
      "Independent branding per client",
      "Agency dashboard",
      "Priority support",
    ],
  },
  agency_100: {
    name: "Agency 100",
    price: 599,
    conversationLimit: 300,
    maxLicenses: 100,
    limit: "100 client licenses",
    features: [
      "100 client licenses",
      "300 conversations/mo per client",
      "Independent branding per client",
      "Agency dashboard",
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
  agency_25: { maxArticles: 50, allowFileUpload: true },
  agency_50: { maxArticles: 50, allowFileUpload: true },
  agency_100: { maxArticles: 50, allowFileUpload: true },
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
  agency_25: PLANS.agency_25.price * AFFILIATE_COMMISSION_RATE,
  agency_50: PLANS.agency_50.price * AFFILIATE_COMMISSION_RATE,
  agency_100: PLANS.agency_100.price * AFFILIATE_COMMISSION_RATE,
};

/** Check if a plan is an agency plan */
export function isAgencyPlan(plan: string): plan is "agency_25" | "agency_50" | "agency_100" {
  return plan === "agency_25" || plan === "agency_50" || plan === "agency_100";
}

/** Get the max number of client licenses for an agency plan */
export function getMaxLicenses(plan: string): number {
  if (!isAgencyPlan(plan)) return 0;
  return PLANS[plan].maxLicenses;
}

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
    agency_25: process.env.STRIPE_PRICE_AGENCY_25,
    agency_50: process.env.STRIPE_PRICE_AGENCY_50,
    agency_100: process.env.STRIPE_PRICE_AGENCY_100,
  };
  return map[plan] || null;
}
