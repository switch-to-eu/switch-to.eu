import { StepsSummary } from './StepsSummary';


interface Step {
  title: string;
  id: string;
}

interface GuideSidebarProps {
  missingFeatures: string[];
  steps: Step[];
  className?: string;
}

export function GuideSidebar({
  steps,
  className
}: GuideSidebarProps) {
  return (
    <div className={className}>
      <div className="border rounded-lg bg-[var(--pop-3)] dark:bg-gray-800 overflow-hidden p-6">


        {steps.length > 0 && (
          <div>
            <StepsSummary steps={steps} />
          </div>
        )}
      </div>
    </div>
  );
}