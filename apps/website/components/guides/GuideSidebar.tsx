import { StepsSummary } from './StepsSummary';

interface Step {
  title: string;
  id: string;
}

interface GuideSidebarProps {
  steps: Step[];
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
          <div className="bg-brand-sage rounded-3xl p-5">
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
