"use client";

import { Check } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@switch-to-eu/ui/lib/utils";
import { usePathname } from "next/navigation";
import { useGuideProgressStore } from "@/lib/store/guide-progress";
import { Link } from "@switch-to-eu/i18n/navigation";

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
  stepsToCompleteText = "Steps to complete",
  guideId = "",
}: StepsSummaryProps) {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const pathname = usePathname();
  const isStepCompleted = useGuideProgressStore(
    (state) => state.isStepCompleted
  );
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(
    {}
  );
  // Add a ref to track if component is mounted
  const isMounted = useRef(false);
  // Add a ref to track if we're in browser environment
  const isBrowser = typeof window !== "undefined";

  // Initialize and sync completed steps from store
  useEffect(() => {
    if (guideId && steps.length > 0) {
      // Only run on client-side to avoid hydration mismatch
      const newCompletedSteps: Record<string, boolean> = {};
      steps.forEach((step) => {
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
        steps.forEach((step) => {
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
  const findElementByStep = useCallback(
    (step: Step): HTMLElement | null => {
      if (!isBrowser || !step) return null;

      try {
        // First try to find by ID directly
        const elementById = document.getElementById(step.id);
        if (elementById) return elementById;

        // Then try to find h2 or h3 elements with matching text content
        const headings = document.querySelectorAll("h2, h3");
        for (const heading of headings) {
          // Add strict type check to ensure textContent is a string before calling trim()
          const headingText = heading.textContent;
          if (
            headingText &&
            typeof headingText === "string" &&
            headingText.trim() === step.title
          ) {
            return heading as HTMLElement;
          }
        }

        // Then try sections (they might have IDs like "section-steps")
        const sections = document.querySelectorAll("section");
        for (const section of sections) {
          // Check if this section contains the step title in an h2 or h3
          const sectionHeadings = section.querySelectorAll("h2, h3");
          for (const heading of sectionHeadings) {
            // Add strict type check to ensure textContent is a string before calling trim()
            const headingText = heading.textContent;
            if (
              headingText &&
              typeof headingText === "string" &&
              headingText.trim() === step.title
            ) {
              return section;
            }
          }
        }
      } catch (error) {
        console.error("Error finding element by step:", error);
      }

      return null;
    },
    [isBrowser]
  ); // Add isBrowser as dependency

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
                window.history.replaceState(null, "", `${pathname}#${step.id}`);
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
          const matchingStep = steps.find((step) => step.id === hash);
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
      window.addEventListener("scroll", handleScroll);
      window.addEventListener("hashchange", handleInitialHash);

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
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", handleInitialHash);
    };
  }, [steps, pathname, activeStep, isBrowser, findElementByStep]);

  if (!steps || steps.length === 0) {
    return null;
  }

  // Count completed steps
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const totalCount = steps.length;

  return (
    <div>
      {/* Title + progress inline */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg uppercase text-brand-green">
          {stepsToCompleteText}
        </h2>
        <span className="text-xs font-semibold text-brand-green/60 bg-brand-green/10 px-2 py-0.5 rounded-full">
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-brand-green/10 rounded-full mb-4 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            completedCount === totalCount ? "bg-brand-green" : "bg-brand-yellow"
          )}
          style={{
            width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
          }}
        />
      </div>

      <ol className="space-y-1">
        {steps.map((step, index) => (
          <li key={index}>
            <Link
              href={`#${step.id}`}
              className={cn(
                "flex items-center gap-3 py-2 px-3 rounded-xl text-sm transition-all duration-200",
                activeStep === step.id
                  ? "bg-brand-green text-white font-medium"
                  : completedSteps[step.id]
                    ? "text-brand-green/50 hover:bg-brand-green/5"
                    : "text-brand-green hover:bg-brand-green/5"
              )}
              onClick={(e) => {
                e.preventDefault();
                if (isBrowser) {
                  try {
                    const element = findElementByStep(step);
                    if (element) {
                      const headerHeight = 80;
                      const elementPosition =
                        element.getBoundingClientRect().top;
                      const offsetPosition =
                        elementPosition + window.pageYOffset - headerHeight;

                      window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                      });

                      setActiveStep(step.id);
                      window.history.pushState(
                        null,
                        "",
                        `${pathname}#${step.id}`
                      );
                    }
                  } catch (error) {
                    console.error("Error in click handler:", error);
                  }
                }
              }}
            >
              <span
                className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 transition-all duration-200",
                  activeStep === step.id
                    ? "bg-brand-yellow text-brand-green"
                    : completedSteps[step.id]
                      ? "bg-brand-green/20 text-brand-green/50"
                      : "bg-brand-yellow/40 text-brand-green"
                )}
              >
                {completedSteps[step.id] ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  completedSteps[step.id] ? "line-through" : ""
                )}
              >
                {step.title}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
