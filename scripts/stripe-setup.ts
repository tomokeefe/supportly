/**
 * Stripe Setup Script — creates products and prices for Resolvly plans.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/stripe-setup.ts
 *
 * This script is idempotent — it checks for existing products first.
 * Run it once to set up your Stripe account, then copy the output
 * env vars into your .env.local file.
 */

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error("\n  Missing STRIPE_SECRET_KEY environment variable.\n");
  console.error("  Usage:");
  console.error(
    "    STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/stripe-setup.ts\n"
  );
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

const PLANS = [
  {
    key: "STARTER",
    name: "Resolvly Starter",
    description:
      "300 conversations/mo, Chat + Email, Basic analytics, Email support",
    price: 4900, // cents
  },
  {
    key: "PRO",
    name: "Resolvly Pro",
    description:
      "2,000 conversations/mo, All channels, Advanced analytics, Custom AI persona, Priority support",
    price: 14900,
  },
  {
    key: "BUSINESS",
    name: "Resolvly Business",
    description:
      "10,000 conversations/mo, All channels + voice, API access, SLA guarantee, Dedicated account manager",
    price: 39900,
  },
  {
    key: "AGENCY_25",
    name: "Resolvly Agency 25",
    description:
      "25 client licenses, 300 conversations/mo per client, White-label ready, Agency dashboard, Priority support",
    price: 19900,
  },
  {
    key: "AGENCY_50",
    name: "Resolvly Agency 50",
    description:
      "50 client licenses, 300 conversations/mo per client, White-label ready, Agency dashboard, Priority support",
    price: 34900,
  },
  {
    key: "AGENCY_100",
    name: "Resolvly Agency 100",
    description:
      "100 client licenses, 300 conversations/mo per client, White-label ready, Agency dashboard, Dedicated account manager",
    price: 59900,
  },
];

async function setup() {
  console.log("\n  Resolvly Stripe Setup");
  console.log("  =====================\n");

  // Check for existing Resolvly products
  const existingProducts = await stripe.products.list({ limit: 100 });
  const resolvlyProducts = existingProducts.data.filter((p) =>
    p.name.startsWith("Resolvly")
  );

  if (resolvlyProducts.length > 0) {
    console.log("  Found existing Resolvly products:");
    for (const p of resolvlyProducts) {
      console.log(`    - ${p.name} (${p.id})`);
    }
  }

  // Find existing prices and create missing products
  const envVars: Record<string, string> = {};

  for (const plan of PLANS) {
    const existingProduct = resolvlyProducts.find((p) => p.name === plan.name);

    if (existingProduct) {
      const prices = await stripe.prices.list({
        product: existingProduct.id,
        active: true,
        limit: 1,
      });
      if (prices.data[0]) {
        envVars[`STRIPE_PRICE_${plan.key}`] = prices.data[0].id;
        console.log(`  ✓ ${plan.name} already exists (${prices.data[0].id})`);
        continue;
      }
    }

    // Create new product + price
    console.log(`  Creating ${plan.name}...`);

    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: { app: "resolvly" },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.price,
      currency: "usd",
      recurring: { interval: "month" },
      metadata: { app: "resolvly" },
    });

    envVars[`STRIPE_PRICE_${plan.key}`] = price.id;
    console.log(`    Product: ${product.id}`);
    console.log(`    Price:   ${price.id} ($${plan.price / 100}/mo)\n`);
  }

  printEnvVars(envVars);
}

function printEnvVars(envVars: Record<string, string>) {
  console.log("\n  ===================================");
  console.log("  Add these to your .env.local:");
  console.log("  ===================================\n");
  console.log(`  STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}`);
  for (const [key, value] of Object.entries(envVars)) {
    console.log(`  ${key}=${value}`);
  }
  console.log("");
  console.log("  Next steps:");
  console.log("    1. Copy the env vars above into .env.local");
  console.log("    2. Set up webhook in Stripe Dashboard → Developers → Webhooks:");
  console.log("       Endpoint URL: https://your-domain.com/api/stripe/webhook");
  console.log("       Events to listen for:");
  console.log("         - checkout.session.completed");
  console.log("         - customer.subscription.updated");
  console.log("         - customer.subscription.deleted");
  console.log("         - invoice.paid");
  console.log("         - invoice.payment_failed");
  console.log("    3. Copy the webhook signing secret → STRIPE_WEBHOOK_SECRET in .env.local");
  console.log("    4. Enable the Customer Portal in Stripe Dashboard → Settings → Billing → Customer portal");
  console.log("");
}

setup().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
