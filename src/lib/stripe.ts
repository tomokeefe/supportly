import Stripe from "stripe";

// Graceful degradation: billing features disabled when Stripe not configured
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
