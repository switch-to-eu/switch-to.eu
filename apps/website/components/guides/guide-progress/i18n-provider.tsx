'use client';

import { CompletionMarkerReplacer } from './completion-marker-replacer';
import { GuideProgress } from './guide-progress';

// The wrapped CompletionMarkerReplacer component
export function CompletionMarkerReplacerWithI18n({
  guideId
}: { guideId: string }) {
  return <CompletionMarkerReplacer guideId={guideId} />;
}

// The wrapped GuideProgress component
export function GuideProgressWithI18n({
  guideId,
  guideName,
  totalSteps,
  showCelebration,
  onComplete
}: {
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
    />
  );
}