import { cn } from "@switch-to-eu/ui/lib/utils";

export interface ShowcaseItem {
  /** Left/right visual (shape circle, screenshot, etc.) */
  visual: React.ReactNode;
  title: string;
  description: string;
}

export interface AlternatingShowcaseProps {
  items: ShowcaseItem[];
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function AlternatingShowcase({
  items,
  className,
  titleClassName = "text-brand-yellow font-bold text-xl sm:text-2xl md:text-3xl mb-3",
  descriptionClassName = "text-white/80 text-sm sm:text-base md:text-lg leading-relaxed max-w-lg",
}: AlternatingShowcaseProps) {
  return (
    <div className={cn("space-y-10 sm:space-y-14 md:space-y-16", className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "flex flex-col items-center gap-6 sm:gap-8 md:gap-12",
            index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
          )}
        >
          <div className="flex-shrink-0">{item.visual}</div>
          <div
            className={cn(
              "text-center",
              index % 2 === 0 ? "md:text-left" : "md:text-right"
            )}
          >
            <h3 className={titleClassName}>{item.title}</h3>
            <p className={descriptionClassName}>{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
