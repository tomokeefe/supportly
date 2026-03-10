"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

// ---------------------------------------------------------------------------
// Clerk loaded from CDN script in <head> with data-clerk-publishable-key.
// The script auto-initializes Clerk AND loads UI components asynchronously.
// We poll for window.Clerk to be fully ready before providing it via context.
//
// This bypasses @clerk/nextjs npm package on the client, which breaks on
// Vercel because NEXT_PUBLIC_* env vars are statically replaced with ""
// at build time.
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ClerkInstance = any;

const ClerkCtx = createContext<ClerkInstance | null>(null);

/** Access the raw Clerk JS instance (or null while loading). */
export function useClerk(): ClerkInstance | null {
  return useContext(ClerkCtx);
}

/** Reactive auth state derived from the Clerk JS instance. */
export function useClerkAuth() {
  const clerk = useClerk();
  const [state, setState] = useState({ isLoaded: false, isSignedIn: false });

  useEffect(() => {
    if (!clerk) return;
    const update = () =>
      setState({ isLoaded: true, isSignedIn: !!clerk.user });
    update();
    const unsub = clerk.addListener(update);
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [clerk]);

  return state;
}

// ---------------------------------------------------------------------------
// Mountable Clerk UI components (sign-in, sign-up, user-button)
// ---------------------------------------------------------------------------

function MountedClerkComponent({
  mountMethod,
  unmountMethod,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props,
}: {
  mountMethod: string;
  unmountMethod: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: Record<string, any>;
}) {
  const clerk = useClerk();
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clerk || !divRef.current) return;
    const el = divRef.current;
    try {
      clerk[mountMethod](el, props);
    } catch (e) {
      console.error(`Clerk ${mountMethod} error:`, e);
    }
    return () => {
      try {
        clerk[unmountMethod](el);
      } catch {
        /* ignore unmount errors */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerk]);

  if (!clerk) {
    return (
      <div className="animate-pulse text-[--color-text-secondary]">
        Loading...
      </div>
    );
  }

  return <div ref={divRef} />;
}

const CLERK_APPEARANCE = {
  variables: {
    colorPrimary: "#DC4A2E",
    fontFamily: "DM Sans, sans-serif",
  },
};

export function ClerkSignIn() {
  return (
    <MountedClerkComponent
      mountMethod="mountSignIn"
      unmountMethod="unmountSignIn"
      props={{ appearance: CLERK_APPEARANCE }}
    />
  );
}

export function ClerkSignUp() {
  return (
    <MountedClerkComponent
      mountMethod="mountSignUp"
      unmountMethod="unmountSignUp"
      props={{ appearance: CLERK_APPEARANCE }}
    />
  );
}

export function ClerkUserButton() {
  return (
    <MountedClerkComponent
      mountMethod="mountUserButton"
      unmountMethod="unmountUserButton"
    />
  );
}

// ---------------------------------------------------------------------------
// Provider — waits for the CDN-loaded Clerk to be fully initialized
// ---------------------------------------------------------------------------
export function ClerkWrapper({
  children,
  publishableKey,
  clerkDomain,
}: {
  children: ReactNode;
  publishableKey?: string;
  clerkDomain?: string;
}) {
  const [clerk, setClerk] = useState<ClerkInstance | null>(null);

  useEffect(() => {
    if (!publishableKey || !clerkDomain) return;

    let cancelled = false;

    // The CDN script in <head> auto-initializes with data-clerk-publishable-key.
    // window.Clerk starts as undefined, becomes an instance, then becomes
    // fully loaded (with UI components) asynchronously.
    // We use Clerk's addListener to know when it's truly ready.
    function waitForClerk() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = (window as any).Clerk;

      if (!c || typeof c.addListener !== "function") {
        // Not ready yet — keep polling
        if (!cancelled) setTimeout(waitForClerk, 100);
        return;
      }

      // Clerk instance exists. Use addListener to detect when fully loaded.
      // The listener fires immediately if already loaded, and again on state changes.
      const unsub = c.addListener(() => {
        if (c.loaded && !cancelled) {
          setClerk(c);
          if (typeof unsub === "function") unsub();
        }
      });

      // Also check immediately in case it's already loaded
      if (c.loaded && !cancelled) {
        setClerk(c);
        if (typeof unsub === "function") unsub();
      }
    }

    waitForClerk();

    return () => {
      cancelled = true;
    };
  }, [publishableKey, clerkDomain]);

  return <ClerkCtx.Provider value={clerk}>{children}</ClerkCtx.Provider>;
}
