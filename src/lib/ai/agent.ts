import Anthropic from "@anthropic-ai/sdk";
import type { OrgSettings, KnowledgeItem } from "../db/schema";

// ── Types ────────────────────────────────────────────────────────────
export type AgentInput = {
  message: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  knowledgeContext: KnowledgeItem[];
  orgSettings: OrgSettings;
  channel: "chat" | "email" | "sms" | "voice";
};

export type AgentResponse = {
  content: string;
  confidence: number;
  shouldEscalate: boolean;
  sourcesUsed: string[];
};

// ── Claude Client ────────────────────────────────────────────────────
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// ── RAG: keyword search (placeholder for pgvector) ───────────────────
export function searchKnowledge(
  query: string,
  items: KnowledgeItem[],
  topK = 5
): KnowledgeItem[] {
  const queryTerms = query.toLowerCase().split(/\s+/);

  const scored = items.map((item) => {
    const text = `${item.title} ${item.content} ${item.category ?? ""}`.toLowerCase();
    let score = 0;
    for (const term of queryTerms) {
      if (term.length < 3) continue;
      const regex = new RegExp(term, "g");
      const matches = text.match(regex);
      score += matches ? matches.length : 0;
    }
    return { item, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.item);
}

// ── Build System Prompt ──────────────────────────────────────────────
function buildSystemPrompt(
  orgSettings: OrgSettings,
  knowledgeContext: KnowledgeItem[],
  channel: string
): string {
  const knowledgeBlock =
    knowledgeContext.length > 0
      ? knowledgeContext
          .map(
            (k, i) =>
              `[Source ${i + 1}: ${k.title}]\n${k.content}`
          )
          .join("\n\n")
      : "No relevant knowledge base articles found.";

  return `You are a customer support AI agent. Your personality is: ${orgSettings.persona}.

CRITICAL RULES:
1. ONLY use information from the knowledge base provided below. Never make up information.
2. If the knowledge base does not contain an answer, say you don't have that information and offer to connect the customer with a human agent.
3. Be concise and helpful. Match the communication style appropriate for ${channel}.
4. At the end of your response, on a new line, output a confidence score in this exact format: [CONFIDENCE: 0.XX] where 0.XX is a number between 0.00 and 1.00 representing how confident you are that your answer is accurate and complete based on the knowledge base.

KNOWLEDGE BASE:
${knowledgeBlock}

Remember: If you cannot answer from the knowledge base, set confidence below 0.5 and suggest escalation to a human agent.`;
}

// ── Parse Confidence from Response ───────────────────────────────────
function parseConfidence(text: string): { content: string; confidence: number } {
  const match = text.match(/\[CONFIDENCE:\s*([\d.]+)\]/);
  const confidence = match ? parseFloat(match[1]) : 0.5;
  const content = text.replace(/\[CONFIDENCE:\s*[\d.]+\]/, "").trim();
  return { content, confidence: Math.min(1, Math.max(0, confidence)) };
}

// ── Main Agent Function ──────────────────────────────────────────────
export async function runAgent(input: AgentInput): Promise<AgentResponse> {
  const { message, conversationHistory, knowledgeContext, orgSettings, channel } = input;

  // Find relevant sources
  const sourcesUsed = knowledgeContext.map((k) => k.title);

  const systemPrompt = buildSystemPrompt(orgSettings, knowledgeContext, channel);

  const messages: { role: "user" | "assistant"; content: string }[] = [
    ...conversationHistory,
    { role: "user", content: message },
  ];

  // If no API key, return a demo response
  if (!anthropic) {
    return getDemoResponse(message, knowledgeContext, orgSettings);
  }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const rawText =
    response.content[0].type === "text" ? response.content[0].text : "";

  const { content, confidence } = parseConfidence(rawText);
  const shouldEscalate = confidence < orgSettings.confidenceThreshold;

  return { content, confidence, shouldEscalate, sourcesUsed };
}

// ── Demo Mode (no API key) ───────────────────────────────────────────
function getDemoResponse(
  message: string,
  knowledgeContext: KnowledgeItem[],
  orgSettings: OrgSettings
): AgentResponse {
  if (knowledgeContext.length === 0) {
    return {
      content:
        "I don't have specific information about that in my knowledge base. Let me connect you with a human agent who can help you better.",
      confidence: 0.3,
      shouldEscalate: true,
      sourcesUsed: [],
    };
  }

  const topMatch = knowledgeContext[0];
  return {
    content: topMatch.content,
    confidence: 0.85,
    shouldEscalate: false,
    sourcesUsed: [topMatch.title],
  };
}
