import { cn } from "@switch-to-eu/ui/lib/utils";
import { shapes } from "../shapes";

export interface DecorativeShapeProps {
  /** Shape name, e.g. "sunburst" */
  shape: string;
  /** Position + size classes, e.g. "-top-8 -right-8 w-36 h-36 sm:w-48 sm:h-48" */
  className: string;
  /** Tailwind text-color class, defaults to "text-white" */
  color?: string;
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
  color = "text-white",
  opacity = 0.15,
  duration,
  delay,
}: DecorativeShapeProps) {
  const shapeData = shapes[shape];
  if (!shapeData) return null;

  return (
    <div
      className={cn("absolute pointer-events-none", color, className)}
      style={{ opacity }}
    >
      <svg
        viewBox={shapeData.viewBox}
        className="w-full h-full select-none animate-shape-float"
        style={{
          ...(duration && { animationDuration: duration }),
          ...(delay && { animationDelay: delay }),
        }}
        aria-hidden="true"
      >
        <path d={shapeData.d} fill="currentColor" />
      </svg>
    </div>
  );
}
