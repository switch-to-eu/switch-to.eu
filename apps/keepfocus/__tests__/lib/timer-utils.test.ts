import { describe, it, expect } from "vitest";
import {
  formatTime,
  getPhaseEmoji,
  calculateProgress,
  getTimerDurations,
} from "../../lib/timer-utils";

describe("formatTime", () => {
  it("formats 0 seconds as 00:00", () => {
    expect(formatTime(0)).toBe("00:00");
  });

  it("formats 60 seconds as 01:00", () => {
    expect(formatTime(60)).toBe("01:00");
  });

  it("formats 1500 seconds (25 min) as 25:00", () => {
    expect(formatTime(1500)).toBe("25:00");
  });

  it("formats 90 seconds as 01:30", () => {
    expect(formatTime(90)).toBe("01:30");
  });

  it("formats 599 seconds as 09:59", () => {
    expect(formatTime(599)).toBe("09:59");
  });

  it("formats 3599 seconds as 59:59", () => {
    expect(formatTime(3599)).toBe("59:59");
  });

  it("pads single digit minutes and seconds", () => {
    expect(formatTime(5)).toBe("00:05");
    expect(formatTime(65)).toBe("01:05");
  });
});

describe("getPhaseEmoji", () => {
  it('returns tomato emoji for "work"', () => {
    expect(getPhaseEmoji("work")).toBe("🍅");
  });

  it('returns coffee emoji for "shortBreak"', () => {
    expect(getPhaseEmoji("shortBreak")).toBe("☕");
  });

  it('returns plant emoji for "longBreak"', () => {
    expect(getPhaseEmoji("longBreak")).toBe("🌿");
  });
});

describe("calculateProgress", () => {
  it("returns 0 at the start (full time remaining)", () => {
    expect(calculateProgress(1500, 1500)).toBe(0);
  });

  it("returns 50 at the halfway point", () => {
    expect(calculateProgress(1500, 750)).toBe(50);
  });

  it("returns 100 at completion (no time remaining)", () => {
    expect(calculateProgress(1500, 0)).toBe(100);
  });

  it("handles 0 phase duration without dividing by zero", () => {
    expect(calculateProgress(0, 0)).toBe(0);
  });

  it("calculates fractional progress correctly", () => {
    expect(calculateProgress(100, 75)).toBe(25);
    expect(calculateProgress(100, 33)).toBeCloseTo(67);
  });
});

describe("getTimerDurations", () => {
  it("converts default settings from minutes to seconds", () => {
    const result = getTimerDurations({
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
    });
    expect(result).toEqual({
      work: 1500,
      shortBreak: 300,
      longBreak: 900,
    });
  });

  it("converts custom settings from minutes to seconds", () => {
    const result = getTimerDurations({
      workDuration: 50,
      shortBreakDuration: 10,
      longBreakDuration: 30,
    });
    expect(result).toEqual({
      work: 3000,
      shortBreak: 600,
      longBreak: 1800,
    });
  });

  it("handles 1-minute durations", () => {
    const result = getTimerDurations({
      workDuration: 1,
      shortBreakDuration: 1,
      longBreakDuration: 1,
    });
    expect(result).toEqual({
      work: 60,
      shortBreak: 60,
      longBreak: 60,
    });
  });
});
