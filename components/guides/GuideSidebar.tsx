import { StepsSummary } from './StepsSummary';

interface Step {
  title: string;
  id: string;
}

interface GuideSidebarProps {
  steps: Step[];
  className?: string;
  stepsToCompleteText?: string;
}

export function GuideSidebar({
  steps,
  className,
  stepsToCompleteText = 'Steps to complete'
}: GuideSidebarProps) {
  // Helper function to create section navigation links


  return (
    <div className={className}>
      <div className="overflow-hidden p-6">

        {steps.length > 0 && (
          <div className="bg-[var(--pop-3)] rounded-lg p-4">
            <StepsSummary
              steps={steps}
              stepsToCompleteText={stepsToCompleteText}
            />
          </div>
        )}
      </div>
    </div>
  );
}