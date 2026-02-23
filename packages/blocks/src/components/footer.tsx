import { ReactNode } from "react";
import { cn } from "@switch-to-eu/ui/lib/utils";

export interface FooterLink {
  /** Link text or label */
  label: ReactNode;
  /** Link URL */
  href: string;
  /** Whether link is external (opens in new tab) */
  external?: boolean;
}

export interface FooterProps {
  /** Navigation links to display */
  links?: FooterLink[];
  /** Copyright text or custom footer content */
  copyright?: ReactNode;
  /** Optional branding element (e.g., "by switch-to.eu") */
  branding?: ReactNode;
  /** Custom class name for the footer */
  className?: string;
  /** Custom class name for the container */
  containerClassName?: string;
  /** Whether to use the Container component wrapper (default: true) */
  useContainer?: boolean;
}

export function Footer({
  links = [],
  copyright,
  branding,
  className,
  containerClassName,
  useContainer = true,
}: FooterProps) {
  const content = (
    <>
      <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            {...(link.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {link.label}
          </a>
        ))}
      </div>
      <div className="flex flex-col items-center gap-2">
        {copyright && (
          <div className="text-sm text-muted-foreground text-center">
            {copyright}
          </div>
        )}
        {branding && (
          <div className="text-xs text-muted-foreground">{branding}</div>
        )}
      </div>
    </>
  );

  return (
    <footer className={cn("border-t bg-background py-6 md:py-10", className)}>
      {useContainer ? (
        <div
          className={cn(
            "container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 flex flex-col items-center gap-6 md:flex-row md:justify-between",
            containerClassName
          )}
        >
          {content}
        </div>
      ) : (
        <div
          className={cn(
            "flex flex-col items-center gap-6 md:flex-row md:justify-between",
            containerClassName
          )}
        >
          {content}
        </div>
      )}
    </footer>
  );
}