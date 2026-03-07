import { cn } from "@switch-to-eu/ui/lib/utils";

export function PageLayout({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <main
      className={cn(
        "flex flex-col gap-8 sm:gap-12 md:gap-20 py-6 sm:py-8 md:py-12",
        className
      )}
      {...props}
    />
  );
}
