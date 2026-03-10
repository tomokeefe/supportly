import Link from "next/link";
import { PLANS, type PlanName } from "@/lib/plans";

const PLAN_META: Record<
  PlanName,
  { description: string; cta: string; href: string }
> = {
  free: {
    description: "Try it risk-free — no credit card needed",
    cta: "Get Started Free",
    href: "/sign-up",
  },
  starter: {
    description: "For small businesses ready to automate support",
    cta: "Start Free Trial",
    href: "/sign-up?plan=starter",
  },
  pro: {
    description: "For growing teams that need every channel",
    cta: "Start Free Trial",
    href: "/sign-up?plan=pro",
  },
  business: {
    description: "For organizations that need scale and control",
    cta: "Contact Sales",
    href: "/sign-up?plan=business",
  },
};

export function PricingSection() {
  const planKeys = Object.keys(PLANS) as PlanName[];

  return (
    <section id="pricing" className="bg-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
        <div className="max-w-xl mb-16">
          <div className="editorial-rule mb-6" />
          <h2 className="heading-editorial text-dark text-3xl md:text-4xl mb-4">
            Transparent pricing. No surprises.
          </h2>
          <p className="text-[--color-text-secondary]">
            Free forever. Upgrade when you&apos;re ready.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {planKeys.map((key) => {
            const plan = PLANS[key];
            const meta = PLAN_META[key];
            const isRecommended = "recommended" in plan && plan.recommended;

            return (
              <div
                key={key}
                className={`rounded-xl p-8 lg:p-10 ${
                  isRecommended
                    ? "bg-white border-2 border-dark"
                    : "bg-white border border-border"
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-base font-semibold text-dark">
                    {plan.name}
                  </h3>
                  {isRecommended && (
                    <span className="text-xs font-medium bg-vermillion-light text-vermillion px-2.5 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-sm text-[--color-text-secondary] mb-6">
                  {meta.description}
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="stat-mono text-4xl text-dark">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-[--color-text-secondary] text-sm">
                      /mo
                    </span>
                  )}
                </div>
                <ul className="space-y-3 mb-10">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-sm text-dark"
                    >
                      <span className="w-1.5 h-1.5 bg-vermillion rounded-full mt-1.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={meta.href}
                  className={`block w-full text-center py-3 rounded-full text-sm font-medium accent-hover ${
                    isRecommended
                      ? "bg-vermillion text-white hover:bg-[#C7412A]"
                      : "bg-dark text-cream hover:bg-[#2C2622]"
                  }`}
                >
                  {meta.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
