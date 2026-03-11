import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getAuthContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizations, affiliates } from "@/lib/db/schema";
import { PLANS, type PlanName } from "@/lib/plans";

// ── Admin gate ───────────────────────────────────────────────────────
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdmin(auth: { userId: string; email: string | null }): boolean {
  if (process.env.NODE_ENV !== "production" && auth.userId === "cookie-user")
    return true;
  if (auth.email && ADMIN_EMAILS.includes(auth.email.toLowerCase()))
    return true;
  return false;
}

// ── Zod schemas ──────────────────────────────────────────────────────
const changePlanSchema = z.object({
  action: z.literal("change_plan"),
  orgId: z.string().uuid(),
  plan: z.enum(["free", "starter", "pro", "business", "agency_25", "agency_50", "agency_100"]),
});

const terminateOrgSchema = z.object({
  action: z.literal("terminate_org"),
  orgId: z.string().uuid(),
});

const suspendOrgSchema = z.object({
  action: z.literal("suspend_org"),
  orgId: z.string().uuid(),
});

const reactivateOrgSchema = z.object({
  action: z.literal("reactivate_org"),
  orgId: z.string().uuid(),
});

const resetConversationsSchema = z.object({
  action: z.literal("reset_conversations"),
  orgId: z.string().uuid(),
});

const updateAffiliateSchema = z.object({
  action: z.literal("update_affiliate"),
  affiliateId: z.string().uuid(),
  status: z.enum(["pending", "active", "suspended"]).optional(),
  commissionRate: z.number().min(0).max(1).optional(),
});

const adminActionSchema = z.discriminatedUnion("action", [
  changePlanSchema,
  terminateOrgSchema,
  suspendOrgSchema,
  reactivateOrgSchema,
  resetConversationsSchema,
  updateAffiliateSchema,
]);

// ── POST handler ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const auth = await getAuthContext();
  if (!auth || !isAdmin(auth)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!db) {
    return NextResponse.json({ error: "DB not configured" }, { status: 503 });
  }

  const body = await req.json();
  const parsed = adminActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  switch (data.action) {
    case "change_plan":
      return handleChangePlan(data);
    case "terminate_org":
      return handleTerminateOrg(data);
    case "suspend_org":
      return handleSuspendOrg(data);
    case "reactivate_org":
      return handleReactivateOrg(data);
    case "reset_conversations":
      return handleResetConversations(data);
    case "update_affiliate":
      return handleUpdateAffiliate(data);
  }
}

// ── Handlers ─────────────────────────────────────────────────────────

async function handleChangePlan(data: z.infer<typeof changePlanSchema>) {
  const plan = data.plan as PlanName;
  await db!
    .update(organizations)
    .set({
      plan,
      conversationLimit: PLANS[plan].conversationLimit,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, data.orgId));

  return NextResponse.json({ success: true, plan });
}

async function handleTerminateOrg(data: z.infer<typeof terminateOrgSchema>) {
  const org = await db!.query.organizations.findFirst({
    where: eq(organizations.id, data.orgId),
  });
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  await db!.delete(organizations).where(eq(organizations.id, data.orgId));

  return NextResponse.json({ success: true, deleted: org.slug });
}

async function handleSuspendOrg(data: z.infer<typeof suspendOrgSchema>) {
  await db!
    .update(organizations)
    .set({ status: "suspended", updatedAt: new Date() })
    .where(eq(organizations.id, data.orgId));

  return NextResponse.json({ success: true });
}

async function handleReactivateOrg(data: z.infer<typeof reactivateOrgSchema>) {
  await db!
    .update(organizations)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(organizations.id, data.orgId));

  return NextResponse.json({ success: true });
}

async function handleResetConversations(
  data: z.infer<typeof resetConversationsSchema>
) {
  await db!
    .update(organizations)
    .set({
      currentPeriodConversations: 0,
      currentPeriodStart: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, data.orgId));

  return NextResponse.json({ success: true });
}

async function handleUpdateAffiliate(
  data: z.infer<typeof updateAffiliateSchema>
) {
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (data.status !== undefined) updates.status = data.status;
  if (data.commissionRate !== undefined)
    updates.commissionRate = data.commissionRate;

  await db!
    .update(affiliates)
    .set(updates)
    .where(eq(affiliates.id, data.affiliateId));

  return NextResponse.json({ success: true });
}
