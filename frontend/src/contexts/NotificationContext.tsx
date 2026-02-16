import { createContext, useContext, type ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';

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

interface NotificationContextType {
  isConnected: boolean;
  notifications: SocketNotification[];
  unreadCount: number;
  addNotification: (notification: SocketNotification) => void;
  clearNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const {
    isConnected,
    notifications,
    unreadCount,
    addNotification,
    clearNotification,
    markAsRead,
    clearAllNotifications,
  } = useSocket();

  return (
    <NotificationContext.Provider
      value={{
        isConnected,
        notifications,
        unreadCount,
        addNotification,
        clearNotification,
        markAsRead,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
