"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  VolumeChart,
  ResolutionChart,
  ConfidenceChart,
  PeakHoursChart,
  ChannelChart,
  EscalationChart,
} from "@/components/charts";
import type { PlanName } from "@/lib/plans";

// ── Types ──
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

type DailyData = {
  date: string;
  conversationsCount: number;
  resolvedCount: number;
  escalatedCount: number;
};

type HourlyData = { hour: number; count: number };
type ChannelData = { channel: string; count: number };
type ConfidenceData = { date: string; avgConfidence: number };

type OrgInfo = {
  name: string;
  plan?: PlanName;
  slug?: string;
};

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  escalated: "bg-amber-100 text-amber-700",
  resolved: "bg-gray-100 text-gray-600",
};

const PLAN_TIERS: PlanName[] = ["free", "starter", "pro", "business"];

function planAtLeast(current: PlanName | undefined, minimum: PlanName): boolean {
  if (!current) return false;
  return PLAN_TIERS.indexOf(current) >= PLAN_TIERS.indexOf(minimum);
}

// ── Lock Overlay ──
function LockedOverlay({ requiredPlan }: { requiredPlan: string }) {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center z-10">
      <svg className="w-8 h-8 text-[--color-text-secondary] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
      <p className="text-sm font-medium text-dark mb-1">
        {requiredPlan} plan required
      </p>
      <Link
        href="/dashboard/billing"
        className="text-xs text-vermillion hover:underline font-medium"
      >
        Upgrade to unlock
      </Link>
    </div>
  );
}

