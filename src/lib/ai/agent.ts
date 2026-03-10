import Anthropic from "@anthropic-ai/sdk";
import { sql, eq } from "drizzle-orm";
import type { OrgSettings, KnowledgeItem } from "../db/schema";
import { knowledgeItems } from "../db/schema";
import { db } from "../db";
import { generateEmbedding } from "./embeddings";

// ── Types ────────────────────────────────────────────────────────────
export type PageContext = {
  title?: string;
  url?: string;
  referrer?: string;
};

export type AgentInput = {
  message: string;
  conversationHistory: { role: "user" | "assistant"; content: string }[];
  knowledgeContext: KnowledgeItem[];
  orgSettings: OrgSettings;
  channel: "chat" | "email" | "sms" | "voice";
  pageContext?: PageContext;
  visitorContext?: string;
};

export type AgentResponse = {
  content: string;
  confidence: number;
  shouldEscalate: boolean;
  sourcesUsed: string[];
  suggestions: string[];
  sentiment: string;
  language: string;
};

export type StreamEvent =
  | { type: "meta"; conversationId: string }
  | { type: "delta"; text: string }
  | {
      type: "done";
      content: string;
      confidence: number;
      shouldEscalate: boolean;
      suggestions: string[];
      sentiment: string;
      language: string;
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

// ── RAG: semantic search (pgvector) ──────────────────────────────────
export async function searchKnowledgeSemantic(
  query: string,
  orgId: string,
  topK = 5
): Promise<KnowledgeItem[]> {
  if (!db) return [];

  const queryEmbedding = await generateEmbedding(query);
  if (!queryEmbedding) return [];

  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const results = await db
    .select()
    .from(knowledgeItems)
    .where(eq(knowledgeItems.orgId, orgId))
    .orderBy(sql`${knowledgeItems.embedding} <=> ${embeddingStr}::vector`)
    .limit(topK);

  // Filter out items without embeddings
  return results.filter((r) => r.embedding !== null);
}

// ── Hybrid search: try semantic first, fall back to keyword ──────────
export async function searchKnowledgeHybrid(
  query: string,
  orgId: string | null,
  items: KnowledgeItem[],
  topK = 5
): Promise<KnowledgeItem[]> {
  // Try semantic search first (requires DB, orgId, and embeddings)
  if (orgId) {
    const semanticResults = await searchKnowledgeSemantic(query, orgId, topK);
    if (semanticResults.length > 0) return semanticResults;
  }

  // Fall back to keyword search
  return searchKnowledge(query, items, topK);
}

// ── Build System Prompt ──────────────────────────────────────────────
function buildSystemPrompt(
  orgSettings: OrgSettings,
  knowledgeContext: KnowledgeItem[],
  channel: string,
  pageContext?: PageContext,
  visitorContext?: string
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

  const pageBlock = pageContext
    ? `\nPAGE CONTEXT (the customer is currently viewing):\n- Page title: ${pageContext.title || "unknown"}\n- URL: ${pageContext.url || "unknown"}${pageContext.referrer ? `\n- Referred from: ${pageContext.referrer}` : ""}\nUse this context to give more relevant answers. For example, if they're on a pricing page, proactively address pricing questions.`
    : "";

  const visitorBlock = visitorContext
    ? `\nRETURNING VISITOR CONTEXT:\n${visitorContext}\nAcknowledge their return naturally (e.g., "Welcome back!") but don't overdo it.`
    : "";

  return `You are a customer support AI agent. Your personality is: ${orgSettings.persona}.

CRITICAL RULES:
1. ONLY use information from the knowledge base provided below. Never make up information.
2. If the knowledge base does not contain an answer, say you don't have that information and offer to connect the customer with a human agent.
3. Be concise and helpful. Match the communication style appropriate for ${channel}.
4. At the end of your response, on a new line, output a confidence score in this exact format: [CONFIDENCE: 0.XX]
5. After the confidence score, suggest 2-3 natural follow-up questions the customer might ask, in this format: [SUGGESTIONS: "Question 1?" | "Question 2?" | "Question 3?"]
6. Output a sentiment reading of the customer's message: [SENTIMENT: positive|neutral|frustrated|angry]
   - When sentiment is frustrated or angry, lead with empathy before answering.
7. Respond in the same language the customer uses. Output: [LANGUAGE: xx] where xx is the ISO 639-1 code.

KNOWLEDGE BASE:
${knowledgeBlock}
${pageBlock}
${visitorBlock}

Remember: If you cannot answer from the knowledge base, set confidence below 0.5 and suggest escalation to a human agent.`;
}

// ── Parse Response Metadata ──────────────────────────────────────────
function parseConfidence(text: string): { text: string; confidence: number } {
  const match = text.match(/\[CONFIDENCE:\s*([\d.]+)\]/);
  const confidence = match ? parseFloat(match[1]) : 0.5;
  const cleaned = text.replace(/\[CONFIDENCE:\s*[\d.]+\]/, "").trim();
  return { text: cleaned, confidence: Math.min(1, Math.max(0, confidence)) };
}

function parseSuggestions(text: string): { text: string; suggestions: string[] } {
  const match = text.match(/\[SUGGESTIONS:\s*(.+?)\]/);
  let suggestions: string[] = [];
  if (match) {
    suggestions = match[1]
      .split("|")
      .map((s) => s.trim().replace(/^[""]|[""]$/g, ""))
      .filter((s) => s.length > 0);
  }
  const cleaned = text.replace(/\[SUGGESTIONS:\s*.+?\]/, "").trim();
  return { text: cleaned, suggestions };
}

function parseSentiment(text: string): { text: string; sentiment: string } {
  const match = text.match(/\[SENTIMENT:\s*(\w+)\]/);
  const sentiment = match ? match[1].toLowerCase() : "neutral";
  const cleaned = text.replace(/\[SENTIMENT:\s*\w+\]/, "").trim();
  return { text: cleaned, sentiment };
}

function parseLanguage(text: string): { text: string; language: string } {
  const match = text.match(/\[LANGUAGE:\s*(\w+)\]/);
  const language = match ? match[1].toLowerCase() : "en";
  const cleaned = text.replace(/\[LANGUAGE:\s*\w+\]/, "").trim();
  return { text: cleaned, language };
}

export function parseResponse(rawText: string): {
  content: string;
  confidence: number;
  suggestions: string[];
  sentiment: string;
  language: string;
} {
  const step1 = parseConfidence(rawText);
  const step2 = parseSuggestions(step1.text);
  const step3 = parseSentiment(step2.text);
  const step4 = parseLanguage(step3.text);

  return {
    content: step4.text,
    confidence: step1.confidence,
    suggestions: step2.suggestions,
    sentiment: step3.sentiment,
    language: step4.language,
  };
}

// ── Main Agent Function (non-streaming) ──────────────────────────────
export async function runAgent(input: AgentInput): Promise<AgentResponse> {
  const { message, conversationHistory, knowledgeContext, orgSettings, channel, pageContext, visitorContext } = input;

  const sourcesUsed = knowledgeContext.map((k) => k.title);
  const systemPrompt = buildSystemPrompt(orgSettings, knowledgeContext, channel, pageContext, visitorContext);

  const messages: { role: "user" | "assistant"; content: string }[] = [
    ...conversationHistory,
    { role: "user", content: message },
  ];

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

  const parsed = parseResponse(rawText);
  const shouldEscalate = parsed.confidence < orgSettings.confidenceThreshold;

  return {
    content: parsed.content,
    confidence: parsed.confidence,
    shouldEscalate,
    sourcesUsed,
    suggestions: parsed.suggestions,
    sentiment: parsed.sentiment,
    language: parsed.language,
  };
}

// ── Streaming Agent Function ─────────────────────────────────────────
export async function* runAgentStreaming(
  input: AgentInput
): AsyncGenerator<StreamEvent> {
  const { message, conversationHistory, knowledgeContext, orgSettings, channel, pageContext, visitorContext } = input;

  const sourcesUsed = knowledgeContext.map((k) => k.title);
  const systemPrompt = buildSystemPrompt(orgSettings, knowledgeContext, channel, pageContext, visitorContext);

  const msgs: { role: "user" | "assistant"; content: string }[] = [
    ...conversationHistory,
    { role: "user", content: message },
  ];

  // Demo mode: yield entire response as a single delta
  if (!anthropic) {
    const demo = getDemoResponse(message, knowledgeContext, orgSettings);
    yield { type: "delta", text: demo.content };
    yield {
      type: "done",
      content: demo.content,
      confidence: demo.confidence,
      shouldEscalate: demo.shouldEscalate,
      suggestions: demo.suggestions,
      sentiment: demo.sentiment,
      language: demo.language,
      sourcesUsed: demo.sourcesUsed,
    };
    return;
  }

  // Stream from Claude
  let fullText = "";

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: msgs,
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      const chunk = event.delta.text;
      fullText += chunk;
      yield { type: "delta", text: chunk };
    }
  }

  // Parse completed text
  const parsed = parseResponse(fullText);
  const shouldEscalate = parsed.confidence < orgSettings.confidenceThreshold;

  yield {
    type: "done",
    content: parsed.content,
    confidence: parsed.confidence,
    shouldEscalate,
    suggestions: parsed.suggestions,
    sentiment: parsed.sentiment,
    language: parsed.language,
    sourcesUsed,
  };
}

