"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { Button } from '@switch-to-eu/ui/components/button';
import { cn } from '@switch-to-eu/ui/lib/utils';
import { usePomodoroTimer } from '../hooks/use-pomodoro-timer';
import { usePomodoroSettings } from '../hooks/use-pomodoro-settings';
import { SettingsDialog } from './settings-dialog';

interface PomodoroTimerProps {
  className?: string;
}

export function PomodoroTimer({
  className,
}: PomodoroTimerProps) {
  const t = useTranslations();
  const { settings } = usePomodoroSettings();

  const {
    phase,
    timeLeft,
    isRunning,
    completedPomodoros,
    start,
    pause,
    reset,
    formatTime,
  } = usePomodoroTimer({
    settings,
    onPomodoroComplete: () => {
    },
    onPhaseChange: (newPhase) => {
      console.log(`Phase changed to: ${newPhase}`);
    },
  });

  const getPhaseContainerClass = () => {
    switch (phase) {
      case 'work':
        return 'phase-work';
      case 'shortBreak':
        return 'phase-short-break';
      case 'longBreak':
        return 'phase-long-break';
      default:
        return 'phase-work';
    }
  };

  const getPhaseBadgeClass = () => {
    switch (phase) {
      case 'work':
        return 'bg-brand-navy/10 text-brand-navy';
      case 'shortBreak':
        return 'bg-brand-sage/10 text-brand-green';
      case 'longBreak':
        return 'bg-brand-sky/15 text-brand-navy';
      default:
        return 'bg-brand-navy/10 text-brand-navy';
    }
  };

  return (
    <div className={cn(
      "relative w-full rounded-3xl overflow-hidden transition-all duration-500 border-2 border-brand-navy",
      getPhaseContainerClass(),
      className
    )}>
      {/* Decorative shapes */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-brand-navy/8 animate-shape-float pointer-events-none"
        aria-hidden="true"
        style={{ animationDuration: '8s' }}
      />
      <div
        className="absolute -bottom-8 -left-8 w-32 h-32 bg-brand-sky/10 animate-shape-float pointer-events-none"
        aria-hidden="true"
        style={{
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          animationDuration: '9s',
          animationDelay: '-3s'
        }}
      />
      <div
        className="absolute top-1/3 -right-4 w-16 h-16 bg-brand-navy/5 rotate-45 animate-shape-float pointer-events-none"
        aria-hidden="true"
        style={{ animationDuration: '7s', animationDelay: '-1.5s' }}
      />

      <div className="relative z-10 px-6 sm:px-10 md:px-12 py-10 sm:py-14 flex flex-col items-center">

        {/* Settings button - top right */}
        <div className="absolute top-5 right-5">
          <SettingsDialog
            trigger={
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-brand-navy/30 hover:text-brand-navy/60 rounded-full transition-colors bg-transparent hover:bg-brand-navy/5"
              >
                <Settings className="h-4 w-4" />
              </Button>
            }
          />
        </div>

        {/* Phase label badge */}
        <div className="mb-4">
          <span className={cn(
            "inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium",
            getPhaseBadgeClass()
          )}>
            {t(`pomodoro.timer.phases.${phase}`)}
          </span>
        </div>

        {/* Pomodoro count */}
        <div className="text-brand-navy/50 text-sm mb-10">
          {completedPomodoros} {t('pomodoro.timer.pomodorosToday')}
        </div>

        {/* Main timer display */}
        <div className="text-brand-navy text-8xl md:text-9xl font-mono font-black tracking-tight leading-none mb-12 transition-colors duration-300">
          {formatTime(timeLeft)}
        </div>

        {/* Primary action button - large pill */}
        <div className="mb-6">
          <button
            onClick={isRunning ? pause : start}
            className={cn(
              "h-16 px-12 text-lg font-semibold rounded-full transition-all duration-200 hover:opacity-90 flex items-center gap-3",
              "bg-brand-yellow text-brand-navy"
            )}
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5" />
                {t('pomodoro.timer.pause')}
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                {t('pomodoro.timer.start')}
              </>
            )}
          </button>
        </div>

        {/* Reset - ghost pill */}
        <button
          onClick={reset}
          className="text-brand-navy/40 hover:text-brand-navy rounded-full px-6 py-2 text-sm flex items-center gap-2 transition-colors hover:bg-brand-navy/5"
        >
          <RotateCcw className="h-4 w-4" />
          {t('pomodoro.timer.reset')}
        </button>
      </div>
    </div>
  );
}
