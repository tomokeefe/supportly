"use client";

import { useEffect, useState } from "react";
import { PLANS, type PlanName } from "@/lib/plans";

type OrgBilling = {
  plan: string;
  conversationLimit: number;
  currentPeriodConversations: number;
};

const PLAN_KEYS = Object.keys(PLANS) as PlanName[];

export default function BillingPage() {
  const [billing, setBilling] = useState<OrgBilling | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/org")
      .then((r) => r.json())
      .then((data) => {
        if (data.org) {
          setBilling({
            plan: data.org.plan ?? "free",
            conversationLimit: data.org.conversationLimit ?? 50,
            currentPeriodConversations:
              data.org.currentPeriodConversations ?? 0,
          });
          setOrgId(data.org.id);
        }
        setLoading(false);
      });
  }, []);

  async function handleUpgrade(plan: string) {
    if (!orgId) return;
    setUpgrading(plan);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, orgId }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Unable to start checkout. Please try again.");
      }
    } finally {
      setUpgrading(null);
    }
  }

  async function handleManageBilling() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  if (loading) {
    return (
      <div className="px-8 py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-taupe rounded w-32" />
          <div className="h-32 bg-taupe rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-48 bg-taupe rounded" />
            <div className="h-48 bg-taupe rounded" />
          </div>
        </div>
      </div>
    );
  }

  const usagePercent = billing
    ? Math.min(
        100,
        (billing.currentPeriodConversations / billing.conversationLimit) * 100
      )
    : 0;

  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-dark">Billing</h1>
        <p className="text-sm text-[--color-text-secondary] mt-1">
          Manage your plan and usage
        </p>
      </div>

      {/* Current Plan & Usage */}
      {billing && (
        <div className="bg-white rounded-xl border border-border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-[--color-text-secondary]">
                Current Plan
              </p>
              <p className="text-xl font-semibold text-dark capitalize">
                {billing.plan}
              </p>
            </div>
            {billing.plan !== "free" && (
              <button
                onClick={handleManageBilling}
                className="text-sm text-vermillion hover:text-[#C7412A] font-medium accent-hover"
              >
                Manage Billing
              </button>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[--color-text-secondary]">
                Conversations this period
              </span>
              <span className="stat-mono text-dark">
                {billing.currentPeriodConversations.toLocaleString()} /{" "}
                {billing.conversationLimit >= 999999
                  ? "Unlimited"
                  : billing.conversationLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-taupe rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  usagePercent > 90
                    ? "bg-red-500"
                    : usagePercent > 70
                      ? "bg-amber-500"
                      : "bg-vermillion"
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Plan Comparison */}
      <h2 className="font-semibold text-dark mb-4">
        {billing?.plan === "free" ? "Upgrade your plan" : "All plans"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLAN_KEYS.map((key) => {
          const plan = PLANS[key];
          const isCurrent = billing?.plan === key;
          const isRecommended = "recommended" in plan && plan.recommended;
          return (
            <div
              key={key}
              className={`bg-white rounded-xl border p-6 ${
                isRecommended
                  ? "border-vermillion"
                  : isCurrent
                    ? "border-dark"
                    : "border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-dark">{plan.name}</h3>
                {isRecommended && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-vermillion/10 text-vermillion font-medium">
                    Popular
                  </span>
                )}
                {isCurrent && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-dark text-cream font-medium">
                    Current
                  </span>
                )}
              </div>
              <p className="mb-4">
                <span className="stat-mono text-2xl text-dark">
                  ${plan.price}
                </span>
                <span className="text-sm text-[--color-text-secondary]">
                  /mo
                </span>
              </p>
              <p className="text-sm text-[--color-text-secondary] mb-4">
                {plan.limit}
              </p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="text-sm text-[--color-text-secondary] flex items-center gap-2"
                  >
                    <span className="w-1 h-1 bg-vermillion rounded-full flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="text-sm text-[--color-text-secondary] font-medium text-center py-2">
                  Your current plan
                </div>
              ) : key === "free" ? (
                <div className="text-sm text-[--color-text-secondary] text-center py-2">
                  Free forever
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(key)}
                  disabled={upgrading === key}
                  className={`w-full py-2.5 rounded-full text-sm font-medium accent-hover disabled:opacity-50 ${
                    isRecommended
                      ? "bg-vermillion text-white hover:bg-[#C7412A]"
                      : "bg-dark text-cream hover:bg-[#2C2622]"
                  }`}
                >
                  {upgrading === key ? "Redirecting..." : `Upgrade to ${plan.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
