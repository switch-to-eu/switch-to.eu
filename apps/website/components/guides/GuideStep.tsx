"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { StepCompletionButton } from "./guide-progress/step-completion-button";

interface StepProps {
  guideId: string;
  step: {
    title: string;
    id: string;
    complete?: boolean;
    video?: string | null;
    videoOrientation?: string | null;
  };
  stepNumber: number;
  /** Rendered rich-text content (passed from a server component). */
  content: ReactNode;
}

// Custom hook to determine if an element is visible in the viewport
const useVideoIntersection = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!targetRef.current) return;

    const currentTarget = targetRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;

        setIsIntersecting(entry.isIntersecting);

        // Play or pause video based on visibility
        if (videoRef.current) {
          if (entry.isIntersecting) {
            // Use a promise to handle play() since it returns a promise
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              playPromise.catch((error: Error) => {
                // Auto-play was prevented (e.g., browser policy)
                console.log("Auto-play was prevented:", error);
              });
            }
          } else {
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.2, ...options }
    ); // Trigger when 20% of element is visible

    observer.observe(currentTarget);

    return () => {
      observer.unobserve(currentTarget);
    };
  }, [options]);

  return { isIntersecting, targetRef, videoRef };
};

export function GuideStep({
  guideId,
  step,
  stepNumber,
  content,
}: StepProps) {
  const { targetRef, videoRef } = useVideoIntersection();
  const isLandscapeVideo = step.videoOrientation === "landscape";

  // Video URL comes directly from the media upload (Vercel Blob or local filesystem)

  // Render the step content
  const renderContent = () => (
    <>
      {/* Step title with number */}
      <h2 className="text-2xl font-bold mb-4 flex items-center text-brand-green">
        <span className="bg-brand-yellow text-brand-green w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold flex-shrink-0">
          {stepNumber}
        </span>
        {step.title}
      </h2>
      {/* Step content */}
      <div className="step-content prose max-w-none mb-6">{content}</div>

      {/* Completion button */}
      {step.complete && (
        <div className="mt-2 mb-4">
          <StepCompletionButton
            guideId={guideId}
            stepId={step.id}
            stepTitle={step.title}
          />
        </div>
      )}
    </>
  );

  // Render the video player
  const renderVideo = () => (
    <div ref={targetRef} className="step-video flex items-center justify-center">
      <video
        ref={videoRef}
        muted
        playsInline
        loop
        controls
        className="max-h-[600px] w-auto h-auto object-contain"
        src={step.video as string}
        title={`Video guide for ${step.title}`}
      />
    </div>
  );

  return (
    <div
      className="guide-step mb-6 rounded-2xl bg-brand-cream p-6 sm:p-8 shadow-sm"
      id={step.id}
    >
      {/* Responsive layout - adjust based on video orientation */}
      {step.video ? (
        isLandscapeVideo ? (
          // Landscape videos go below content in a single column
          <div className="flex flex-col gap-6">
            <div>{renderContent()}</div>
            <div>{renderVideo()}</div>
          </div>
        ) : (
          // Portrait videos use the original two-column layout
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:order-1">{renderContent()}</div>
            <div className="md:order-2">{renderVideo()}</div>
          </div>
        )
      ) : (
        renderContent()
      )}
    </div>
  );
}
