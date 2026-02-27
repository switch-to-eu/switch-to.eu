"use client";

import { useTranslations } from "next-intl";
import { tools } from "../data/tools";

interface FooterToolsProps {
  /** Tool ID to exclude from listing (e.g., the current app) */
  excludeToolId?: string;
  /** Section title */
  title?: string;
}

export function FooterTools({ excludeToolId, title }: FooterToolsProps) {
  const t = useTranslations("footerTools");

  const displayTools = tools.filter(
    (tool) => tool.status === "active" && tool.id !== excludeToolId
  );

  return (
    <div>
      {title && (
        <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      )}
      <ul className="space-y-2">
        {displayTools.map((tool) => (
          <li key={tool.id}>
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="font-medium">{tool.name}</span>
              <span className="text-muted-foreground/60"> — </span>
              <span className="text-xs">{t(tool.id as never)}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
