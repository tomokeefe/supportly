"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PLANS, PLAN_LIMITS, getMinPlanForFeature, type PlanName } from "@/lib/plans";
import { ResolvlyLogo } from "@/components/resolvly-logo";
import { getVerticalSlugByIndustry, getVerticalFAQs } from "@/lib/verticals";
import { parseFileToArticles, type ParsedArticle } from "@/lib/file-parsers";

const VERTICALS = [
  "Property Management",
  "Legal / Law Firm",
  "Healthcare / Dental",
  "Restaurant / Cafe",
  "E-commerce",
  "Auto / Home Services",
  "Other",
];

const PLAN_KEYS = Object.keys(PLANS) as PlanName[];
const STEP_LABELS = ["Your business", "Choose plan", "Knowledge base", "Go live"];

type FAQ = { title: string; content: string };

function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 — Business Info
  const [businessName, setBusinessName] = useState("");
  const [vertical, setVertical] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Step 2 — Plan
  const [selectedPlan, setSelectedPlan] = useState<PlanName>("free");

  // Step 3 — Knowledge Base
  const [faqs, setFaqs] = useState<FAQ[]>([{ title: "", content: "" }]);
  const [uploadedArticles, setUploadedArticles] = useState<ParsedArticle[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);

  // Step 4 — Go Live
  const [orgSlug, setOrgSlug] = useState("");
  const [orgId, setOrgId] = useState("");
  const [widgetColor, setWidgetColor] = useState("#DC4A2E");

  // ── Restore state from URL params (Stripe return) ──
  useEffect(() => {
    const stepParam = searchParams.get("step");
    const orgIdParam = searchParams.get("orgId");
    const planParam = searchParams.get("plan") as PlanName | null;
    const verticalParam = searchParams.get("vertical");

    if (stepParam === "3" && orgIdParam) {
      setStep(3);
      setOrgId(orgIdParam);
      if (planParam && planParam in PLANS) setSelectedPlan(planParam);
      if (verticalParam) {
        setVertical(verticalParam);
        const slug = getVerticalSlugByIndustry(verticalParam);
        if (slug) {
          const verticalFaqs = getVerticalFAQs(slug);
          if (verticalFaqs.length > 0) setFaqs(verticalFaqs);
        }
      }
    }
  }, [searchParams]);

  // ── FAQ Helpers ──
  function addFaq() {
    setFaqs([...faqs, { title: "", content: "" }]);
  }
  function updateFaq(index: number, field: "title" | "content", value: string) {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
  }
  function removeFaq(index: number) {
    if (faqs.length <= 1) return;
    setFaqs(faqs.filter((_, i) => i !== index));
  }

  // ── Step 1 → Step 2 ──
  function handleStep1Continue() {
    const slug = getVerticalSlugByIndustry(vertical);
    if (slug) {
      const verticalFaqs = getVerticalFAQs(slug);
      setFaqs(verticalFaqs.length > 0 ? verticalFaqs : [{ title: "", content: "" }]);
    } else {
      setFaqs([{ title: "", content: "" }]);
    }
    setStep(2);
  }

  // ── Step 2 → Create Org → Step 3 (or Stripe) ──
  async function handlePlanContinue() {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: { name: businessName, vertical, websiteUrl },
          plan: selectedPlan,
          widgetColor,
        }),
      });
      const data = await res.json();
      if (!data.orgSlug) {
        setLoading(false);
        return;
      }

      setOrgSlug(data.orgSlug);
      setOrgId(data.orgId);

      if (selectedPlan !== "free") {
        const checkoutRes = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: selectedPlan,
            orgId: data.orgId,
            returnTo: "onboarding",
            vertical,
          }),
        });
        const checkoutData = await checkoutRes.json();
        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }
        alert("Billing is not configured yet. Starting on the Free plan — upgrade anytime from your dashboard.");
        setStep(3);
      } else {
        setStep(3);
      }
    } catch {
      alert("Something went wrong. Starting on the Free plan — upgrade from your dashboard.");
      setStep(3);
    } finally {
      setLoading(false);
    }
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

  // ── Step 3 → Save KB → Step 4 ──
  async function handleKnowledgeContinue() {
    setLoading(true);
    const validFaqs = faqs.filter((f) => f.title.trim() && f.content.trim());
    const allItems = [
      ...validFaqs.map((f) => ({ title: f.title, content: f.content, category: "faq" })),
      ...uploadedArticles.map((a) => ({
        title: a.title,
        content: a.content,
        category: a.category ?? "uploaded",
      })),
    ];

    if (allItems.length > 0 && orgId) {
      try {
        const res = await fetch("/api/onboarding/knowledge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orgId, items: allItems }),
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "Failed to save knowledge base");
          setLoading(false);
          return;
        }
      } catch {
        // Proceed — user can add KB items from dashboard
      }
    }

    setStep(4);
    setLoading(false);
  }

  // ── Computed values ──
  const limits = PLAN_LIMITS[selectedPlan];
  const validFaqCount = faqs.filter((f) => f.title.trim() && f.content.trim()).length;
  const totalArticles = validFaqCount + uploadedArticles.length;
  const maxArticles = limits.maxArticles === Infinity ? "Unlimited" : limits.maxArticles;
  const isOverLimit = limits.maxArticles !== Infinity && totalArticles > limits.maxArticles;
  const canUploadFiles = limits.allowFileUpload;
  const minUploadPlan = getMinPlanForFeature("fileUpload");

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5">
          <Link href="/" aria-label="Resolvly home">
            <ResolvlyLogo />
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Step indicator */}
        <div className="flex items-center gap-6 mb-12 flex-wrap">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1;
            return (
              <div key={s} className="flex items-center gap-2">
                <span
                  className={`stat-mono text-sm ${
                    s === step ? "text-vermillion" : s < step ? "text-dark" : "text-[--color-text-secondary]"
                  }`}
                >
                  0{s}
                </span>
                <span
                  className={`text-sm ${
                    s === step ? "text-dark font-medium" : "text-[--color-text-secondary]"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ═══════════ Step 1: Business Info ═══════════ */}
        {step === 1 && (
          <div>
            <div className="editorial-rule mb-6" />
            <h1 className="heading-editorial text-dark text-3xl md:text-4xl mb-3">
              Tell us about your business.
            </h1>
            <p className="text-[--color-text-secondary] mb-10">
              We&apos;ll use this to configure your AI agent.
            </p>

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-dark mb-2">
                  Business name
                </label>
                <input
                  id="name"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Sunrise Property Management"
                  className="w-full px-4 py-3 bg-white border border-border rounded-lg text-dark placeholder:text-[--color-text-secondary] focus:outline-none focus:ring-2 focus:ring-vermillion/20 focus:border-vermillion accent-hover"
                />
              </div>

              <div>
                <label htmlFor="vertical" className="block text-sm font-medium text-dark mb-2">
                  Industry
                </label>
                <select
                  id="vertical"
                  value={vertical}
                  onChange={(e) => setVertical(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-border rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-vermillion/20 focus:border-vermillion accent-hover"
                >
                  <option value="">Select your industry</option>
                  {VERTICALS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="url" className="block text-sm font-medium text-dark mb-2">
                  Website URL <span className="text-[--color-text-secondary] font-normal">(optional)</span>
                </label>
                <input
                  id="url"
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://your-business.com"
                  className="w-full px-4 py-3 bg-white border border-border rounded-lg text-dark placeholder:text-[--color-text-secondary] focus:outline-none focus:ring-2 focus:ring-vermillion/20 focus:border-vermillion accent-hover"
                />
              </div>
            </div>

            <button
              onClick={handleStep1Continue}
              disabled={!businessName.trim() || !vertical}
              className="mt-10 inline-flex items-center gap-2 bg-dark text-cream px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#2C2622] accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        )}

        {/* ═══════════ Step 2: Choose Plan ═══════════ */}
        {step === 2 && (
          <div>
            <div className="editorial-rule mb-6" />
            <h1 className="heading-editorial text-dark text-3xl md:text-4xl mb-3">
              Choose your plan.
            </h1>
            <p className="text-[--color-text-secondary] mb-10">
              Start free and upgrade anytime. All plans include your AI agent, knowledge base, and chat widget.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {PLAN_KEYS.map((key) => {
                const plan = PLANS[key];
                const planLimits = PLAN_LIMITS[key];
                const isRecommended = "recommended" in plan && plan.recommended;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedPlan(key)}
                    disabled={loading}
                    className={`text-left p-5 rounded-xl border accent-hover ${
                      selectedPlan === key
                        ? "border-vermillion bg-vermillion/5"
                        : "border-border bg-white hover:border-dark/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-dark">{plan.name}</span>
                      {isRecommended && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-vermillion/10 text-vermillion font-medium">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="mb-2">
                      <span className="stat-mono text-xl text-dark">${plan.price}</span>
                      {plan.price > 0 && (
                        <span className="text-sm text-[--color-text-secondary]">/mo</span>
                      )}
                    </p>
                    <p className="text-xs text-[--color-text-secondary] mb-3">{plan.limit}</p>
                    <ul className="space-y-1">
                      {plan.features.map((f) => (
                        <li key={f} className="text-xs text-[--color-text-secondary] flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-vermillion rounded-full flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                      {planLimits.allowFileUpload && (
                        <li className="text-xs text-dark font-medium flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-vermillion rounded-full flex-shrink-0" />
                          KB file upload (.txt, .csv, .json)
                        </li>
                      )}
                      <li className="text-xs text-[--color-text-secondary] flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-vermillion rounded-full flex-shrink-0" />
                        Up to {planLimits.maxArticles === Infinity ? "unlimited" : planLimits.maxArticles} KB articles
                      </li>
                    </ul>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-[--color-text-secondary] hover:text-dark accent-hover"
              >
                &larr; Back
              </button>
              <button
                onClick={handlePlanContinue}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-vermillion text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#C7412A] accent-hover disabled:opacity-40"
              >
                {loading
                  ? "Setting up..."
                  : selectedPlan === "free"
                    ? "Start for free"
                    : `Start with ${PLANS[selectedPlan].name}`}
                {!loading && <span aria-hidden="true">&rarr;</span>}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ Step 3: Knowledge Base ═══════════ */}
        {step === 3 && (
          <div>
            <div className="editorial-rule mb-6" />
            <h1 className="heading-editorial text-dark text-3xl md:text-4xl mb-3">
              Build your knowledge base.
            </h1>
            <p className="text-[--color-text-secondary] mb-4">
              Your AI agent answers customers using this knowledge base. Add FAQs, upload files, or both.
            </p>

            {/* Article counter */}
            <div className="bg-white border border-border rounded-lg p-4 mb-8">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[--color-text-secondary]">Articles</span>
                <span className={`stat-mono ${isOverLimit ? "text-red-500" : "text-dark"}`}>
                  {totalArticles} / {maxArticles}
                </span>
              </div>
              {limits.maxArticles !== Infinity && (
                <div className="w-full bg-taupe rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      isOverLimit
                        ? "bg-red-500"
                        : totalArticles / limits.maxArticles > 0.7
                          ? "bg-amber-500"
                          : "bg-vermillion"
                    }`}
                    style={{
                      width: `${Math.min(100, (totalArticles / limits.maxArticles) * 100)}%`,
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

            {/* Section A: FAQs */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-dark">FAQs</h2>
                {vertical && vertical !== "Other" && faqs.length > 1 && (
                  <span className="text-xs text-[--color-text-secondary] bg-taupe px-3 py-1 rounded-full">
                    Pre-filled from {vertical} templates
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-white border border-border rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="stat-mono text-xs text-vermillion">FAQ {i + 1}</span>
                      {faqs.length > 1 && (
                        <button
                          onClick={() => removeFaq(i)}
                          className="text-xs text-[--color-text-secondary] hover:text-dark accent-hover"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={faq.title}
                      onChange={(e) => updateFaq(i, "title", e.target.value)}
                      placeholder="Question (e.g., What are your hours?)"
                      className="w-full px-3 py-2.5 bg-cream border border-border rounded-lg text-dark text-sm placeholder:text-[--color-text-secondary] focus:outline-none focus:ring-2 focus:ring-vermillion/20 focus:border-vermillion mb-3"
                    />
                    <textarea
                      value={faq.content}
                      onChange={(e) => updateFaq(i, "content", e.target.value)}
                      placeholder="Answer"
                      rows={3}
                      className="w-full px-3 py-2.5 bg-cream border border-border rounded-lg text-dark text-sm placeholder:text-[--color-text-secondary] focus:outline-none focus:ring-2 focus:ring-vermillion/20 focus:border-vermillion resize-none"
                    />
                  </div>
                ))}

                <button
                  onClick={addFaq}
                  className="text-sm text-vermillion hover:text-[#C7412A] font-medium accent-hover"
                >
                  + Add another FAQ
                </button>
              </div>
            </div>

            {/* Section B: File Upload */}
            <div className="mb-10">
              <h2 className="font-semibold text-dark mb-4">Upload files</h2>

              <div className="relative">
                {!canUploadFiles && (
                  <div className="absolute inset-0 bg-cream/80 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
                    <span className="bg-dark text-cream px-5 py-2.5 rounded-full text-sm font-medium shadow-lg">
                      Upgrade to {PLANS[minUploadPlan].name} to unlock file uploads
                    </span>
                  </div>
                )}

                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center ${
                    canUploadFiles
                      ? "border-border hover:border-vermillion/40 cursor-pointer"
                      : "border-border opacity-60"
                  }`}
                  onClick={() => canUploadFiles && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={!canUploadFiles}
                  />
                  <div className="text-3xl mb-3">📄</div>
                  <p className="text-sm text-dark font-medium mb-1">
                    {fileUploadLoading ? "Parsing..." : "Click to upload"}
                  </p>
                  <p className="text-xs text-[--color-text-secondary]">
                    .txt, .csv, or .json — max 5MB
                  </p>
                </div>
              </div>

              {/* Upload errors */}
              {uploadErrors.length > 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  {uploadErrors.map((err, i) => (
                    <p key={i} className="text-xs text-amber-700">{err}</p>
                  ))}
                </div>
              )}

              {/* Uploaded articles list */}
              {uploadedArticles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-[--color-text-secondary] font-medium">
                    {uploadedArticles.length} article{uploadedArticles.length === 1 ? "" : "s"} from upload
                  </p>
                  {uploadedArticles.map((article, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white border border-border rounded-lg px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-dark font-medium truncate">{article.title}</p>
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
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep(2)}
                className="text-sm text-[--color-text-secondary] hover:text-dark accent-hover"
              >
                &larr; Back
              </button>
              <button
                onClick={handleKnowledgeContinue}
                disabled={loading || isOverLimit}
                className="inline-flex items-center gap-2 bg-dark text-cream px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#2C2622] accent-hover disabled:opacity-40"
              >
                {loading ? "Saving..." : "Continue"}
                {!loading && <span aria-hidden="true">&rarr;</span>}
              </button>
              <button
                onClick={() => setStep(4)}
                className="text-sm text-[--color-text-secondary] hover:text-dark accent-hover"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ Step 4: Go Live ═══════════ */}
        {step === 4 && (
          <div>
            <div className="editorial-rule mb-6" />
            <h1 className="heading-editorial text-dark text-3xl md:text-4xl mb-3">
              You&apos;re live.
            </h1>
            <p className="text-[--color-text-secondary] mb-10">
              Add this snippet to your website to deploy your AI agent.
            </p>

            {/* Widget color */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-dark mb-2">
                Widget color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={widgetColor}
                  onChange={(e) => setWidgetColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <span className="stat-mono text-sm text-[--color-text-secondary]">
                  {widgetColor}
                </span>
              </div>
            </div>

            {/* Code snippet */}
            <div className="bg-dark rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="stat-mono text-xs text-[--color-text-secondary]">
                  index.html
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `<script src="https://www.resolvly.ai/widget.js" data-org="${orgSlug}" data-color="${widgetColor}"></script>`
                    );
                  }}
                  className="text-xs text-vermillion hover:text-[#C7412A] accent-hover font-medium"
                >
                  Copy
                </button>
              </div>
              <pre className="text-sm font-mono text-[#E7E5E4] leading-relaxed overflow-x-auto">
                <code>
                  <span className="text-[#78716C]">&lt;!-- Add Resolvly to your site --&gt;</span>
                  {"\n"}
                  <span className="text-[#E7E5E4]">&lt;script</span>
                  {"\n  "}
                  <span className="text-vermillion">src</span>
                  <span className="text-[#78716C]">=</span>
                  <span className="text-[#A8A29E]">&quot;https://www.resolvly.ai/widget.js&quot;</span>
                  {"\n  "}
                  <span className="text-vermillion">data-org</span>
                  <span className="text-[#78716C]">=</span>
                  <span className="text-[#A8A29E]">&quot;{orgSlug}&quot;</span>
                  {"\n  "}
                  <span className="text-vermillion">data-color</span>
                  <span className="text-[#78716C]">=</span>
                  <span className="text-[#A8A29E]">&quot;{widgetColor}&quot;</span>
                  {"\n"}
                  <span className="text-[#E7E5E4]">&gt;&lt;/script&gt;</span>
                </code>
              </pre>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 bg-vermillion text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#C7412A] accent-hover"
            >
              Go to your dashboard
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingWizard />
    </Suspense>
  );
}
