"use client";

import { useState } from 'react';
import { ChevronDown, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@switch-to-eu/ui/lib/utils';

type IconType = 'alert-triangle' | 'alert-circle' | 'info';

interface WarningCollapsibleProps {
  items: string[];
  title?: string;
  variant?: 'warning' | 'error' | 'info';
  iconType?: IconType;
  className?: string;
}

export function WarningCollapsible({
  items,
  title = "Missing Features & Limitations",
  variant = 'warning',
  iconType = 'alert-triangle',
  className
}: WarningCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!items || items.length === 0) {
    return null;
  }

  const variantStyles = {
    warning: {
      container: "md:rounded-2xl border-y md:border border-brand-orange",
      button: "hover:bg-brand-orange/5",
      badge: "bg-brand-orange/10 text-brand-orange",
      icon: "text-brand-orange",
      bullet: "text-brand-orange"
    },
    error: {
      container: "md:rounded-2xl border-y md:border border-brand-red",
      button: "hover:bg-brand-red/5",
      badge: "bg-brand-red/10 text-brand-red",
      icon: "text-brand-red",
      bullet: "text-brand-red"
    },
    info: {
      container: "md:rounded-2xl border-y md:border border-brand-navy",
      button: "hover:bg-brand-navy/5",
      badge: "bg-brand-navy/10 text-brand-navy",
      icon: "text-brand-navy",
      bullet: "text-brand-navy"
    }
  };

  const IconComponent = () => {
    switch (iconType) {
      case 'alert-triangle':
        return <AlertTriangle className="h-4 w-4" />;
      case 'alert-circle':
        return <AlertCircle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className={cn(
      variantStyles[variant].container,
      "overflow-hidden",
      className
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-5 py-4 transition-colors",
          variantStyles[variant].button
        )}
      >
        <div className="flex items-center gap-2.5 font-semibold text-sm">
          <span className={variantStyles[variant].icon}>
            <IconComponent />
          </span>
          <span>{title}</span>
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-bold", variantStyles[variant].badge)}>
            {items.length}
          </span>
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 flex-shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="px-5 pb-5">
          <ul className="space-y-2.5">
            {items.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2.5 text-sm"
              >
                <span className={cn("mt-0.5 flex-shrink-0", variantStyles[variant].bullet)}>•</span>
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}