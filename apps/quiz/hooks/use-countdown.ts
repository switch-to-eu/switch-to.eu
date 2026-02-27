"use client";

import { useState, useEffect, useCallback } from "react";

interface UseCountdownOptions {
  startedAt: string;
  timerSeconds: number;
  enabled: boolean;
  onExpire?: () => void;
}

export function useCountdown({ startedAt, timerSeconds, enabled, onExpire }: UseCountdownOptions) {
  const noTimer = timerSeconds === 0;
  const [secondsLeft, setSecondsLeft] = useState(timerSeconds);
  const [isExpired, setIsExpired] = useState(false);

  const calculate = useCallback(() => {
    if (noTimer || !startedAt || !enabled) return timerSeconds;
    const elapsed = (Date.now() - new Date(startedAt).getTime()) / 1000;
    return Math.max(0, Math.ceil(timerSeconds - elapsed));
  }, [startedAt, timerSeconds, enabled, noTimer]);

  useEffect(() => {
    if (noTimer || !enabled || !startedAt) {
      setSecondsLeft(timerSeconds);
      setIsExpired(false);
      return;
    }

    const update = () => {
      const left = calculate();
      setSecondsLeft(left);
      if (left <= 0 && !isExpired) {
        setIsExpired(true);
        onExpire?.();
      }
    };

    update();
    const interval = setInterval(update, 200);
    return () => clearInterval(interval);
  }, [enabled, startedAt, timerSeconds, calculate, isExpired, onExpire, noTimer]);

  const progress = timerSeconds > 0 ? secondsLeft / timerSeconds : 0;

  return { secondsLeft, isExpired, progress, noTimer };
}
