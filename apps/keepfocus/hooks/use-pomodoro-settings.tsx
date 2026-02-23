"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PomodoroSettings, DEFAULT_SETTINGS } from '../lib/types';

interface SettingsContextType {
  settings: PomodoroSettings;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
  resetSettings: () => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'keepfocus-pomodoro-settings';

export const PomodoroSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<PomodoroSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          // Merge with defaults to handle missing properties in saved settings
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch (error) {
        console.error('Failed to parse saved pomodoro settings:', error);
        // On error, use defaults
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save pomodoro settings:', error);
      }
    }
  }, [settings, isLoading]);

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const usePomodoroSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('usePomodoroSettings must be used within a PomodoroSettingsProvider');
  }
  return context;
};