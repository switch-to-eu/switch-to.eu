'use client';

import { useState, useEffect } from 'react';
import { Square, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGuideProgressStore, useHydratedGuideProgressStore } from '@/lib/store/guide-progress';
import { Button } from '@/components/ui/button';
import { usePlausible } from 'next-plausible';

interface StepCompletionButtonProps {
  guideId: string;
  stepId: string;
  stepTitle?: string;
  className?: string;
  dict: {
    guideProgress: {
      stepCompletionButton: {
        markComplete: string;
        completed: string;
      };
    };
  };
}

type StepEvents = {
  StepCompleted: {
    guideId: string;
    stepId: string;
    stepTitle?: string;
    status: string;
  };
};

export function StepCompletionButton({
  guideId,
  stepId,
  stepTitle,
  className,
  dict,
}: StepCompletionButtonProps) {
  // Use the regular store for methods
  const { toggleStepCompleted, initGuide } = useGuideProgressStore();

  // Use the hydrated store for state values to ensure we have the persisted values
  const isStepCompleted = useHydratedGuideProgressStore(state =>
    state.isStepCompleted(guideId, stepId)
  );

  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const plausible = usePlausible<StepEvents>();

  // Initialize the guide in the store
  useEffect(() => {
    initGuide(guideId);
  }, [guideId, initGuide]);

  // Initialize and sync with store
  useEffect(() => {
    // Update from the hydrated store
    setIsCompleted(isStepCompleted);

    // Set up subscription to store changes
    const unsubscribe = useGuideProgressStore.subscribe((state) => {
      const currentCompleted = state.isStepCompleted(guideId, stepId);
      setIsCompleted(currentCompleted);
    });

    return () => unsubscribe();
  }, [guideId, stepId, isStepCompleted]);

  const handleToggleCompletion = () => {
    toggleStepCompleted(guideId, stepId);

    // Track this event with Plausible analytics
    plausible('StepCompleted', {
      props: {
        guideId,
        stepId,
        stepTitle,
        status: !isCompleted ? 'completed' : 'uncompleted'
      }
    });
  };

  return (
    <div className={cn(
      'flex pt-2 items-center my-4 transition-colors',
      className
    )}>
      <Button
        onClick={handleToggleCompletion}
        variant={isCompleted ? "outline" : "default"}
        size="sm"
        className={cn(
          "transition-all",
          isCompleted
            ? "bg-white hover:bg-muted text-green-600 border-green-200 dark:bg-background dark:text-green-400 dark:border-green-800"
            : ""
        )}
      >
        {isCompleted ? (
          <>
            <CheckSquare className="mr-2 h-4 w-4" />
            {dict.guideProgress.stepCompletionButton.completed}
          </>
        ) : (
          <>
            <Square className="mr-2 h-4 w-4" />
            {dict.guideProgress.stepCompletionButton.markComplete}
          </>
        )}
      </Button>
    </div>
  );
}