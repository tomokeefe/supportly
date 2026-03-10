"use client";

import { type ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";

const CLERK_APPEARANCE = {
  variables: {
    colorPrimary: "#DC4A2E",
    fontFamily: "DM Sans, sans-serif",
  },
};

export function ClerkWrapper({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider appearance={CLERK_APPEARANCE}>
      {children}
    </ClerkProvider>
  );
}
