"use client";

import { useState, useEffect, useCallback } from 'react';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

interface UseNotificationsReturn {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (options: NotificationOptions) => Promise<void>;
  playNotificationSound: () => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  // Check notification support and get current permission
  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    } else {
      setIsSupported(false);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }, [isSupported]);

  const showNotification = useCallback(async (options: NotificationOptions): Promise<void> => {
    if (!isSupported) {
      console.warn('Notifications are not supported in this browser');
      return;
    }

    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        silent: false,
      });

      // Auto-close notification after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Optional: Handle notification clicks
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [isSupported, permission]);

  const playNotificationSound = useCallback(() => {
    try {
      // Short beep sound encoded as base64 data URL
      const audio = new Audio(
        'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D0rnEhCFmjz+XpkTIHJ3bA7N2QQAoUXrTp66hVFApGn+D0rnEhCFmjz+XpkTIHJ3bA7M'
      );

      // Set volume to a reasonable level
      audio.volume = 0.3;

      audio.play().catch((error) => {
        console.warn('Could not play notification sound:', error);
        // Fallback: visual notification
        visualFlash();
      });
    } catch (error) {
      console.warn('Audio notification failed:', error);
      // Fallback: visual notification
      visualFlash();
    }
  }, []);

  // Visual flash fallback when sound fails
  const visualFlash = useCallback(() => {
    const originalBackground = document.body.style.background;
    const originalTransition = document.body.style.transition;

    document.body.style.transition = 'background-color 0.1s ease';
    document.body.style.background = '#ef4444';

    setTimeout(() => {
      document.body.style.background = originalBackground;
      setTimeout(() => {
        document.body.style.transition = originalTransition;
      }, 100);
    }, 200);
  }, []);

  return {
    permission,
    isSupported,
    requestPermission,
    showNotification,
    playNotificationSound,
  };
};