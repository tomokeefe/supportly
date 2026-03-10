import Image from "next/image";

type LogoSize = "sm" | "md" | "lg";

// PNG is 824×225 — aspect ratio 3.662:1
const HEIGHTS: Record<LogoSize, number> = {
  sm: 36,  // footer, dashboard sidebar
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
  const w = Math.round(h * (824 / 225));
  return (
    <Image
      src="/resolvly-logo.png"
      alt="Resolvly"
      width={w}
      height={h}
      priority
      className={className}
    />
  );
}
