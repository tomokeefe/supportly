import Link from "next/link";

export function Nav({ isSignedIn = false }: { isSignedIn?: boolean }) {
  return (
    <nav className="border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="heading-editorial text-2xl text-dark tracking-tight"
        >
          Supportly
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a
            href="/#how-it-works"
            className="text-sm text-[--color-text-secondary] hover:text-dark accent-hover"
          >
            How It Works
          </a>
          <a
            href="/#industries"
            className="text-sm text-[--color-text-secondary] hover:text-dark accent-hover"
          >
            Industries
          </a>
          <a
            href="/#pricing"
            className="text-sm text-[--color-text-secondary] hover:text-dark accent-hover"
          >
            Pricing
          </a>
          <Link
            href="/demo"
            className="text-sm text-[--color-text-secondary] hover:text-dark accent-hover"
          >
            Demo
          </Link>
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="text-sm font-medium bg-vermillion text-white px-5 py-2 rounded-full hover:bg-[#C7412A] accent-hover"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm text-[--color-text-secondary] hover:text-dark accent-hover"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-medium bg-vermillion text-white px-5 py-2 rounded-full hover:bg-[#C7412A] accent-hover"
              >
                Start Free Trial
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
