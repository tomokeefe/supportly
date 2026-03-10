import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { affiliates } from "@/lib/db/schema";

const applySchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  company: z.string().max(255).optional(),
  paypalEmail: z.string().email().max(255).optional(),
});

function generateReferralCode(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${slug}-${suffix}`;
}

// POST: Apply to become an affiliate
export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json(
      { error: "Not available in demo mode" },
      { status: 503 }
    );
  }

  const body = await req.json();
  const parsed = applySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Check if email already registered
  const existing = await db.query.affiliates.findFirst({
    where: eq(affiliates.email, parsed.data.email),
  });

  if (existing) {
    return NextResponse.json(
      { error: "This email is already registered as an affiliate" },
      { status: 409 }
    );
  }

  const referralCode = generateReferralCode(parsed.data.name);

  const [affiliate] = await db
    .insert(affiliates)
    .values({
      name: parsed.data.name,
      email: parsed.data.email,
      company: parsed.data.company,
      paypalEmail: parsed.data.paypalEmail,
      referralCode,
    })
    .returning();

  return NextResponse.json(
    {
      affiliate: {
        id: affiliate.id,
        name: affiliate.name,
        email: affiliate.email,
        referralCode: affiliate.referralCode,
        status: affiliate.status,
      },
    },
    { status: 201 }
  );
}
