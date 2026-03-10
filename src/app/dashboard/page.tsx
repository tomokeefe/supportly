"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ConversationSummary = {
  id: string;
  status: "active" | "escalated" | "resolved";
  channel: string;
  customerName: string | null;
  customerEmail: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessage: { content: string; role: string; createdAt: string } | null;
  messageCount: number;
};

type Stats = {
  totalConversations: number;
  totalResolved: number;
  totalEscalated: number;
  resolutionRate: number;
  avgConfidence: number;
  activeConversations: number;
};

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  escalated: "bg-amber-100 text-amber-700",
  resolved: "bg-gray-100 text-gray-600",
};

export default function DashboardPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/conversations").then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
    ]).then(([convData, statsData]) => {
      setConversations(convData.conversations ?? []);
      setStats(statsData.summary);
      setLoading(false);
    });
  }, []);

  return (
    <div className="px-8 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-dark">Overview</h1>
        <p className="text-sm text-[--color-text-secondary] mt-1">
          Last 30 days
        </p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-border p-5 animate-pulse"
            >
              <div className="h-4 bg-taupe rounded w-24 mb-3" />
              <div className="h-8 bg-taupe rounded w-16" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-border p-5">
            <p className="text-sm text-[--color-text-secondary] mb-1">
              Total Conversations
            </p>
            <p className="stat-mono text-2xl text-dark">
              {stats.totalConversations.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <p className="text-sm text-[--color-text-secondary] mb-1">
              Resolution Rate
            </p>
            <p className="stat-mono text-2xl text-green-600">
              {(stats.resolutionRate * 100).toFixed(0)}%
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <p className="text-sm text-[--color-text-secondary] mb-1">
              Avg Confidence
            </p>
            <p className="stat-mono text-2xl text-vermillion">
              {(stats.avgConfidence * 100).toFixed(0)}%
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <p className="text-sm text-[--color-text-secondary] mb-1">
              Escalated
            </p>
            <p className="stat-mono text-2xl text-amber-600">
              {stats.totalEscalated.toLocaleString()}
            </p>
          </div>
        </div>
      ) : null}

      {/* Conversations List */}
      <div className="bg-white rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-dark">Recent Conversations</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-4">
                <div className="w-10 h-10 bg-taupe rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-taupe rounded w-32 mb-2" />
                  <div className="h-3 bg-taupe rounded w-64" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[--color-text-secondary] mb-2">
              No conversations yet
            </p>
            <p className="text-sm text-[--color-text-secondary]">
              Conversations will appear here once customers start chatting through your widget.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/dashboard/${conv.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-taupe/50 accent-hover"
              >
                <div className="w-10 h-10 rounded-full bg-taupe flex items-center justify-center text-sm font-medium text-dark flex-shrink-0">
                  {conv.customerName
                    ? conv.customerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-dark text-sm">
                      {conv.customerName ?? "Anonymous"}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[conv.status]}`}
                    >
                      {conv.status}
                    </span>
                    <span className="text-xs text-[--color-text-secondary] capitalize">
                      {conv.channel}
                    </span>
                  </div>
                  <p className="text-sm text-[--color-text-secondary] truncate">
                    {conv.lastMessage?.content ?? "No messages"}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-[--color-text-secondary]">
                    {new Date(conv.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-[--color-text-secondary]">
                    {conv.messageCount} msgs
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
