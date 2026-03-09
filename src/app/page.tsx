import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

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

export default async function LandingPage() {
  let isSignedIn = false;
  try {
    const { userId } = await auth();
    isSignedIn = !!userId;
  } catch {
    // Clerk not configured — show signed-out nav
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="heading-editorial text-2xl text-dark tracking-tight"
          >
            Supportly
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm text-[--color-text-secondary] hover:text-dark accent-hover"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-sm text-[--color-text-secondary] hover:text-dark accent-hover"
            >
              Pricing
            </a>
            <Link
              href="/demo"
              className="text-sm text-[--color-text-secondary] hover:text-dark accent-hover"
            >
              Demo
            </Link>
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium bg-vermillion text-white px-5 py-2 rounded-full hover:bg-[#C7412A] accent-hover"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm text-[--color-text-secondary] hover:text-dark accent-hover"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="text-sm font-medium bg-vermillion text-white px-5 py-2 rounded-full hover:bg-[#C7412A] accent-hover"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-24 pb-20 lg:pt-32 lg:pb-28">
          <div className="max-w-3xl">
            <h1 className="heading-editorial text-dark text-5xl md:text-6xl lg:text-7xl mb-8">
              Your customers have questions at 2am.
              <br />
              <span className="text-vermillion">Now they get answers.</span>
            </h1>
            <p className="text-lg md:text-xl text-[--color-text-secondary] leading-relaxed max-w-xl mb-10">
              An AI support agent that works from your knowledge base. It
              handles the conversations you can&apos;t — nights, weekends,
              holidays — at a fraction of the cost.
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 bg-dark text-cream px-8 py-4 rounded-full text-base font-medium hover:bg-[#2C2622] accent-hover"
            >
              See it in action
              <span aria-hidden="true">&rarr;</span>
            </Link>
            <p className="mt-8 text-sm text-[--color-text-secondary]">
              Trusted by 200+ small businesses. Set up in under 5 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <div className="editorial-rule mb-6" />
              <h2 className="heading-editorial text-dark text-3xl md:text-4xl mb-6">
                Small businesses lose customers while they sleep.
              </h2>
              <p className="text-[--color-text-secondary] leading-relaxed">
                Most SMBs can&apos;t afford round-the-clock support staff. So
                questions go unanswered, leads go cold, and customers find
                someone who will pick up.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-px bg-border">
                <div className="bg-cream p-8 lg:p-10">
                  <p className="stat-mono text-5xl lg:text-6xl text-dark mb-3">
                    62%
                  </p>
                  <p className="text-sm text-[--color-text-secondary] leading-relaxed">
                    of customer calls to small businesses go unanswered
                  </p>
                </div>
                <div className="bg-cream p-8 lg:p-10">
                  <p className="stat-mono text-5xl lg:text-6xl text-vermillion mb-3">
                    $6
                  </p>
                  <p className="text-sm text-[--color-text-secondary] leading-relaxed">
                    average cost per interaction with a human support agent
                  </p>
                </div>
                <div className="bg-cream p-8 lg:p-10">
                  <p className="stat-mono text-5xl lg:text-6xl text-dark mb-3">
                    70%
                  </p>
                  <p className="text-sm text-[--color-text-secondary] leading-relaxed">
                    of conversations resolved by AI, without human intervention
                  </p>
                </div>
                <div className="bg-cream p-8 lg:p-10">
                  <p className="stat-mono text-5xl lg:text-6xl text-dark mb-3">
                    $0.05
                  </p>
                  <p className="text-sm text-[--color-text-secondary] leading-relaxed">
                    per AI-handled conversation — 120x cheaper than human agents
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-taupe">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div className="max-w-xl mb-16">
            <div className="editorial-rule mb-6" />
            <h2 className="heading-editorial text-dark text-3xl md:text-4xl">
              Live in five minutes. Not five sprints.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            <div>
              <p className="stat-mono text-sm text-vermillion mb-4">01</p>
              <h3 className="text-lg font-semibold text-dark mb-3">
                Add one line of code
              </h3>
              <p className="text-[--color-text-secondary] text-sm leading-relaxed mb-6">
                Drop a single script tag on your site. The chat widget appears
                instantly — styled to match your brand, no design work needed.
              </p>
              <div className="bg-dark rounded-lg p-5">
                <code className="text-sm font-mono text-[#E7E5E4] leading-relaxed block">
                  <span className="text-[#78716C]">
                    &lt;!-- Add Supportly --&gt;
                  </span>
                  {"\n"}
                  <span className="text-[#E7E5E4]">&lt;script </span>
                  <span className="text-vermillion">src</span>
                  <span className="text-[#78716C]">=</span>
                  <span className="text-[#A8A29E]">
                    &quot;cdn.supportly.ai/w.js&quot;
                  </span>
                  {"\n"}
                  {"  "}
                  <span className="text-vermillion">data-org</span>
                  <span className="text-[#78716C]">=</span>
                  <span className="text-[#A8A29E]">
                    &quot;your-slug&quot;
                  </span>
                  <span className="text-[#E7E5E4]"> /&gt;</span>
                </code>
              </div>
            </div>

            <div>
              <p className="stat-mono text-sm text-vermillion mb-4">02</p>
              <h3 className="text-lg font-semibold text-dark mb-3">
                Upload your knowledge base
              </h3>
              <p className="text-[--color-text-secondary] text-sm leading-relaxed">
                Add your FAQs, policies, product docs — whatever your customers
                ask about. The AI only answers from what you provide. No
                hallucinations. No off-brand responses.
              </p>
            </div>

            <div>
              <p className="stat-mono text-sm text-vermillion mb-4">03</p>
              <h3 className="text-lg font-semibold text-dark mb-3">
                Let the AI handle it
              </h3>
              <p className="text-[--color-text-secondary] text-sm leading-relaxed">
                Your agent starts answering immediately. When it&apos;s not
                confident, it escalates to your team automatically. You stay in
                control without doing the work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div className="max-w-xl mb-16">
            <div className="editorial-rule mb-6" />
            <h2 className="heading-editorial text-dark text-3xl md:text-4xl">
              Built for businesses that can&apos;t afford to miss a question.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-12 lg:gap-y-16">
            <div className="border-t border-border pt-6">
              <h3 className="text-base font-semibold text-dark mb-2">
                Answers grounded in your knowledge base
              </h3>
              <p className="text-sm text-[--color-text-secondary] leading-relaxed">
                Every response is sourced from your uploaded docs, FAQs, and
                policies. The AI never makes things up. If it doesn&apos;t know,
                it says so and routes to your team.
              </p>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-base font-semibold text-dark mb-2">
                Confidence scoring with auto-escalation
              </h3>
              <p className="text-sm text-[--color-text-secondary] leading-relaxed">
                Every response carries a confidence score. Fall below your
                threshold and the conversation is handed to a human
                automatically. No customer left hanging.
              </p>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-base font-semibold text-dark mb-2">
                Works across chat, email, SMS, and voice
              </h3>
              <p className="text-sm text-[--color-text-secondary] leading-relaxed">
                Same AI brain, every channel. Customers get consistent answers
                whether they message your website, email your support address, or
                text your business number.
              </p>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-base font-semibold text-dark mb-2">
                See exactly how your agent performs
              </h3>
              <p className="text-sm text-[--color-text-secondary] leading-relaxed">
                Resolution rates, confidence trends, escalation patterns, peak
                hours — the dashboard shows you what&apos;s working and where
                you can improve.
              </p>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-base font-semibold text-dark mb-2">
                Your brand, your persona
              </h3>
              <p className="text-sm text-[--color-text-secondary] leading-relaxed">
                Customize the agent&apos;s name, tone, and appearance. Match
                your brand colors. Customers interact with your business, not a
                generic chatbot.
              </p>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-base font-semibold text-dark mb-2">
                No engineers required
              </h3>
              <p className="text-sm text-[--color-text-secondary] leading-relaxed">
                One script tag. A file upload for your docs. That&apos;s the
                setup. No API keys to configure, no webhooks to wire up, no
                developers on call.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
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

      {/* Final CTA */}
      <section className="bg-dark">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div className="max-w-2xl">
            <h2 className="heading-editorial text-cream text-3xl md:text-4xl lg:text-5xl mb-6">
              Stop losing customers to voicemail.
            </h2>
            <p className="text-[#A8A29E] text-lg leading-relaxed mb-10">
              Your customers are reaching out right now. Give them an answer in
              seconds, not hours. Start your free trial — no credit card, no
              commitment, live in five minutes.
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 bg-vermillion text-white px-8 py-4 rounded-full text-base font-medium hover:bg-[#C7412A] accent-hover"
            >
              Start your free trial
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex items-center justify-between">
          <span className="heading-editorial text-dark text-lg">
            Supportly
          </span>
          <p className="text-sm text-[--color-text-secondary]">
            &copy; {new Date().getFullYear()} Supportly. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
