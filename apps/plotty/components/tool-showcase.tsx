"use client";

import { ExternalLink, ArrowRight } from "lucide-react";
import { tools, type Tool } from "@switch-to-eu/blocks/data/tools";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { cva } from "class-variance-authority";

const cardBackground = cva("absolute inset-0", {
  variants: {
    color: {
      blue: "bg-blue-50",
      green: "bg-green-50",
      purple: "bg-purple-50",
      gray: "bg-gray-50"
    }
  },
  defaultVariants: {
    color: "gray"
  }
});

const cardBorder = cva("", {
  variants: {
    color: {
      blue: "border-blue-200",
      green: "border-green-200",
      purple: "border-purple-200",
      gray: "border-gray-200"
    }
  },
  defaultVariants: {
    color: "gray"
  }
});

const cardText = cva("", {
  variants: {
    color: {
      blue: "text-primary-color",
      green: "text-green-600",
      purple: "text-primary-color",
      gray: "text-gray-500"
    }
  },
  defaultVariants: {
    color: "gray"
  }
});

const cardDarkText = cva("", {
  variants: {
    color: {
      blue: "text-blue-900",
      green: "text-green-900",
      purple: "text-purple-900",
      gray: "text-gray-700"
    }
  },
  defaultVariants: {
    color: "gray"
  }
});

const cardButton = cva("inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium text-white transition-colors text-sm", {
  variants: {
    color: {
      blue: "bg-blue-600 hover:bg-blue-700",
      green: "bg-green-600 hover:bg-green-700",
      purple: "bg-purple-600 hover:bg-purple-700",
      gray: "bg-gray-400"
    }
  },
  defaultVariants: {
    color: "gray"
  }
});

interface ToolShowcaseProps {
  className?: string;
}

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const t = useTranslations('tools');
  const colorVariant = (tool.color as "blue" | "green" | "purple" | "gray") || "gray";
  const isActive = tool.status === 'active' || tool.status === 'beta';
  const isReversed = index % 2 === 1;

  const handleClick = () => {
    if (isActive && tool.url !== '#') {
      window.open(tool.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className={`group relative overflow-hidden rounded-lg bg-white border ${cardBorder({ color: colorVariant })} shadow-sm hover:shadow-md transition-shadow ${
        isActive ? 'cursor-pointer' : 'opacity-60'
      }`}
      onClick={handleClick}
    >
      <div className={cardBackground({ color: colorVariant })} />
      
      <div className={`relative flex ${isReversed ? 'flex-row-reverse' : 'flex-row'} items-center min-h-[200px]`}>
        {/* Screenshot Side */}
        <div className={`flex-shrink-0 w-2/5 h-full flex items-center justify-center p-6`}>
          <div className="relative w-full h-32 rounded-lg overflow-hidden shadow-md border border-gray-200">
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
            <h3 className={`text-xl font-bold ${cardDarkText({ color: colorVariant })}`}>
              {tool.name}
            </h3>
            {isActive && (
              <ExternalLink className={`h-4 w-4 ${cardText({ color: colorVariant })} opacity-60`} />
            )}
          </div>

          <p className={`text-base font-medium ${cardText({ color: colorVariant })} mb-2`}>
            {t(`${tool.id}.tagline` as any)}
          </p>

          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {t(`${tool.id}.description` as any)}
          </p>

          {isActive ? (
            <button className={cardButton({ color: colorVariant })}>
              {t(`${tool.id}.cta` as any)}
              <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium text-gray-500 bg-gray-100 text-sm">
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
      {tools.map((tool, index) => (
        <ToolCard key={tool.id} tool={tool} index={index} />
      ))}
    </div>
  );
}