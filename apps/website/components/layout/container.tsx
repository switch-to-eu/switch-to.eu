import { cn } from "@switch-to-eu/ui";

export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8",
        className
      )}
      {...props}
    />
  );
}