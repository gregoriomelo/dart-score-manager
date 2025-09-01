import React, { useEffect } from 'react';
import { CSS_CLASSES } from '../../shared/utils/constants';
import './Notification.css';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationProps {
  type: NotificationType;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

const Notification: React.FC<NotificationProps> = React.memo(({
  type,
  message,
  isVisible,
  onClose,
  autoHide = true,
  autoHideDelay = 3000
}) => {
  useEffect(() => {
    if (isVisible && autoHide) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHide, autoHideDelay, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div 
      className={`${CSS_CLASSES.NOTIFICATION} ${CSS_CLASSES.NOTIFICATION}--${type}`}
      role="alert"
      aria-live="polite"
    >
      <span className={CSS_CLASSES.NOTIFICATION_ICON}>{getIcon()}</span>
      <span className={CSS_CLASSES.NOTIFICATION_MESSAGE}>{message}</span>
      <button 
        className={CSS_CLASSES.NOTIFICATION_CLOSE}
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
});

Notification.displayName = 'Notification';

export default Notification;
