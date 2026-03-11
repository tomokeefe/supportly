"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ResolvlyLogo } from "@/components/resolvly-logo";

type Client = {
  id: string;
  name: string;
  slug: string;
  settings: {
    branding?: { primaryColor?: string };
  };
  conversationLimit: number;
  currentPeriodConversations: number;
  status: string;
  createdAt: string;
};

type AgencyData = {
  agency: {
    id: string;
    name: string;
    plan: string;
    maxLicenses: number;
    usedLicenses: number;
  };
  clients: Client[];
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <p className="text-sm text-[--color-text-secondary] mb-1">{label}</p>
      <p className="stat-mono text-3xl text-dark">{value}</p>
    </div>
  );
}

export default function AgencyPage() {
  const [data, setData] = useState<AgencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/agency/orgs");
      if (res.status === 403) {
        setError("not_agency");
        return;
      }
      if (res.status === 401) {
        setError("not_authenticated");
        return;
      }
      if (!res.ok) throw new Error("Failed to load");
      setData(await res.json());
    } catch {
      setError("failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddClient = async (name: string, primaryColor: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/agency/orgs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, primaryColor }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.error || "Failed to create client");
        return;
      }
      setShowAddModal(false);
      await fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClient = async (id: string, name: string, primaryColor: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/agency/orgs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, primaryColor }),
      });
      if (!res.ok) {
        const result = await res.json();
        alert(result.error || "Failed to update client");
        return;
      }
      setEditClient(null);
      await fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/agency/orgs/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const result = await res.json();
        alert(result.error || "Failed to delete client");
        return;
      }
      setDeleteClient(null);
      await fetchData();
    } finally {
      setActionLoading(false);
    }
  };

  const copyEmbedCode = (slug: string) => {
    const code = `<script src="https://www.resolvly.ai/widget.js" data-org="${slug}"></script>`;
    navigator.clipboard.writeText(code);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-[--color-text-secondary]">Loading...</p>
      </div>
    );
  }

  if (error === "not_agency") {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-dark mb-2">Not an Agency Account</h1>
          <p className="text-[--color-text-secondary] mb-4">
            Your account is not set up as an agency. Contact us to get started.
          </p>
          <Link href="/" className="text-vermillion hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-dark mb-2">Something went wrong</h1>
          <p className="text-[--color-text-secondary]">
            {error === "not_authenticated" ? "Please sign in to access the agency dashboard." : "Failed to load agency data."}
          </p>
        </div>
      </div>
    );
  }

  const { agency, clients } = data;
  const totalClientConversations = clients.reduce(
    (sum, c) => sum + c.currentPeriodConversations,
    0
  );

  const planLabel = agency.plan.replace("agency_", "Agency ");

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <ResolvlyLogo />
            </Link>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
              Agency
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-[--color-text-secondary]">
            <span>{agency.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
              {planLabel}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Licenses Used"
            value={`${agency.usedLicenses} / ${agency.maxLicenses}`}
          />
          <StatCard label="Total Client Conversations" value={totalClientConversations.toLocaleString()} />
          <StatCard label="Plan" value={planLabel} />
        </div>

        {/* Client Orgs */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-dark">Client Organizations</h2>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={agency.usedLicenses >= agency.maxLicenses}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-vermillion text-white hover:bg-vermillion/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Add Client
          </button>
        </div>

        {clients.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <p className="text-[--color-text-secondary] mb-4">
              No clients yet. Add your first client to get started.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-vermillion text-white hover:bg-vermillion/90"
            >
              + Add Client
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">Slug</th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">Conversations</th>
                  <th className="text-left px-4 py-3 font-medium text-[--color-text-secondary]">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-[--color-text-secondary]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b border-border last:border-0 hover:bg-cream/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: client.settings?.branding?.primaryColor || "#2563eb",
                          }}
                        />
                        <span className="font-medium text-dark">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[--color-text-secondary]">
                      {client.slug}
                    </td>
                    <td className="px-4 py-3">
                      <span className="stat-mono">
                        {client.currentPeriodConversations} / {client.conversationLimit}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          client.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyEmbedCode(client.slug)}
                          className="px-2 py-1 text-xs rounded border border-border hover:bg-cream/50"
                          title="Copy embed code"
                        >
                          {copiedSlug === client.slug ? "Copied!" : "Embed"}
                        </button>
                        <button
                          onClick={() => setEditClient(client)}
                          className="px-2 py-1 text-xs rounded border border-border hover:bg-cream/50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteClient(client)}
                          className="px-2 py-1 text-xs rounded border border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add Client Modal */}
      {showAddModal && (
        <ClientModal
          title="Add Client"
          onSubmit={(name, color) => handleAddClient(name, color)}
          onCancel={() => setShowAddModal(false)}
          loading={actionLoading}
        />
      )}

      {/* Edit Client Modal */}
      {editClient && (
        <ClientModal
          title="Edit Client"
          initialName={editClient.name}
          initialColor={editClient.settings?.branding?.primaryColor || "#2563eb"}
          onSubmit={(name, color) => handleEditClient(editClient.id, name, color)}
          onCancel={() => setEditClient(null)}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-dark mb-2">Delete Client</h3>
            <p className="text-sm text-[--color-text-secondary] mb-6">
              Are you sure you want to delete <strong>{deleteClient.name}</strong>? This will
              remove the organization and all its data. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteClient(null)}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-cream/50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteClient(deleteClient.id)}
                disabled={actionLoading}
                className="px-4 py-2 text-sm rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared Modal for Add/Edit ─────────────────────────────────────────
function ClientModal({
  title,
  initialName = "",
  initialColor = "#2563eb",
  onSubmit,
  onCancel,
  loading,
}: {
  title: string;
  initialName?: string;
  initialColor?: string;
  onSubmit: (name: string, color: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-dark mb-4">{title}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Business Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Joe's Plumbing"
              className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-vermillion/20 focus:border-vermillion"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded border border-border cursor-pointer"
              />
              <span className="text-sm font-mono text-[--color-text-secondary]">
                {color}
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-cream/50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(name, color)}
            disabled={!name.trim() || loading}
            className="px-4 py-2 text-sm rounded-lg font-medium text-white bg-vermillion hover:bg-vermillion/90 disabled:opacity-50"
          >
            {loading ? "Saving..." : title === "Add Client" ? "Create" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
