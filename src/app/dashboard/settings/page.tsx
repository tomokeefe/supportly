"use client";

import { useEffect, useState, useCallback } from "react";

type Settings = {
  confidenceThreshold: number;
  persona: string;
  greeting: string;
  escalationEmail?: string;
  branding: { primaryColor: string; position: string };
};

type Toast = {
  message: string;
  type: "success" | "error";
};

const DEFAULT_SETTINGS: Settings = {
  confidenceThreshold: 0.75,
  persona: "friendly and professional",
  greeting: "Hi! How can I help you today?",
  escalationEmail: "",
  branding: { primaryColor: "#DC4A2E", position: "bottom-right" },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [orgSlug, setOrgSlug] = useState("");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [copied, setCopied] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [initialSettings, setInitialSettings] = useState<{
    settings: Settings;
    orgName: string;
  } | null>(null);

  // Show a toast notification
  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          showToast(data.error, "error");
          setSettings(DEFAULT_SETTINGS);
          setOrgName("Your Business");
          setOrgSlug("your-org");
        } else {
          setSettings(data.settings);
          setOrgSlug(data.orgSlug ?? "");
          setOrgName(data.orgName ?? "");
          setInitialSettings({
            settings: structuredClone(data.settings),
            orgName: data.orgName ?? "",
          });
        }
        setLoading(false);
      })
      .catch(() => {
        showToast("Failed to load settings", "error");
        setSettings(DEFAULT_SETTINGS);
        setLoading(false);
      });
  }, [showToast]);

  // Track dirty state
  useEffect(() => {
    if (!settings || !initialSettings) return;
    const settingsChanged =
      JSON.stringify(settings) !== JSON.stringify(initialSettings.settings);
    const nameChanged = orgName !== initialSettings.orgName;
    setDirty(settingsChanged || nameChanged);
  }, [settings, orgName, initialSettings]);

  function updateSettings(patch: Partial<Settings>) {
    if (!settings) return;
    setSettings({ ...settings, ...patch });
  }

  function updateBranding(patch: Partial<Settings["branding"]>) {
    if (!settings) return;
    setSettings({
      ...settings,
      branding: { ...settings.branding, ...patch },
    });
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, orgName }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error ?? "Failed to save settings", "error");
        return;
      }

      setInitialSettings({
        settings: structuredClone(settings),
        orgName,
      });
      setDirty(false);
      showToast("Settings saved successfully", "success");
    } catch {
      showToast("Network error — please try again", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleResetDefaults() {
    setSettings(structuredClone(DEFAULT_SETTINGS));
    setShowResetConfirm(false);
  }

  async function handleCopy() {
    if (!settings) return;
    const snippet = getWidgetSnippet(orgSlug, settings);
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast("Failed to copy — try selecting the code manually", "error");
    }
  }

  // ── Loading skeleton ──
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

  const widgetSnippet = getWidgetSnippet(orgSlug, settings);

  return (
    <div className="px-8 py-8 max-w-3xl">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {toast.type === "success" ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-dark">Settings</h1>
        <p className="text-sm text-[--color-text-secondary] mt-1">
          Configure your AI agent, widget, and organization
        </p>
      </div>

      <div className="space-y-8">
        {/* ── Organization ── */}
        <section className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold text-dark mb-4">Organization</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Business Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Your Business"
                className="w-full px-4 py-2.5 bg-cream border border-border rounded-lg text-dark text-sm placeholder:text-[--color-text-secondary] focus:outline-none focus:ring-2 focus:ring-vermillion/20 focus:border-vermillion"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Organization Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[--color-text-secondary]">resolvly.ai/</span>
                <input
                  type="text"
                  value={orgSlug}
                  disabled
                  className="flex-1 px-4 py-2.5 bg-taupe/50 border border-border rounded-lg text-[--color-text-secondary] text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-[--color-text-secondary] mt-1">
                Used in your widget embed code. Cannot be changed.
              </p>
            </div>
          </div>
        </section>

        {/* ── Agent Configuration ── */}
        <section className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold text-dark mb-4">Agent Configuration</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                AI Persona
              </label>
              <textarea
                value={settings.persona}
                onChange={(e) => updateSettings({ persona: e.target.value })}
                placeholder="friendly and professional"
                rows={2}
                maxLength={500}
                className="w-full px-4 py-2.5 bg-cream border border-border rounded-lg text-dark text-sm placeholder:text-[--color-text-secondary] focus:outline-none focus:ring-2 focus:ring-vermillion/20 focus:border-vermillion resize-none"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-[--color-text-secondary]">
                  Describes how your AI agent communicates with customers
                </p>
                <span className="text-xs text-[--color-text-secondary]">
                  {settings.persona.length}/500
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Greeting Message
              </label>
              <textarea
                value={settings.greeting}
                onChange={(e) => updateSettings({ greeting: e.target.value })}
                placeholder="Hi! How can I help you today?"
                rows={2}
                maxLength={1000}
                className="w-full px-4 py-2.5 bg-cream border border-border rounded-lg text-dark text-sm placeholder:text-[--color-text-secondary] focus:outline-none focus:ring-2 focus:ring-vermillion/20 focus:border-vermillion resize-none"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-[--color-text-secondary]">
                  First message shown when a customer opens the chat
                </p>
                <span className="text-xs text-[--color-text-secondary]">
                  {settings.greeting.length}/1000
                </span>
              </div>
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
                    updateSettings({
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
                Responses below this threshold are automatically escalated to a
                human agent. Lower values mean fewer escalations.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Escalation Email
              </label>
              <input
                type="email"
                value={settings.escalationEmail ?? ""}
                onChange={(e) =>
                  updateSettings({ escalationEmail: e.target.value })
                }
                placeholder="support@yourcompany.com"
                className="w-full px-4 py-2.5 bg-cream border border-border rounded-lg text-dark text-sm placeholder:text-[--color-text-secondary] focus:outline-none focus:ring-2 focus:ring-vermillion/20 focus:border-vermillion"
              />
              <p className="text-xs text-[--color-text-secondary] mt-1">
                When a conversation is escalated, a notification email is sent
                to this address with the conversation details. Leave blank to
                disable email notifications.
              </p>
            </div>
          </div>
        </section>

        {/* ── Widget Appearance ── */}
        <section className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold text-dark mb-4">Widget Appearance</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Controls */}
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
                      updateBranding({ primaryColor: e.target.value })
                    }
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.branding.primaryColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
                        updateBranding({ primaryColor: val });
                      }
                    }}
                    maxLength={7}
                    className="w-24 px-3 py-2 bg-cream border border-border rounded-lg stat-mono text-sm text-dark focus:outline-none focus:ring-2 focus:ring-vermillion/20 focus:border-vermillion"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Widget Position
                </label>
                <div className="flex gap-3">
                  {(["bottom-right", "bottom-left"] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => updateBranding({ position: pos })}
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

            {/* Live Widget Preview */}
            <div>
              <label className="block text-sm font-medium text-dark mb-1.5">
                Preview
              </label>
              <div className="relative bg-cream border border-border rounded-lg h-52 overflow-hidden">
                {/* Simulated page background */}
                <div className="absolute inset-0 p-4">
                  <div className="h-2 bg-border rounded w-3/4 mb-2" />
                  <div className="h-2 bg-border rounded w-1/2 mb-4" />
                  <div className="h-2 bg-border rounded w-2/3 mb-2" />
                  <div className="h-2 bg-border rounded w-1/3" />
                </div>
                {/* Chat bubble */}
                <div
                  className={`absolute bottom-3 ${
                    settings.branding.position === "bottom-right"
                      ? "right-3"
                      : "left-3"
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors"
                    style={{ backgroundColor: settings.branding.primaryColor }}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                  </div>
                </div>
                {/* Chat window preview */}
                <div
                  className={`absolute bottom-[68px] ${
                    settings.branding.position === "bottom-right"
                      ? "right-3"
                      : "left-3"
                  } w-56 bg-white rounded-lg shadow-lg border border-border overflow-hidden`}
                >
                  <div
                    className="px-3 py-2 text-white text-xs font-medium"
                    style={{ backgroundColor: settings.branding.primaryColor }}
                  >
                    {orgName || "Your Business"}
                  </div>
                  <div className="px-3 py-2">
                    <div
                      className="text-[10px] px-2 py-1 rounded-lg max-w-[85%] text-white"
                      style={{ backgroundColor: settings.branding.primaryColor }}
                    >
                      {settings.greeting.length > 60
                        ? settings.greeting.slice(0, 60) + "..."
                        : settings.greeting}
                    </div>
                  </div>
                  <div className="px-3 py-1.5 border-t border-border">
                    <div className="bg-cream rounded text-[10px] text-[--color-text-secondary] px-2 py-1">
                      Type a message...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Embed Code ── */}
        <section className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold text-dark mb-2">Embed Code</h2>
          <p className="text-sm text-[--color-text-secondary] mb-4">
            Add this snippet before the closing{" "}
            <code className="bg-taupe px-1.5 py-0.5 rounded font-mono text-xs">
              &lt;/body&gt;
            </code>{" "}
            tag on your website to deploy the chat widget.
          </p>
          <div className="bg-dark rounded-lg p-4 mb-3 relative group">
            <code className="text-sm font-mono text-[#E7E5E4] break-all leading-relaxed">
              {widgetSnippet}
            </code>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-sm font-medium accent-hover transition-colors"
            style={{ color: copied ? "#16a34a" : "#DC4A2E" }}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                </svg>
                Copy to clipboard
              </>
            )}
          </button>
        </section>

        {/* ── Save Button ── */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="inline-flex items-center gap-2 bg-dark text-cream px-8 py-3 rounded-full text-sm font-medium hover:bg-[#2C2622] accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
          {dirty && (
            <span className="text-xs text-[--color-text-secondary]">
              You have unsaved changes
            </span>
          )}
        </div>

        {/* ── Danger Zone ── */}
        <section className="bg-white rounded-xl border border-red-200 p-6">
          <h2 className="font-semibold text-red-700 mb-2">Danger Zone</h2>
          <p className="text-sm text-[--color-text-secondary] mb-5">
            These actions cannot be undone. Proceed with caution.
          </p>
          <div className="space-y-4">
            {/* Reset settings */}
            <div className="flex items-center justify-between py-3 border-t border-border">
              <div>
                <p className="text-sm font-medium text-dark">
                  Reset to defaults
                </p>
                <p className="text-xs text-[--color-text-secondary]">
                  Restore agent persona, greeting, threshold, and widget
                  settings to their original values
                </p>
              </div>
              {showResetConfirm ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleResetDefaults}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 accent-hover"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-[--color-text-secondary] hover:text-dark accent-hover"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 accent-hover"
                >
                  Reset Settings
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Helpers ──
function getWidgetSnippet(slug: string, settings: Settings): string {
  return `<script src="https://cdn.resolvly.ai/widget.js" data-org="${slug}" data-color="${settings.branding.primaryColor}"></script>`;
}