// ── Chart Card Wrapper ──
function ChartCard({
  title,
  description,
  children,
  locked,
  requiredPlan,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  locked?: boolean;
  requiredPlan?: string;
}) {
  return (
    <div className="relative bg-white rounded-xl border border-border p-5">
      {locked && requiredPlan && <LockedOverlay requiredPlan={requiredPlan} />}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-dark">{title}</h3>
        {description && (
          <p className="text-xs text-[--color-text-secondary] mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Empty State Component ──
function EmptyState() {
  return (
    <div className="px-8 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-dark">Welcome to Resolvly</h1>
        <p className="text-sm text-[--color-text-secondary] mt-1">
          Your AI support agent is ready. Here&apos;s how to get started.
        </p>
      </div>

      {/* Getting started steps */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="w-10 h-10 rounded-full bg-vermillion/10 flex items-center justify-center mb-4">
            <span className="text-vermillion font-semibold text-sm">1</span>
          </div>
          <h3 className="font-semibold text-dark mb-2 text-sm">Add knowledge</h3>
          <p className="text-xs text-[--color-text-secondary] leading-relaxed mb-4">
            Upload your FAQs, docs, or policies so your agent knows how to answer customer questions.
          </p>
          <Link
            href="/dashboard/knowledge"
            className="text-xs font-medium text-vermillion hover:underline"
          >
            Go to Knowledge Base &rarr;
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <div className="w-10 h-10 rounded-full bg-vermillion/10 flex items-center justify-center mb-4">
            <span className="text-vermillion font-semibold text-sm">2</span>
          </div>
          <h3 className="font-semibold text-dark mb-2 text-sm">Install the widget</h3>
          <p className="text-xs text-[--color-text-secondary] leading-relaxed mb-4">
            Add one line of code to your website and the chat widget appears automatically.
          </p>
          <Link
            href="/dashboard/settings"
            className="text-xs font-medium text-vermillion hover:underline"
          >
            Get embed code &rarr;
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <div className="w-10 h-10 rounded-full bg-vermillion/10 flex items-center justify-center mb-4">
            <span className="text-vermillion font-semibold text-sm">3</span>
          </div>
          <h3 className="font-semibold text-dark mb-2 text-sm">Watch it work</h3>
          <p className="text-xs text-[--color-text-secondary] leading-relaxed mb-4">
            Conversations and analytics will appear here as customers start chatting with your agent.
          </p>
          <Link
            href="/demo"
            className="text-xs font-medium text-vermillion hover:underline"
          >
            Try the live demo &rarr;
          </Link>
        </div>
      </div>

      {/* Empty conversations card */}
      <div className="bg-white rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-dark">Recent Conversations</h2>
        </div>
        <div className="py-16 text-center">
          <svg className="w-12 h-12 mx-auto text-[--color-text-secondary]/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
          <p className="text-[--color-text-secondary] mb-2 font-medium">
            No conversations yet
          </p>
          <p className="text-sm text-[--color-text-secondary] max-w-sm mx-auto">
            Once you install the chat widget on your website, conversations will appear here in real time.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ──
export default function DashboardPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [daily, setDaily] = useState<DailyData[]>([]);
  const [hourly, setHourly] = useState<HourlyData[]>([]);
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [confidenceTrend, setConfidenceTrend] = useState<ConfidenceData[]>([]);
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/conversations").then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/org").then((r) => r.json()),
    ]).then(([convData, statsData, orgData]) => {
      // If user is signed in but has no org, redirect to onboarding
      if (orgData.redirect) {
        router.push(orgData.redirect);
        return;
      }

      const convs = convData.conversations ?? [];
      setConversations(convs);
      setStats(statsData.summary);
      setDaily(statsData.daily ?? []);
      setHourly(statsData.hourly ?? []);
      setChannels(statsData.channels ?? []);
      setConfidenceTrend(statsData.confidenceTrend ?? []);
      if (orgData.org) setOrg(orgData.org);

      // Show empty state when there are zero conversations AND zero stats
      const totalConvs = statsData.summary?.totalConversations ?? 0;
      setIsEmpty(convs.length === 0 && totalConvs === 0);
      setLoading(false);
    });
  }, [router]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="px-8 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="h-7 bg-taupe rounded w-40 animate-pulse mb-2" />
          <div className="h-4 bg-taupe rounded w-24 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse">
              <div className="h-4 bg-taupe rounded w-24 mb-3" />
              <div className="h-8 bg-taupe rounded w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse h-80" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state for brand-new users
  if (isEmpty) {
    return <EmptyState />;
  }

  const plan = org?.plan;
  const hasBasicAnalytics = planAtLeast(plan, "starter");
  const hasAdvancedAnalytics = planAtLeast(plan, "pro");

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
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Conversations"
            value={stats.totalConversations.toLocaleString()}
          />
          <StatCard
            label="Resolution Rate"
            value={`${(stats.resolutionRate * 100).toFixed(0)}%`}
            color="text-green-600"
          />
          <StatCard
            label="Avg Confidence"
            value={`${(stats.avgConfidence * 100).toFixed(0)}%`}
            color="text-vermillion"
          />
          <StatCard
            label="Escalated"
            value={stats.totalEscalated.toLocaleString()}
            color="text-amber-600"
          />
        </div>
      )}

      {/* ── Basic Analytics (Starter+) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Conversation Volume"
          description="Daily conversations vs. resolved"
          locked={!hasBasicAnalytics}
          requiredPlan="Starter"
        >
          <VolumeChart data={daily} />
        </ChartCard>

        <ChartCard
          title="Resolution Rate"
          description="Percentage resolved by day"
          locked={!hasBasicAnalytics}
          requiredPlan="Starter"
        >
          <ResolutionChart data={daily} />
        </ChartCard>
      </div>

      {/* ── Advanced Analytics (Pro+) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard
          title="Confidence Trend"
          description="Average AI confidence over time"
          locked={!hasAdvancedAnalytics}
          requiredPlan="Pro"
        >
          <ConfidenceChart data={confidenceTrend} />
        </ChartCard>

        <ChartCard
          title="Peak Hours"
          description="When your customers reach out"
          locked={!hasAdvancedAnalytics}
          requiredPlan="Pro"
        >
          <PeakHoursChart data={hourly} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <ChartCard
          title="Channel Breakdown"
          description="Conversations by channel"
          locked={!hasAdvancedAnalytics}
          requiredPlan="Pro"
        >
          <ChannelChart data={channels} />
        </ChartCard>

        <ChartCard
          title="Escalation Patterns"
          description="Daily escalations to human agents"
          locked={!hasAdvancedAnalytics}
          requiredPlan="Pro"
        >
          <EscalationChart data={daily} />
        </ChartCard>
      </div>

      {/* Conversations List */}
      <div className="bg-white rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-dark">Recent Conversations</h2>
          <span className="text-xs text-[--color-text-secondary]">
            {stats?.activeConversations ?? 0} active
          </span>
        </div>
        {conversations.length === 0 ? (
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
            {conversations.slice(0, 8).map((conv) => (
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

// ── Stat Card ──
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <p className="text-sm text-[--color-text-secondary] mb-1">{label}</p>
      <p className={`stat-mono text-2xl ${color ?? "text-dark"}`}>{value}</p>
    </div>
  );
}
