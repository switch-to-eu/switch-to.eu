import Image from "next/image";
import { cn } from "@switch-to-eu/ui/lib/utils";
import { FILTER_WHITE } from "@switch-to-eu/ui/lib/shape-filters";

export interface DecorativeShapeProps {
  /** SVG filename without path, e.g. "sunburst" */
  shape: string;
  /** Position + size classes, e.g. "-top-8 -right-8 w-36 h-36 sm:w-48 sm:h-48" */
  className: string;
  /** CSS filter, defaults to FILTER_WHITE */
  filter?: string;
  /** Opacity 0-1, defaults to 0.15 */
  opacity?: number;
  /** Animation duration, e.g. "8s" */
  duration?: string;
  /** Animation delay, e.g. "-3s" */
  delay?: string;
}

export function DecorativeShape({
  shape,
  className,
  filter = FILTER_WHITE,
  opacity = 0.15,
  duration,
  delay,
}: DecorativeShapeProps) {
  return (
    <div
      className={cn("absolute pointer-events-none", className)}
      style={{ opacity }}
    >
      <Image
        src={`/images/shapes/${shape}.svg`}
        alt=""
        fill
        className="object-contain select-none animate-shape-float"
        style={{
          filter,
          ...(duration && { animationDuration: duration }),
          ...(delay && { animationDelay: delay }),
        }}
        aria-hidden="true"
        unoptimized
      />
    </div>
  );
}
