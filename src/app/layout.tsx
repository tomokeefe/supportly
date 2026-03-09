import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
  title: "Supportly — AI Customer Support for SMBs",
  description:
    "AI-powered customer support that handles 70%+ of conversations at $0.05 each. Stop missing calls. Start closing tickets.",
};

const clerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const body = (
    <body
      className={`${dmSans.variable} ${dmSerifDisplay.variable} ${jetbrainsMono.variable} font-sans antialiased`}
    >
      {children}
    </body>
  );

  if (!clerkConfigured) {
    return <html lang="en">{body}</html>;
  }

  return (
    <ClerkProvider>
      <html lang="en">{body}</html>
    </ClerkProvider>
  );
}
