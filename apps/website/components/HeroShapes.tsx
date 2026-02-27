"use client";

import { useEffect, useId, useState } from "react";

const floatKeyframes = [
  `@keyframes hero-float-1 {
    0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
    25% { transform: translate(6px, -10px) rotate(3deg) scale(1.03); }
    50% { transform: translate(-4px, -6px) rotate(-2deg) scale(0.98); }
    75% { transform: translate(8px, 4px) rotate(2deg) scale(1.02); }
  }`,
  `@keyframes hero-float-2 {
    0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
    20% { transform: translate(-8px, 6px) rotate(-3deg) scale(1.02); }
    45% { transform: translate(5px, 10px) rotate(2deg) scale(0.97); }
    70% { transform: translate(-6px, -8px) rotate(-1deg) scale(1.04); }
  }`,
  `@keyframes hero-float-3 {
    0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
    30% { transform: translate(10px, 5px) rotate(4deg) scale(0.98); }
    60% { transform: translate(-7px, -9px) rotate(-3deg) scale(1.03); }
    85% { transform: translate(3px, 7px) rotate(1deg) scale(1.01); }
  }`,
];

let injected = false;
function injectKeyframes() {
  if (injected || typeof document === "undefined") return;
  injected = true;
  const style = document.createElement("style");
  style.textContent = floatKeyframes.join("\n");
  document.head.appendChild(style);
}

let shapeCounter = 0;

function AnimatedShape({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [index] = useState(() => shapeCounter++);

  useEffect(() => {
    injectKeyframes();
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const floatIndex = (index % 3) + 1;
  const duration = 12 + (index % 3) * 4; // 12s, 16s, 20s

  return (
    <div
      className={`
        select-none
        transition-all duration-700 ease-out
        ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"}
        ${className}
      `}
      style={
        isVisible
          ? { animation: `hero-float-${floatIndex} ${duration}s ease-in-out infinite` }
          : undefined
      }
    >
      {children}
    </div>
  );
}

interface ShapeProps {
  color: string;
  className?: string;
  delay?: number;
}

// Large organic blob — smooth, wobbly like the orange blob in image 2
export function BlobShape({ color, className, delay }: ShapeProps) {
  return (
    <AnimatedShape className={className} delay={delay}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <path
          d="M100 20C130 15 165 30 175 60C185 90 175 110 160 135C145 160 120 175 95 178C70 181 45 168 30 145C15 122 12 95 20 70C28 45 70 25 100 20Z"
          fill={color}
        />
      </svg>
    </AnimatedShape>
  );
}

// Pebble — lumpy organic blob with overlapping rounded forms
export function PebbleShape({ color, className, delay }: ShapeProps) {
  return (
    <AnimatedShape className={className} delay={delay}>
      <svg viewBox="0 0 331.3 316.13" className="w-full h-full">
        <path
          d="M330.41,86.96c-7.05-42.22-49.01-65.59-89.37-62.74-2.96.21-5.97.56-8.98,1.07-15.12-13.5-34.16-22.39-54.53-24.68-28.26-3.2-60.72,6.39-79.98,28.08-2.32,2.61-4.43,5.44-6.25,8.41-16.11-.6-32.37,5.08-44.67,17.22-16.09,15.87-21.23,38.67-15.69,59.18-9.24,5.48-17.24,12.89-23.04,22.72-6.44,10.9-9.55,23.93-7.04,36.47,2.25,11.22,8.89,20.91,17.29,28.48-2.59,4.79-4.3,10.1-4.97,15.64-2.21,17.98,5.94,35.94,18.04,48.89,17.58,18.8,42.96,26.81,67.25,23.31,2.8,4.2,6.22,8.02,10.17,11.23,20.08,16.34,53.53,21.55,76.61,8.65,3.68-2.06,7.05-4.68,9.93-7.71,8.48,3.44,17.81,4.82,27.24,3.53,25.67-3.53,46.44-24.48,48.56-50.45.32-3.98.23-7.96-.28-11.88,10.29-4.85,19.49-12,26.58-21.22,15.91-20.7,21.08-51.91,9.8-76.03,3.22-2.28,6.22-4.92,8.94-7.84,12.68-13.61,17.41-32.12,14.37-50.32Z"
          fill={color}
        />
      </svg>
    </AnimatedShape>
  );
}

// Smooth circle — large, perfect, like the purple circle in image 2
export function CircleShape({ color, className, delay }: ShapeProps) {
  return (
    <AnimatedShape className={className} delay={delay}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <circle cx="100" cy="100" r="90" fill={color} />
      </svg>
    </AnimatedShape>
  );
}

// Rounded diamond/square — tilted, like the yellow diamond in image 2
export function DiamondShape({ color, className, delay }: ShapeProps) {
  return (
    <AnimatedShape className={className} delay={delay}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <rect
          x="40"
          y="40"
          width="120"
          height="120"
          rx="20"
          fill={color}
          transform="rotate(15, 100, 100)"
        />
      </svg>
    </AnimatedShape>
  );
}

// Heart shape — like the pink heart in image 2
export function HeartShape({ color, className, delay }: ShapeProps) {
  return (
    <AnimatedShape className={className} delay={delay}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <path
          d="M100 170C100 170 25 120 25 72C25 45 48 28 72 28C85 28 95 35 100 45C105 35 115 28 128 28C152 28 175 45 175 72C175 120 100 170 100 170Z"
          fill={color}
        />
      </svg>
    </AnimatedShape>
  );
}

// Half circle / semi-circle — like the blue half-circle in image 2
export function HalfCircleShape({ color, className, delay }: ShapeProps) {
  return (
    <AnimatedShape className={className} delay={delay}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <path
          d="M20 140A80 80 0 0 1 180 140Z"
          fill={color}
        />
      </svg>
    </AnimatedShape>
  );
}

// Puddle — wide, flat organic spill shape
export function PuddleShape({ color, className, delay }: ShapeProps) {
  return (
    <AnimatedShape className={className} delay={delay}>
      <svg viewBox="0 0 450.08 379.01" className="w-full h-full">
        <path
          d="M421.53,98.92c-26.1-36.1-68.98-61.35-114.25-60.12-28.63.76-57.71,11.94-86.26,4.83-24.88-6.2-42.47-26.6-65.37-36.94-20.87-9.44-45.45-8.74-66,1.27-20.7,10.08-35.38,29.78-40.32,52.15-2.32,10.56-2.42,21.42-.28,32.02,0,.07.02.14.04.21.02.08.05.15.06.24,0,0,0,0,0,0,7.76,27.9-2.36,57.17-11.57,83.46-9.67,27.59-23.46,53.66-31.4,81.87-7.12,25.32-9.54,53.46.74,78.28,8.3,20.04,26.36,37.11,47.88,41.72,22.62,4.85,43.49-6.54,57.72-23.59,16.35-19.6,23.46-44.22,33.11-67.38,10.08-24.18,25.66-49.43,52.47-57.09,26.02-7.42,47.08,10.04,60.12,30.86,12.48,19.91,18.95,43.14,33.32,61.94,14.43,18.89,35.93,28.11,59.62,24.76,50.52-7.16,80.7-61.82,92.53-106.56,12.63-47.77,7.29-101.2-22.14-141.91Z"
          fill={color}
        />
      </svg>
    </AnimatedShape>
  );
}