// ── Handoff Summary for Escalated Conversations ──────────────────────
export async function generateHandoffSummary(
  history: { role: "user" | "assistant"; content: string }[],
  currentMessage: string
): Promise<string | null> {
  if (!anthropic) return null;

  const transcript = [
    ...history.map((m) => `${m.role}: ${m.content}`),
    `user: ${currentMessage}`,
  ].join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    system:
      "You are summarizing a support conversation for a human agent handoff. Write 3-5 concise bullet points covering: what the customer needs, what was already tried, and their emotional state. Be brief and actionable.",
    messages: [{ role: "user", content: transcript }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  return text || null;
}

// ── Demo Mode (no API key) ───────────────────────────────────────────
function getDemoResponse(
  message: string,
  knowledgeContext: KnowledgeItem[],
  orgSettings: OrgSettings
): AgentResponse {
  const lowerMsg = message.toLowerCase();

  if (knowledgeContext.length === 0) {
    return {
      content:
        "I don't have specific information about that in my knowledge base. Let me connect you with a human agent who can help you better.",
      confidence: 0.3,
      shouldEscalate: true,
      sourcesUsed: [],
      suggestions: [
        "What services do you offer?",
        "How can I contact support?",
      ],
      sentiment: "neutral",
      language: "en",
    };
  }

  const topMatch = knowledgeContext[0];

  // Generate contextual suggestions based on knowledge category
  const suggestions = knowledgeContext
    .slice(1, 4)
    .map((k) => `Tell me about ${k.title.toLowerCase()}?`);
  if (suggestions.length === 0) {
    suggestions.push("Is there anything else I can help with?");
  }

  // Simple sentiment detection for demo mode
  let sentiment = "neutral";
  if (lowerMsg.match(/thanks|thank|great|awesome|perfect/)) sentiment = "positive";
  if (lowerMsg.match(/frustrated|annoyed|upset|terrible|worst/)) sentiment = "frustrated";
  if (lowerMsg.match(/angry|furious|unacceptable|ridiculous/)) sentiment = "angry";

  return {
    content: topMatch.content,
    confidence: 0.85,
    shouldEscalate: false,
    sourcesUsed: [topMatch.title],
    suggestions,
    sentiment,
    language: "en",
  };
}
