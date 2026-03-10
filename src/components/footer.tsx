import Link from "next/link";
import { ResolvlyLogo } from "./resolvly-logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex items-center justify-between">
        <Link href="/" aria-label="Resolvly home">
          <ResolvlyLogo size="sm" />
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/partners"
            className="text-sm text-[--color-text-secondary] hover:text-dark"
          >
            Partners
          </Link>
          <p className="text-sm text-[--color-text-secondary]">
            &copy; {new Date().getFullYear()} Resolvly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
