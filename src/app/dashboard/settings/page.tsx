"use client";

import { useEffect, useState } from "react";

type Settings = {
  confidenceThreshold: number;
  persona: string;
  greeting: string;
  branding: { primaryColor: string; position: string };
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [orgSlug, setOrgSlug] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data.settings);
        setOrgSlug(data.orgSlug ?? "");
        setOrgName(data.orgName ?? "");
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    setSaved(false);

    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
    return (
      <div className="px-8 py-8 max-w-3xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-taupe rounded w-32" />
          <div className="h-40 bg-taupe rounded" />
          <div className="h-40 bg-taupe rounded" />
        </div>
      </div>
    );
  }

  const widgetSnippet = `<script src="https://cdn.resolvly.ai/widget.js" data-org="${orgSlug}" data-color="${settings.branding.primaryColor}"></script>`;

  return (
    <div className="px-8 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-dark">Settings</h1>
        <p className="text-sm text-[--color-text-secondary] mt-1">
          Configure your AI agent and widget
        </p>
      </div>

      <div className="space-y-8">
        {/* Agent Configuration */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold text-dark mb-4">Agent Configuration</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                AI Persona
              </label>
              <input
                type="text"
                value={settings.persona}
                onChange={(e) =>
                  setSettings({ ...settings, persona: e.target.value })
                }
                placeholder="friendly and professional"
                className="w-full px-4 py-2.5 bg-cream border border-border rounded-lg text-dark text-sm placeholder:text-[--color-text-secondary] focus:outline-none focus:ring-2 focus:ring-vermillion/20 focus:border-vermillion"
              />
              <p className="text-xs text-[--color-text-secondary] mt-1">
                Describes how your AI agent communicates with customers
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Greeting Message
              </label>
              <input
                type="text"
                value={settings.greeting}
                onChange={(e) =>
                  setSettings({ ...settings, greeting: e.target.value })
                }
                placeholder="Hi! How can I help you today?"
                className="w-full px-4 py-2.5 bg-cream border border-border rounded-lg text-dark text-sm placeholder:text-[--color-text-secondary] focus:outline-none focus:ring-2 focus:ring-vermillion/20 focus:border-vermillion"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Confidence Threshold
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={settings.confidenceThreshold * 100}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      confidenceThreshold: parseInt(e.target.value) / 100,
                    })
                  }
                  className="flex-1 accent-vermillion"
                />
                <span className="stat-mono text-sm text-dark w-12 text-right">
                  {(settings.confidenceThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-[--color-text-secondary] mt-1">
                Responses below this threshold are automatically escalated to a human agent
              </p>
            </div>
          </div>
        </div>

        {/* Widget Appearance */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold text-dark mb-4">Widget Appearance</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Widget Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.branding.primaryColor}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      branding: {
                        ...settings.branding,
                        primaryColor: e.target.value,
                      },
                    })
                  }
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <span className="stat-mono text-sm text-[--color-text-secondary]">
                  {settings.branding.primaryColor}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Widget Position
              </label>
              <div className="flex gap-3">
                {["bottom-right", "bottom-left"].map((pos) => (
                  <button
                    key={pos}
                    onClick={() =>
                      setSettings({
                        ...settings,
                        branding: { ...settings.branding, position: pos },
                      })
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium border accent-hover ${
                      settings.branding.position === pos
                        ? "border-vermillion bg-vermillion/10 text-vermillion"
                        : "border-border text-[--color-text-secondary] hover:text-dark"
                    }`}
                  >
                    {pos === "bottom-right" ? "Bottom Right" : "Bottom Left"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Embed Code */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold text-dark mb-4">Embed Code</h2>
          <p className="text-sm text-[--color-text-secondary] mb-4">
            Add this snippet to your website to deploy your AI chat widget.
          </p>
          <div className="bg-dark rounded-lg p-4 mb-3">
            <code className="text-sm font-mono text-[#E7E5E4] break-all">
              {widgetSnippet}
            </code>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(widgetSnippet)}
            className="text-sm text-vermillion hover:text-[#C7412A] font-medium accent-hover"
          >
            Copy to clipboard
          </button>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-dark text-cream px-8 py-3 rounded-full text-sm font-medium hover:bg-[#2C2622] accent-hover disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">
              Settings saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
