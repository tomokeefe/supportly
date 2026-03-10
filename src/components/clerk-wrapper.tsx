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
  // We bypass this by passing clerkJSUrl directly, derived server-side.
  const clerkJSUrl = clerkDomain
    ? `https://${clerkDomain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`
    : undefined;

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      {...(clerkJSUrl ? { clerkJSUrl } : {})}
    >
      {children}
    </ClerkProvider>
  );
}
