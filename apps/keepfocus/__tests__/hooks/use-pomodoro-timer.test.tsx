import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { DEFAULT_SETTINGS } from "../../lib/types";

// Mock Worker constructor
let mockWorkerPostMessage: ReturnType<typeof vi.fn>;
let mockWorkerTerminate: ReturnType<typeof vi.fn>;
let workerOnMessage: ((event: MessageEvent) => void) | null = null;

beforeEach(() => {
  vi.useFakeTimers();

  mockWorkerPostMessage = vi.fn();
  mockWorkerTerminate = vi.fn();
  workerOnMessage = null;

  // Must use function (not arrow) so it can be called with `new`
  const MockWorker = vi.fn(function (this: Record<string, unknown>) {
    this.postMessage = mockWorkerPostMessage;
    this.terminate = mockWorkerTerminate;
    Object.defineProperty(this, "onmessage", {
      get() {
        return workerOnMessage;
      },
      set(handler: (event: MessageEvent) => void) {
        workerOnMessage = handler;
      },
      configurable: true,
    });
  });

  vi.stubGlobal("Worker", MockWorker);

  // Ensure Notification mock has "granted" permission for these tests
  Object.defineProperty(Notification, "permission", {
    value: "granted",
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// Helper to simulate a worker tick
function simulateWorkerTick(timeLeft: number, isComplete: boolean) {
  act(() => {
    workerOnMessage?.({
      data: { type: "tick", timeLeft, isComplete },
    } as MessageEvent);
  });
}

// Dynamic import to pick up mocks
async function importHook() {
  const mod = await import("../../hooks/use-pomodoro-timer");
  return mod.usePomodoroTimer;
}

describe("usePomodoroTimer", () => {
  describe("initialization", () => {
    it("initializes with work phase and correct timeLeft", async () => {
      const usePomodoroTimer = await importHook();
      const { result } = renderHook(() =>
        usePomodoroTimer({ settings: DEFAULT_SETTINGS }),
      );

      expect(result.current.phase).toBe("work");
      expect(result.current.timeLeft).toBe(DEFAULT_SETTINGS.workDuration * 60);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.completedPomodoros).toBe(0);
    });

    it("creates a Worker on mount", async () => {
      const usePomodoroTimer = await importHook();
      renderHook(() => usePomodoroTimer({ settings: DEFAULT_SETTINGS }));

      expect(Worker).toHaveBeenCalled();
    });
  });

  describe("formatTime", () => {
    it("formats seconds correctly", async () => {
      const usePomodoroTimer = await importHook();
      const { result } = renderHook(() =>
        usePomodoroTimer({ settings: DEFAULT_SETTINGS }),
      );

      expect(result.current.formatTime(0)).toBe("00:00");
      expect(result.current.formatTime(90)).toBe("01:30");
      expect(result.current.formatTime(1500)).toBe("25:00");
    });
  });

  describe("getPhaseEmoji", () => {
    it("returns correct emoji for each phase", async () => {
      const usePomodoroTimer = await importHook();
      const { result } = renderHook(() =>
        usePomodoroTimer({ settings: DEFAULT_SETTINGS }),
      );

      expect(result.current.getPhaseEmoji("work")).toBe("🍅");
      expect(result.current.getPhaseEmoji("shortBreak")).toBe("☕");
      expect(result.current.getPhaseEmoji("longBreak")).toBe("🌿");
    });
  });

  describe("controls", () => {
    it("start() posts reset then start messages to worker", async () => {
      const usePomodoroTimer = await importHook();
      const { result } = renderHook(() =>
        usePomodoroTimer({
          settings: { ...DEFAULT_SETTINGS, desktopNotifications: false },
        }),
      );

      await act(async () => {
        result.current.start();
      });

      // Should post a reset message with current timeLeft
      expect(mockWorkerPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: "reset", duration: 1500 }),
      );

      expect(result.current.isRunning).toBe(true);

      // After small delay, should post start message
      act(() => {
        vi.advanceTimersByTime(10);
      });

      expect(mockWorkerPostMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: "start" }),
      );
    });

    it("pause() posts pause message and sets isRunning to false", async () => {
      const usePomodoroTimer = await importHook();
      const { result } = renderHook(() =>
        usePomodoroTimer({
          settings: { ...DEFAULT_SETTINGS, desktopNotifications: false },
        }),
      );

      await act(async () => {
        result.current.start();
      });
      mockWorkerPostMessage.mockClear();

      act(() => {
        result.current.pause();
      });

      expect(mockWorkerPostMessage).toHaveBeenCalledWith({ type: "pause" });
      expect(result.current.isRunning).toBe(false);
    });

    it("reset() posts reset message and resets timeLeft", async () => {
      const usePomodoroTimer = await importHook();
      const { result } = renderHook(() =>
        usePomodoroTimer({ settings: DEFAULT_SETTINGS }),
      );

      // Simulate some time passing
      simulateWorkerTick(1200, false);

      mockWorkerPostMessage.mockClear();

      act(() => {
        result.current.reset();
      });

      expect(mockWorkerPostMessage).toHaveBeenCalledWith({
        type: "reset",
        duration: 1500,
      });
      expect(result.current.isRunning).toBe(false);
      expect(result.current.timeLeft).toBe(1500);
    });

    it("skip() posts skip message to worker", async () => {
      const usePomodoroTimer = await importHook();
      const { result } = renderHook(() =>
        usePomodoroTimer({ settings: DEFAULT_SETTINGS }),
      );

      mockWorkerPostMessage.mockClear();

      act(() => {
        result.current.skip();
      });

      expect(mockWorkerPostMessage).toHaveBeenCalledWith({ type: "skip" });
      expect(result.current.isRunning).toBe(false);
    });
  });

  describe("phase transitions", () => {
    it("transitions from work to shortBreak after work completes", async () => {
      const onPhaseChange = vi.fn();
      const usePomodoroTimer = await importHook();
      const { result } = renderHook(() =>
        usePomodoroTimer({
          settings: {
            ...DEFAULT_SETTINGS,
            soundEnabled: false,
            desktopNotifications: false,
          },
          onPhaseChange,
        }),
      );

      // Simulate work completion
      simulateWorkerTick(0, true);

      // Need to wait for the shouldCompletePhase effect
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.phase).toBe("shortBreak");
      expect(result.current.completedPomodoros).toBe(1);
      expect(onPhaseChange).toHaveBeenCalledWith("shortBreak");
    });

    it("transitions from work to longBreak after longBreakInterval sessions", async () => {
      const settings = {
        ...DEFAULT_SETTINGS,
        longBreakInterval: 2,
        soundEnabled: false,
        desktopNotifications: false,
      };

      const usePomodoroTimer = await importHook();
      const { result } = renderHook(() =>
        usePomodoroTimer({ settings }),
      );

      // Complete first work session -> shortBreak
      simulateWorkerTick(0, true);
      await act(async () => {
        await vi.runAllTimersAsync();
      });
      expect(result.current.phase).toBe("shortBreak");

      // Complete short break -> work
      simulateWorkerTick(0, true);
      await act(async () => {
        await vi.runAllTimersAsync();
      });
      expect(result.current.phase).toBe("work");

      // Complete second work session -> longBreak (2 completed % 2 === 0)
      simulateWorkerTick(0, true);
      await act(async () => {
        await vi.runAllTimersAsync();
      });
      expect(result.current.phase).toBe("longBreak");
      expect(result.current.completedPomodoros).toBe(2);
    });

    it("transitions from shortBreak back to work", async () => {
      const usePomodoroTimer = await importHook();
      const { result } = renderHook(() =>
        usePomodoroTimer({
          settings: {
            ...DEFAULT_SETTINGS,
            soundEnabled: false,
            desktopNotifications: false,
          },
        }),
      );

      // work -> shortBreak
      simulateWorkerTick(0, true);
      await act(async () => {
        await vi.runAllTimersAsync();
      });
      expect(result.current.phase).toBe("shortBreak");

      // shortBreak -> work
      simulateWorkerTick(0, true);
      await act(async () => {
        await vi.runAllTimersAsync();
      });
      expect(result.current.phase).toBe("work");
    });

    it("calls onPomodoroComplete callback when work phase ends", async () => {
      const onPomodoroComplete = vi.fn();
      const usePomodoroTimer = await importHook();
      renderHook(() =>
        usePomodoroTimer({
          settings: {
            ...DEFAULT_SETTINGS,
            soundEnabled: false,
            desktopNotifications: false,
          },
          onPomodoroComplete,
        }),
      );

      simulateWorkerTick(0, true);
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(onPomodoroComplete).toHaveBeenCalledTimes(1);
    });

    it("does not call onPomodoroComplete when break phase ends", async () => {
      const onPomodoroComplete = vi.fn();
      const usePomodoroTimer = await importHook();
      renderHook(() =>
        usePomodoroTimer({
          settings: {
            ...DEFAULT_SETTINGS,
            soundEnabled: false,
            desktopNotifications: false,
          },
          onPomodoroComplete,
        }),
      );

      // Complete work -> break
      simulateWorkerTick(0, true);
      await act(async () => {
        await vi.runAllTimersAsync();
      });
      onPomodoroComplete.mockClear();

      // Complete break -> work
      simulateWorkerTick(0, true);
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(onPomodoroComplete).not.toHaveBeenCalled();
    });
  });

  describe("progress", () => {
    it("returns 0 at start", async () => {
      const usePomodoroTimer = await importHook();
      const { result } = renderHook(() =>
        usePomodoroTimer({ settings: DEFAULT_SETTINGS }),
      );

      expect(result.current.progress).toBe(0);
    });

    it("returns 50 at halfway point", async () => {
      const usePomodoroTimer = await importHook();
      const { result } = renderHook(() =>
        usePomodoroTimer({ settings: DEFAULT_SETTINGS }),
      );

      // 25 min = 1500s, halfway = 750
      simulateWorkerTick(750, false);

      expect(result.current.progress).toBe(50);
    });
  });

  describe("timeLeft updates from worker", () => {
    it("updates timeLeft when worker sends tick", async () => {
      const usePomodoroTimer = await importHook();
      const { result } = renderHook(() =>
        usePomodoroTimer({ settings: DEFAULT_SETTINGS }),
      );

      simulateWorkerTick(1200, false);

      expect(result.current.timeLeft).toBe(1200);
    });
  });
});
