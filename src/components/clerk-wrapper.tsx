"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { type ReactNode } from "react";

export function ClerkWrapper({
  children,
  publishableKey,
  clerkDomain,
}: {
  children: ReactNode;
  publishableKey?: string;
  clerkDomain?: string;
}) {
  if (!publishableKey) return <>{children}</>;

  // Clerk internally constructs its script URL from the publishable key's
  // encoded domain. But on Vercel, process.env.NEXT_PUBLIC_* is statically
  // replaced at build time — if the env var wasn't available during the build,
  // the compiled JS has "" baked in, producing `https:///npm/...`.
  // We bypass this by passing __internal_clerkJSUrl directly, derived
  // server-side where the env var is available at runtime.
  const extra: Record<string, string> = {};
  if (clerkDomain) {
    extra.__internal_clerkJSUrl = `https://${clerkDomain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} {...extra}>
      {children}
    </ClerkProvider>
  );
}
