/**
 * Resolvly logo — embeds the original SVG file as an isolated document
 * via <object>. This prevents any page CSS (antialiased, font-smoothing,
 * inherited styles) from altering the SVG rendering. The file at
 * public/resolvly-logo.svg is served completely untouched.
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
    <object
      type="image/svg+xml"
      data="/resolvly-logo.svg"
      aria-label="Resolvly"
      style={{ height: h, width: "auto", pointerEvents: "none", display: "block" }}
      className={className}
    >
      Resolvly
    </object>
  );
}
