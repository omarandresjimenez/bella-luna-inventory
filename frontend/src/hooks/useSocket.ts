import { useEffect, useState, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

interface SocketNotification {
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

interface UseSocketReturn {
  isConnected: boolean;
  notifications: SocketNotification[];
  unreadCount: number;
  addNotification: (notification: SocketNotification) => void;
  clearNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAllNotifications: () => void;
}

export function useSocket(): UseSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<SocketNotification[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const notificationIdRef = useRef(0);

  // Connect to socket server
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    // Remove /api path if present for socket connection
    const socketUrl = apiUrl.replace(/\/api\/?$/, '');

    socketRef.current = io(socketUrl, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    // Handle connection
    socketRef.current.on('connect', () => {
      setIsConnected(true);
    });

    // Handle disconnection
    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle new orders
    socketRef.current.on('order:created', (data: any) => {
      const notification: SocketNotification = {
        id: `order-${++notificationIdRef.current}`,
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        message: `Nuevo pedido #${data.orderNumber} de ${data.customerName} - ${data.total}`,
        type: 'success',
        customerId: data.customerId,
        customerName: data.customerName,
        total: data.total,
        status: data.status,
        timestamp: new Date(data.timestamp),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev]);
      playNotificationSound();
    });

    // Handle order status changes
    socketRef.current.on('order:status-changed', (data: any) => {
      const notification: SocketNotification = {
        id: `status-${++notificationIdRef.current}`,
        orderId: data.orderId,
        message: `El pedido #${data.orderId.substring(0, 8)} cambió a: ${data.newStatus}`,
        type: 'info',
        timestamp: new Date(data.timestamp),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev]);
    });

    // Handle general admin notifications
    socketRef.current.on('admin:notification', (data: any) => {
      const notification: SocketNotification = {
        id: `admin-${++notificationIdRef.current}`,
        message: data.message,
        type: data.type || 'info',
        timestamp: new Date(data.timestamp),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev]);
    });

    // Handle errors
    socketRef.current.on('connect_error', () => {
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const addNotification = useCallback((notification: SocketNotification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    isConnected,
    notifications,
    unreadCount,
    addNotification,
    clearNotification,
    markAsRead,
    clearAllNotifications,
  };
}

// Play notification sound
function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a simple beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    // Fallback: try playing audio file if available
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Silent fail if audio not available
      });
    } catch {
      // Silent fail
    }
  }
}

export default useSocket;
