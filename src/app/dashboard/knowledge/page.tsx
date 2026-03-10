"use client";

import { useEffect, useState } from "react";

type KnowledgeItem = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
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

  useEffect(() => {
    loadItems();
  }, []);

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

      {/* Form */}
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
          <p className="text-[--color-text-secondary] mb-2">
            No articles yet
          </p>
          <p className="text-sm text-[--color-text-secondary]">
            Add articles to your knowledge base so your AI agent can answer customer questions accurately.
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
