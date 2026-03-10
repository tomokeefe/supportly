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
// Clerk loaded from CDN script in <head> (see layout.tsx), then manually
// initialized here with .load() which includes UI components.
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
// Module-level singleton to survive re-renders and HMR
// ---------------------------------------------------------------------------
let clerkInitPromise: Promise<ClerkInstance> | null = null;

function initClerk(publishableKey: string): Promise<ClerkInstance> {
  if (clerkInitPromise) return clerkInitPromise;

  clerkInitPromise = (async () => {
    // Wait for the CDN script (loaded in <head>) to set window.Clerk
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctor = await new Promise<any>((resolve) => {
      function check() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const c = (window as any).Clerk;
        // Before .load(), window.Clerk is the class constructor
        if (c && typeof c === "function") {
          resolve(c);
        } else {
          setTimeout(check, 50);
        }
      }
      check();
    });

    const instance = new Ctor(publishableKey);
    await instance.load();
    return instance;
  })();

  // Allow retry on failure
  clerkInitPromise.catch(() => {
    clerkInitPromise = null;
  });

  return clerkInitPromise;
}

// ---------------------------------------------------------------------------
// Provider
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

    initClerk(publishableKey)
      .then(setClerk)
      .catch((err) => console.error("Clerk init failed:", err));
  }, [publishableKey, clerkDomain]);

  return <ClerkCtx.Provider value={clerk}>{children}</ClerkCtx.Provider>;
}
