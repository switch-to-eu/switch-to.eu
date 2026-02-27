import { ReactNode } from "react";
import { cn } from "@switch-to-eu/ui/lib/utils";
import { FooterTools } from "./footer-tools";
import { FooterFeedback } from "./footer-feedback";

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
  /** Tool ID for the feedback dialog — when set, a "Feedback" link appears in the links column */
  feedbackToolId?: string;
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
  feedbackToolId,
}: FooterProps) {
  const content = (
    <>
      <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            className="text-sm font-medium text-white/70 transition-colors hover:text-brand-yellow"
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
          <div className="text-sm text-white/50 text-center">
            {copyright}
          </div>
        )}
        {branding && (
          <div className="text-xs text-white/40">{branding}</div>
        )}
      </div>
    </>
  );

  return (
    <footer className={cn("bg-brand-green py-8 md:py-12", className)}>
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
