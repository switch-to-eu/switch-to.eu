import { cn } from "@switch-to-eu/ui/lib/utils";

export function Container({
  className,
  noPaddingMobile,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  noPaddingMobile?: boolean;
}) {
  return (
    <div
      className={cn(
        "container max-w-7xl mx-auto",
        noPaddingMobile
          ? "md:px-6 lg:px-8"
          : "px-3 md:px-6 lg:px-8",
        className
      )}
      {...props}
    />
  );
}
