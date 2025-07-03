import { useState, useEffect, FC } from 'react';
import { Notification } from '../types/notifications';

interface NotificationToastProps {
  notifications: Notification[];
}

const NotificationToast: FC<NotificationToastProps> = ({ notifications }) => {
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);
  const [shownNotifications, setShownNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    const recentNotifications = notifications.filter(n => {
      const timeDiff = Date.now() - n.timestamp.getTime();
      // Show notifications that are less than 30 seconds old, unread, and not already shown
      return timeDiff < 30000 && !n.read && !shownNotifications.has(n.id);
    });
    
    recentNotifications.forEach(notification => {
      if (!visibleNotifications.includes(notification.id)) {
        setVisibleNotifications(prev => [...prev, notification.id]);
        setShownNotifications(prev => new Set([...prev, notification.id]));
        
        // Auto-dismiss after 7 seconds
        setTimeout(() => {
          setVisibleNotifications(prev => prev.filter(id => id !== notification.id));
        }, 7000);
      }
    });
  }, [notifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'event_assignment':
        return '📝';
      case 'event_update':
        return '🔄';
      case 'event_reminder':
        return '⏰';
      case 'volunteer_match':
        return '🤝';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const closeToast = (notificationId: string) => {
    setVisibleNotifications(prev => prev.filter(id => id !== notificationId));
  };

  return (
    <div className="fixed top-20 right-4 space-y-3 z-50 w-80 sm:w-96">
      {visibleNotifications.map(notificationId => {
        const notification = notifications.find(n => n.id === notificationId);
        if (!notification) return null;

        return (
          <div
            key={notification.id}
            className={`w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out ${
              notification.urgent ? 'border-l-4 border-red-500' : 'border-l-4 border-green-500'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {notification.message}
                  </p>
                  {notification.actionUrl && (
                    <div className="mt-3">
                      <button className="text-sm font-medium text-green-600 hover:text-green-500">
                        {notification.actionLabel || 'View Details'}
                      </button>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={() => closeToast(notification.id)}
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <span className="sr-only">Close</span>
                    <i className="fas fa-times text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationToast;