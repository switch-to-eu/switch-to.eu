'use client';

import { cn } from '@switch-to-eu/ui/lib/utils';
import { useMemo, useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface GuideProgressIndicatorProps {
  progress: number;
  totalSteps: number;
  className?: string;
  currentStepTitle?: string;
}

export function GuideProgressIndicator({
  progress,
  totalSteps,
  className,
  currentStepTitle,
}: GuideProgressIndicatorProps) {
  const [showCompletedMessage, setShowCompletedMessage] = useState(false);
  const t = useTranslations('guideProgress.progressIndicator');

  // Calculate progress values using useMemo to avoid unnecessary recalculations
  const { progressPercentage, completedSteps } = useMemo(() => {
    // Ensure the progress is a valid percentage
    const progressPercentage = Math.round(Math.min(Math.max(progress, 0), 100));

    // Calculate the completed steps based on percentage
    const completedSteps = Math.round((progressPercentage * totalSteps) / 100);

    return { progressPercentage, completedSteps };
  }, [progress, totalSteps]);

  // Format the steps count string with variables
  const formattedStepsCount = t('stepsCount', {
    completedSteps: completedSteps,
    totalSteps: totalSteps
  });

  // Show completion message when progress is 100%
  useEffect(() => {
    if (progressPercentage === 100) {
      setShowCompletedMessage(true);

      // Hide the completion message after 5 seconds
      const timer = setTimeout(() => {
        setShowCompletedMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [progressPercentage]);

  // Check if guide is complete
  const isComplete = progressPercentage === 100;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 w-full z-50 transition-all duration-300 border-t",
        className
      )}
      suppressHydrationWarning
    >
      <div className="relative h-2 bg-muted overflow-hidden">
        {/* Progress bar */}
        <div
          className={cn(
            "h-full **:transition-all duration-300 ease-in-out",
            isComplete ? "bg-green-500" : "bg-[var(--green)]"
          )}
          style={{ width: `${progressPercentage}%` }}
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
          aria-label={formattedStepsCount}
        />

        {/* Show completion message if enabled */}
        {showCompletedMessage && (
          <div className="absolute bottom-0 right-0 text-xs text-green-500 p-1">
            {t('completed')}
            {currentStepTitle && `: ${currentStepTitle}`}
          </div>
        )}
      </div>
    </div>
  );
}