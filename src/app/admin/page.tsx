"use client";

import { useState, useEffect, useCallback } from "react";
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
    status: string;
    conversationLimit: number;
    currentPeriodConversations: number;
    stripeCustomerId: string | null;
    affiliateCode: string | null;
    agencyId: string | null;
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
  agency_25: "bg-purple-100 text-purple-700",
  agency_50: "bg-purple-100 text-purple-700",
  agency_100: "bg-purple-100 text-purple-700",
};

const AGENCY_LICENSES: Record<string, number> = {
  agency_25: 25,
  agency_50: 50,
  agency_100: 100,
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

function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-dark mb-2">{title}</h3>
        <p className="text-sm text-[--color-text-secondary] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-cream/50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm rounded-lg font-medium text-white ${
              confirmVariant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-vermillion hover:bg-vermillion/90"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

async function adminAction(
  body: Record<string, unknown>
): Promise<{ success?: boolean; error?: string }> {
  const res = await fetch("/api/admin/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"orgs" | "affiliates">("orgs");
  const [modal, setModal] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    confirmVariant?: "danger" | "primary";
    onConfirm: () => void;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    fetch("/api/admin")
      .then((r) => {
        if (r.status === 403) throw new Error("Access denied. Admin only.");
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Org action handlers ──────────────────────────────────────────

  function handleChangePlan(orgId: string, newPlan: string) {
    setActionLoading(orgId);
    adminAction({ action: "change_plan", orgId, plan: newPlan })
      .then(() => fetchData())
      .finally(() => setActionLoading(null));
  }

  function handleSuspend(orgId: string, orgName: string) {
    setModal({
      title: "Suspend Organization",
      message: `Are you sure you want to suspend "${orgName}"? Their chat widget will stop working immediately.`,
      confirmLabel: "Suspend",
      confirmVariant: "danger",
      onConfirm: () => {
        setModal(null);
        setActionLoading(orgId);
        adminAction({ action: "suspend_org", orgId })
          .then(() => fetchData())
          .finally(() => setActionLoading(null));
      },
    });
  }

  function handleReactivate(orgId: string) {
    setActionLoading(orgId);
    adminAction({ action: "reactivate_org", orgId })
      .then(() => fetchData())
      .finally(() => setActionLoading(null));
  }

  function handleTerminate(orgId: string, orgName: string) {
    setModal({
      title: "Terminate Organization",
      message: `This will permanently delete "${orgName}" and ALL its data (conversations, knowledge base, messages). This cannot be undone.`,
      confirmLabel: "Delete Permanently",
      confirmVariant: "danger",
      onConfirm: () => {
        setModal(null);
        setActionLoading(orgId);
        adminAction({ action: "terminate_org", orgId })
          .then(() => fetchData())
          .finally(() => setActionLoading(null));
      },
    });
  }

  function handleResetConversations(orgId: string, orgName: string) {
    setModal({
      title: "Reset Conversation Count",
      message: `Reset the billing period conversation count for "${orgName}" to 0?`,
      confirmLabel: "Reset",
      confirmVariant: "primary",
      onConfirm: () => {
        setModal(null);
        setActionLoading(orgId);
        adminAction({ action: "reset_conversations", orgId })
          .then(() => fetchData())
          .finally(() => setActionLoading(null));
      },
    });
  }

  // ── Affiliate action handlers ────────────────────────────────────

  function handleAffiliateStatus(affiliateId: string, newStatus: string) {
    setActionLoading(affiliateId);
    adminAction({ action: "update_affiliate", affiliateId, status: newStatus })
      .then(() => fetchData())
      .finally(() => setActionLoading(null));
  }

  function handleAffiliateCommission(affiliateId: string, rate: number) {
    setActionLoading(affiliateId);
    adminAction({
      action: "update_affiliate",
      affiliateId,
      commissionRate: rate,
    })
      .then(() => fetchData())
      .finally(() => setActionLoading(null));
  }

  // ── Render ───────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Link
            href="/dashboard"
            className="text-sm text-vermillion hover:underline"
          >
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
          <StatCard
            label="Total Organizations"
            value={String(data.stats.totalOrgs)}
          />
          <StatCard
            label="Paid Customers"
            value={String(data.stats.paidOrgs)}
          />
          <StatCard
            label="MRR"
            value={`$${data.stats.mrr.toLocaleString()}`}
          />
          <StatCard
            label="Total Conversations"
            value={data.stats.totalConversations.toLocaleString()}
          />
          <StatCard
            label="Affiliates"
            value={String(data.stats.totalAffiliates)}
          />
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
          <div className="bg-white rounded-xl border border-border overflow-x-auto">
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
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">
                    Conversations
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">
                    Stripe
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">
                    Created
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.organizations.map((org) => (
                  <tr
                    key={org.id}
                    className={`hover:bg-cream/30 ${
                      actionLoading === org.id ? "opacity-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-dark">{org.name}</p>
                      <p className="text-xs text-[--color-text-secondary]">
                        {org.slug}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <select
                          value={org.plan}
                          onChange={(e) =>
                            handleChangePlan(org.id, e.target.value)
                          }
                          disabled={actionLoading === org.id}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${
                            PLAN_BADGE[org.plan] ?? PLAN_BADGE.free
                          }`}
                        >
                          {["free", "starter", "pro", "business", "agency_25", "agency_50", "agency_100"].map((p) => (
                            <option key={p} value={p}>
                              {p.startsWith("agency_") ? `Agency ${p.split("_")[1]}` : p}
                            </option>
                          ))}
                        </select>
                        {AGENCY_LICENSES[org.plan] && (
                          <p className="text-xs text-purple-600 mt-0.5">
                            {data!.organizations.filter((o) => o.agencyId === org.id).length}/{AGENCY_LICENSES[org.plan]} licenses
                          </p>
                        )}
                        {org.agencyId && (
                          <p className="text-xs text-purple-500 mt-0.5">
                            via Agency
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                          STATUS_BADGE[org.status] ?? STATUS_BADGE.active
                        }`}
                      >
                        {org.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-dark">
                        {org.currentPeriodConversations} /{" "}
                        {org.conversationLimit.toLocaleString()}
                      </p>
                      <p className="text-xs text-[--color-text-secondary]">
                        {org.totalConversations} total
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      {org.stripeCustomerId ? (
                        <span className="text-xs text-green-600">
                          Connected
                        </span>
                      ) : (
                        <span className="text-xs text-[--color-text-secondary]">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-[--color-text-secondary]">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {org.status === "active" ? (
                          <button
                            onClick={() => handleSuspend(org.id, org.name)}
                            disabled={actionLoading === org.id}
                            className="text-xs px-2 py-1 rounded border border-amber-200 text-amber-700 hover:bg-amber-50 disabled:opacity-40"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(org.id)}
                            disabled={actionLoading === org.id}
                            className="text-xs px-2 py-1 rounded border border-green-200 text-green-700 hover:bg-green-50 disabled:opacity-40"
                          >
                            Reactivate
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleResetConversations(org.id, org.name)
                          }
                          disabled={actionLoading === org.id}
                          className="text-xs px-2 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-40"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => handleTerminate(org.id, org.name)}
                          disabled={actionLoading === org.id}
                          className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
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
          <div className="bg-white rounded-xl border border-border overflow-x-auto">
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
                    Commission
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">
                    Earned
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.affiliates.map((aff) => (
                  <tr
                    key={aff.id}
                    className={`hover:bg-cream/30 ${
                      actionLoading === aff.id ? "opacity-50" : ""
                    }`}
                  >
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
                      <p className="text-dark">
                        {aff.referrals.converted} converted
                      </p>
                      <p className="text-xs text-[--color-text-secondary]">
                        {aff.referrals.total} total
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-dark">
                        {(aff.commissionRate * 100).toFixed(0)}%
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
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <select
                          value={aff.status}
                          onChange={(e) =>
                            handleAffiliateStatus(aff.id, e.target.value)
                          }
                          disabled={actionLoading === aff.id}
                          className="text-xs border border-border rounded px-1.5 py-1 disabled:opacity-40"
                        >
                          {["pending", "active", "suspended"].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <select
                          value={aff.commissionRate}
                          onChange={(e) =>
                            handleAffiliateCommission(
                              aff.id,
                              parseFloat(e.target.value)
                            )
                          }
                          disabled={actionLoading === aff.id}
                          className="text-xs border border-border rounded px-1.5 py-1 disabled:opacity-40"
                        >
                          {[0.1, 0.15, 0.2, 0.25, 0.3].map((r) => (
                            <option key={r} value={r}>
                              {(r * 100).toFixed(0)}%
                            </option>
                          ))}
                        </select>
                      </div>
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

      {/* Confirmation Modal */}
      {modal && (
        <ConfirmModal
          title={modal.title}
          message={modal.message}
          confirmLabel={modal.confirmLabel}
          confirmVariant={modal.confirmVariant}
          onConfirm={modal.onConfirm}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
