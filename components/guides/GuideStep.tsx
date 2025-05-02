'use client';

import { marked } from 'marked';
import { useEffect, useState } from 'react';
import { useGuideProgress } from '@/hooks/useGuideProgress';

interface StepProps {
  guideId: string;
  step: {
    title: string;
    id: string;
    complete?: boolean;
    video?: string;
    content: string;
  };
  stepNumber: number;
  category: string;
  slug: string;
}

export function GuideStep({ guideId, step, stepNumber, category, slug }: StepProps) {
  const { isStepCompleted, markStepCompleted } = useGuideProgress(guideId);
  const [completed, setCompleted] = useState(false);

  // Process the step content with marked to convert markdown to HTML
  const processedContent = marked.parse(step.content);

  // Check if this step is completed on initial render and when completion status changes
  useEffect(() => {
    const checkCompletion = async () => {
      const isCompleted = await isStepCompleted(step.id);
      setCompleted(isCompleted);
    };

    checkCompletion();
  }, [isStepCompleted, step.id]);

  // Handle step completion
  const handleMarkComplete = async () => {
    await markStepCompleted(step.id, step.title);
    setCompleted(true);
  };

  // Format video URL to use the API route with full path
  const getVideoUrl = (videoPath: string) => {
    if (!videoPath) return '';

    // If it's already an absolute URL, return as is
    if (videoPath.startsWith('http')) {
      return videoPath;
    }

    // If the video path already includes the guide path, use it as is
    if (videoPath.includes(`guides/${category}/${slug}`)) {
      return `/api/content/${videoPath}`;
    }

    // Otherwise, construct the full path including the guide location
    return `/api/content/nl/guides/${category}/${slug}/${videoPath}`;
  };

  // Render the step content
  const renderContent = () => (
    <>
      {/* Step title with number */}
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">
          {stepNumber}
        </span>
        {step.title}
      </h2>
      {/* Step content */}
      <div
        className="step-content prose dark:prose-invert max-w-none mb-6"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />

      {/* Completion button */}
      {step.complete && (
        <div className="mt-2 mb-4">
          <button
            onClick={handleMarkComplete}
            disabled={completed}
            className={`px-4 py-2 rounded-md transition-colors flex items-center ${completed
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              }`}
          >
            {completed ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Completed
              </>
            ) : (
              "Mark as Completed"
            )}
          </button>
        </div>
      )}
    </>
  );

  // Render the video player
  const renderVideo = () => (
    <div className="step-video h-full flex items-center">
      <video
        controls
        className="w-full"
        src={getVideoUrl(step.video as string)}
        title={`Video guide for ${step.title}`}
      />
    </div>
  );

  return (
    <div className="guide-step mb-10 pb-6 border-b border-gray-200 dark:border-gray-700" id={step.id}>


      {/* Responsive layout - two columns with video if available, otherwise single column */}
      {step.video ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:order-1">
            {renderContent()}
          </div>
          <div className="md:order-2">
            {renderVideo()}
          </div>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
}