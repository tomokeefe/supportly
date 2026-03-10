import Image from "next/image";

type LogoSize = "sm" | "md" | "lg";

const SIZES: Record<LogoSize, { height: number; width: number }> = {
  sm: { height: 22, width: 68 },   // footer, dashboard sidebar
  md: { height: 28, width: 87 },   // nav, auth pages, onboarding
  lg: { height: 36, width: 112 },  // hero or splash if needed
};

export function ResolvlyLogo({
  size = "md",
  className,
}: {
  size?: LogoSize;
  className?: string;
}) {
  const dims = SIZES[size];
  return (
    <Image
      src="/resolvly-logo.svg"
      alt="Resolvly"
      width={dims.width}
      height={dims.height}
      priority
      className={className}
    />
  );
}
