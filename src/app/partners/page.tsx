"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ResolvlyLogo } from "@/components/resolvly-logo";

type AffiliateData = {
  affiliate: {
    id: string;
    name: string;
    email: string;
    company: string | null;
    referralCode: string;
    commissionRate: number;
    status: string;
    totalEarned: number;
    totalPaid: number;
    balance: number;
  };
  stats: {
    totalReferrals: number;
    activeCustomers: number;
    monthlyCommission: number;
    pendingReferrals: number;
  };
  referrals: {
    id: string;
    customerEmail: string | null;
    plan: string | null;
    status: string;
    commissionAmount: number | null;
    convertedAt: string | null;
    createdAt: string;
  }[];
  payouts: {
    id: string;
    amount: number;
    status: string;
    periodStart: string;
    periodEnd: string;
    createdAt: string;
  }[];
};

function cents(amount: number): string {
  return `$${(amount / 100).toFixed(2)}`;
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <p className="text-sm text-[--color-text-secondary] mb-1">{label}</p>
      <p className="stat-mono text-3xl text-dark">{value}</p>
      {sub && (
        <p className="text-xs text-[--color-text-secondary] mt-1">{sub}</p>
      )}
    </div>
  );
}

// ── Apply Form ────────────────────────────────────────────────────────
function ApplyForm({ onSuccess }: { onSuccess: (code: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      name: form.get("name"),
      email: form.get("email"),
      company: form.get("company") || undefined,
      paypalEmail: form.get("paypalEmail") || undefined,
    };

    const res = await fetch("/api/affiliates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    onSuccess(data.affiliate.referralCode);
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl border border-border p-8">
        <h2 className="text-xl font-semibold text-dark mb-2">
          Become a Partner
        </h2>
        <p className="text-sm text-[--color-text-secondary] mb-6">
          Earn 20% recurring commission on every customer you refer.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Full Name
            </label>
            <input
              name="name"
              required
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vermillion/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vermillion/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              Company / Agency
              <span className="text-[--color-text-secondary] font-normal">
                {" "}
                (optional)
              </span>
            </label>
            <input
              name="company"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vermillion/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark mb-1">
              PayPal Email
              <span className="text-[--color-text-secondary] font-normal">
                {" "}
                (for payouts)
              </span>
            </label>
            <input
              name="paypalEmail"
              type="email"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vermillion/30"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-vermillion text-white py-3 rounded-full text-sm font-medium hover:bg-[#C7412A] accent-hover disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Apply to Partner Program"}
          </button>
        </form>
      </div>

      <div className="mt-8 bg-white rounded-xl border border-border p-8">
        <h3 className="text-base font-semibold text-dark mb-4">
          How it works
        </h3>
        <div className="space-y-4 text-sm text-[--color-text-secondary]">
          <div className="flex gap-3">
            <span className="w-6 h-6 bg-vermillion/10 text-vermillion rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              1
            </span>
            <p>Apply and get approved. We review applications within 24 hours.</p>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 bg-vermillion/10 text-vermillion rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              2
            </span>
            <p>
              Share your unique referral link with your clients and audience.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 bg-vermillion/10 text-vermillion rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              3
            </span>
            <p>
              Earn 20% recurring commission for every customer who signs up
              through your link — paid monthly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard View ────────────────────────────────────────────────────
function Dashboard({ code }: { code: string }) {
  const [data, setData] = useState<AffiliateData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/affiliates/dashboard?code=${code}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      });
  }, [code]);

  useEffect(() => {
    load();
  }, [load]);

  if (error)
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => {
            localStorage.removeItem("resolvly_affiliate_code");
            window.location.reload();
          }}
          className="text-sm text-vermillion hover:underline"
        >
          Try a different code
        </button>
      </div>
    );

  if (!data)
    return (
      <div className="text-center py-12 text-[--color-text-secondary]">
        Loading dashboard...
      </div>
    );

  const referralUrl = `${window.location.origin}?ref=${data.affiliate.referralCode}`;

  const STATUS_BADGE: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    converted: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-dark">
            Welcome back, {data.affiliate.name}
          </h2>
          {data.affiliate.status === "pending" && (
            <p className="text-sm text-amber-600 mt-1">
              Your application is pending review. You can still prepare your
              referral link.
            </p>
          )}
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("resolvly_affiliate_code");
            window.location.reload();
          }}
          className="text-sm text-[--color-text-secondary] hover:text-dark"
        >
          Sign out
        </button>
      </div>

      {/* Referral link */}
      <div className="bg-white rounded-xl border border-border p-6">
        <p className="text-sm font-medium text-dark mb-2">
          Your Referral Link
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={referralUrl}
            className="flex-1 px-3 py-2 bg-cream border border-border rounded-lg text-sm text-dark"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(referralUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-4 py-2 bg-dark text-cream rounded-lg text-sm font-medium hover:bg-[#2C2622]"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-[--color-text-secondary] mt-2">
          90-day cookie attribution — your referral earns commission even if
          they sign up weeks later.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Referrals"
          value={String(data.stats.totalReferrals)}
        />
        <StatCard
          label="Active Customers"
          value={String(data.stats.activeCustomers)}
        />
        <StatCard
          label="Monthly Commission"
          value={cents(data.stats.monthlyCommission)}
          sub="recurring"
        />
        <StatCard
          label="Balance"
          value={cents(data.affiliate.balance)}
          sub={`${cents(data.affiliate.totalEarned)} earned · ${cents(data.affiliate.totalPaid)} paid`}
        />
      </div>

      {/* Commission table */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-6 text-center">
          <p className="text-sm text-[--color-text-secondary]">Starter Plan</p>
          <p className="stat-mono text-2xl text-dark mt-1">$9.80</p>
          <p className="text-xs text-[--color-text-secondary]">/mo per customer</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-6 text-center">
          <p className="text-sm text-[--color-text-secondary]">Pro Plan</p>
          <p className="stat-mono text-2xl text-dark mt-1">$29.80</p>
          <p className="text-xs text-[--color-text-secondary]">/mo per customer</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-6 text-center">
          <p className="text-sm text-[--color-text-secondary]">Business Plan</p>
          <p className="stat-mono text-2xl text-dark mt-1">$79.80</p>
          <p className="text-xs text-[--color-text-secondary]">/mo per customer</p>
        </div>
      </div>

      {/* Referrals list */}
      {data.referrals.length > 0 && (
        <div className="bg-white rounded-xl border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-base font-semibold text-dark">Referrals</h3>
          </div>
          <div className="divide-y divide-border">
            {data.referrals.map((ref) => (
              <div
                key={ref.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-dark">
                    {ref.customerEmail ?? "Anonymous"}
                  </p>
                  <p className="text-xs text-[--color-text-secondary]">
                    {ref.plan
                      ? `${ref.plan.charAt(0).toUpperCase()}${ref.plan.slice(1)} plan`
                      : "No plan yet"}{" "}
                    · {new Date(ref.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {ref.commissionAmount != null && ref.commissionAmount > 0 && (
                    <span className="text-sm font-medium text-dark">
                      {cents(ref.commissionAmount)}/mo
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[ref.status] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {ref.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payouts list */}
      {data.payouts.length > 0 && (
        <div className="bg-white rounded-xl border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-base font-semibold text-dark">Payouts</h3>
          </div>
          <div className="divide-y divide-border">
            {data.payouts.map((payout) => (
              <div
                key={payout.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-dark">{cents(payout.amount)}</p>
                  <p className="text-xs text-[--color-text-secondary]">
                    {new Date(payout.periodStart).toLocaleDateString()} –{" "}
                    {new Date(payout.periodEnd).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[payout.status] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {payout.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Login Form ────────────────────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: (code: string) => void }) {
  const [code, setCode] = useState("");

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl border border-border p-8">
        <h2 className="text-xl font-semibold text-dark mb-2">
          Partner Login
        </h2>
        <p className="text-sm text-[--color-text-secondary] mb-6">
          Enter your referral code to access your dashboard.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (code.trim()) onLogin(code.trim());
          }}
          className="space-y-4"
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Your referral code"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-vermillion/30"
          />
          <button
            type="submit"
            className="w-full bg-dark text-cream py-3 rounded-full text-sm font-medium hover:bg-[#2C2622]"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function PartnersPage() {
  const [view, setView] = useState<"loading" | "apply" | "login" | "dashboard">(
    "loading"
  );
  const [code, setCode] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("resolvly_affiliate_code");
    if (saved) {
      setCode(saved);
      setView("dashboard");
    } else {
      setView("apply");
    }
  }, []);

  function handleLogin(referralCode: string) {
    localStorage.setItem("resolvly_affiliate_code", referralCode);
    setCode(referralCode);
    setView("dashboard");
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <ResolvlyLogo size="md" />
          </Link>
          <div className="flex items-center gap-4">
            {view === "apply" && (
              <button
                onClick={() => setView("login")}
                className="text-sm text-[--color-text-secondary] hover:text-dark"
              >
                Already a partner? Log in
              </button>
            )}
            {view === "login" && (
              <button
                onClick={() => setView("apply")}
                className="text-sm text-[--color-text-secondary] hover:text-dark"
              >
                Apply to become a partner
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        {view !== "dashboard" && (
          <div className="text-center mb-12">
            <h1 className="heading-editorial text-dark text-3xl md:text-4xl mb-3">
              Partner Program
            </h1>
            <p className="text-[--color-text-secondary] max-w-lg mx-auto">
              Earn 20% recurring commission for every customer you refer to
              Resolvly. Our partners earn up to $79.80/mo per referral.
            </p>
          </div>
        )}

        {view === "loading" && (
          <div className="text-center py-12 text-[--color-text-secondary]">
            Loading...
          </div>
        )}
        {view === "apply" && <ApplyForm onSuccess={handleLogin} />}
        {view === "login" && <LoginForm onLogin={handleLogin} />}
        {view === "dashboard" && <Dashboard code={code} />}
      </div>
    </div>
  );
}
