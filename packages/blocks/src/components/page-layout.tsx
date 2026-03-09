import { cn } from "@switch-to-eu/ui/lib/utils";

export function PageLayout({
  className,
  paddingTopMobile,
  paddingBottomMobile,
  gapMobile,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  /** Add top padding on mobile */
  paddingTopMobile?: boolean;
  /** Add bottom padding on mobile */
  paddingBottomMobile?: boolean;
  /** Add vertical gap between sections on mobile */
  gapMobile?: boolean;
}) {
  return (
    <main
      className={cn(
        "flex flex-col md:gap-20 overflow-hidden",
        gapMobile && "gap-8 sm:gap-12",
        paddingTopMobile ? "pt-6 sm:pt-8 md:pt-12" : "md:pt-12",
        paddingBottomMobile ? "pb-6 sm:pb-8 md:pb-12" : "md:pb-12",
        className
      )}
      {...props}
    />
  );
}
