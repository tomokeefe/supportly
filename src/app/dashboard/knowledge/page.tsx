"use client";

import { useEffect, useState, useRef } from "react";
import { PLANS, PLAN_LIMITS, getMinPlanForFeature, type PlanName } from "@/lib/plans";
import { parseFileToArticles, type ParsedArticle } from "@/lib/file-parsers";

type KnowledgeItem = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
};

type OrgInfo = {
  plan?: string;
};

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [orgPlan, setOrgPlan] = useState<PlanName>("free");
  const [uploadedArticles, setUploadedArticles] = useState<ParsedArticle[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  useEffect(() => {
    loadItems();
    loadOrg();
  }, []);

  async function loadOrg() {
    try {
      const res = await fetch("/api/org");
      const data = await res.json();
      if (data.org?.plan) {
        setOrgPlan(data.org.plan as PlanName);
      }
    } catch {
      // fallback to free
    }
  }

  async function loadItems() {
    const res = await fetch("/api/knowledge");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }

  function resetForm() {
    setTitle("");
    setContent("");
    setCategory("");
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(item: KnowledgeItem) {
    setTitle(item.title);
    setContent(item.content);
    setCategory(item.category ?? "");
    setEditingId(item.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);

    try {
      if (editingId) {
        await fetch(`/api/knowledge/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, category: category || undefined }),
        });
      } else {
        await fetch("/api/knowledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content, category: category || undefined }),
        });
      }
      resetForm();
      await loadItems();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
    await loadItems();
  }

  // ── File Upload ──
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileUploadLoading(true);
    setUploadErrors([]);

    const result = await parseFileToArticles(file);
    if (result.articles.length > 0) {
      setUploadedArticles((prev) => [...prev, ...result.articles]);
    }
    if (result.errors.length > 0) {
      setUploadErrors(result.errors);
    }

    setFileUploadLoading(false);
    e.target.value = "";
  }

  function removeUploadedArticle(index: number) {
    setUploadedArticles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleBulkSave() {
    if (uploadedArticles.length === 0) return;
    setBulkSaving(true);

    try {
      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: uploadedArticles.map((a) => ({
            title: a.title,
            content: a.content,
            category: a.category ?? "uploaded",
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadErrors([data.error || "Failed to save uploaded articles"]);
        return;
      }
      setUploadedArticles([]);
      setUploadErrors([]);
      await loadItems();
    } finally {
      setBulkSaving(false);
    }
  }

  // ── Computed values ──
  const limits = PLAN_LIMITS[orgPlan] ?? PLAN_LIMITS.free;
  const canUploadFiles = limits.allowFileUpload;
  const minUploadPlan = getMinPlanForFeature("fileUpload");
  const maxArticles = limits.maxArticles === Infinity ? "Unlimited" : limits.maxArticles;
  const pendingCount = uploadedArticles.length;
  const totalAfterUpload = items.length + pendingCount;
  const isOverLimit =
    limits.maxArticles !== Infinity && totalAfterUpload > limits.maxArticles;

  return (
    <div className="px-8 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-dark">Knowledge Base</h1>
          <p className="text-sm text-[--color-text-secondary] mt-1">
            Articles your AI agent uses to answer customer questions
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 bg-dark text-cream px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#2C2622] accent-hover"
        >
          <span>+</span> Add Article
        </button>
      </div>

      {/* Article counter */}
      <div className="bg-white border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-[--color-text-secondary]">Articles</span>
          <span
            className={`stat-mono ${isOverLimit ? "text-red-500" : "text-dark"}`}
          >
            {items.length}
            {pendingCount > 0 && (
              <span className="text-[--color-text-secondary]">
                {" "}
                (+{pendingCount} pending)
              </span>
            )}{" "}
            / {maxArticles}
          </span>
        </div>
        {limits.maxArticles !== Infinity && (
          <div className="w-full bg-taupe rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isOverLimit
                  ? "bg-red-500"
                  : totalAfterUpload / limits.maxArticles > 0.7
                    ? "bg-amber-500"
                    : "bg-vermillion"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (totalAfterUpload / limits.maxArticles) * 100
                )}%`,
              }}
            />
          </div>
        )}
        {isOverLimit && (
          <p className="text-xs text-red-500 mt-2">
            Over your plan limit — remove some articles or upgrade your plan.
          </p>
        )}
      </div>

      {/* File Upload Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-dark text-sm">Upload Files</h2>
          {!canUploadFiles && (
            <span className="text-xs text-[--color-text-secondary]">
              Requires {PLANS[minUploadPlan].name} plan or higher
            </span>
          )}
        </div>

        <div className="relative">
          {!canUploadFiles && (
            <div className="absolute inset-0 bg-cream/80 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
              <span className="bg-dark text-cream px-5 py-2.5 rounded-full text-sm font-medium shadow-lg">
                Upgrade to {PLANS[minUploadPlan].name} to unlock file uploads
              </span>
            </div>
          )}

          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center ${
              canUploadFiles
                ? "border-border hover:border-vermillion/40 cursor-pointer"
                : "border-border opacity-60"
            }`}
            onClick={() => canUploadFiles && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,.json,.md,.docx,.doc"
              onChange={handleFileUpload}
              className="hidden"
              disabled={!canUploadFiles}
            />
            <div className="text-2xl mb-2">📄</div>
            <p className="text-sm text-dark font-medium mb-1">
              {fileUploadLoading ? "Parsing..." : "Click to upload"}
            </p>
            <p className="text-xs text-[--color-text-secondary]">
              .txt, .csv, .json, .md, .docx, or .doc — max 10MB
            </p>
          </div>
        </div>

        {/* Upload errors */}
        {uploadErrors.length > 0 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            {uploadErrors.map((err, i) => (
              <p key={i} className="text-xs text-amber-700">
                {err}
              </p>
            ))}
          </div>
        )}

        {/* Staged uploaded articles */}
        {uploadedArticles.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[--color-text-secondary] font-medium">
                {uploadedArticles.length} article
                {uploadedArticles.length === 1 ? "" : "s"} ready to import
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setUploadedArticles([]);
                    setUploadErrors([]);
                  }}
                  className="text-xs text-[--color-text-secondary] hover:text-dark accent-hover"
                >
                  Clear all
                </button>
                <button
                  onClick={handleBulkSave}
                  disabled={bulkSaving || isOverLimit}
                  className="inline-flex items-center gap-1.5 bg-vermillion text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-[#C7412A] accent-hover disabled:opacity-40"
                >
                  {bulkSaving ? "Importing..." : `Import ${uploadedArticles.length} articles`}
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploadedArticles.map((article, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white border border-border rounded-lg px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-dark font-medium truncate">
                      {article.title}
                    </p>
                    <p className="text-xs text-[--color-text-secondary] truncate">
                      {article.content.slice(0, 80)}...
                    </p>
                  </div>
                  <button
                    onClick={() => removeUploadedArticle(i)}
                    className="text-xs text-[--color-text-secondary] hover:text-dark ml-3 flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark">
              {editingId ? "Edit Article" : "New Article"}
            </h3>
            <button
              onClick={resetForm}
              className="text-xs text-[--color-text-secondary] hover:text-dark accent-hover"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., How to pay rent online"
                className="w-full px-4 py-2.5 bg-cream border border-border rounded-lg text-dark text-sm placeholder:text-[--color-text-secondary] focus:outline-none focus:ring-2 focus:ring-vermillion/20 focus:border-vermillion"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the full answer your AI agent should use..."
                rows={6}
                className="w-full px-4 py-2.5 bg-cream border border-border rounded-lg text-dark text-sm placeholder:text-[--color-text-secondary] focus:outline-none focus:ring-2 focus:ring-vermillion/20 focus:border-vermillion resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Category{" "}
                <span className="text-[--color-text-secondary] font-normal">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., payments, maintenance, policies"
                className="w-full px-4 py-2.5 bg-cream border border-border rounded-lg text-dark text-sm placeholder:text-[--color-text-secondary] focus:outline-none focus:ring-2 focus:ring-vermillion/20 focus:border-vermillion"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !content.trim()}
            className="mt-4 inline-flex items-center gap-2 bg-vermillion text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#C7412A] accent-hover disabled:opacity-40"
          >
            {saving ? "Saving..." : editingId ? "Update Article" : "Add Article"}
          </button>
        </div>
      )}

      {/* Articles List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-border p-6 animate-pulse"
            >
              <div className="h-5 bg-taupe rounded w-48 mb-3" />
              <div className="h-4 bg-taupe rounded w-full mb-2" />
              <div className="h-4 bg-taupe rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <p className="text-[--color-text-secondary] mb-2">No articles yet</p>
          <p className="text-sm text-[--color-text-secondary]">
            Add articles to your knowledge base so your AI agent can answer
            customer questions accurately.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-border p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-dark">{item.title}</h3>
                    {item.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-taupe text-[--color-text-secondary] font-medium">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[--color-text-secondary] line-clamp-3">
                    {item.content}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-xs text-[--color-text-secondary] hover:text-dark accent-hover px-2 py-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs text-red-500 hover:text-red-700 accent-hover px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
