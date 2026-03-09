"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  confidence: number | null;
  createdAt: string;
};

type Conversation = {
  id: string;
  status: "active" | "escalated" | "resolved";
  channel: string;
  customerName: string | null;
  customerEmail: string | null;
  createdAt: string;
};

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  escalated: "bg-amber-100 text-amber-700",
  resolved: "bg-gray-100 text-gray-600",
};

export default function ConversationDetailPage() {
  const params = useParams();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/conversations/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setConversation(data.conversation);
        setMessages(data.messages);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Conversation not found</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 text-sm">
                  {conversation.customerName ?? "Anonymous"}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[conversation.status]}`}>
                  {conversation.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {conversation.customerEmail ?? "No email"} &middot; {conversation.channel} &middot;{" "}
                {new Date(conversation.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </nav>

      {/* Messages */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {messages.map((msg) => (
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
                    ? "bg-blue-600 text-white"
                    : msg.role === "system"
                    ? "bg-amber-50 text-amber-700 border border-amber-200 text-sm"
                    : "bg-white border border-gray-200 text-gray-800"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <div className="flex items-center justify-between mt-2 gap-4">
                  <span
                    className={`text-xs ${
                      msg.role === "user" ? "text-blue-200" : "text-gray-400"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
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
                      {(msg.confidence * 100).toFixed(0)}% confidence
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
