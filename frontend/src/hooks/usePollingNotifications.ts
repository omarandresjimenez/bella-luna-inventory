import { useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

interface PollingNotification {
  id: string;
  orderId?: string;
  orderNumber?: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  customerId?: string;
  customerName?: string;
  total?: number;
  status?: string;
  timestamp: Date;
  read: boolean;
}

interface UsePollingNotificationsProps {
  onNewNotification?: (notification: PollingNotification) => void;
  pollingInterval?: number; // milliseconds, default 5000 (5 seconds)
  enabled?: boolean; // Enable/disable polling, default true
}

/**
 * Hook for polling notifications from the server
 * Used as fallback when WebSockets are unavailable (e.g., Vercel production)
 */
export function usePollingNotifications({
  onNewNotification,
  pollingInterval = 5000,
  enabled = true,
}: UsePollingNotificationsProps) {
  const lastNotificationIdRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      // Call a notification endpoint to get recent notifications
      const response = await apiClient.get<PollingNotification[]>('/admin/notifications', {
        params: {
          limit: 10,
          unread: true,
        },
      });

      if (response.data && Array.isArray(response.data)) {
        const notifications = response.data;

        // Process each notification (only new ones)
        notifications.forEach((notification: PollingNotification) => {
          if (!lastNotificationIdRef.current || notification.id > lastNotificationIdRef.current) {
            lastNotificationIdRef.current = notification.id;
            onNewNotification?.(notification);
          }
        });
      }
    } catch (error) {
      // Silently ignore polling errors to avoid spam
    }
  }, [onNewNotification]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Start polling
    fetchNotifications(); // Initial check
    pollingIntervalRef.current = setInterval(fetchNotifications, pollingInterval);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchNotifications, pollingInterval, enabled]);
}
