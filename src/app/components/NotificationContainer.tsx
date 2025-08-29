import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import Notification from './Notification';

const NotificationContainer: React.FC = () => {
  const { notifications, hideNotification } = useNotifications();

  return (
    <>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={() => hideNotification(notification.id)}
        />
      ))}
    </>
  );
};

export default NotificationContainer;
