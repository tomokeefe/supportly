import Link from "next/link";

const STATS = [
  { value: "70%+", label: "Conversations resolved by AI" },
  { value: "$0.05", label: "Per conversation (vs $6 for humans)" },
  { value: "24/7", label: "Always-on support coverage" },
  { value: "<2s", label: "Average response time" },
];

const FEATURES = [
  {
    title: "AI-Powered Responses",
    description:
      "Claude-powered agent that understands context, follows conversations, and provides accurate answers from your knowledge base.",
    icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  },
  {
    title: "Smart Escalation",
    description:
      "Every response includes a confidence score. When the AI isn't sure, it automatically hands off to your human team.",
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
  },
  {
    title: "Your Knowledge Base",
    description:
      "Upload your FAQs, docs, and policies. The AI only answers from what you provide — no hallucinations.",
    icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
  },
  {
    title: "Omnichannel Ready",
    description:
      "Same AI brain across chat, email, SMS, and voice. Consistent answers no matter how customers reach out.",
    icon: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155",
  },
  {
    title: "5-Minute Setup",
    description:
      "Add one script tag to your website. Configure your knowledge base. You're live. No engineers needed.",
    icon: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
  },
  {
    title: "Analytics Dashboard",
    description:
      "See resolution rates, confidence trends, and escalation patterns. Know exactly how your AI agent is performing.",
    icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605",
  },
];

const PRICING = [
  {
    name: "Starter",
    price: "$299",
    period: "/mo",
    description: "For small businesses getting started",
    features: [
      "500 conversations/mo",
      "1 knowledge base",
      "Chat widget",
      "Email support",
      "Basic analytics",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "$599",
    period: "/mo",
    description: "For growing teams that need more",
    features: [
      "2,500 conversations/mo",
      "3 knowledge bases",
      "Chat + Email + SMS",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$1,999",
    period: "/mo",
    description: "For organizations at scale",
    features: [
      "Unlimited conversations",
      "Unlimited knowledge bases",
      "All channels + voice",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "SSO & SAML",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Supportly</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <Link href="/demo" className="text-sm text-gray-600 hover:text-gray-900">Demo</Link>
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
            <Link href="/demo" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Try It Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          Now handling 1M+ conversations/month
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6 max-w-4xl mx-auto">
          Your AI support agent that<span className="text-blue-600"> actually works</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          SMBs miss 62% of customer calls. Supportly handles 70%+ of conversations with AI — at $0.05 each instead of $6 for a human agent.
        </p>
        <div className="flex justify-center gap-4 mb-16">
          <Link href="/demo" className="bg-blue-600 text-white px-8 py-3.5 rounded-lg text-lg font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200">
            See It In Action
          </Link>
          <a href="#pricing" className="border border-gray-300 text-gray-700 px-8 py-3.5 rounded-lg text-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition">
            View Pricing
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Code snippet */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-gray-950 rounded-2xl p-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-500 text-xs ml-2">index.html</span>
          </div>
          <pre className="text-sm text-gray-300 overflow-x-auto">
            <code>
              <span className="text-gray-500">&lt;!-- Add Supportly to your site --&gt;</span>{"\n"}
              <span className="text-pink-400">&lt;script</span>{"\n"}
              {"  "}<span className="text-blue-400">src</span><span className="text-gray-500">=</span><span className="text-green-400">&quot;https://cdn.supportly.ai/widget.js&quot;</span>{"\n"}
              {"  "}<span className="text-blue-400">data-org</span><span className="text-gray-500">=</span><span className="text-green-400">&quot;your-org-slug&quot;</span>{"\n"}
              <span className="text-pink-400">&gt;&lt;/script&gt;</span>{"\n\n"}
              <span className="text-gray-500">&lt;!-- That&apos;s it. You&apos;re live. --&gt;</span>
            </code>
          </pre>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to automate support</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built for SMBs who want enterprise-grade AI support without the enterprise price tag.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-600">Start free for 14 days. No credit card required.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING.map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 ${plan.highlighted ? "bg-blue-600 text-white ring-4 ring-blue-200 scale-105" : "bg-white border border-gray-200"}`}>
                <h3 className={`text-lg font-semibold mb-1 ${plan.highlighted ? "text-blue-100" : "text-gray-900"}`}>{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.highlighted ? "text-blue-200" : "text-gray-500"}`}>{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={plan.highlighted ? "text-blue-200" : "text-gray-500"}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <svg className={`w-5 h-5 flex-shrink-0 ${plan.highlighted ? "text-blue-200" : "text-blue-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-lg font-medium transition ${plan.highlighted ? "bg-white text-blue-600 hover:bg-blue-50" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-950 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stop missing customer conversations</h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Join hundreds of SMBs using Supportly to provide 24/7 AI-powered support. Set up in 5 minutes.
          </p>
          <Link href="/demo" className="inline-block bg-blue-600 text-white px-8 py-3.5 rounded-lg text-lg font-medium hover:bg-blue-700 transition">
            Try the Live Demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">Supportly</span>
          </div>
          <p className="text-sm text-gray-500">&copy; 2024 Supportly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
