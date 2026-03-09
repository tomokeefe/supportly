import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runAgent, searchKnowledge } from "@/lib/ai/agent";
import { demoKnowledge, demoOrg, getOrgSettings, demoConversations, demoMessages } from "@/lib/demo-data";
import { v4 as uuidv4 } from "uuid";

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

    const { message, conversationId, channel } = parsed.data;
    const orgSettings = getOrgSettings();

    // Find relevant knowledge
    const relevantKnowledge = searchKnowledge(message, demoKnowledge);

    // Build conversation history from existing messages
    const history: { role: "user" | "assistant"; content: string }[] = [];
    if (conversationId) {
      const existing = demoMessages.filter(
        (m) => m.conversationId === conversationId && m.role !== "system"
      );
      for (const msg of existing) {
        if (msg.role === "user" || msg.role === "assistant") {
          history.push({ role: msg.role, content: msg.content });
        }
      }
    }

    // Run agent
    const response = await runAgent({
      message,
      conversationHistory: history,
      knowledgeContext: relevantKnowledge,
      orgSettings,
      channel,
    });

    // Generate IDs for new conversation if needed
    const convId = conversationId ?? uuidv4();
    const messageId = uuidv4();

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
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
