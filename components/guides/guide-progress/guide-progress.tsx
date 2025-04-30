'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useGuideProgressStore, useHydratedGuideProgressStore } from '@/lib/store/guide-progress';
import { CompletionCelebration } from './completion-celebration';

// Lazy load the GuideProgressIndicator component
const GuideProgressIndicator = dynamic(
  () => import('./guide-progress-indicator').then(mod => ({ default: mod.GuideProgressIndicator })),
  { ssr: false }
);

interface GuideProgressProps {
  guideId: string;
  guideName?: string;
  totalSteps: number;
  showCelebration?: boolean;
  onComplete?: () => void;
  dict: {
    guideProgress: {
      progressIndicator: {
        progress: string;
        stepsCount: string;
        completed: string;
      };
      completionCelebration: {
        congratulations: string;
        successMessage: string;
        continueButton: string;
      };
    };
  };
}

export function GuideProgress({
  guideId,
  guideName = 'Guide',
  totalSteps,
  showCelebration = true,
  onComplete,
  dict,
}: GuideProgressProps) {
  // Use regular store for methods
  const { initGuide, markGuideCompleted } = useGuideProgressStore();

  // Use hydrated store for derived state
  const progress = useHydratedGuideProgressStore(state =>
    state.getGuideProgress(guideId, totalSteps)
  );

  const isCompleted = useHydratedGuideProgressStore(state =>
    state.isGuideCompleted(guideId, totalSteps)
  );

  const [showingCelebration, setShowingCelebration] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Use a ref to track if celebration has been shown already
  const celebrationShownRef = useRef(false);

  // Initialize the guide in the store when the component mounts
  useEffect(() => {
    initGuide(guideId);
  }, [guideId, initGuide]);

  // Keep progress in sync with store changes
  useEffect(() => {
    // Initial calculation from hydrated store
    setCurrentProgress(progress);

    // Subscribe to store changes
    const unsubscribe = useGuideProgressStore.subscribe((state) => {
      const newProgress = state.getGuideProgress(guideId, totalSteps);
      setCurrentProgress(newProgress);
    });

    return () => unsubscribe();
  }, [guideId, totalSteps, progress]);

  // Check if the guide is completed and show celebration if needed
  useEffect(() => {
    if (isCompleted) {
      // Ensure guide is marked as completed in the store
      markGuideCompleted(guideId);

      // Only show celebration if it hasn't been shown before for this session
      if (showCelebration && !showingCelebration && !celebrationShownRef.current) {
        celebrationShownRef.current = true;
        setShowingCelebration(true);
        onComplete?.();
      }
    }
  }, [guideId, isCompleted, showCelebration, onComplete, markGuideCompleted, showingCelebration]);

  // Handle dismissing the celebration
  const handleDismissCelebration = () => {
    setShowingCelebration(false);
  };

  return (
    <>
      <GuideProgressIndicator
        progress={currentProgress}
        totalSteps={totalSteps}
        dict={dict}
      />

      {showingCelebration && (
        <CompletionCelebration
          guideId={guideId}
          guideName={guideName}
          onDismiss={handleDismissCelebration}
          dict={dict}
        />
      )}
    </>
  );
}