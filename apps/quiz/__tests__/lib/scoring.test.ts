import { describe, it, expect } from "vitest";
import { calculateScore, isLateAnswer } from "@/lib/scoring";

describe("calculateScore", () => {
  it("awards 1000 points for first correct answer", () => {
    expect(calculateScore(true, 1)).toBe(1000);
  });

  it("awards 975 points for second correct answer", () => {
    expect(calculateScore(true, 2)).toBe(975);
  });

  it("awards 950 points for third correct answer", () => {
    expect(calculateScore(true, 3)).toBe(950);
  });

  it("decreases by 25 points per position", () => {
    expect(calculateScore(true, 10)).toBe(1000 - 9 * 25);
  });

  it("has a floor of 100 points for correct answers", () => {
    expect(calculateScore(true, 50)).toBe(100);
    expect(calculateScore(true, 100)).toBe(100);
  });

  it("awards 0 points for wrong answers", () => {
    expect(calculateScore(false, 1)).toBe(0);
    expect(calculateScore(false, 5)).toBe(0);
  });
});

describe("isLateAnswer", () => {
  it("returns false when answer is within timer", () => {
    const started = "2025-01-01T12:00:00.000Z";
    const answered = "2025-01-01T12:00:15.000Z"; // 15s later
    expect(isLateAnswer(answered, started, 20)).toBe(false);
  });

  it("returns true when answer is after timer", () => {
    const started = "2025-01-01T12:00:00.000Z";
    const answered = "2025-01-01T12:00:25.000Z"; // 25s later
    expect(isLateAnswer(answered, started, 20)).toBe(true);
  });

  it("returns false when answer is exactly at deadline", () => {
    const started = "2025-01-01T12:00:00.000Z";
    const answered = "2025-01-01T12:00:20.000Z"; // exactly 20s
    expect(isLateAnswer(answered, started, 20)).toBe(false);
  });

  it("returns false when timer is disabled (timerSeconds=0)", () => {
    const started = "2025-01-01T12:00:00.000Z";
    const answered = "2025-01-01T13:00:00.000Z"; // 1 hour later
    expect(isLateAnswer(answered, started, 0)).toBe(false);
  });
});
