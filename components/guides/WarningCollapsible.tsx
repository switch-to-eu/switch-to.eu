"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      container: "text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/30",
      badge: "bg-amber-200/50 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300",
      bullet: "text-amber-500 dark:text-amber-400"
    },
    error: {
      container: "text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/30",
      badge: "bg-red-200/50 dark:bg-red-900/50 text-red-800 dark:text-red-300",
      bullet: "text-red-500 dark:text-red-400"
    },
    info: {
      container: "text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/30",
      badge: "bg-blue-200/50 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300",
      bullet: "text-blue-500 dark:text-blue-400"
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
      className
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-6 py-4",
          "border-b transition-colors"
        )}
      >
        <div className="flex items-center gap-2 font-medium">
          <IconComponent />
          <span>{title}</span>
          <span className={cn("text-xs px-2 py-0.5 rounded-full", variantStyles[variant].badge)}>
            {items.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="p-6">
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm"
              >
                <span className={cn("mt-0.5", variantStyles[variant].bullet)}>•</span>
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}