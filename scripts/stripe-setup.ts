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
      "500 conversations/mo, Chat + Email, Basic analytics, Email support",
    price: 2900, // cents
  },
  {
    key: "PRO",
    name: "Resolvly Pro",
    description:
      "2,500 conversations/mo, All channels, Advanced analytics, Custom AI persona, Priority support",
    price: 7900,
  },
  {
    key: "BUSINESS",
    name: "Resolvly Business",
    description:
      "Unlimited conversations, All channels + voice, API access, SLA guarantee, Dedicated account manager",
    price: 19900,
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

    // Find and display existing price IDs
    const envVars: Record<string, string> = {};
    for (const plan of PLANS) {
      const product = resolvlyProducts.find((p) => p.name === plan.name);
      if (product) {
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
          limit: 1,
        });
        if (prices.data[0]) {
          envVars[`STRIPE_PRICE_${plan.key}`] = prices.data[0].id;
        }
      }
    }

    if (Object.keys(envVars).length > 0) {
      printEnvVars(envVars);
    } else {
      console.log(
        "\n  No active prices found. Archive existing products in Stripe Dashboard to start fresh.\n"
      );
    }
    return;
  }

  // Create products and prices
  const envVars: Record<string, string> = {};

  for (const plan of PLANS) {
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
