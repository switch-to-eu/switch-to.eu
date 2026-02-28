'use client';

import { useState, useEffect } from 'react';
import { Square, CheckSquare } from 'lucide-react';
import { cn } from '@switch-to-eu/ui/lib/utils';
import { useGuideProgressStore, useHydratedGuideProgressStore } from '@/lib/store/guide-progress';
import { Button } from '@switch-to-eu/ui/components/button';
import { usePlausible } from 'next-plausible';
import { useTranslations } from 'next-intl';

interface StepCompletionButtonProps {
  guideId: string;
  stepId: string;
  stepTitle?: string;
  className?: string;
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
}: StepCompletionButtonProps) {
  // Use the regular store for methods
  const { toggleStepCompleted, initGuide } = useGuideProgressStore();
  const t = useTranslations('guideProgress.stepCompletionButton');

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
          "transition-all rounded-full font-semibold",
          isCompleted
            ? "bg-brand-sage/30 hover:bg-brand-sage/50 text-brand-green border-brand-sage"
            : "bg-brand-green hover:bg-brand-green/90 text-white"
        )}
      >
        {isCompleted ? (
          <>
            <CheckSquare className="mr-2 h-4 w-4" />
            {t('completed')}
          </>
        ) : (
          <>
            <Square className="mr-2 h-4 w-4" />
            {t('markComplete')}
          </>
        )}
      </Button>
    </div>
  );
}