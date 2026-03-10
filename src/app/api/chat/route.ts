import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { runAgent, searchKnowledgeHybrid } from "@/lib/ai/agent";
import { db } from "@/lib/db";
import {
  organizations,
  knowledgeItems,
  conversations,
  messages,
  type OrgSettings,
  type KnowledgeItem,
} from "@/lib/db/schema";
import {
  demoKnowledge,
  getOrgSettings,
  demoMessages,
} from "@/lib/demo-data";
import { v4 as uuidv4 } from "uuid";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

const chatSchema = z.object({
  message: z.string().min(1).max(5000),
  conversationId: z.string().nullable().optional(),
  orgSlug: z.string().default("sunrise-pm"),
  channel: z.enum(["chat", "email", "sms", "voice"]).default("chat"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = chatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { message, conversationId, channel, orgSlug } = parsed.data;

    // ── Resolve org, knowledge, and settings ──
    let orgSettings: OrgSettings;
    let knowledge: KnowledgeItem[] = [];
    let orgId: string | null = null;
    let orgConversationLimit = 999999;
    let orgCurrentConversations = 0;

    if (db) {
      // Real DB: look up org by slug
      const org = await db.query.organizations.findFirst({
        where: eq(organizations.slug, orgSlug),
      });

      if (!org) {
        return NextResponse.json(
          { error: "Organization not found" },
          { status: 404 }
        );
      }

      orgId = org.id;
      orgSettings = org.settings as OrgSettings;
      orgConversationLimit = org.conversationLimit;
      orgCurrentConversations = org.currentPeriodConversations;

      // Load knowledge items for this org
      knowledge = await db.query.knowledgeItems.findMany({
        where: eq(knowledgeItems.orgId, org.id),
      });
    } else {
      // Demo fallback
      orgSettings = getOrgSettings();
      knowledge = demoKnowledge;
    }

    // ── Check conversation limit ──
    if (!conversationId && orgCurrentConversations >= orgConversationLimit) {
      return NextResponse.json(
        {
          error: "Conversation limit reached",
          message: {
            role: "system",
            content:
              "This business has reached their conversation limit for this billing period. Please try again later or contact the business directly.",
          },
        },
        { status: 429 }
      );
    }

    // ── Find relevant knowledge ──
    const relevantKnowledge = await searchKnowledgeHybrid(message, orgId, knowledge);

    // ── Build conversation history ──
    const history: { role: "user" | "assistant"; content: string }[] = [];
    if (conversationId) {
      if (db) {
        const existingMessages = await db.query.messages.findMany({
          where: eq(messages.conversationId, conversationId),
          orderBy: (m, { asc }) => [asc(m.createdAt)],
        });
        for (const msg of existingMessages) {
          if (msg.role === "user" || msg.role === "assistant") {
            history.push({ role: msg.role, content: msg.content });
          }
        }
      } else {
        const existing = demoMessages.filter(
          (m) => m.conversationId === conversationId && m.role !== "system"
        );
        for (const msg of existing) {
          if (msg.role === "user" || msg.role === "assistant") {
            history.push({ role: msg.role, content: msg.content });
          }
        }
      }
    }

    // ── Run agent ──
    const response = await runAgent({
      message,
      conversationHistory: history,
      knowledgeContext: relevantKnowledge,
      orgSettings,
      channel,
    });

    // ── Generate IDs ──
    const convId = conversationId ?? uuidv4();
    const messageId = uuidv4();

    // ── Persist to DB ──
    if (db && orgId) {
      if (!conversationId) {
        // Create new conversation
        await db.insert(conversations).values({
          id: convId,
          orgId,
          status: response.shouldEscalate ? "escalated" : "active",
          channel,
        });

        // Increment conversation counter for this org
        await db
          .update(organizations)
          .set({
            currentPeriodConversations: sql`${organizations.currentPeriodConversations} + 1`,
          })
          .where(eq(organizations.id, orgId));
      }

      // Save user message
      await db.insert(messages).values({
        conversationId: convId,
        role: "user",
        content: message,
      });

      // Save assistant message
      await db.insert(messages).values({
        id: messageId,
        conversationId: convId,
        role: "assistant",
        content: response.content,
        confidence: response.confidence,
      });

      // If escalated, save system message, update conversation, and notify
      if (response.shouldEscalate) {
        const escalationEmail = orgSettings.escalationEmail;

        await db.insert(messages).values({
          conversationId: convId,
          role: "system",
          content: escalationEmail
            ? `Conversation escalated to human agent (${escalationEmail}) due to low confidence.`
            : "Conversation escalated to human agent due to low confidence.",
        });
        await db
          .update(conversations)
          .set({ status: "escalated", updatedAt: new Date() })
          .where(eq(conversations.id, convId));

        // Send escalation email notification (async, non-blocking)
        if (escalationEmail) {
          sendEscalationNotification({
            to: escalationEmail,
            conversationId: convId,
            customerMessage: message,
            aiResponse: response.content,
            confidence: response.confidence,
          }).catch((err) =>
            console.error("Escalation email failed:", err)
          );
        }
      } else {
        await db
          .update(conversations)
          .set({ updatedAt: new Date() })
          .where(eq(conversations.id, convId));
      }
    }

    return NextResponse.json({
      conversationId: convId,
      message: {
        id: messageId,
        role: "assistant",
        content: response.content,
        confidence: response.confidence,
        createdAt: new Date().toISOString(),
      },
      shouldEscalate: response.shouldEscalate,
      sourcesUsed: response.sourcesUsed,
      suggestions: response.suggestions,
      sentiment: response.sentiment,
      language: response.language,
    }, { headers: CORS_HEADERS });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── Escalation Email Notification ─────────────────────────────────────
// Pluggable: replace with Resend, SendGrid, SES, etc.
async function sendEscalationNotification(params: {
  to: string;
  conversationId: string;
  customerMessage: string;
  aiResponse: string;
  confidence: number;
}) {
  // TODO: Wire up a real email provider (Resend recommended).
  // For now, log the escalation so it's visible in server logs.
  console.log(
    `[ESCALATION] Notifying ${params.to} — conversation ${params.conversationId} ` +
      `(confidence: ${params.confidence.toFixed(2)})`
  );
}
