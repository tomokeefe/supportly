import Link from "next/link";

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Try it risk-free — no credit card needed",
    features: [
      "50 conversations/mo",
      "1 knowledge base",
      "Chat widget",
      "Community support",
    ],
    cta: "Get Started Free",
    href: "/sign-up",
    recommended: false,
  },
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    description: "For small businesses ready to automate support",
    features: [
      "500 conversations/mo",
      "1 knowledge base",
      "Chat + Email + SMS",
      "Basic analytics",
      "Email support",
    ],
    cta: "Start Free Trial",
    href: "/sign-up",
    recommended: false,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/mo",
    description: "For growing teams that need every channel",
    features: [
      "2,500 conversations/mo",
      "3 knowledge bases",
      "All channels",
      "Advanced analytics",
      "Custom branding",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/sign-up",
    recommended: true,
  },
  {
    name: "Business",
    price: "$199",
    period: "/mo",
    description: "For organizations that need scale and control",
    features: [
      "Unlimited conversations",
      "Unlimited knowledge bases",
      "All channels + voice",
      "API access",
      "SLA guarantee",
      "SSO & SAML",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    href: "#",
    recommended: false,
  },
];

export function PricingSection() {
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
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-8 lg:p-10 ${
                plan.recommended
                  ? "bg-white border-2 border-dark"
                  : "bg-white border border-border"
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-base font-semibold text-dark">
                  {plan.name}
                </h3>
                {plan.recommended && (
                  <span className="text-xs font-medium bg-vermillion-light text-vermillion px-2.5 py-0.5 rounded-full">
                    Recommended
                  </span>
                )}
              </div>
              <p className="text-sm text-[--color-text-secondary] mb-6">
                {plan.description}
              </p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="stat-mono text-4xl text-dark">
                  {plan.price}
                </span>
                <span className="text-[--color-text-secondary] text-sm">
                  {plan.period}
                </span>
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
                href={plan.href}
                className={`block w-full text-center py-3 rounded-full text-sm font-medium accent-hover ${
                  plan.recommended
                    ? "bg-vermillion text-white hover:bg-[#C7412A]"
                    : "bg-dark text-cream hover:bg-[#2C2622]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
