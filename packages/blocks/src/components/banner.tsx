import { cn } from "@switch-to-eu/ui/lib/utils";
import { DecorativeShape } from "./decorative-shape";
import type { DecorativeShapeProps } from "./decorative-shape";

export interface BannerProps {
  /** Tailwind bg class, e.g. "bg-brand-navy" */
  color: string;
  /** Decorative floating shapes */
  shapes?: DecorativeShapeProps[];
  children: React.ReactNode;
  /** Extra classes on outer rounded container */
  className?: string;
  /** Extra classes on z-10 content wrapper */
  contentClassName?: string;
}

export function Banner({
  color,
  shapes,
  children,
  className,
  contentClassName,
}: BannerProps) {
  return (
    <div className={cn(color, "md:rounded-3xl overflow-hidden", className)}>
      <div className="relative px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-20">
        {shapes?.map((shapeProps, i) => (
          <DecorativeShape key={i} {...shapeProps} />
        ))}
        <div className={cn("relative z-10", contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}
