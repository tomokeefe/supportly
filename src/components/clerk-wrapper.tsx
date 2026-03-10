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
// Clerk loaded entirely from CDN script in <head> (see layout.tsx).
// The script has data-clerk-publishable-key which auto-initializes Clerk
// and sets window.Clerk to the ready instance.
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
// Provider — polls for window.Clerk (set by CDN script in <head>)
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

    // The CDN script in <head> auto-initializes Clerk and sets window.Clerk.
    // Poll until it's ready (usually <1s).
    function checkClerk() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = (window as any).Clerk;
      if (c && typeof c.mountSignIn === "function") {
        if (!cancelled) setClerk(c);
        return;
      }
      if (!cancelled) {
        setTimeout(checkClerk, 100);
      }
    }

    checkClerk();

    return () => {
      cancelled = true;
    };
  }, [publishableKey, clerkDomain]);

  return <ClerkCtx.Provider value={clerk}>{children}</ClerkCtx.Provider>;
}
