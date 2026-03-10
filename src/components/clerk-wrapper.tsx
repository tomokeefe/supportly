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
// Clerk loaded entirely from CDN — bypasses the @clerk/nextjs npm package
// on the client side, which breaks on Vercel because NEXT_PUBLIC_* env vars
// are statically replaced with "" at build time.
//
// Server-side auth (@clerk/nextjs/server in API routes) still works fine.
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
    // Only re-mount when the clerk instance changes, not on every render
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
// Module-level singleton to survive HMR and re-renders
// ---------------------------------------------------------------------------
let clerkLoadPromise: Promise<ClerkInstance> | null = null;

function loadClerkFromCDN(
  publishableKey: string,
  clerkDomain: string
): Promise<ClerkInstance> {
  if (clerkLoadPromise) return clerkLoadPromise;

  clerkLoadPromise = (async () => {
    const scriptUrl = `https://${clerkDomain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`;

    // Load the Clerk JS script from CDN
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!(window as any).__clerkCtor) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = scriptUrl;
        script.async = true;
        script.crossOrigin = "anonymous";
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error("Failed to load Clerk JS from CDN"));
        document.head.appendChild(script);
      });
      // Store the constructor before .load() potentially overwrites window.Clerk
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__clerkCtor = (window as any).Clerk;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctor = (window as any).__clerkCtor;
    if (!Ctor) throw new Error("Clerk constructor not found");

    // If it's already an initialized instance (e.g. from a previous load)
    if (typeof Ctor.mountSignIn === "function") return Ctor;

    const instance = new Ctor(publishableKey);
    await instance.load();
    return instance;
  })();

  // Reset on failure so next attempt can retry
  clerkLoadPromise.catch(() => {
    clerkLoadPromise = null;
  });

  return clerkLoadPromise;
}

// ---------------------------------------------------------------------------
// Provider — wraps children with Clerk context
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

    loadClerkFromCDN(publishableKey, clerkDomain)
      .then(setClerk)
      .catch((err) => console.error("Clerk init failed:", err));
  }, [publishableKey, clerkDomain]);

  return <ClerkCtx.Provider value={clerk}>{children}</ClerkCtx.Provider>;
}
