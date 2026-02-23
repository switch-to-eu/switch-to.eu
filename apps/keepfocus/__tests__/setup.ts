import "@testing-library/jest-dom/vitest";
import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Automatically cleanup after each test (unmounts rendered hooks/components)
afterEach(() => {
  cleanup();
});

// --- Global Mocks ---

// Mock localStorage with a working in-memory implementation
// We expose the store reset so afterEach can clear it without
// losing the default mock implementations.
let store: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key];
  }),
  clear: vi.fn(() => {
    store = {};
  }),
  get length() {
    return Object.keys(store).length;
  },
  key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// Reset localStorage store AND restore default mock implementations between tests.
// This is critical because individual tests may call `.mockImplementation()` on getItem,
// which persists across tests if we only call `vi.clearAllMocks()`.
afterEach(() => {
  store = {};
  localStorageMock.getItem.mockImplementation((key: string) => store[key] ?? null);
  localStorageMock.setItem.mockImplementation((key: string, value: string) => {
    store[key] = value;
  });
  localStorageMock.removeItem.mockImplementation((key: string) => {
    delete store[key];
  });
  localStorageMock.clear.mockImplementation(() => {
    store = {};
  });
  vi.clearAllMocks();
});

// Mock Notification API (configurable so tests can redefine it)
const MockNotification = vi.fn(function (
  this: { close: () => void; onclick: (() => void) | null },
) {
  this.close = vi.fn();
  this.onclick = null;
}) as unknown as typeof Notification;

Object.defineProperty(MockNotification, "permission", {
  value: "default" as NotificationPermission,
  writable: true,
  configurable: true,
});
Object.defineProperty(MockNotification, "requestPermission", {
  value: vi.fn().mockResolvedValue("granted"),
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, "Notification", {
  value: MockNotification,
  writable: true,
  configurable: true,
});

// Mock Audio API (must use function, not arrow, to support `new Audio()`)
const mockAudioPlay = vi.fn().mockResolvedValue(undefined);
globalThis.Audio = vi.fn(function (this: Record<string, unknown>) {
  this.play = mockAudioPlay;
  this.volume = 0.3;
}) as unknown as typeof Audio;
