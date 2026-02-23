"use client";

import React from "react";
import { cn } from "@switch-to-eu/ui/lib/utils";

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

interface SectionHeaderProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

interface SectionContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SectionFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ children, className }: SectionCardProps) {
  return (
    <div className={cn(
      "overflow-hidden shadow-card",
      // Mobile: only top/bottom borders, no left/right
      "border-t border-b border-primary",
      // Desktop: rounded corners and full border
      "sm:rounded-lg sm:border-l sm:border-r",
      className
    )}>
      {children}
    </div>
  );
}

export function SectionHeader({
  children,
  icon,
  title,
  description,
  className
}: SectionHeaderProps) {
  return (
    <div className={cn("border-b border-gray-200 px-6 py-4 header-bg", className)}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-primary-color">{icon}</span>}
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {description && (
        <p className="mt-1 text-sm text-gray-600">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

export function SectionContent({ children, className }: SectionContentProps) {
  return (
    <div className={cn("p-6 bg-white", className)}>
      {children}
    </div>
  );
}

export function SectionFooter({ children, className }: SectionFooterProps) {
  return (
    <div className={cn("border-t border-gray-200 bg-gray-50 px-6 py-4", className)}>
      {children}
    </div>
  );
}