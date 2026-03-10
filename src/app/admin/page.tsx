"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ResolvlyLogo } from "@/components/resolvly-logo";

type AdminData = {
  stats: {
    totalOrgs: number;
    paidOrgs: number;
    totalConversations: number;
    mrr: number;
    totalAffiliates: number;
  };
  organizations: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    conversationLimit: number;
    currentPeriodConversations: number;
    stripeCustomerId: string | null;
    affiliateCode: string | null;
    totalConversations: number;
    createdAt: string;
  }[];
  affiliates: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    referralCode: string;
    commissionRate: number;
    status: string;
    totalEarned: number;
    totalPaid: number;
    referrals: { total: number; converted: number };
    createdAt: string;
  }[];
};

const PLAN_BADGE: Record<string, string> = {
  free: "bg-gray-100 text-gray-600",
  starter: "bg-blue-100 text-blue-700",
  pro: "bg-vermillion/10 text-vermillion",
  business: "bg-amber-100 text-amber-700",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  active: "bg-green-100 text-green-700",
  suspended: "bg-red-100 text-red-700",
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <p className="text-sm text-[--color-text-secondary] mb-1">{label}</p>
      <p className="stat-mono text-3xl text-dark">{value}</p>
    </div>
  );
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"orgs" | "affiliates">("orgs");

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => {
        if (r.status === 403) throw new Error("Access denied. Admin only.");
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Link href="/dashboard" className="text-sm text-vermillion hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-[--color-text-secondary]">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <ResolvlyLogo size="md" />
            </Link>
            <span className="text-xs font-medium bg-dark text-cream px-2.5 py-0.5 rounded-full">
              Admin
            </span>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-[--color-text-secondary] hover:text-dark"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Organizations" value={String(data.stats.totalOrgs)} />
          <StatCard label="Paid Customers" value={String(data.stats.paidOrgs)} />
          <StatCard
            label="MRR"
            value={`$${data.stats.mrr.toLocaleString()}`}
          />
          <StatCard
            label="Total Conversations"
            value={data.stats.totalConversations.toLocaleString()}
          />
          <StatCard label="Affiliates" value={String(data.stats.totalAffiliates)} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6">
          <button
            onClick={() => setTab("orgs")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === "orgs"
                ? "bg-dark text-cream"
                : "text-[--color-text-secondary] hover:bg-taupe/50"
            }`}
          >
            Organizations ({data.organizations.length})
          </button>
          <button
            onClick={() => setTab("affiliates")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              tab === "affiliates"
                ? "bg-dark text-cream"
                : "text-[--color-text-secondary] hover:bg-taupe/50"
            }`}
          >
            Affiliates ({data.affiliates.length})
          </button>
        </div>

        {/* Organizations table */}
        {tab === "orgs" && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-cream/50">
                  <th className="text-left px-6 py-3 font-medium text-[--color-text-secondary]">
                    Organization
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">
                    Plan
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">
                    Conversations
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">
                    Stripe
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">
                    Affiliate
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-cream/30">
                    <td className="px-6 py-4">
                      <p className="font-medium text-dark">{org.name}</p>
                      <p className="text-xs text-[--color-text-secondary]">
                        {org.slug}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                          PLAN_BADGE[org.plan] ?? PLAN_BADGE.free
                        }`}
                      >
                        {org.plan}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-dark">
                        {org.currentPeriodConversations} / {org.conversationLimit.toLocaleString()}
                      </p>
                      <p className="text-xs text-[--color-text-secondary]">
                        {org.totalConversations} total
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {org.stripeCustomerId ? (
                        <span className="text-xs text-green-600">Connected</span>
                      ) : (
                        <span className="text-xs text-[--color-text-secondary]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {org.affiliateCode ? (
                        <span className="text-xs font-mono text-vermillion">
                          {org.affiliateCode}
                        </span>
                      ) : (
                        <span className="text-xs text-[--color-text-secondary]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-[--color-text-secondary]">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.organizations.length === 0 && (
              <p className="text-center py-8 text-[--color-text-secondary]">
                No organizations yet.
              </p>
            )}
          </div>
        )}

        {/* Affiliates table */}
        {tab === "affiliates" && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-cream/50">
                  <th className="text-left px-6 py-3 font-medium text-[--color-text-secondary]">
                    Partner
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">
                    Code
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">
                    Referrals
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">
                    Earned
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">
                    Applied
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.affiliates.map((aff) => (
                  <tr key={aff.id} className="hover:bg-cream/30">
                    <td className="px-6 py-4">
                      <p className="font-medium text-dark">{aff.name}</p>
                      <p className="text-xs text-[--color-text-secondary]">
                        {aff.email}
                        {aff.company && ` · ${aff.company}`}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                          STATUS_BADGE[aff.status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {aff.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs font-mono text-dark">
                        {aff.referralCode}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-dark">{aff.referrals.converted} converted</p>
                      <p className="text-xs text-[--color-text-secondary]">
                        {aff.referrals.total} total
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-dark">
                        ${(aff.totalEarned / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-[--color-text-secondary]">
                        ${(aff.totalPaid / 100).toFixed(2)} paid
                      </p>
                    </td>
                    <td className="px-4 py-4 text-xs text-[--color-text-secondary]">
                      {new Date(aff.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.affiliates.length === 0 && (
              <p className="text-center py-8 text-[--color-text-secondary]">
                No affiliates yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
