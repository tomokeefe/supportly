"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

// Context to share lazily-loaded Clerk components with the rest of the app.
// This ensures @clerk/nextjs is imported exactly ONCE, after we've patched
// the publishable key env var (which Clerk reads at module-init time).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ClerkComponentsCtx = createContext<Record<string, any> | null>(null);

export function useClerkComponents() {
  return useContext(ClerkComponentsCtx);
}

export function ClerkWrapper({
  children,
  publishableKey,
  clerkDomain,
}: {
  children: ReactNode;
  publishableKey?: string;
  clerkDomain?: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [clerkMod, setClerkMod] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    if (!publishableKey) return;

    // Patch env var BEFORE importing @clerk/nextjs.
    // Next.js statically replaces process.env.NEXT_PUBLIC_* at build time.
    // If the value was "" during the Vercel build, the compiled @clerk/nextjs
    // chunk has "" baked in. But dynamic import() triggers module evaluation
    // and some internal code paths read process.env at runtime too.
    if (typeof process !== "undefined" && process.env) {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = publishableKey;
    }

    import("@clerk/nextjs").then((mod) => {
      setClerkMod(mod);
    });
  }, [publishableKey]);

  if (!publishableKey || !clerkMod) return <>{children}</>;

  const { ClerkProvider } = clerkMod;

  const extra: Record<string, string> = {};
  if (clerkDomain) {
    extra.__internal_clerkJSUrl = `https://${clerkDomain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`;
    extra.__internal_clerkUIUrl = `https://${clerkDomain}/npm/@clerk/ui@1/dist/ui.browser.js`;
  }

  return (
    <ClerkComponentsCtx.Provider value={clerkMod}>
      <ClerkProvider publishableKey={publishableKey} {...extra}>
        {children}
      </ClerkProvider>
    </ClerkComponentsCtx.Provider>
  );
}
