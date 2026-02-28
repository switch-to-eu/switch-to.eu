"use client";

import { useState, useEffect, useCallback } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@switch-to-eu/ui/components/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@switch-to-eu/ui/components/sheet';
import { GuideSidebar } from './GuideSidebar';
import { usePathname } from 'next/navigation';

interface Step {
  title: string;
  id: string;
}

interface MobileGuideSidebarProps {
  steps: Step[];
  lang?: string;
  stepsToCompleteText?: string;
  guideId?: string;
}

export function MobileGuideSidebar({
  steps,
  lang = 'en',
  stepsToCompleteText,
  guideId
}: MobileGuideSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Get the appropriate text based on language
  // Using values from dictionaries/en.json and dictionaries/nl.json guides.stepPlan
  const stepPlanText = lang === 'nl' ? "Stappenplan" : "Step Plan";

  // Use the stepsToCompleteText prop if provided, or derive it based on language
  const finalStepsToCompleteText = stepsToCompleteText;

  // Function to find the element by step title or ID
  const findElementByStep = useCallback((stepId: string): HTMLElement | null => {
    // First try to find by ID directly
    const elementById = document.getElementById(stepId);
    if (elementById) return elementById;

    // Find the step object from the ID
    const step = steps.find(s => s.id === stepId);
    if (!step) return null;

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
          return section;
        }
      }
    }

    return null;
  }, [steps]);

  // Override the StepsSummary click behavior to close the sheet
  const handleSheetOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    // If closing the sheet, we don't need to do anything else
    if (!isOpen) return;
  };

  // Handle clicks on navigation links
  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const stepLink = target.closest('a[href^="#"]');

      if (stepLink) {
        e.preventDefault();

        // Get the step ID from the href attribute
        const href = stepLink.getAttribute('href');
        if (!href) return;

        const stepId = href.substring(1); // Remove the # character

        // Find the element and scroll to it
        const element = findElementByStep(stepId);
        if (element) {
          // Close the sheet first
          setOpen(false);

          // Wait a small amount of time before scrolling
          setTimeout(() => {
            // Add padding to account for the fixed header
            const headerHeight = 80; // Estimated header height
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

            // Scroll with custom offset instead of using scrollIntoView
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });

            // Update URL hash
            window.history.pushState(null, '', `${pathname}#${stepId}`);
          }, 300);
        }
      }
    };

    document.addEventListener('click', handleClick);

    // Clean up event listener when sheet is closed or component unmounts
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [open, pathname, steps, findElementByStep]);

  return (
    <>
      {/* Mobile Toggle Button - Only visible on mobile */}
      <div className="fixed bottom-6 right-6 z-40 block md:hidden">
        <Sheet open={open} onOpenChange={handleSheetOpenChange}>
          <SheetTrigger asChild>
            <Button
              variant="default"
              size="default"
              aria-label="Open guide navigation"
              className="rounded-full shadow-lg flex items-center gap-2 px-4 bg-brand-green hover:bg-brand-green/90 text-white"
            >
              <span>{stepPlanText}</span>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] sm:max-w-md px-0 pt-12 overflow-y-auto bg-brand-cream border-l-brand-sage">
            <SheetTitle className="text-lg font-semibold px-6 sr-only">
              {stepPlanText}
            </SheetTitle>
            <div className="h-full overflow-y-auto">
              <GuideSidebar
                steps={steps}
                stepsToCompleteText={finalStepsToCompleteText}
                guideId={guideId}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}