import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  real,
  integer,
  date,
  pgEnum,
  customType,
} from "drizzle-orm/pg-core";

// Custom pgvector type for embeddings
const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(256)";
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: string): number[] {
    return value
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map(Number);
  },
});

export const planEnum = pgEnum("plan", [
  "free",
  "starter",
  "pro",
  "business",
]);

export const conversationStatusEnum = pgEnum("conversation_status", [
  "active",
  "escalated",
  "resolved",
]);

export const channelEnum = pgEnum("channel", [
  "chat",
  "email",
  "sms",
  "voice",
]);

export const messageRoleEnum = pgEnum("message_role", [
  "user",
  "assistant",
  "system",
]);

// ── Organizations (tenants) ──────────────────────────────────────────
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  settings: jsonb("settings")
    .notNull()
    .default({
      confidenceThreshold: 0.75,
      persona: "friendly and professional",
      greeting: "Hi! How can I help you today?",
      escalationEmail: "",
      branding: { primaryColor: "#2563eb", position: "bottom-right" },
    }),
  plan: planEnum("plan").notNull().default("free"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  conversationLimit: integer("conversation_limit").notNull().default(50),
  currentPeriodConversations: integer("current_period_conversations")
    .notNull()
    .default(0),
  currentPeriodStart: timestamp("current_period_start"),
  clerkUserId: varchar("clerk_user_id", { length: 255 }),
  affiliateCode: varchar("affiliate_code", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Knowledge Base ───────────────────────────────────────────────────
export const knowledgeItems = pgTable("knowledge_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  embedding: vector("embedding"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Conversations ────────────────────────────────────────────────────
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  status: conversationStatusEnum("status").notNull().default("active"),
  channel: channelEnum("channel").notNull().default("chat"),
  customerName: varchar("customer_name", { length: 255 }),
  customerEmail: varchar("customer_email", { length: 255 }),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Messages ─────────────────────────────────────────────────────────
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  confidence: real("confidence"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Daily Stats ──────────────────────────────────────────────────────
export const dailyStats = pgTable("daily_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  conversationsCount: integer("conversations_count").notNull().default(0),
  resolvedCount: integer("resolved_count").notNull().default(0),
  escalatedCount: integer("escalated_count").notNull().default(0),
  avgConfidence: real("avg_confidence"),
});

// ── Affiliates ──────────────────────────────────────────────────────
export const affiliateStatusEnum = pgEnum("affiliate_status", [
  "pending",
  "active",
  "suspended",
]);

export const affiliates = pgTable("affiliates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  company: varchar("company", { length: 255 }),
  referralCode: varchar("referral_code", { length: 50 }).notNull().unique(),
  commissionRate: real("commission_rate").notNull().default(0.2), // 20%
  status: affiliateStatusEnum("status").notNull().default("pending"),
  totalEarned: integer("total_earned").notNull().default(0), // cents
  totalPaid: integer("total_paid").notNull().default(0), // cents
  paypalEmail: varchar("paypal_email", { length: 255 }),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const referrals = pgTable("referrals", {
  id: uuid("id").primaryKey().defaultRandom(),
  affiliateId: uuid("affiliate_id")
    .notNull()
    .references(() => affiliates.id, { onDelete: "cascade" }),
  orgId: uuid("org_id")
    .references(() => organizations.id, { onDelete: "set null" }),
  customerEmail: varchar("customer_email", { length: 255 }),
  plan: planEnum("plan"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending | converted | cancelled
  commissionAmount: integer("commission_amount").default(0), // cents per month
  convertedAt: timestamp("converted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const commissionPayouts = pgTable("commission_payouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  affiliateId: uuid("affiliate_id")
    .notNull()
    .references(() => affiliates.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // cents
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending | processing | paid | failed
  payoutMethod: varchar("payout_method", { length: 50 }),
  reference: varchar("reference", { length: 255 }),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Types ────────────────────────────────────────────────────────────
export type Organization = typeof organizations.$inferSelect;
export type KnowledgeItem = typeof knowledgeItems.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type DailyStat = typeof dailyStats.$inferSelect;

export type Affiliate = typeof affiliates.$inferSelect;
export type Referral = typeof referrals.$inferSelect;
export type CommissionPayout = typeof commissionPayouts.$inferSelect;

export type OrgSettings = {
  confidenceThreshold: number;
  persona: string;
  greeting: string;
  escalationEmail?: string;
  branding: { primaryColor: string; position: string };
};
