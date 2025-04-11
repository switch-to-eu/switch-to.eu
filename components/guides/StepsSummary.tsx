"use client";

import Link from 'next/link';
import { Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Step {
  title: string;
  id: string;
}

interface StepsSummaryProps {
  steps: Step[];
  title?: string;
}

export function StepsSummary({
  steps
}: StepsSummaryProps) {
  const [activeStep, setActiveStep] = useState<string | null>(null);

  useEffect(() => {
    // Function to determine which step is currently in view
    const handleScroll = () => {
      // This is a simple implementation - could be more sophisticated
      for (const step of steps) {
        const element = document.getElementById(step.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the element is in the viewport
          if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
            setActiveStep(step.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [steps]);

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="relative h-40 mb-2">
        <Image
          src="/images/migrate.svg"
          alt="Migration guides illustration"
          fill
          className="object-contain block"
        />
      </div>
      {/* Title section */}
      <div className="px-6 py-3 ">
        <h2 className="text-xl font-bold">Steps to complete</h2>
      </div>
      <div className="">
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start gap-2">
              <Link
                href={`#${step.id}`}
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors",
                  activeStep === step.id
                    ? "text-blue-600 dark:text-blue-400 font-medium"
                    : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(step.id);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    setActiveStep(step.id);
                  }
                }}
              >
                <span className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full text-xs",
                  activeStep === step.id
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                )}>
                  {activeStep === step.id ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span>{step.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}