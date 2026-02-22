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
  const simplifiedTitle = stepTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-');

  return `${guideId}-step-${stepNumber}-${simplifiedTitle}`.slice(0, 40);
}

/**
 * CompletionMarkerReplacer component
 * Finds elements with the class 'step-completion-marker' and replaces them with completion buttons
 * These markers are inserted by processCompletionMarkers() in lib/content/utils/index.ts
 * Note: Since our update, markers are only inserted for steps with complete: true in their metadata
 */
export function CompletionMarkerReplacer({ guideId }: CompletionMarkerReplacerProps) {
  const processedRef = useRef<boolean>(false);
  const t = useTranslations('guideProgress');

  useEffect(() => {
    // Only process once to avoid duplicate buttons
    if (processedRef.current) return;

    // Find all marker elements
    const markers = document.querySelectorAll('.step-completion-marker');

    if (markers.length === 0) return;

    // Keep track of step headings we've already processed
    const processedHeadings = new Set<string>();
    let noHeadingCounter = 0;

    markers.forEach((marker, index) => {
      try {
        // Only process if the marker matches our guide ID
        if (marker.getAttribute('data-guide-id') !== guideId) return;

        // Get step title from data attribute or nearby heading
        let stepTitle = getStepTitle(marker);

        // If no title found, use default
        if (!stepTitle) {
          noHeadingCounter++;
          stepTitle = t('unnamedStep', { number: noHeadingCounter });
        } else if (processedHeadings.has(stepTitle)) {
          // Skip duplicates
          return;
        }

        processedHeadings.add(stepTitle);

        // Extract step number from title if present or use index
        const stepNumberMatch = stepTitle.match(/Stap\s+(\d+):/i);
        const stepNumber = stepNumberMatch?.[1] ? parseInt(stepNumberMatch[1]) : index + 1;

        // Generate stable step ID
        const stepId = generateStableStepId(guideId, stepTitle, stepNumber);

        // Replace marker with completion button
        replaceMarkerWithButton(marker, guideId, stepId, stepTitle);
      } catch (error) {
        console.error('Error processing completion marker:', error);
      }
    });

    // Mark as processed
    processedRef.current = true;
  }, [guideId, t]);

  // Get step title from marker
  function getStepTitle(marker: Element): string {
    // First check data-heading attribute
    const headingData = marker.getAttribute('data-heading');
    if (headingData) {
      try {
        return decodeURIComponent(headingData);
      } catch (e) {
        console.error('Error decoding heading data:', e);
      }
    }

    // Look for nearby headings
    let currentNode: Element | null = marker;

    // Check previous siblings
    while (currentNode) {
      currentNode = currentNode.previousElementSibling;
      if (currentNode && (currentNode.tagName === 'H2' || currentNode.tagName === 'H3')) {
        return currentNode.textContent?.trim() || '';
      }
    }

    // Check parent elements
    currentNode = marker.parentElement;
    while (currentNode) {
      const foundHeading = currentNode.querySelector('h2, h3');
      if (foundHeading) {
        return foundHeading.textContent?.trim() || '';
      }
      currentNode = currentNode.parentElement;
    }

    return '';
  }

  // Replace marker with completion button
  function replaceMarkerWithButton(marker: Element, guideId: string, stepId: string, stepTitle: string) {
    // Create container
    const container = document.createElement('div');
    container.setAttribute('id', `completion-marker-${stepId}`);
    container.setAttribute('data-step-title', stepTitle);
    container.setAttribute('data-guide-id', guideId);
    container.setAttribute('data-step-id', stepId);

    // Replace marker with container
    if (!marker.parentNode) return;
    marker.parentNode.replaceChild(container, marker);

    // Render React component
    setTimeout(() => {
      const mountPoint = document.getElementById(`completion-marker-${stepId}`);
      if (!mountPoint) return;

      const root = document.createElement('div');
      mountPoint.appendChild(root);

      try {
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
    }, 0);
  }

  return null;
}