import { FC } from 'react';
import { User } from '../App';
import { useNotifications } from '../context/NotificationContext';

interface NotificationsProps {
  user: User | null;
}

const Notifications: FC<NotificationsProps> = ({ user }) => {
  if (!user) return null;

  const { notifications, markAsRead, markAllAsRead, removeNotification } = useNotifications();

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

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Notifications</h1>
            <p className="mt-2 text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Mark All as Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="glass-card organic-shadow p-8">
                <i className="fas fa-bell-slash text-4xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                <p className="text-gray-500">We'll notify you when something important happens!</p>
              </div>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`glass-card organic-shadow p-6 ${
                  !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-lg font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {notification.urgent && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              Urgent
                            </span>
                          )}
                          {!notification.read && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-3">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                        <div className="flex items-center space-x-3">
                          {notification.actionUrl && (
                            <button className="text-sm font-medium text-green-600 hover:text-green-500">
                              {notification.actionLabel || 'View Details'}
                            </button>
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                              Mark as Read
                            </button>
                          )}
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-500"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        {notifications.length > 0 && (
          <div className="mt-8 glass-card organic-shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {notifications.filter(n => n.read).length}
                </div>
                <div className="text-sm text-gray-600">Read</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {notifications.filter(n => !n.read).length}
                </div>
                <div className="text-sm text-gray-600">Unread</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {notifications.filter(n => n.urgent).length}
                </div>
                <div className="text-sm text-gray-600">Urgent</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;