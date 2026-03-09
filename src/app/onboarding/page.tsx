"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const VERTICALS = [
  "Property Management",
  "Legal / Law Firm",
  "Healthcare / Dental",
  "Restaurant / Cafe",
  "E-commerce",
  "Auto / Home Services",
  "Other",
];

type FAQ = { title: string; content: string };

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [businessName, setBusinessName] = useState("");
  const [vertical, setVertical] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Step 2
  const [faqs, setFaqs] = useState<FAQ[]>([{ title: "", content: "" }]);

  // Step 3
  const [orgSlug, setOrgSlug] = useState("");
  const [widgetColor, setWidgetColor] = useState("#DC4A2E");

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

  async function handleSubmit() {
    setLoading(true);
    try {
      const validFaqs = faqs.filter((f) => f.title.trim() && f.content.trim());
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business: { name: businessName, vertical, websiteUrl },
          faqs: validFaqs,
          widgetColor,
        }),
      });
      const data = await res.json();
      if (data.orgSlug) {
        setOrgSlug(data.orgSlug);
        setStep(3);
      }
    } catch (err) {
      console.error("Onboarding error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5">
          <Link
            href="/"
            className="heading-editorial text-2xl text-dark tracking-tight"
          >
            Supportly
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Step indicator */}
        <div className="flex items-center gap-8 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <span
                className={`stat-mono text-sm ${
                  s === step
                    ? "text-vermillion"
                    : s < step
                      ? "text-dark"
                      : "text-[--color-text-secondary]"
                }`}
              >
                0{s}
              </span>
              <span
                className={`text-sm ${
                  s === step
                    ? "text-dark font-medium"
                    : "text-[--color-text-secondary]"
                }`}
              >
                {s === 1
                  ? "Your business"
                  : s === 2
                    ? "Knowledge base"
                    : "Go live"}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Business Info */}
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
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-dark mb-2"
                >
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
                <label
                  htmlFor="vertical"
                  className="block text-sm font-medium text-dark mb-2"
                >
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
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-dark mb-2"
                >
                  Website URL{" "}
                  <span className="text-[--color-text-secondary] font-normal">
                    (optional)
                  </span>
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
              onClick={() => setStep(2)}
              disabled={!businessName.trim() || !vertical}
              className="mt-10 inline-flex items-center gap-2 bg-dark text-cream px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#2C2622] accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
              <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        )}

        {/* Step 2: Knowledge Base */}
        {step === 2 && (
          <div>
            <div className="editorial-rule mb-6" />
            <h1 className="heading-editorial text-dark text-3xl md:text-4xl mb-3">
              Add your FAQs.
            </h1>
            <p className="text-[--color-text-secondary] mb-10">
              Add common questions and answers. Your AI agent will use these to
              respond to customers. You can always add more later.
            </p>

            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="bg-white border border-border rounded-lg p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="stat-mono text-xs text-vermillion">
                      FAQ {i + 1}
                    </span>
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
                    placeholder="Answer (e.g., We're open Mon-Fri 9am-5pm, Sat 10am-2pm)"
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

            <div className="flex items-center gap-4 mt-10">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-[--color-text-secondary] hover:text-dark accent-hover"
              >
                &larr; Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-dark text-cream px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#2C2622] accent-hover disabled:opacity-40"
              >
                {loading ? "Setting up..." : "Create my agent"}
                {!loading && <span aria-hidden="true">&rarr;</span>}
              </button>
              <button
                onClick={() => {
                  setFaqs([]);
                  handleSubmit();
                }}
                disabled={loading}
                className="text-sm text-[--color-text-secondary] hover:text-dark accent-hover"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Go Live */}
        {step === 3 && (
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
                      `<script src="https://cdn.supportly.ai/widget.js" data-org="${orgSlug}" data-color="${widgetColor}"></script>`
                    );
                  }}
                  className="text-xs text-vermillion hover:text-[#C7412A] accent-hover font-medium"
                >
                  Copy
                </button>
              </div>
              <pre className="text-sm font-mono text-[#E7E5E4] leading-relaxed overflow-x-auto">
                <code>
                  <span className="text-[#78716C]">
                    &lt;!-- Add Supportly to your site --&gt;
                  </span>
                  {"\n"}
                  <span className="text-[#E7E5E4]">&lt;script</span>
                  {"\n"}
                  {"  "}
                  <span className="text-vermillion">src</span>
                  <span className="text-[#78716C]">=</span>
                  <span className="text-[#A8A29E]">
                    &quot;https://cdn.supportly.ai/widget.js&quot;
                  </span>
                  {"\n"}
                  {"  "}
                  <span className="text-vermillion">data-org</span>
                  <span className="text-[#78716C]">=</span>
                  <span className="text-[#A8A29E]">
                    &quot;{orgSlug}&quot;
                  </span>
                  {"\n"}
                  {"  "}
                  <span className="text-vermillion">data-color</span>
                  <span className="text-[#78716C]">=</span>
                  <span className="text-[#A8A29E]">
                    &quot;{widgetColor}&quot;
                  </span>
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
