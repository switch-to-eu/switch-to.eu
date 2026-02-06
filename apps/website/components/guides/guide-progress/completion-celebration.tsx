'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { usePlausible } from 'next-plausible';

type GuideCompletedEvent = {
  GuideCompleted: {
    guideId?: string;
    guideName?: string;
  };
};

interface CompletionCelebrationProps {
  onDismiss?: () => void;
  guideId?: string;
  guideName?: string;
  className?: string;
}

// Local storage key for tracking shown celebrations
const CELEBRATION_STORAGE_KEY = 'guide-celebrations-shown';

export function CompletionCelebration({
  onDismiss,
  guideId,
  guideName,
}: CompletionCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const plausible = usePlausible<GuideCompletedEvent>();

  useEffect(() => {
    // Check if celebration was already shown for this guide
    if (guideId && typeof window !== 'undefined') {
      try {
        const celebrationsShown = JSON.parse(localStorage.getItem(CELEBRATION_STORAGE_KEY) || '{}');
        if (celebrationsShown[guideId]) {
          // If already shown, dismiss immediately
          onDismiss?.();
          return;
        }
      } catch (e) {
        console.error('Error checking celebration history:', e);
      }
    }

    // Show celebration animation with a small delay
    const timer = setTimeout(() => {
      setIsVisible(true);

      // Trigger confetti effect
      triggerConfetti();

      // Track completion event if analytics is available and guide info provided
      if (guideId && guideName) {
        plausible('GuideCompleted', {
          props: {
            guideId,
            guideName
          }
        });

        // Mark this celebration as shown in localStorage
        try {
          const celebrationsShown = JSON.parse(localStorage.getItem(CELEBRATION_STORAGE_KEY) || '{}');
          celebrationsShown[guideId] = true;
          localStorage.setItem(CELEBRATION_STORAGE_KEY, JSON.stringify(celebrationsShown));
        } catch (e) {
          console.error('Error storing celebration history:', e);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [guideId, guideName, plausible, onDismiss]);

  function triggerConfetti() {
    // Use canvas-confetti for a celebratory effect
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

    // Launch multiple bursts of confetti
    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors: colors
      });

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }

  function handleDismiss() {
    setIsVisible(false);
    // Delay the onDismiss callback to allow exit animation to finish
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  }

  return (
    <div
      onClick={handleDismiss}
      className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Content */}

    </div>
  );
}