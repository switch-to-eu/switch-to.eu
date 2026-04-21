import { cn } from "@switch-to-eu/ui/lib/utils";

export interface LogoProps {
  /** Optional class names applied to the wordmark span. */
  className?: string;
  /** Accessible label. Defaults to "Switch-to.eu". */
  ariaLabel?: string;
  /** Visual size of the wordmark. Defaults to "md". */
  size?: "sm" | "md" | "lg";
}

const TEXT_STYLE = {
  fontFamily: "var(--font-anton)",
  fontWeight: 400,
} as const;

const SIZE_CLASSES: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "text-2xl",
  md: "text-3xl md:text-[2.25rem]",
  lg: "text-5xl md:text-6xl",
};

export function Logo({
  className,
  ariaLabel = "Switch-to.eu",
  size = "md",
}: LogoProps) {
  return (
    <span
      role="img"
      aria-label={ariaLabel}
      style={TEXT_STYLE}
      className={cn(
        "inline-block uppercase tracking-[-0.02em] leading-none select-none text-brand-green",
        SIZE_CLASSES[size],
        className
      )}
    >
      <span aria-hidden="true">Switch-to</span>
      <span aria-hidden="true" className="text-brand-yellow">.eu</span>
    </span>
  );
}
