"use client";

import React, { useState } from 'react';
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

  const getPhaseColor = () => {
    switch (phase) {
      case 'work':
        return 'text-tool-accent';
      case 'shortBreak':
        return 'text-success';
      case 'longBreak':
        return 'text-tool-primary';
      default:
        return 'text-foreground';
    }
  };

  const getPhaseBackground = () => {
    switch (phase) {
      case 'work':
        return 'bg-tool-accent/10';
      case 'shortBreak':
        return 'bg-success/10';
      case 'longBreak':
        return 'bg-tool-primary/10';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className={cn(
      "relative w-full rounded-3xl p-12 transition-all duration-500 shadow-xl",
      getPhaseBackground(),
      className
    )}>
      {/* Settings button - minimal and tucked away */}
      <div className="absolute top-6 right-6">
        <SettingsDialog
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-muted-foreground hover:text-foreground rounded-full opacity-60 hover:opacity-100 transition-opacity"
            >
              <Settings className="h-4 w-4" />
            </Button>
          }
        />
      </div>

      {/* Phase indicator */}
      <div className="text-center mb-12">
        <div className="text-xl font-semibold text-foreground mb-3">
          {t(`pomodoro.timer.phases.${phase}`)}
        </div>
        <div className="text-base text-muted-foreground">
          {completedPomodoros} {t('pomodoro.timer.pomodorosToday')}
        </div>
      </div>

      {/* Main timer display - prominent but not overwhelming */}
      <div className="text-center mb-16">
        <div className={cn(
          "text-7xl md:text-8xl font-mono font-black tracking-tight leading-none transition-colors duration-300",
          getPhaseColor()
        )}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Single primary action button */}
      <div className="flex justify-center mb-8">
        <Button
          onClick={isRunning ? pause : start}
          size="lg"
          className={cn(
            "h-20 w-40 text-xl font-bold rounded-3xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105",
            isRunning
              ? "bg-tool-accent hover:bg-tool-accent/90 text-tool-accent-foreground"
              : "bg-success hover:bg-success/90 text-white"
          )}
        >
          {isRunning ? (
            <>
              <Pause className="h-6 w-6 mr-3" />
              {t('pomodoro.timer.pause')}
            </>
          ) : (
            <>
              <Play className="h-6 w-6 mr-3" />
              {t('pomodoro.timer.start')}
            </>
          )}
        </Button>
      </div>

      {/* Secondary action - reset only, smaller and less prominent */}
      <div className="flex justify-center">
        <Button
          onClick={reset}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground rounded-full px-6 py-2 opacity-70 hover:opacity-100 transition-all"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {t('pomodoro.timer.reset')}
        </Button>
      </div>
    </div>
  );
}