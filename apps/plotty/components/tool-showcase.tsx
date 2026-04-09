"use client";

import { ExternalLink, ArrowRight } from "lucide-react";
import { getActiveTools, type Tool } from "@switch-to-eu/blocks/data/tools";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface ToolShowcaseProps {
  className?: string;
}

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const t = useTranslations('tools');
  const isActive = tool.status === 'active' || tool.status === 'beta';
  const isReversed = index % 2 === 1;

  const handleClick = () => {
    if (isActive && tool.url !== '#') {
      window.open(tool.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-lg bg-card border border-border shadow-sm hover:shadow-md transition-shadow ${
        isActive ? 'cursor-pointer' : 'opacity-60'
      }`}
      onClick={handleClick}
    >
      <div className="absolute inset-0 bg-tool-surface/10" />

      <div className={`relative flex ${isReversed ? 'flex-row-reverse' : 'flex-row'} items-center min-h-[200px]`}>
        {/* Screenshot Side */}
        <div className="flex-shrink-0 w-2/5 h-full flex items-center justify-center p-6">
          <div className="relative w-full h-32 rounded-lg overflow-hidden shadow-md border border-border">
            <Image
              src={`/${tool.id}-screenshot.png`}
              alt={`${tool.name} screenshot`}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Content Side */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-foreground">
              {tool.name}
            </h3>
            {isActive && (
              <ExternalLink className="h-4 w-4 text-tool-primary opacity-60" />
            )}
          </div>

          <p className="text-base font-medium text-tool-primary mb-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {t(`${tool.id}.tagline` as any)}
          </p>

          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {t(`${tool.id}.description` as any)}
          </p>

          {isActive ? (
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium text-white bg-tool-primary hover:opacity-90 transition-opacity text-sm">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {t(`${tool.id}.cta` as any)}
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium text-muted-foreground bg-muted text-sm">
              {t('more.cta')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ToolShowcase({ className }: ToolShowcaseProps) {
  return (
    <div className={`space-y-6 max-w-4xl mx-auto ${className}`}>
      {getActiveTools().map((tool, index) => (
        <ToolCard key={tool.id} tool={tool} index={index} />
      ))}
    </div>
  );
}
