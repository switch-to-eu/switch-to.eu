import { cn } from "@switch-to-eu/ui/lib/utils";

export function Container({
  className,
  noPaddingMobile,
  overlapHeader,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  noPaddingMobile?: boolean;
  /** Pull container up under the header (hero banners) */
  overlapHeader?: boolean;
}) {
  return (
    <div
      className={cn(
        "container max-w-7xl mx-auto",
        noPaddingMobile
          ? "md:px-6 lg:px-8"
          : "px-3 md:px-6 lg:px-8",
        overlapHeader && "mt-[-30px] md:mt-[initial]",
        className
      )}
      {...props}
    />
  );
}