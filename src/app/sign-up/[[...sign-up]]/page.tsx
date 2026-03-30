"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { ResolvlyLogo } from "@/components/resolvly-logo";

function SignUpContent() {
  const searchParams = useSearchParams();

  // Persist selected plan across the Clerk sign-up redirect
  useEffect(() => {
    const plan = searchParams.get("plan");
    if (plan) {
      localStorage.setItem("resolvly_selected_plan", plan);
    }
  }, [searchParams]);

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
            <SignUp />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpContent />
    </Suspense>
  );
}
