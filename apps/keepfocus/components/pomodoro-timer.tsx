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
        return 'text-red-500';
      case 'shortBreak':
        return 'text-green-500';
      case 'longBreak':
        return 'text-blue-500';
      default:
        return 'text-gray-900';
    }
  };

  const getPhaseBackground = () => {
    switch (phase) {
      case 'work':
        return 'bg-red-50';
      case 'shortBreak':
        return 'bg-green-50';
      case 'longBreak':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
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
              className="h-10 w-10 p-0 text-gray-400 hover:text-gray-600 rounded-full opacity-60 hover:opacity-100 transition-opacity"
            >
              <Settings className="h-4 w-4" />
            </Button>
          }
        />
      </div>

      {/* Phase indicator */}
      <div className="text-center mb-12">
        <div className="text-xl font-semibold text-gray-700 mb-3">
          {t(`pomodoro.timer.phases.${phase}`)}
        </div>
        <div className="text-base text-gray-500">
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
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
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
          className="text-gray-400 hover:text-gray-600 rounded-full px-6 py-2 opacity-70 hover:opacity-100 transition-all"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {t('pomodoro.timer.reset')}
        </Button>
      </div>
    </div>
  );
}