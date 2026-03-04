import { ReactNode } from "react";
import { cn } from "@switch-to-eu/ui/lib/utils";
import { FooterTools } from "./footer-tools";
import { FooterFeedback } from "./footer-feedback";
import { FooterCopyright } from "./footer-copyright";

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
            <h3 className="text-sm font-semibold text-white mb-3">
              {linksSectionTitle}
            </h3>
          )}
          <ul className="space-y-2">
            {links.map((link, index) => (
              <li key={index}>
                <a
                  href={link.href}
                  className="text-sm text-white/70 transition-colors hover:text-white"
                  {...(link.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          
          {feedbackToolId && (
            <div className="mt-2">
              <FooterFeedback toolId={feedbackToolId} />
            </div>
          )}
        </div>
      )}

      {/* Branding + Copyright Column */}
      <div className="flex flex-col gap-4">
        {branding}
        {copyright !== undefined ? (
          copyright && <p className="text-xs text-white/40">{copyright}</p>
        ) : (
          <FooterCopyright />
        )}
      </div>
    </div>
  );

  return (
    <footer className={cn("bg-gray-800 text-white border-t-[3px] border-tool-primary py-8 md:py-12", className)}>
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
