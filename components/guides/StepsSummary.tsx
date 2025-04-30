"use client";

import Link from 'next/link';
import { Check } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useGuideProgressStore } from '@/lib/store/guide-progress';

interface Step {
  title: string;
  id: string;
}

interface StepsSummaryProps {
  steps: Step[];
  title?: string;
  lang?: string;
  stepsToCompleteText?: string;
  guideId?: string;
}

export function StepsSummary({
  steps,
  stepsToCompleteText = 'Steps to complete',
  guideId = '',
}: StepsSummaryProps) {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const pathname = usePathname();
  const isStepCompleted = useGuideProgressStore(state => state.isStepCompleted);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  // Add a ref to track if component is mounted
  const isMounted = useRef(false);
  // Add a ref to track if we're in browser environment
  const isBrowser = typeof window !== 'undefined';

  // Initialize and sync completed steps from store
  useEffect(() => {
    if (guideId && steps.length > 0) {
      // Only run on client-side to avoid hydration mismatch
      const newCompletedSteps: Record<string, boolean> = {};
      steps.forEach(step => {
        newCompletedSteps[step.id] = isStepCompleted(guideId, step.id);
      });
      setCompletedSteps(newCompletedSteps);
    }
  }, [guideId, steps, isStepCompleted]);

  // Subscribe to store updates to keep completion status in sync
  useEffect(() => {
    if (guideId && steps.length > 0) {
      const updateCompletedSteps = () => {
        const newCompletedSteps: Record<string, boolean> = {};
        steps.forEach(step => {
          newCompletedSteps[step.id] = isStepCompleted(guideId, step.id);
        });
        setCompletedSteps(newCompletedSteps);
      };

      // Set up subscription to store changes
      const unsubscribe = useGuideProgressStore.subscribe(updateCompletedSteps);
      return () => unsubscribe();
    }
  }, [guideId, steps, isStepCompleted]);

  // Function to find the element by step title or ID - wrap in useCallback
  const findElementByStep = useCallback((step: Step): HTMLElement | null => {
    if (!isBrowser || !step) return null;

    try {
      // First try to find by ID directly
      const elementById = document.getElementById(step.id);
      if (elementById) return elementById;

      // Then try to find h2 or h3 elements with matching text content
      const headings = document.querySelectorAll('h2, h3');
      for (const heading of headings) {
        // Add strict type check to ensure textContent is a string before calling trim()
        const headingText = heading.textContent;
        if (headingText && typeof headingText === 'string' && headingText.trim() === step.title) {
          return heading as HTMLElement;
        }
      }

      // Then try sections (they might have IDs like "section-steps")
      const sections = document.querySelectorAll('section');
      for (const section of sections) {
        // Check if this section contains the step title in an h2 or h3
        const sectionHeadings = section.querySelectorAll('h2, h3');
        for (const heading of sectionHeadings) {
          // Add strict type check to ensure textContent is a string before calling trim()
          const headingText = heading.textContent;
          if (headingText && typeof headingText === 'string' && headingText.trim() === step.title) {
            return section as HTMLElement;
          }
        }
      }
    } catch (error) {
      console.error("Error finding element by step:", error);
    }

    return null;
  }, [isBrowser]); // Add isBrowser as dependency

  // Handle scroll events to update active step
  useEffect(() => {
    // Exit early if not in browser
    if (!isBrowser) return;

    // Set mounted flag
    isMounted.current = true;

    // Function to determine which step is currently in view
    const handleScroll = () => {
      if (!isMounted.current) return;

      try {
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
      } catch (error) {
        console.error("Error in scroll handler:", error);
      }
    };

    // Handle initial hash from URL - only update the active step, don't scroll
    const handleInitialHash = () => {
      if (!isMounted.current) return;

      try {
        // Get hash without the # character
        const hash = window.location.hash.substring(1);

        if (hash) {
          const matchingStep = steps.find(step => step.id === hash);
          if (matchingStep) {
            setActiveStep(hash);
          }
        }
      } catch (error) {
        console.error("Error handling initial hash:", error);
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Set up event listeners
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('hashchange', handleInitialHash);

      // Initial check for hash
      handleInitialHash();
      if (!window.location.hash) {
        handleScroll();
      }
    }, 100); // Small delay to ensure DOM is ready

    return () => {
      // Clear the timeout if component unmounts before it fires
      clearTimeout(timer);
      // Mark component as unmounted
      isMounted.current = false;
      // Remove event listeners
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleInitialHash);
    };
  }, [steps, pathname, activeStep, isBrowser, findElementByStep]);

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
      <div className="px-6 py-3">
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
                  if (isBrowser) {
                    try {
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
                    } catch (error) {
                      console.error("Error in click handler:", error);
                    }
                  }
                }}
              >
                <span className={cn(
                  "flex items-center justify-center w-5 h-5 rounded-full text-xs transition-all duration-300 ease-in-out",
                  activeStep === step.id
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 transform scale-110 shadow-sm"
                    : completedSteps[step.id]
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                )}>
                  {activeStep === step.id ? (
                    <Check className="h-3 w-3 animate-fadeIn" />
                  ) : completedSteps[step.id] ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <span className="transition-opacity duration-200">{index + 1}</span>
                  )}
                </span>
                <span className={cn(
                  "transition-all duration-300 ease-in-out",
                  activeStep === step.id ? "font-medium transform translate-x-0.5" : "opacity-80",
                  completedSteps[step.id] ? "line-through text-slate-500 dark:text-slate-400" : ""
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