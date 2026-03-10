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

  // Derive the Clerk Frontend API domain from the publishable key.
  // Clerk constructs script URLs from this domain, but since the env var
  // isn't inlined into the client bundle at build time on Vercel, the URL
  // ends up as `https:///npm/...` (missing domain). We derive it server-side
  // and pass it as a prop so ClerkProvider can use clerkJSUrl directly.
  let clerkDomain = "";
  if (clerkPk) {
    try {
      const base64 = clerkPk.replace(/^pk_(test|live)_/, "");
      clerkDomain = Buffer.from(base64, "base64").toString().split("$")[0];
    } catch {
      // Invalid key format — ignore
    }
  }

  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${dmSerifDisplay.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ClerkWrapper publishableKey={clerkPk} clerkDomain={clerkDomain}>
          {children}
        </ClerkWrapper>
      </body>
    </html>
  );
}
