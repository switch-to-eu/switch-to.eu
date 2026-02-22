// Timer Web Worker for accurate background timing
// This worker runs independently of the main thread to ensure consistent timing
// even when the browser tab becomes inactive or the main thread is busy.

console.log("[Worker] Timer worker started and ready");

interface TimerMessage {
  type: "start" | "pause" | "reset" | "skip";
  duration?: number; // Duration in seconds for reset operation
}

interface TickMessage {
  type: "tick";
  timeLeft: number; // Time remaining in seconds
  isComplete: boolean; // Whether the timer has reached its duration
}

// Simplified worker state
let startTime = 0; // When current session started (performance.now())
let duration = 0; // Total duration of current timer in seconds
let intervalId: ReturnType<typeof setInterval> | null = null;

// Simple timing calculation - like the minimal timer
function getTimeLeft(): number {
  if (startTime === 0) return duration;

  const now = performance.now();
  const elapsed = Math.floor((now - startTime) / 1000);
  const timeLeft = Math.max(0, duration - elapsed);

  return timeLeft;
}

function tick(): void {
  const timeLeft = getTimeLeft();
  const isComplete = timeLeft <= 0;

  // Post tick message to main thread with timeLeft (like minimal timer)
  const message: TickMessage = {
    type: "tick",
    timeLeft,
    isComplete,
  };

  self.postMessage(message);

  // Stop the timer if completed
  if (isComplete && intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
    startTime = 0; // Reset for next use
  }
}

function startTimer(): void {
  console.log(`[Worker] startTimer called - duration: ${duration}`);

  if (intervalId !== null) {
    console.log(`[Worker] Timer already running, skipping start`);
    return;
  }

  // Fresh start with current remaining time (duration is already set)
  startTime = performance.now();
  console.log(`[Worker] Starting timer - duration: ${duration}s`);

  // Start the tick interval - using 1000ms like minimal timer
  intervalId = setInterval(tick, 1000);
  console.log(`[Worker] Started interval with ID: ${intervalId}`);

  // Send immediate tick to sync state
  tick();
}

function pauseTimer(): void {
  console.log(`[Worker] pauseTimer called`);

  if (intervalId === null) {
    console.log(`[Worker] Timer not running, skipping pause`);
    return;
  }

  // Get current time left and save it as the new duration for resume
  duration = getTimeLeft();
  console.log(`[Worker] Paused with ${duration}s remaining`);

  // Stop the interval
  clearInterval(intervalId);
  intervalId = null;
  startTime = 0; // Reset startTime for next resume

  console.log(`[Worker] Timer paused`);
}

function resetTimer(newDuration: number): void {
  console.log(`[Worker] resetTimer called - newDuration: ${newDuration}`);

  // Stop any running timer
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
    console.log(`[Worker] Cleared existing interval during reset`);
  }

  // Reset timing state with new duration
  startTime = 0;
  duration = newDuration;

  console.log(`[Worker] Reset complete - duration: ${duration}s`);

  // Send immediate tick with reset state
  const message: TickMessage = {
    type: "tick",
    timeLeft: duration,
    isComplete: false,
  };
  self.postMessage(message);
  console.log(`[Worker] Sent reset tick message:`, message);
}

function skipTimer(): void {
  console.log(`[Worker] skipTimer called`);

  // Stop any running timer
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  // Send completion tick with timeLeft = 0
  const message: TickMessage = {
    type: "tick",
    timeLeft: 0,
    isComplete: true,
  };
  self.postMessage(message);
  console.log(`[Worker] Sent skip completion message`);
}

// Listen for messages from main thread
self.addEventListener("message", (event: MessageEvent<TimerMessage>) => {
  const { type, duration } = event.data;

  console.log(`[Worker] Received message:`, { type, duration });

  switch (type) {
    case "start":
      startTimer();
      break;

    case "pause":
      pauseTimer();
      break;

    case "reset":
      if (duration !== undefined) {
        resetTimer(duration);
      } else {
        console.warn("[Worker] Reset message received without duration");
      }
      break;

    case "skip":
      skipTimer();
      break;

    default:
      console.warn("Unknown timer message type:", type);
  }
});

// Export types for use in main thread
export type { TimerMessage, TickMessage };
