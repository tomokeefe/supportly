import { NextRequest } from "next/server";
import { z } from "zod";
import { eq, sql, desc } from "drizzle-orm";
import {
  runAgentStreaming,
  searchKnowledgeHybrid,
  generateHandoffSummary,
} from "@/lib/ai/agent";
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

export const runtime = "nodejs";

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
  pageContext: z
    .object({
      title: z.string().optional(),
      url: z.string().optional(),
      referrer: z.string().optional(),
    })
    .optional(),
  visitorId: z.string().optional(),
});

function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = chatSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request", details: parsed.error.flatten() }),
        { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    const { message, conversationId, channel, orgSlug, pageContext, visitorId } =
      parsed.data;

    // ── Resolve org, knowledge, and settings ──
    let orgSettings: OrgSettings;
    let knowledge: KnowledgeItem[] = [];
    let orgId: string | null = null;
    let orgConversationLimit = 999999;
    let orgCurrentConversations = 0;

    if (db) {
      const org = await db.query.organizations.findFirst({
        where: eq(organizations.slug, orgSlug),
      });

      if (!org) {
        return new Response(
          JSON.stringify({ error: "Organization not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
        );
      }

      orgId = org.id;
      orgSettings = org.settings as OrgSettings;
      orgConversationLimit = org.conversationLimit;
      orgCurrentConversations = org.currentPeriodConversations;

      knowledge = await db.query.knowledgeItems.findMany({
        where: eq(knowledgeItems.orgId, org.id),
      });
    } else {
      orgSettings = getOrgSettings();
      knowledge = demoKnowledge;
    }

    // ── Check conversation limit ──
    if (!conversationId && orgCurrentConversations >= orgConversationLimit) {
      return new Response(
        JSON.stringify({
          error: "Conversation limit reached",
          message:
            "This business has reached their conversation limit. Please try again later.",
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
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

    // ── Returning visitor context ──
    let visitorContext: string | undefined;
    if (visitorId && db && orgId && !conversationId) {
      const prevConvos = await db.query.conversations.findMany({
        where: eq(conversations.orgId, orgId),
        orderBy: [desc(conversations.createdAt)],
        limit: 20,
      });

      // Filter by visitorId in metadata
      const visitorConvos = prevConvos.filter(
        (c) => (c.metadata as Record<string, unknown>)?.visitorId === visitorId
      );

      if (visitorConvos.length > 0) {
        const recentConvoIds = visitorConvos.slice(0, 2).map((c) => c.id);
        const prevMessages: string[] = [];
        for (const cId of recentConvoIds) {
          const lastMsg = await db.query.messages.findFirst({
            where: eq(messages.conversationId, cId),
            orderBy: [desc(messages.createdAt)],
          });
          if (lastMsg) {
            prevMessages.push(`Previous topic: "${lastMsg.content}"`);
          }
        }
        if (prevMessages.length > 0) {
          visitorContext = `This is a returning visitor (${visitorConvos.length} previous conversations).\n${prevMessages.join("\n")}`;
        }
      }
    }

    // ── Generate IDs ──
    const convId = conversationId ?? uuidv4();

    // ── Stream response ──
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send meta event with conversation ID
          controller.enqueue(encoder.encode(sseEvent("meta", { conversationId: convId })));

          const generator = runAgentStreaming({
            message,
            conversationHistory: history,
            knowledgeContext: relevantKnowledge,
            orgSettings,
            channel,
            pageContext,
            visitorContext,
          });

          for await (const event of generator) {
            if (event.type === "delta") {
              controller.enqueue(encoder.encode(sseEvent("delta", { text: event.text })));
            } else if (event.type === "done") {
              // ── Persist to DB ──
              if (db && orgId) {
                if (!conversationId) {
                  await db.insert(conversations).values({
                    id: convId,
                    orgId,
                    status: event.shouldEscalate ? "escalated" : "active",
                    channel,
                    metadata: visitorId ? { visitorId } : {},
                  });

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

                // Save assistant message with metadata
                const messageId = uuidv4();
                await db.insert(messages).values({
                  id: messageId,
                  conversationId: convId,
                  role: "assistant",
                  content: event.content,
                  confidence: event.confidence,
                  metadata: {
                    sentiment: event.sentiment,
                    language: event.language,
                  },
                });

                // Handle escalation
                if (event.shouldEscalate) {
                  // Generate handoff summary
                  const handoffSummary = await generateHandoffSummary(
                    history,
                    message
                  );

                  const escalationEmail = orgSettings.escalationEmail;
                  await db.insert(messages).values({
                    conversationId: convId,
                    role: "system",
                    content: escalationEmail
                      ? `Conversation escalated to human agent (${escalationEmail}).`
                      : "Conversation escalated to human agent.",
                  });
                  await db
                    .update(conversations)
                    .set({
                      status: "escalated",
                      metadata: handoffSummary
                        ? { ...(visitorId ? { visitorId } : {}), handoffSummary }
                        : visitorId
                          ? { visitorId }
                          : {},
                      updatedAt: new Date(),
                    })
                    .where(eq(conversations.id, convId));
                } else {
                  await db
                    .update(conversations)
                    .set({ updatedAt: new Date() })
                    .where(eq(conversations.id, convId));
                }
              }

              // Send done event with all metadata
              controller.enqueue(
                encoder.encode(
                  sseEvent("done", {
                    content: event.content,
                    confidence: event.confidence,
                    shouldEscalate: event.shouldEscalate,
                    suggestions: event.suggestions,
                    sentiment: event.sentiment,
                    language: event.language,
                    sourcesUsed: event.sourcesUsed,
                  })
                )
              );
            }
          }
        } catch (err) {
          console.error("Streaming error:", err);
          controller.enqueue(
            encoder.encode(sseEvent("error", { message: "Internal server error" }))
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Chat stream API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }
}
