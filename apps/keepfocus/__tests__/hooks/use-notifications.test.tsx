import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNotifications } from "../../hooks/use-notifications";

describe("useNotifications", () => {
  beforeEach(() => {
    // Reset Notification permission to default before each test
    // The Notification mock is set up in setup.ts with configurable: true
    Object.defineProperty(Notification, "permission", {
      value: "default",
      writable: true,
      configurable: true,
    });
    (Notification.requestPermission as ReturnType<typeof vi.fn>).mockResolvedValue("granted");
  });

  describe("browser support detection", () => {
    it("detects notification support when Notification is available", () => {
      const { result } = renderHook(() => useNotifications());
      expect(result.current.isSupported).toBe(true);
    });

    it("detects no support when Notification is missing", () => {
      const original = window.Notification;
      // @ts-expect-error - intentionally removing for test
      delete (window as Record<string, unknown>).Notification;

      const { result } = renderHook(() => useNotifications());
      expect(result.current.isSupported).toBe(false);

      // Restore
      Object.defineProperty(window, "Notification", {
        value: original,
        writable: true,
        configurable: true,
      });
    });
  });

  describe("requestPermission", () => {
    it("calls Notification.requestPermission when supported", async () => {
      const { result } = renderHook(() => useNotifications());

      let permission: NotificationPermission = "default";
      await act(async () => {
        permission = await result.current.requestPermission();
      });

      expect(Notification.requestPermission).toHaveBeenCalled();
      expect(permission).toBe("granted");
    });

    it("returns denied when notifications not supported", async () => {
      const original = window.Notification;
      // @ts-expect-error - intentionally removing for test
      delete (window as Record<string, unknown>).Notification;

      const { result } = renderHook(() => useNotifications());

      let permission: NotificationPermission = "default";
      await act(async () => {
        permission = await result.current.requestPermission();
      });

      expect(permission).toBe("denied");

      Object.defineProperty(window, "Notification", {
        value: original,
        writable: true,
        configurable: true,
      });
    });
  });

  describe("showNotification", () => {
    it("creates a Notification when permission is granted", async () => {
      Object.defineProperty(Notification, "permission", {
        value: "granted",
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useNotifications());

      // Wait for the useEffect that reads permission
      await act(async () => {});

      const constructorMock =
        Notification as unknown as ReturnType<typeof vi.fn>;
      constructorMock.mockClear();

      await act(async () => {
        await result.current.showNotification({
          title: "Test",
          body: "Test body",
        });
      });

      expect(constructorMock).toHaveBeenCalledWith(
        "Test",
        expect.objectContaining({
          body: "Test body",
        }),
      );
    });

    it("does nothing when permission is not granted", async () => {
      // Permission is "default" (not granted)
      const { result } = renderHook(() => useNotifications());

      const constructorMock =
        Notification as unknown as ReturnType<typeof vi.fn>;
      constructorMock.mockClear();

      await act(async () => {
        await result.current.showNotification({
          title: "Test",
          body: "Test body",
        });
      });

      expect(constructorMock).not.toHaveBeenCalled();
    });
  });

  describe("playNotificationSound", () => {
    it("creates and plays an Audio element", () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.playNotificationSound();
      });

      expect(Audio).toHaveBeenCalled();
    });

    it("falls back to visual flash when play() rejects", async () => {
      const mockPlay = vi.fn().mockRejectedValue(new Error("play failed"));
      globalThis.Audio = vi.fn(function (this: Record<string, unknown>) {
        this.play = mockPlay;
        this.volume = 0.3;
      }) as unknown as typeof Audio;

      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.playNotificationSound();
      });

      // Flush microtask queue so the .catch() handler runs
      await act(async () => {
        await vi.waitFor(() => {
          expect(mockPlay).toHaveBeenCalled();
        });
      });
    });
  });
});
