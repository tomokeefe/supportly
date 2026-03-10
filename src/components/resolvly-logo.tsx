/**
 * Resolvly SVG logo — renders at the SVG's natural aspect ratio (221.2 × 71.5)
 * to avoid any distortion. Size is controlled via height only; width scales
 * automatically.
 */

type LogoSize = "sm" | "md" | "lg";

const HEIGHTS: Record<LogoSize, number> = {
  sm: 32,  // footer, dashboard sidebar
  md: 48,  // nav, auth pages, onboarding
  lg: 56,  // hero or splash if needed
};

export function ResolvlyLogo({
  size = "md",
  className,
}: {
  size?: LogoSize;
  className?: string;
}) {
  const h = HEIGHTS[size];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/resolvly-logo.svg"
      alt="Resolvly"
      height={h}
      style={{ height: h, width: "auto" }}
      className={className}
    />
  );
}
