import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Nav } from "@/components/nav";
import { PricingSection } from "@/components/pricing-section";
import { Footer } from "@/components/footer";
import { getVerticalSlugs, getVerticalBySlug } from "@/lib/verticals";

// ── Static Generation ────────────────────────────────────────

export function generateStaticParams() {
  return getVerticalSlugs().map((vertical) => ({ vertical }));
}

// ── Dynamic Metadata ─────────────────────────────────────────

type Props = { params: Promise<{ vertical: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vertical: slug } = await params;
  const data = getVerticalBySlug(slug);
  if (!data) return {};
  return {
    title: data.metaTitle,
    description: data.metaDescription,
  };
}

// ── Helpers ──────────────────────────────────────────────────

function renderHeadline(headline: string) {
  const parts = headline.split("{vermillion}");
  // Replace \n with <br /> for line breaks
  const first = parts[0].split("\n").map((line, i, arr) => (
    <span key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </span>
  ));

  return (
    <>
      {first}
      {parts[1] && <span className="text-vermillion">{parts[1]}</span>}
    </>
  );
}

// ── Page Component ───────────────────────────────────────────

export default async function VerticalPage({ params }: Props) {
  const { vertical: slug } = await params;
  const data = getVerticalBySlug(slug);
  if (!data) notFound();

  let isSignedIn = false;
  try {
    const { userId } = await auth();
    isSignedIn = !!userId;
  } catch {
    // Clerk not configured
  }

  return (
    <div className="min-h-screen bg-cream">
      <Nav isSignedIn={isSignedIn} />

      {/* Hero */}
      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-24 pb-20 lg:pt-32 lg:pb-28">
          <div className="max-w-3xl">
            <p className="stat-mono text-sm text-vermillion mb-6">
              {data.industry}
            </p>
            <h1 className="heading-editorial text-dark text-5xl md:text-6xl lg:text-7xl mb-8">
              {renderHeadline(data.headline)}
            </h1>
            <p className="text-lg md:text-xl text-[--color-text-secondary] leading-relaxed max-w-xl mb-10">
              {data.subheadline}
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-dark text-cream px-8 py-4 rounded-full text-base font-medium hover:bg-[#2C2622] accent-hover"
            >
              Start free trial
              <span aria-hidden="true">&rarr;</span>
            </Link>
            <p className="mt-8 text-sm text-[--color-text-secondary]">
              Set up in under 5 minutes. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Stats */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <div className="editorial-rule mb-6" />
              <h2 className="heading-editorial text-dark text-3xl md:text-4xl mb-6">
                {data.problemHeadline}
              </h2>
              <p className="text-[--color-text-secondary] leading-relaxed">
                {data.problemDescription}
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-px bg-border">
                {data.stats.map((stat, i) => (
                  <div key={i} className="bg-cream p-8 lg:p-10">
                    <p
                      className={`stat-mono text-5xl lg:text-6xl mb-3 ${
                        stat.highlight ? "text-vermillion" : "text-dark"
                      }`}
                    >
                      {stat.value}
                    </p>
                    <p className="text-sm text-[--color-text-secondary] leading-relaxed">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-taupe">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div className="max-w-xl mb-16">
            <div className="editorial-rule mb-6" />
            <h2 className="heading-editorial text-dark text-3xl md:text-4xl">
              {data.useCasesHeadline}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.useCases.map((uc, i) => (
              <div
                key={i}
                className="bg-white border border-border rounded-xl p-6"
              >
                <p className="stat-mono text-xs text-vermillion mb-3">
                  0{i + 1}
                </p>
                <p className="text-base font-medium text-dark mb-3 leading-snug">
                  &ldquo;{uc.question}&rdquo;
                </p>
                <p className="text-sm text-[--color-text-secondary] leading-relaxed">
                  {uc.context}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div className="max-w-xl mb-16">
            <div className="editorial-rule mb-6" />
            <h2 className="heading-editorial text-dark text-3xl md:text-4xl">
              What Resolvly does for {data.industry.toLowerCase()}.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-16 gap-y-12 lg:gap-y-16">
            {data.capabilities.map((cap, i) => (
              <div key={i} className="border-t border-border pt-6">
                <h3 className="text-base font-semibold text-dark mb-2">
                  {cap.title}
                </h3>
                <p className="text-sm text-[--color-text-secondary] leading-relaxed">
                  {cap.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      {/* Final CTA */}
      <section className="bg-dark">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-28">
          <div className="max-w-2xl">
            <h2 className="heading-editorial text-cream text-3xl md:text-4xl lg:text-5xl mb-6">
              {data.ctaHeadline}
            </h2>
            <p className="text-[#A8A29E] text-lg leading-relaxed mb-10">
              {data.ctaDescription}
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-vermillion text-white px-8 py-4 rounded-full text-base font-medium hover:bg-[#C7412A] accent-hover"
            >
              Start your free trial
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
