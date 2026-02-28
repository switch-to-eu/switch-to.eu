"use client";

import { useEffect, useState } from "react";

interface HeroBadgeProps {
  children: React.ReactNode;
  color: string;
  shape: "circle" | "square" | "star" | "hexagon";
  className?: string;
  delay?: number;
}

export function HeroBadge({
  children,
  color,
  shape,
  className = "",
  delay = 0,
}: HeroBadgeProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const shapeClasses: Record<string, string> = {
    circle: "rounded-full",
    square: "rounded-xl rotate-12",
    star: "rounded-full",
    hexagon: "rounded-2xl -rotate-6",
  };

  return (
    <div
      className={`
        inline-flex items-center justify-center
        text-sm font-bold select-none
        transition-all duration-500 ease-out
        ${shapeClasses[shape]}
        ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"}
        ${className}
      `}
      style={{ backgroundColor: color }}
    >
      {children}
    </div>
  );
}
