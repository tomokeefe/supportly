"use client";

import { type ReactNode, useState, useEffect } from "react";

// At module-load time, check if the server injected the publishable key
// into the DOM (via an inline script that runs before JS bundles).
// Clerk reads process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY at module-
// import time to construct script URLs. If it's missing, Clerk produces
// broken URLs like `https:///npm/...`. This patches it before any
// @clerk/* module is imported.
if (typeof window !== "undefined") {
  const injected = (window as unknown as Record<string, string>).__CLERK_PK;
  if (injected && typeof process !== "undefined" && process.env) {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = injected;
  }
}

export function ClerkWrapper({
  children,
  publishableKey,
}: {
  children: ReactNode;
  publishableKey?: string;
}) {
  const [ClerkProvider, setClerkProvider] = useState<React.ComponentType<{
    publishableKey: string;
    children: ReactNode;
  }> | null>(null);

  useEffect(() => {
    if (!publishableKey) return;
    import("@clerk/nextjs").then((mod) => {
      setClerkProvider(() => mod.ClerkProvider as unknown as React.ComponentType<{
        publishableKey: string;
        children: ReactNode;
      }>);
    });
  }, [publishableKey]);

  if (!publishableKey || !ClerkProvider) return <>{children}</>;

  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}
