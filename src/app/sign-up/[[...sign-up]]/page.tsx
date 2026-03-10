"use client";

import Link from "next/link";
import { ResolvlyLogo } from "@/components/resolvly-logo";
import { ClerkSignUp } from "@/components/clerk-wrapper";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5">
          <Link href="/" aria-label="Resolvly home">
            <ResolvlyLogo />
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
            <ClerkSignUp />
          </div>
        </div>
      </div>
    </div>
  );
}
