import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NotificationType } from '../components/Notification';

interface NotificationState {
  type: NotificationType;
  message: string;
  isVisible: boolean;
  id: string;
}

interface NotificationContextType {
  notifications: NotificationState[];
  showNotification: (type: NotificationType, message: string, autoHide?: boolean) => void;
  hideNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showNotification = useCallback((
    type: NotificationType, 
    message: string, 
    autoHide: boolean = true
  ) => {
    const id = Date.now().toString();
    const newNotification: NotificationState = {
      type,
      message,
      isVisible: true,
      id
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-hide notification after 3 seconds if autoHide is true
    if (autoHide) {
      setTimeout(() => {
        hideNotification(id);
      }, 3000);
    }
  }, [hideNotification]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextType = {
    notifications,
    showNotification,
    hideNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
