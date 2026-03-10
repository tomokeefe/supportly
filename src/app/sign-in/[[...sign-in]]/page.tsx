"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ResolvlyLogo } from "@/components/resolvly-logo";

const ClerkSignIn = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.SignIn),
  { ssr: false }
);

export default function SignInPage() {
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
              Welcome back.
            </h1>
            <p className="text-[--color-text-secondary]">
              Sign in to your Resolvly dashboard.
            </p>
          </div>
          <div className="flex justify-center">
            <ClerkSignIn
              appearance={{
                variables: {
                  colorPrimary: "#DC4A2E",
                  fontFamily: "DM Sans, sans-serif",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
