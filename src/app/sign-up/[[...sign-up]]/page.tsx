"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

const clerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const ClerkSignUp = clerkConfigured
  ? dynamic(
      () => import("@clerk/nextjs").then((mod) => mod.SignUp),
      { ssr: false }
    )
  : null;

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5">
          <Link
            href="/"
            className="heading-editorial text-2xl text-dark tracking-tight"
          >
            Resolvly
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="heading-editorial text-dark text-3xl mb-2">
              Get started with Resolvly.
            </h1>
            <p className="text-[--color-text-secondary]">
              Create your account, then set up your AI agent in under 5
              minutes.
            </p>
          </div>
          <div className="flex justify-center">
            {ClerkSignUp ? (
              <ClerkSignUp
                appearance={{
                  variables: {
                    colorPrimary: "#DC4A2E",
                    fontFamily: "DM Sans, sans-serif",
                  },
                }}
              />
            ) : (
              <div className="text-center">
                <p className="text-sm text-[--color-text-secondary] mb-4">
                  Authentication is not configured yet.
                </p>
                <p className="text-xs text-[--color-text-secondary]">
                  Set <code className="bg-taupe px-1.5 py-0.5 rounded font-mono">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and{" "}
                  <code className="bg-taupe px-1.5 py-0.5 rounded font-mono">CLERK_SECRET_KEY</code> in your{" "}
                  <code className="bg-taupe px-1.5 py-0.5 rounded font-mono">.env.local</code> to enable auth.
                </p>
                <Link
                  href="/onboarding"
                  className="inline-block mt-6 text-sm font-medium bg-dark text-cream px-6 py-2.5 rounded-full hover:bg-[#2C2622] accent-hover"
                >
                  Continue to Onboarding
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
