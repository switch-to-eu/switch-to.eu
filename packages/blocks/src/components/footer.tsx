import { ReactNode } from "react";
import { cn } from "@switch-to-eu/ui/lib/utils";
import { FooterTools } from "./footer-tools";

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
  /** i18n title for the "Tools" section */
  toolsSectionTitle?: string;
  /** i18n title for the "Links" section */
  linksSectionTitle?: string;
  /** Tool ID to exclude from the tools listing (current app) */
  currentToolId?: string;
  /** Whether to show the tools section (default: true) */
  showTools?: boolean;
}

export function Footer({
  links = [],
  copyright,
  branding,
  className,
  containerClassName,
  useContainer = true,
  toolsSectionTitle,
  linksSectionTitle,
  currentToolId,
  showTools = true,
}: FooterProps) {
  const content = (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {/* Tools Column */}
      {showTools && (
        <FooterTools
          excludeToolId={currentToolId}
          title={toolsSectionTitle}
        />
      )}

      {/* Links Column */}
      {links.length > 0 && (
        <div>
          {linksSectionTitle && (
            <h3 className="text-sm font-semibold text-foreground mb-3">
              {linksSectionTitle}
            </h3>
          )}
          <ul className="space-y-2">
            {links.map((link, index) => (
              <li key={index}>
                <a
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  {...(link.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Branding + Copyright Column */}
      {(branding || copyright) && (
        <div className="flex flex-col gap-4">
          {branding}
          {copyright && (
            <p className="text-xs text-muted-foreground">{copyright}</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <footer
      className={cn("border-t bg-background py-8 md:py-12", className)}
    >
      {useContainer ? (
        <div
          className={cn(
            "container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8",
            containerClassName
          )}
        >
          {content}
        </div>
      ) : (
        <div className={cn("", containerClassName)}>
          {content}
        </div>
      )}
    </footer>
  );
}
