"use client";

import { useTranslations } from "next-intl";
import { getActiveTools } from "../data/tools";

interface FooterToolsProps {
  /** Tool ID to exclude from listing (e.g., the current app) */
  excludeToolId?: string;
  /** Section title */
  title?: string;
}

export function FooterTools({ excludeToolId, title }: FooterToolsProps) {
  const t = useTranslations("footerTools");

  const displayTools = getActiveTools().filter(
    (tool) => tool.id !== excludeToolId
  );

  return (
    <div>
      {title && (
        <h3 className="text-sm font-semibold text-tool-primary-foreground mb-3">{title}</h3>
      )}
      <ul className="space-y-2">
        {displayTools.map((tool) => (
          <li key={tool.id}>
            {tool.status === 'active' ? (
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-tool-primary-foreground/60 transition-colors hover:text-brand-yellow"
              >
                <span className="font-medium">{tool.name}</span>
                <span className="text-tool-primary-foreground/30"> — </span>
                <span className="text-xs">{t(tool.id as never)}</span>
              </a>
            ) : (
              <span className="text-sm text-tool-primary-foreground/30">
                <span className="font-medium">{tool.name}</span>
                <span className="text-tool-primary-foreground/20"> — </span>
                <span className="text-xs italic">{t('comingSoon')}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
