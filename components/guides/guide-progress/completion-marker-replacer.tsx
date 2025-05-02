'use client';

import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { StepCompletionButton } from './step-completion-button';
import { useTranslations } from 'next-intl';

interface CompletionMarkerReplacerProps {
  guideId: string;
}

// Generate a stable ID for a step based on its title and guide ID
function generateStableStepId(guideId: string, stepTitle: string, stepNumber: number): string {
  // Create a simplified version of the step title (lowercase, no special chars)
  const simplifiedTitle = stepTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');

  // Combine with the guide ID and step number for uniqueness
  return `${guideId}-step-${stepNumber}-${simplifiedTitle}`.slice(0, 40);
}

export function CompletionMarkerReplacer({ guideId }: CompletionMarkerReplacerProps) {
  const processedRef = useRef<boolean>(false);
  const t = useTranslations('guideProgress');

  useEffect(() => {
    // Only process once to avoid duplicate buttons
    if (processedRef.current) return;

    // Find all marker elements
    const markers = document.querySelectorAll('.step-completion-marker');

    // Keep track of step headings we've already processed
    const processedHeadings = new Set<string>();
    // Keep track of markers with no headings
    let noHeadingCounter = 0;

    if (markers.length > 0) {
      markers.forEach((marker, index) => {
        try {
          // Get the guide ID from the data attribute
          const markerGuideId = marker.getAttribute('data-guide-id');

          // Only process if the marker matches our guide ID
          if (markerGuideId === guideId) {
            // First check for heading data from the pre-processed data-heading attribute
            let stepTitle = '';
            const headingData = marker.getAttribute('data-heading');

            if (headingData) {
              try {
                stepTitle = decodeURIComponent(headingData);
              } catch (e) {
                console.error('Error decoding heading data:', e);
              }
            }

            // If no heading data, fallback to DOM traversal to find the closest heading
            if (!stepTitle) {
              let currentNode: Element | null = marker;

              // Look for headings above this marker
              while (currentNode && !stepTitle) {
                // Go back up the DOM tree
                currentNode = currentNode.previousElementSibling;

                // Check if we found an h2 or h3 element
                if (currentNode && (currentNode.tagName === 'H2' || currentNode.tagName === 'H3')) {
                  const textContent = currentNode.textContent;
                  stepTitle = textContent ? textContent.trim() : '';
                  break;
                }
              }

              // If we couldn't find a heading, try to look up the tree
              if (!stepTitle) {
                currentNode = marker.parentElement;
                while (currentNode) {
                  // Look for h2 or h3 elements in parent nodes
                  const foundHeading = currentNode.querySelector('h2, h3');
                  if (foundHeading) {
                    const textContent = foundHeading.textContent;
                    stepTitle = textContent ? textContent.trim() : '';
                    break;
                  }
                  currentNode = currentNode.parentElement;
                }
              }
            }

            // If still no title, use a default
            if (!stepTitle) {
              noHeadingCounter++;
              // Use the translation with variable replacement
              stepTitle = t('unnamedStep', { number: noHeadingCounter });
            } else {
              // Check if we've already processed this heading
              // If so, we'll skip creating a duplicate completion button for the same step
              if (processedHeadings.has(stepTitle)) {
                return;
              }
              processedHeadings.add(stepTitle);
            }

            // Extract step number from title if present (e.g. "Stap 1: ..." -> 1)
            const stepNumberMatch = stepTitle.match(/Stap\s+(\d+):/i);
            const stepNumber = stepNumberMatch ? parseInt(stepNumberMatch[1]) : index + 1;

            // Generate a stable step ID based on the title and guide ID
            const stepId = generateStableStepId(guideId, stepTitle, stepNumber);

            // Create a container for the completion button
            const container = document.createElement('div');
            container.setAttribute('id', `completion-marker-${stepId}`);
            container.setAttribute('data-step-title', stepTitle);
            container.setAttribute('data-guide-id', guideId);
            container.setAttribute('data-step-id', stepId);

            // Replace the marker with the container
            if (marker.parentNode) {
              marker.parentNode.replaceChild(container, marker);

              // Render the StepCompletionButton into the container using React
              // We need to do this in a separate effect to ensure the DOM is updated
              setTimeout(() => {
                const mountPoint = document.getElementById(`completion-marker-${stepId}`);
                if (mountPoint) {
                  // Create a new div element to mount the React component
                  const root = document.createElement('div');
                  mountPoint.appendChild(root);

                  try {
                    // Use ReactDOM.createRoot to render the component
                    const reactRoot = createRoot(root);
                    reactRoot.render(
                      <StepCompletionButton
                        guideId={guideId}
                        stepId={stepId}
                        stepTitle={stepTitle}
                      />
                    );
                  } catch (error) {
                    console.error('Error rendering StepCompletionButton:', error);
                  }
                }
              }, 0);
            }
          }
        } catch (error) {
          console.error('Error processing completion marker:', error);
        }
      });

      // Mark as processed
      processedRef.current = true;
    }
  }, [guideId, t]);

  // This component doesn't render anything visible
  return null;
}