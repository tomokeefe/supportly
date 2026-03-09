import Link from "next/link";
import Script from "next/script";

export const metadata = {
  title: "Live Demo — Supportly",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Supportly</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">Home</Link>
          </div>
        </div>
      </nav>

      {/* Demo content - simulating a property management website */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Fake website header */}
          <div className="bg-emerald-700 text-white px-8 py-6">
            <h1 className="text-2xl font-bold">Sunrise Property Management</h1>
            <p className="text-emerald-200 text-sm mt-1">Your home, our priority</p>
          </div>

          <div className="p-8">
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Supportly Demo</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Click the chat bubble in the bottom-right corner to talk to the AI support agent.
                    Try asking about rent payments, maintenance requests, pet policies, or amenities.
                    The agent uses a knowledge base to answer — in demo mode it responds with the best matching article.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to Sunrise Properties</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Sunrise Property Management has been serving the community since 2010. We manage over 500
              residential units across 12 properties, providing exceptional living experiences for our tenants.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">For Current Tenants</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Pay rent online
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Submit maintenance requests
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    View lease details
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Register pets
                  </li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Property Amenities</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Fitness center
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Resort-style pool
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Business center
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Dog park
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Contact Us</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-700">Address</p>
                  <p>123 Main St, Suite 200</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Phone</p>
                  <p>(555) 123-4567</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Hours</p>
                  <p>Mon-Fri 9-5, Sat 10-2</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sample questions */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-3">Try asking the chatbot:</p>
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
                className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-full text-gray-600"
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
        data-color="#2563eb"
        strategy="afterInteractive"
      />
    </div>
  );
}
