import { cn } from "@switch-to-eu/ui/lib/utils";

export interface SectionHeadingProps {
  children: React.ReactNode;
  /** Text color class, defaults to "text-brand-green" */
  color?: string;
  /** Extra classes (text-center, custom margin override, etc.) */
  className?: string;
  /** HTML heading level, defaults to "h2" */
  as?: "h1" | "h2" | "h3";
}

export function SectionHeading({
  children,
  color = "text-brand-green",
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <Tag
      className={cn(
        "font-heading text-4xl sm:text-5xl uppercase mb-4 mt-4 md:mt-0 sm:mb-6 px-3 md:px-0",
        color,
        className
      )}
    >
      {children}
    </Tag>
  );
}
