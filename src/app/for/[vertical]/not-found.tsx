import Link from "next/link";
import { ResolvlyLogo } from "@/components/resolvly-logo";

export default function VerticalNotFound() {
  return (
    <div className="min-h-screen bg-cream">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5">
          <Link href="/" aria-label="Resolvly home">
            <ResolvlyLogo />
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="editorial-rule mx-auto mb-6" />
        <h1 className="heading-editorial text-dark text-3xl md:text-4xl mb-4">
          Industry not found.
        </h1>
        <p className="text-[--color-text-secondary] mb-8">
          We couldn&apos;t find a page for that industry. Check out the
          industries we support or head back to the homepage.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-dark text-cream px-8 py-4 rounded-full text-base font-medium hover:bg-[#2C2622] accent-hover"
        >
          Back to homepage
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
