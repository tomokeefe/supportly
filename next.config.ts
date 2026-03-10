import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude @clerk/nextjs from the client bundle entirely.
  // We load Clerk from CDN on the client side (see layout.tsx + clerk-wrapper.tsx).
  // The bundled @clerk/nextjs has NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY baked in as ""
  // from the Vercel build, causing broken script URLs that interfere with the
  // CDN-loaded Clerk. Server-side @clerk/nextjs/server imports are unaffected.
  turbopack: {
    resolveAlias: {
      // On the client, @clerk/nextjs resolves to empty objects.
      // Server imports of @clerk/nextjs/server are unaffected by this.
      "@clerk/nextjs": { browser: "./src/lib/clerk-stub.ts" },
      "@clerk/nextjs/*": { browser: "./src/lib/clerk-stub.ts" },
    },
  },
};

export default nextConfig;
