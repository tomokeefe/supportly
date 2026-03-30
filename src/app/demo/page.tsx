import Script from "next/script";
import { auth } from "@clerk/nextjs/server";
import { Nav } from "@/components/nav";

export const metadata = {
  title: "Live Demo — Resolvly",
};

export default async function DemoPage() {
  let isSignedIn = false;
  try {
    const { userId } = await auth();
    isSignedIn = !!userId;
  } catch {
    // Clerk not configured
  }

  return (
    <div className="min-h-screen bg-cream">
      <Nav isSignedIn={isSignedIn} />

      {/* Demo content - simulating a property management website */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Demo instructions */}
        <div className="mb-8 max-w-xl">
          <div className="editorial-rule mb-6" />
          <h1 className="heading-editorial text-dark text-3xl md:text-4xl mb-4">
            See Resolvly in action.
          </h1>
          <p className="text-[--color-text-secondary] leading-relaxed">
            Below is a simulated property management website with a live AI agent.
            Click the chat bubble in the bottom-right corner to start a conversation.
          </p>
        </div>

        {/* Simulated client website */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {/* Fake website header */}
          <div className="bg-emerald-700 text-white px-8 py-6">
            <h2 className="text-2xl font-bold">Sunrise Property Management</h2>
            <p className="text-emerald-200 text-sm mt-1">Your home, our priority</p>
          </div>

          <div className="p-8">
            <h3 className="text-xl font-semibold text-dark mb-4">Welcome to Sunrise Properties</h3>
            <p className="text-[--color-text-secondary] mb-6 leading-relaxed">
              Sunrise Property Management has been serving the community since 2010. We manage over 500
              residential units across 12 properties, providing exceptional living experiences for our tenants.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="border border-border rounded-lg p-5">
                <h4 className="font-semibold text-dark mb-3">For Current Tenants</h4>
                <ul className="space-y-2 text-sm text-[--color-text-secondary]">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                    Pay rent online
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                    Submit maintenance requests
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                    View lease details
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                    Register pets
                  </li>
                </ul>
              </div>
              <div className="border border-border rounded-lg p-5">
                <h4 className="font-semibold text-dark mb-3">Property Amenities</h4>
                <ul className="space-y-2 text-sm text-[--color-text-secondary]">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                    Fitness center
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                    Resort-style pool
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                    Business center
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                    Dog park
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-taupe rounded-lg p-5">
              <h4 className="font-semibold text-dark mb-2">Contact Us</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-[--color-text-secondary]">
                <div>
                  <p className="font-medium text-dark">Address</p>
                  <p>123 Main St, Suite 200</p>
                </div>
                <div>
                  <p className="font-medium text-dark">Phone</p>
                  <p>(555) 123-4567</p>
                </div>
                <div>
                  <p className="font-medium text-dark">Hours</p>
                  <p>Mon-Fri 9-5, Sat 10-2</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sample questions */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[--color-text-secondary] mb-3">Try asking the chatbot:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "How do I pay rent?",
              "What's the pet policy?",
              "I need maintenance help",
              "What amenities do you have?",
              "How do I break my lease?",
            ].map((q) => (
              <span
                key={q}
                className="text-xs bg-white border border-border px-3 py-1.5 rounded-full text-[--color-text-secondary]"
              >
                &ldquo;{q}&rdquo;
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Load the chat widget */}
      <Script
        src="/widget.js"
        data-org="sunrise-pm"
        data-color="#DC4A2E"
        data-header-title="Sunrise PM"
        data-agent-name="AI Assistant"
        data-greeting="Hi! I'm Sunrise PM's virtual assistant. How can I help you today?"
        data-questions="How do I pay rent?|I need maintenance help|What's the pet policy?|What amenities do you have?"
        strategy="afterInteractive"
      />
    </div>
  );
}
