"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TimerPhase, PomodoroSettings, PHASE_EMOJIS } from '../lib/types';
import { formatTime as formatTimeUtil, getPhaseEmoji as getPhaseEmojiUtil } from '../lib/timer-utils';
import { useNotifications } from './use-notifications';
import type { TimerMessage, TickMessage } from './timer-worker';

interface TimerState {
  phase: TimerPhase;
  timeLeft: number;
  isRunning: boolean;
  completedPomodoros: number;
}

interface UsePomodoroTimerProps {
  settings: PomodoroSettings;
  onPomodoroComplete?: () => void;
  onPhaseChange?: (phase: TimerPhase) => void;
}

interface UsePomodoroTimerReturn {
  // Timer state
  phase: TimerPhase;
  timeLeft: number;
  isRunning: boolean;
  completedPomodoros: number;
  progress: number;

  // Timer controls
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;

  // Utility functions
  formatTime: (seconds: number) => string;
  getPhaseEmoji: (phase: TimerPhase) => string;
}

// Phase labels are now handled by translations in components

export const usePomodoroTimer = ({
  settings,
  onPomodoroComplete,
  onPhaseChange,
}: UsePomodoroTimerProps): UsePomodoroTimerReturn => {
  const [phase, setPhase] = useState<TimerPhase>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [shouldCompletePhase, setShouldCompletePhase] = useState(false);

  // Worker-based timer management instead of setInterval
  const workerRef = useRef<Worker | null>(null);
  const originalTitle = useRef<string>('');
  const { showNotification, playNotificationSound, requestPermission } = useNotifications();

  // Calculate timer durations from settings (memoized to prevent unnecessary effect reruns)
  const TIMER_DURATIONS = useMemo(() => ({
    work: settings.workDuration * 60,
    shortBreak: settings.shortBreakDuration * 60,
    longBreak: settings.longBreakDuration * 60,
  }), [settings.workDuration, settings.shortBreakDuration, settings.longBreakDuration]);

  // Store original page title
  useEffect(() => {
    originalTitle.current = document.title;
    return () => {
      document.title = originalTitle.current;
    };
  }, []);

  // Wrap imported utility in useCallback for stable reference
  const formatTime = useCallback((seconds: number): string => {
    return formatTimeUtil(seconds);
  }, []);

  // Update page title when timer is running
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const formattedTime = formatTime(timeLeft);
      const emoji = PHASE_EMOJIS[phase];
      // Simple phase labels for title (not translated)
      const simpleLabels = { work: 'Focus', shortBreak: 'Break', longBreak: 'Long Break' };
      const label = simpleLabels[phase];
      document.title = `${emoji} ${formattedTime} - ${label}`;
    } else {
      document.title = originalTitle.current;
    }
  }, [isRunning, timeLeft, phase, formatTime]);

  // We'll initialize the worker after handlePhaseComplete is defined

  const handlePhaseComplete = useCallback(async () => {
    setIsRunning(false);

    // Play sound notification if enabled
    if (settings.soundEnabled) {
      playNotificationSound();
    }

    if (phase === 'work') {
      // Work session completed
      const newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);

      // Call completion callback
      if (onPomodoroComplete) {
        onPomodoroComplete();
      }

      // Determine next phase (short break or long break)
      const isLongBreak = newCompletedPomodoros % settings.longBreakInterval === 0;
      const nextPhase: TimerPhase = isLongBreak ? 'longBreak' : 'shortBreak';

      setPhase(nextPhase);
      setTimeLeft(TIMER_DURATIONS[nextPhase]);

      // Notify about phase change
      if (onPhaseChange) {
        onPhaseChange(nextPhase);
      }

      // Show notification
      if (settings.desktopNotifications) {
        await showNotification({
          title: 'Pomodoro Complete! 🍅',
          body: `Time for a ${isLongBreak ? 'long' : 'short'} break.`,
          tag: 'pomodoro-complete',
        });
      }

      // Auto-start break if enabled
      if (settings.autoStartBreaks) {
        setTimeout(() => setIsRunning(true), 1000);
      }
    } else {
      // Break completed, back to work
      setPhase('work');
      setTimeLeft(TIMER_DURATIONS.work);

      // Notify about phase change
      if (onPhaseChange) {
        onPhaseChange('work');
      }

      // Show notification
      if (settings.desktopNotifications) {
        await showNotification({
          title: 'Break Complete! ⏰',
          body: 'Time to get back to work.',
          tag: 'break-complete',
        });
      }

      // Auto-start work if enabled
      if (settings.autoStartWork) {
        setTimeout(() => setIsRunning(true), 1000);
      }
    }
  }, [
    phase,
    completedPomodoros,
    settings,
    onPomodoroComplete,
    onPhaseChange,
    playNotificationSound,
    showNotification,
    TIMER_DURATIONS,
  ]);

  // Handle phase completion with current state (no stale closure issues)
  useEffect(() => {
    if (shouldCompletePhase) {
      setShouldCompletePhase(false); // Reset flag first
      handlePhaseComplete(); // Now called with current state/dependencies
    }
  }, [shouldCompletePhase, handlePhaseComplete]);

  // Initialize worker once on mount
  useEffect(() => {
    // Create worker instance
    workerRef.current = new Worker(new URL('./timer-worker.ts', import.meta.url));

    // Cleanup worker on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []); // Only create worker once on mount

  // Set up stable message handler (no dependencies to avoid stale closures)
  useEffect(() => {
    if (!workerRef.current) return;

    const handleWorkerMessage = (event: MessageEvent<TickMessage>) => {
      const { timeLeft: newTimeLeft, isComplete } = event.data;

      // Update time left directly from worker
      setTimeLeft(newTimeLeft);

      // Signal phase completion via state (avoids stale closure issues)
      if (isComplete) {
        setShouldCompletePhase(true);
      }
    };

    // Set the message handler once - no dependencies means no stale closures
    workerRef.current.onmessage = handleWorkerMessage;
  }, []); // Intentionally empty - handler is pure and uses only setState

  // Reset worker timer when phase changes (only when not running)
  useEffect(() => {
    if (!workerRef.current || isRunning) return;

    // Reset the timer with new phase duration (only when not running)
    const message: TimerMessage = {
      type: 'reset',
      duration: TIMER_DURATIONS[phase],
    };
    workerRef.current.postMessage(message);
    setTimeLeft(TIMER_DURATIONS[phase]);
  }, [phase, TIMER_DURATIONS]); // Removed isRunning from dependencies

  const start = useCallback(async () => {
    if (settings.desktopNotifications) {
      await requestPermission();
    }

    // First set the worker's duration to current timeLeft (for resume scenarios)
    if (workerRef.current) {
      const resetMessage: TimerMessage = {
        type: 'reset',
        duration: timeLeft,
      };
      workerRef.current.postMessage(resetMessage);

      // Small delay to ensure reset is processed before start
      setTimeout(() => {
        if (workerRef.current) {
          const startMessage: TimerMessage = { type: 'start' };
          workerRef.current.postMessage(startMessage);
        }
      }, 10);
    }

    setIsRunning(true);
  }, [settings.desktopNotifications, requestPermission, timeLeft]);

  const pause = useCallback(() => {
    // Send pause message to worker
    if (workerRef.current) {
      const message: TimerMessage = { type: 'pause' };
      workerRef.current.postMessage(message);
    }

    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    // Send reset message to worker with current phase duration
    if (workerRef.current) {
      const message: TimerMessage = {
        type: 'reset',
        duration: TIMER_DURATIONS[phase],
      };
      workerRef.current.postMessage(message);
    }

    setIsRunning(false);
    setTimeLeft(TIMER_DURATIONS[phase]);
  }, [TIMER_DURATIONS, phase]);

  const skip = useCallback(() => {
    // Send skip message to worker to force completion
    if (workerRef.current) {
      const message: TimerMessage = { type: 'skip' };
      workerRef.current.postMessage(message);
    }

    setIsRunning(false);
    // The worker will send a completion tick, triggering handlePhaseComplete
  }, []);

  // getPhaseLabel removed - now handled by translations in components

  const getPhaseEmoji = useCallback((currentPhase: TimerPhase): string => {
    return getPhaseEmojiUtil(currentPhase);
  }, []);

  // Calculate progress percentage
  const progress = ((TIMER_DURATIONS[phase] - timeLeft) / TIMER_DURATIONS[phase]) * 100;

  return {
    // Timer state
    phase,
    timeLeft,
    isRunning,
    completedPomodoros,
    progress,

    // Timer controls
    start,
    pause,
    reset,
    skip,

    // Utility functions
    formatTime,
    getPhaseEmoji,
  };
};