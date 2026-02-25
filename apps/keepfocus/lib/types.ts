// Pomodoro Task Types
export interface Task {
    id: string;
    description: string;
    completed: boolean;
    createdAt: Date;
    pomodoros: number;
}

// Pomodoro Settings Types
export interface PomodoroSettings {
    workDuration: number; // in minutes
    shortBreakDuration: number; // in minutes
    longBreakDuration: number; // in minutes
    longBreakInterval: number; // after how many work sessions
    autoStartBreaks: boolean;
    autoStartWork: boolean;
    soundEnabled: boolean;
    desktopNotifications: boolean;
}

export const DEFAULT_SETTINGS: PomodoroSettings = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartWork: false,
    soundEnabled: true,
    desktopNotifications: true,
};

// Timer Types
export type TimerPhase = 'work' | 'shortBreak' | 'longBreak';

export interface TimerState {
    phase: TimerPhase;
    timeLeft: number;
    isRunning: boolean;
    completedPomodoros: number;
}

export const PHASE_LABELS: Record<TimerPhase, string> = {
    work: 'Focus Time',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
};

export const PHASE_EMOJIS: Record<TimerPhase, string> = {
    work: '🍅',
    shortBreak: '☕',
    longBreak: '🌿',
};

export const PHASE_COLORS: Record<TimerPhase, string> = {
    work: 'bg-blue-500',
    shortBreak: 'bg-green-500',
    longBreak: 'bg-purple-500',
};