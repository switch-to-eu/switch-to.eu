import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

let postMessageMock: ReturnType<typeof vi.fn>;
let messageHandler: (event: MessageEvent) => void;
let fakeNow: number;
let intervalCallbacks: Map<number, () => void>;
let nextIntervalId: number;

beforeEach(async () => {
  // Start at 1000ms so startTime is never 0 (the worker uses
  // `if (startTime === 0) return duration` as a "not running" guard)
  fakeNow = 1000;
  intervalCallbacks = new Map();
  nextIntervalId = 1;
  postMessageMock = vi.fn();

  // Mock self (worker global) before importing
  vi.stubGlobal("self", {
    postMessage: postMessageMock,
    addEventListener: vi.fn(
      (_event: string, handler: (event: MessageEvent) => void) => {
        messageHandler = handler;
      },
    ),
  });

  // Mock performance.now to return our controlled value
  vi.stubGlobal("performance", {
    now: () => fakeNow,
  });

  // Mock setInterval/clearInterval to manually control ticks
  vi.stubGlobal(
    "setInterval",
    vi.fn((callback: () => void, _ms: number) => {
      const id = nextIntervalId++;
      intervalCallbacks.set(id, callback);
      return id;
    }),
  );
  vi.stubGlobal(
    "clearInterval",
    vi.fn((id: number) => {
      intervalCallbacks.delete(id);
    }),
  );

  // Suppress console.log/warn in tests
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});

  // Fresh import each test (module has mutable state)
  vi.resetModules();
  await import("../../hooks/timer-worker");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function sendMessage(type: string, duration?: number) {
  messageHandler({
    data: { type, duration },
  } as MessageEvent);
}

// Fire all active interval callbacks (simulates one tick)
function fireIntervals() {
  for (const callback of intervalCallbacks.values()) {
    callback();
  }
}

describe("timer-worker", () => {
  describe("message handler dispatch", () => {
    it("handles start message", () => {
      sendMessage("reset", 300);
      postMessageMock.mockClear();

      sendMessage("start");
      expect(postMessageMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: "tick" }),
      );
    });

    it("handles pause message without crashing", () => {
      sendMessage("reset", 300);
      sendMessage("start");

      sendMessage("pause");
      expect(true).toBe(true);
    });

    it("handles reset message with duration", () => {
      sendMessage("reset", 600);

      expect(postMessageMock).toHaveBeenCalledWith({
        type: "tick",
        timeLeft: 600,
        isComplete: false,
      });
    });

    it("warns on reset without duration", () => {
      sendMessage("reset");
      expect(console.warn).toHaveBeenCalledWith(
        "[Worker] Reset message received without duration",
      );
    });

    it("warns on unknown message type", () => {
      sendMessage("unknown");
      expect(console.warn).toHaveBeenCalledWith(
        "Unknown timer message type:",
        "unknown",
      );
    });
  });

  describe("resetTimer", () => {
    it("posts a tick with full duration and isComplete=false", () => {
      sendMessage("reset", 1500);

      expect(postMessageMock).toHaveBeenCalledWith({
        type: "tick",
        timeLeft: 1500,
        isComplete: false,
      });
    });

    it("clears any running interval", () => {
      sendMessage("reset", 300);
      sendMessage("start");
      postMessageMock.mockClear();

      sendMessage("reset", 600);

      expect(postMessageMock).toHaveBeenCalledWith({
        type: "tick",
        timeLeft: 600,
        isComplete: false,
      });
    });
  });

  describe("startTimer", () => {
    it("posts an immediate tick", () => {
      sendMessage("reset", 300);
      postMessageMock.mockClear();

      sendMessage("start");

      expect(postMessageMock).toHaveBeenCalledWith({
        type: "tick",
        timeLeft: 300,
        isComplete: false,
      });
    });

    it("is idempotent when already running", () => {
      sendMessage("reset", 300);
      sendMessage("start");
      postMessageMock.mockClear();

      sendMessage("start");
      expect(postMessageMock).not.toHaveBeenCalled();
    });

    it("ticks every interval with reduced time", () => {
      sendMessage("reset", 300);
      sendMessage("start"); // startTime = fakeNow (1000)
      postMessageMock.mockClear();

      // Simulate 1 second passing
      fakeNow = 2000;
      fireIntervals();

      expect(postMessageMock).toHaveBeenCalledWith({
        type: "tick",
        timeLeft: 299,
        isComplete: false,
      });
    });
  });

  describe("tick / getTimeLeft calculation", () => {
    it("returns full duration immediately after start", () => {
      sendMessage("reset", 300);
      postMessageMock.mockClear();
      sendMessage("start");

      expect(postMessageMock).toHaveBeenCalledWith(
        expect.objectContaining({ timeLeft: 300 }),
      );
    });

    it("returns reduced time after elapsed seconds", () => {
      sendMessage("reset", 300);
      sendMessage("start"); // startTime = 1000
      postMessageMock.mockClear();

      fakeNow = 6000; // 5 seconds elapsed (6000 - 1000)
      fireIntervals();

      expect(postMessageMock).toHaveBeenCalledWith(
        expect.objectContaining({ timeLeft: 295 }),
      );
    });

    it("completes when timer reaches zero", () => {
      sendMessage("reset", 3);
      sendMessage("start"); // startTime = 1000
      postMessageMock.mockClear();

      fakeNow = 4000; // 3 seconds elapsed (4000 - 1000)
      fireIntervals();

      expect(postMessageMock).toHaveBeenCalledWith({
        type: "tick",
        timeLeft: 0,
        isComplete: true,
      });
    });

    it("never returns negative timeLeft", () => {
      sendMessage("reset", 2);
      sendMessage("start"); // startTime = 1000
      postMessageMock.mockClear();

      fakeNow = 20000; // way past duration
      fireIntervals();

      expect(postMessageMock).toHaveBeenCalledWith(
        expect.objectContaining({ timeLeft: 0 }),
      );
    });
  });

  describe("pauseTimer", () => {
    it("is idempotent when not running", () => {
      sendMessage("reset", 300);
      sendMessage("pause");
      expect(true).toBe(true);
    });

    it("preserves remaining duration for resume", () => {
      sendMessage("reset", 300);
      sendMessage("start"); // startTime = 1000

      // Simulate 100 seconds elapsed
      fakeNow = 101000; // 100s after startTime (1000)
      sendMessage("pause"); // saves duration = 200
      postMessageMock.mockClear();

      // Start again - should resume from 200s
      sendMessage("start");

      expect(postMessageMock).toHaveBeenCalledWith(
        expect.objectContaining({ timeLeft: 200, isComplete: false }),
      );
    });
  });

  describe("skipTimer", () => {
    it("posts timeLeft=0 and isComplete=true", () => {
      sendMessage("reset", 1500);
      sendMessage("start");
      postMessageMock.mockClear();

      sendMessage("skip");

      expect(postMessageMock).toHaveBeenCalledWith({
        type: "tick",
        timeLeft: 0,
        isComplete: true,
      });
    });

    it("clears any running interval so no more ticks fire", () => {
      sendMessage("reset", 300);
      sendMessage("start");
      sendMessage("skip");
      postMessageMock.mockClear();

      fakeNow = 5000;
      fireIntervals();

      expect(postMessageMock).not.toHaveBeenCalled();
    });
  });
});
