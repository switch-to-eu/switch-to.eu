"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WarningCollapsibleProps {
  missingFeatures: string[];
  title?: string;
}

export function WarningCollapsible({
  missingFeatures,
  title = "Missing Features & Limitations"
}: WarningCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!missingFeatures || missingFeatures.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "text-amber-800 dark:text-amber-300",
      "bg-amber-50 dark:bg-amber-900/20",
      "border-amber-100 dark:border-amber-900/30",
      "hover:bg-amber-100 dark:hover:bg-amber-900/30"
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-6 py-4",
          "border-b transition-colors",

        )}
      >
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="h-4 w-4" />
          <span>{title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200/50 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
            {missingFeatures.length}
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
            {missingFeatures.map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm"
              >
                <span className="text-amber-500 dark:text-amber-400 mt-0.5">•</span>
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}