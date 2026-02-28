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
      container: "text-brand-green bg-brand-yellow/10 rounded-2xl border border-brand-yellow/30",
      button: "hover:bg-brand-yellow/10",
      badge: "bg-brand-yellow/30 text-brand-green",
      icon: "text-brand-orange",
      bullet: "text-brand-orange"
    },
    error: {
      container: "text-brand-green bg-brand-red/5 rounded-2xl border border-brand-red/20",
      button: "hover:bg-brand-red/10",
      badge: "bg-brand-red/15 text-brand-red",
      icon: "text-brand-red",
      bullet: "text-brand-red"
    },
    info: {
      container: "text-brand-green bg-brand-sky/15 rounded-2xl border border-brand-sky/30",
      button: "hover:bg-brand-sky/15",
      badge: "bg-brand-sky/30 text-brand-green",
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
                <span className="text-brand-green/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}