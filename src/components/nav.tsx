"use client";

import { useState } from "react";
import Link from "next/link";
import { ResolvlyLogo } from "./resolvly-logo";

export function Nav({ isSignedIn = false }: { isSignedIn?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-border relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
        <Link href="/" aria-label="Resolvly home">
          <ResolvlyLogo />
        </Link>

        {/* Desktop nav */}
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
          <Link
            href="/partners"
            className="text-sm text-[--color-text-secondary] hover:text-dark accent-hover"
          >
            Partners
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

        {/* Mobile hamburger button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1.5 p-2 -mr-2"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span
            className={`block w-5 h-0.5 bg-dark transition-transform duration-200 ${
              open ? "translate-y-[4px] rotate-45" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-dark transition-opacity duration-200 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-dark transition-transform duration-200 ${
              open ? "-translate-y-[4px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-white absolute inset-x-0 top-full z-50 shadow-lg">
          <div className="flex flex-col px-6 py-4 gap-1">
            <a
              href="/#how-it-works"
              onClick={() => setOpen(false)}
              className="text-sm text-[--color-text-secondary] hover:text-dark py-2.5"
            >
              How It Works
            </a>
            <a
              href="/#industries"
              onClick={() => setOpen(false)}
              className="text-sm text-[--color-text-secondary] hover:text-dark py-2.5"
            >
              Industries
            </a>
            <a
              href="/#pricing"
              onClick={() => setOpen(false)}
              className="text-sm text-[--color-text-secondary] hover:text-dark py-2.5"
            >
              Pricing
            </a>
            <Link
              href="/demo"
              onClick={() => setOpen(false)}
              className="text-sm text-[--color-text-secondary] hover:text-dark py-2.5"
            >
              Demo
            </Link>
            <Link
              href="/partners"
              onClick={() => setOpen(false)}
              className="text-sm text-[--color-text-secondary] hover:text-dark py-2.5"
            >
              Partners
            </Link>

            <div className="border-t border-border mt-2 pt-4 pb-2 flex flex-col gap-3">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium bg-vermillion text-white px-5 py-2.5 rounded-full hover:bg-[#C7412A] text-center"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium text-dark text-center py-2.5"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium bg-vermillion text-white px-5 py-2.5 rounded-full hover:bg-[#C7412A] text-center"
                  >
                    Start Free Trial
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
