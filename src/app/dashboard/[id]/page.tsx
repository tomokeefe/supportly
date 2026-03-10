"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  confidence: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

type Conversation = {
  id: string;
  status: "active" | "escalated" | "resolved";
  channel: string;
  customerName: string | null;
  customerEmail: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  escalated: "bg-amber-100 text-amber-700",
  resolved: "bg-gray-100 text-gray-600",
};

const SENTIMENT_STYLES: Record<string, { color: string; label: string }> = {
  positive: { color: "bg-green-100 text-green-700", label: "Positive" },
  neutral: { color: "bg-gray-100 text-gray-600", label: "Neutral" },
  frustrated: { color: "bg-orange-100 text-orange-700", label: "Frustrated" },
  angry: { color: "bg-red-100 text-red-700", label: "Angry" },
};

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const style = SENTIMENT_STYLES[sentiment] ?? SENTIMENT_STYLES.neutral;
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${style.color}`}>
      {style.label}
    </span>
  );
}

export default function ConversationDetailPage() {
  const params = useParams();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/conversations/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setConversation(data.conversation);
        setMessages(data.messages ?? []);
        setLoading(false);
      });
  }, [params.id]);

  async function updateStatus(status: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/conversations/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setConversation((prev) =>
          prev ? { ...prev, status: status as Conversation["status"] } : prev
        );
      }
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-[--color-text-secondary]">
          Loading...
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-[--color-text-secondary] mb-4">
            Conversation not found
          </p>
          <Link
            href="/dashboard"
            className="text-vermillion hover:text-[#C7412A] text-sm font-medium accent-hover"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="text-[--color-text-secondary] hover:text-dark accent-hover"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-dark">
              {conversation.customerName ?? "Anonymous"}
            </h1>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[conversation.status]}`}
            >
              {conversation.status}
            </span>
          </div>
          <p className="text-xs text-[--color-text-secondary] mt-0.5">
            {conversation.customerEmail ?? "No email"} &middot;{" "}
            <span className="capitalize">{conversation.channel}</span> &middot;{" "}
            {new Date(conversation.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {conversation.status !== "resolved" && (
            <button
              onClick={() => updateStatus("resolved")}
              disabled={updating}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-100 text-green-700 hover:bg-green-200 accent-hover disabled:opacity-50"
            >
              Resolve
            </button>
          )}
          {conversation.status === "active" && (
            <button
              onClick={() => updateStatus("escalated")}
              disabled={updating}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 accent-hover disabled:opacity-50"
            >
              Escalate
            </button>
          )}
          {conversation.status === "resolved" && (
            <button
              onClick={() => updateStatus("active")}
              disabled={updating}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-taupe text-dark hover:bg-border accent-hover disabled:opacity-50"
            >
              Reopen
            </button>
          )}
        </div>
      </div>

      {/* Handoff Summary (for escalated conversations) */}
      {conversation.status === "escalated" &&
        conversation.metadata &&
        !!(conversation.metadata as Record<string, unknown>).handoffSummary && (
          <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <h3 className="text-sm font-semibold text-amber-800">Handoff Summary</h3>
            </div>
            <p className="text-sm text-amber-700 whitespace-pre-wrap">
              {(conversation.metadata as Record<string, unknown>).handoffSummary as string}
            </p>
          </div>
        )}

      {/* Messages */}
      <div className="space-y-4">
        {messages.map((msg) => {
          const sentiment = (msg.metadata as Record<string, unknown>)?.sentiment as string | undefined;
          return (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user"
                  ? "justify-end"
                  : msg.role === "system"
                    ? "justify-center"
                    : "justify-start"
              }`}
            >
              <div
                className={`max-w-lg rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-dark text-cream"
                    : msg.role === "system"
                      ? "bg-amber-50 text-amber-700 border border-amber-200 text-sm"
                      : "bg-white border border-border text-dark"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <div className="flex items-center justify-between mt-2 gap-4">
                  <span
                    className={`text-xs ${
                      msg.role === "user"
                        ? "text-cream/60"
                        : "text-[--color-text-secondary]"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    {sentiment && sentiment !== "neutral" && (
                      <SentimentBadge sentiment={sentiment} />
                    )}
                    {msg.confidence !== null && (
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          msg.confidence >= 0.75
                            ? "bg-green-100 text-green-700"
                            : msg.confidence >= 0.5
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {(msg.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
