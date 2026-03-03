import { cn } from "@switch-to-eu/ui/lib/utils";

const COL_CLASSES = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
} as const;

export function CardGrid({
  cols = 3,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  cols?: 2 | 3 | 4;
}) {
  return (
    <div
      className={cn(
        "grid gap-0 md:gap-5 auto-rows-fr",
        COL_CLASSES[cols],
        className
      )}
      {...props}
    />
  );
}
