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
      setConversations(convData.conversations);
      setStats(statsData.summary);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">Supportly</span>
            </Link>
            <span className="text-sm text-gray-400">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/demo" className="text-sm text-gray-600 hover:text-gray-900">Demo</Link>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
              SP
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Sunrise Property Management</h1>
          <p className="text-sm text-gray-500 mt-1">Last 30 days overview</p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
                <div className="h-8 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Total Conversations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalConversations.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Resolution Rate</p>
              <p className="text-2xl font-bold text-green-600">{(stats.resolutionRate * 100).toFixed(0)}%</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Avg Confidence</p>
              <p className="text-2xl font-bold text-blue-600">{(stats.avgConfidence * 100).toFixed(0)}%</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">Escalated</p>
              <p className="text-2xl font-bold text-amber-600">{stats.totalEscalated.toLocaleString()}</p>
            </div>
          </div>
        ) : null}

        {/* Conversations List */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Conversations</h2>
          </div>
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-64" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/dashboard/${conv.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
                    {conv.customerName
                      ? conv.customerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      : "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-gray-900 text-sm">
                        {conv.customerName ?? "Anonymous"}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[conv.status]}`}>
                        {conv.status}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">{conv.channel}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessage?.content ?? "No messages"}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {new Date(conv.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-gray-400">{conv.messageCount} msgs</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
