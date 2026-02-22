import { ReactNode } from "react";
import { cn } from "@switch-to-eu/ui/lib/utils";

export interface HeaderProps {
  /** Logo or brand element to display */
  logo: ReactNode;
  /** Navigation content for desktop */
  navigation?: ReactNode;
  /** Navigation content for mobile (optional, defaults to navigation prop) */
  mobileNavigation?: ReactNode;
  /** Custom class name for the header container */
  className?: string;
  /** Custom class name for the inner container */
  containerClassName?: string;
  /** Whether to use the Container component wrapper (default: true) */
  useContainer?: boolean;
}

export function Header({
  logo,
  navigation,
  mobileNavigation,
  className,
  containerClassName,
  useContainer = true,
}: HeaderProps) {
  const navContent = mobileNavigation || navigation;

  const content = (
    <>
      {logo}

      {/* Desktop Navigation */}
      {navigation && (
        <div className="hidden items-center gap-4 md:flex">
          {navigation}
        </div>
      )}

      {/* Mobile Navigation */}
      {navContent && (
        <div className="flex items-center gap-2 md:hidden">
          {navContent}
        </div>
      )}
    </>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      {useContainer ? (
        <div
          className={cn(
            "container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 flex h-16 items-center justify-between",
            containerClassName
          )}
        >
          {content}
        </div>
      ) : (
        <div
          className={cn(
            "flex h-16 items-center justify-between py-3 sm:py-4",
            containerClassName
          )}
        >
          {content}
        </div>
      )}
    </header>
  );
}
