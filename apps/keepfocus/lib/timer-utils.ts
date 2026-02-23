import { TimerPhase, PHASE_EMOJIS } from "./types";

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function getPhaseEmoji(phase: TimerPhase): string {
  return PHASE_EMOJIS[phase];
}

export function calculateProgress(
  phaseDuration: number,
  timeLeft: number,
): number {
  if (phaseDuration === 0) return 0;
  return ((phaseDuration - timeLeft) / phaseDuration) * 100;
}

export function getTimerDurations(settings: {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
}) {
  return {
    work: settings.workDuration * 60,
    shortBreak: settings.shortBreakDuration * 60,
    longBreak: settings.longBreakDuration * 60,
  };
}
