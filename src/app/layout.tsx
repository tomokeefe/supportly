import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkWrapper } from "@/components/clerk-wrapper";
import "./globals.css";

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Resolvly — AI Customer Support for SMBs",
  description:
    "AI-powered customer support that handles 70%+ of conversations at $0.05 each. Stop missing calls. Start closing tickets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkPk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

  return (
    <html lang="en">
      <head>
        {/* Inject Clerk publishable key before any JS bundles execute.
            Clerk reads process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY at
            module-import time, but the env var may not be inlined into
            the client bundle on Vercel. This inline script ensures the
            key is available on window before any modules load. */}
        {clerkPk && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__CLERK_PK=${JSON.stringify(clerkPk)};`,
            }}
          />
        )}
      </head>
      <body
        className={`${dmSans.variable} ${dmSerifDisplay.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ClerkWrapper publishableKey={clerkPk}>
          {children}
        </ClerkWrapper>
      </body>
    </html>
  );
}
