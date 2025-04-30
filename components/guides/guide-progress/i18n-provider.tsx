'use client';

import { ReactNode } from 'react';
import { CompletionMarkerReplacer } from './completion-marker-replacer';
import { GuideProgress } from './guide-progress';
import { Dictionary } from '@/lib/i18n/dictionaries';

interface I18nGuideProgressProviderProps {
  dict: Dictionary;
  children?: ReactNode;
}

// The wrapped CompletionMarkerReplacer component
export function CompletionMarkerReplacerWithI18n({
  dict,
  guideId
}: I18nGuideProgressProviderProps & { guideId: string }) {
  return <CompletionMarkerReplacer guideId={guideId} dict={dict} />;
}

// The wrapped GuideProgress component
export function GuideProgressWithI18n({
  dict,
  guideId,
  guideName,
  totalSteps,
  showCelebration,
  onComplete
}: I18nGuideProgressProviderProps & {
  guideId: string;
  guideName?: string;
  totalSteps: number;
  showCelebration?: boolean;
  onComplete?: () => void;
}) {
  return (
    <GuideProgress
      guideId={guideId}
      guideName={guideName}
      totalSteps={totalSteps}
      showCelebration={showCelebration}
      onComplete={onComplete}
      dict={dict}
    />
  );
}