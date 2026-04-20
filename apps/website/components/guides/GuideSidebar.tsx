import { StepsSummary } from './StepsSummary';
import type { GuideStepSummary } from '@/lib/types';

interface GuideSidebarProps {
  steps: GuideStepSummary[];
  className?: string;
  stepsToCompleteText?: string;
  guideId?: string;
}

export function GuideSidebar({
  steps,
  className,
  stepsToCompleteText = 'Steps to complete',
  guideId
}: GuideSidebarProps) {
  return (
    <div className={className}>
      <div className="overflow-hidden p-6 pt-0">
        {steps.length > 0 && (
          <div className="bg-brand-sky/20 rounded-3xl p-5 border border-brand-sky/30">
            <StepsSummary
              steps={steps}
              stepsToCompleteText={stepsToCompleteText}
              guideId={guideId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
