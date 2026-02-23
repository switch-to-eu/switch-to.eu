import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  PomodoroSettingsProvider,
  usePomodoroSettings,
} from "../../hooks/use-pomodoro-settings";
import { DEFAULT_SETTINGS } from "../../lib/types";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <PomodoroSettingsProvider>{children}</PomodoroSettingsProvider>
);

function renderSettingsHook() {
  return renderHook(() => usePomodoroSettings(), { wrapper });
}

describe("usePomodoroSettings", () => {
  it("initializes with DEFAULT_SETTINGS when localStorage is empty", () => {
    const { result } = renderSettingsHook();

    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
  });

  it("loads saved settings from localStorage on mount", () => {
    const customSettings = { ...DEFAULT_SETTINGS, workDuration: 50 };
    localStorage.setItem(
      "keepfocus-pomodoro-settings",
      JSON.stringify(customSettings),
    );

    const { result } = renderSettingsHook();

    expect(result.current.settings.workDuration).toBe(50);
  });

  it("merges saved settings with DEFAULT_SETTINGS for missing keys", () => {
    // Simulate saved settings missing some keys (e.g., a newly added setting)
    const partialSettings = { workDuration: 30, shortBreakDuration: 10 };
    localStorage.setItem(
      "keepfocus-pomodoro-settings",
      JSON.stringify(partialSettings),
    );

    const { result } = renderSettingsHook();

    expect(result.current.settings.workDuration).toBe(30);
    expect(result.current.settings.shortBreakDuration).toBe(10);
    // Missing keys fall back to defaults
    expect(result.current.settings.longBreakDuration).toBe(
      DEFAULT_SETTINGS.longBreakDuration,
    );
    expect(result.current.settings.longBreakInterval).toBe(
      DEFAULT_SETTINGS.longBreakInterval,
    );
    expect(result.current.settings.autoStartBreaks).toBe(
      DEFAULT_SETTINGS.autoStartBreaks,
    );
  });

  it("updateSettings merges partial settings with current settings", () => {
    const { result } = renderSettingsHook();

    act(() => {
      result.current.updateSettings({ workDuration: 45 });
    });

    expect(result.current.settings.workDuration).toBe(45);
    // Other settings remain unchanged
    expect(result.current.settings.shortBreakDuration).toBe(
      DEFAULT_SETTINGS.shortBreakDuration,
    );
  });

  it("resetSettings restores DEFAULT_SETTINGS", () => {
    const { result } = renderSettingsHook();

    act(() => {
      result.current.updateSettings({
        workDuration: 99,
        shortBreakDuration: 99,
      });
    });

    act(() => {
      result.current.resetSettings();
    });

    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
  });

  it("persists settings to localStorage on change", () => {
    const { result } = renderSettingsHook();

    act(() => {
      result.current.updateSettings({ workDuration: 42 });
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "keepfocus-pomodoro-settings",
      expect.stringContaining('"workDuration":42'),
    );
  });

  it("handles corrupted localStorage JSON gracefully", () => {
    localStorage.setItem("keepfocus-pomodoro-settings", "{{broken json");

    const { result } = renderSettingsHook();

    // Should fall back to defaults
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS);
  });

  it("throws error when used outside PomodoroSettingsProvider", () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      renderHook(() => usePomodoroSettings());
    }).toThrow(
      "usePomodoroSettings must be used within a PomodoroSettingsProvider",
    );

    consoleSpy.mockRestore();
  });
});
