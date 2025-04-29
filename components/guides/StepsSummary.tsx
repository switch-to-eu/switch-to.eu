"use client";

import Link from 'next/link';
import { Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface Step {
  title: string;
  id: string;
}

interface StepsSummaryProps {
  steps: Step[];
  title?: string;
  lang?: string;
  stepsToCompleteText?: string;
}

export function StepsSummary({
  steps,
  stepsToCompleteText = 'Steps to complete'
}: StepsSummaryProps) {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const pathname = usePathname();

  // Function to find the element by step title or ID
  const findElementByStep = (step: Step): HTMLElement | null => {
    // First try to find by ID directly
    const elementById = document.getElementById(step.id);
    if (elementById) return elementById;

    // Then try to find h2 or h3 elements with matching text content
    const headings = document.querySelectorAll('h2, h3');
    for (const heading of headings) {
      if (heading.textContent?.trim() === step.title) {
        return heading as HTMLElement;
      }
    }

    // Then try sections (they might have IDs like "section-steps")
    const sections = document.querySelectorAll('section');
    for (const section of sections) {
      // Check if this section contains the step title in an h2 or h3
      const sectionHeadings = section.querySelectorAll('h2, h3');
      for (const heading of sectionHeadings) {
        if (heading.textContent?.trim() === step.title) {
          return section as HTMLElement;
        }
      }
    }

    return null;
  };

  // Handle scroll events to update active step
  useEffect(() => {
    // Function to determine which step is currently in view
    const handleScroll = () => {
      // This is a simple implementation - could be more sophisticated
      for (const step of steps) {
        const element = findElementByStep(step);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the element is in the viewport
          if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
            if (activeStep !== step.id) {
              setActiveStep(step.id);
              // Update URL hash without triggering navigation
              window.history.replaceState(null, '', `${pathname}#${step.id}`);
            }
            break;
          }
        }
      }
    };

    // Handle initial hash from URL - only update the active step, don't scroll
    const handleInitialHash = () => {
      // Get hash without the # character
      const hash = window.location.hash.substring(1);

      if (hash) {
        const matchingStep = steps.find(step => step.id === hash);
        if (matchingStep) {
          setActiveStep(hash);
        }
      }
    };

    // Set up event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('hashchange', handleInitialHash);

    // Initial check for hash
    handleInitialHash();
    if (!window.location.hash) {
      handleScroll();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleInitialHash);
    };
  }, [steps, pathname, activeStep]);

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
        <h2 className="text-xl font-bold">{stepsToCompleteText}</h2>
      </div>
      <div className="">
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start gap-2">
              <Link
                href={`#${step.id}`}
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors duration-300 ease-in-out",
                  activeStep === step.id
                    ? "text-blue-600 dark:text-blue-400 font-medium"
                    : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  const element = findElementByStep(step);
                  if (element) {
                    // Add padding to account for the fixed header
                    const headerHeight = 80; // Estimated header height
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                    // Scroll with custom offset instead of using scrollIntoView
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });

                    setActiveStep(step.id);
                    // Update URL hash without causing page reload
                    window.history.pushState(null, '', `${pathname}#${step.id}`);
                  }
                }}
              >
                <span className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full text-xs transition-all duration-300 ease-in-out",
                  activeStep === step.id
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 transform scale-110 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                )}>
                  {activeStep === step.id ? (
                    <Check className="h-3 w-3 animate-fadeIn" />
                  ) : (
                    <span className="transition-opacity duration-200">{index + 1}</span>
                  )}
                </span>
                <span className={cn(
                  "transition-all duration-300 ease-in-out",
                  activeStep === step.id ? "font-medium transform translate-x-0.5" : "opacity-80"
                )}>
                  {step.title}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}