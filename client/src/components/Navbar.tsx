import { FC } from 'react';
import { User } from '../App';
import NotificationDropdown from './NotificationDropdown';
import { useNotifications } from '../context/NotificationContext';

interface NavbarProps {
  user: User;
  currentPage: string;
  onNavigate: (page: 'dashboard' | 'admin' | 'profile' | 'events' | 'history' | 'notifications') => void;
  onLogout: () => void;
}

const Navbar: FC<NavbarProps> = ({ user, currentPage, onNavigate, onLogout }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const navigation = user.role === 'admin' ? [
    { id: 'admin', label: 'Dashboard', page: 'admin' as const },
    { id: 'events', label: 'Events', page: 'events' as const },
    { id: 'history', label: 'History', page: 'history' as const },
  ] : [
    { id: 'dashboard', label: 'Home', page: 'dashboard' as const },
    { id: 'events', label: 'Events', page: 'events' as const },
    { id: 'history', label: 'History', page: 'history' as const },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img 
                src="https://placehold.co/40x40" 
                alt="VolunteerMatch leaf logo in green and white" 
                className="h-8 w-8"
              />
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.page)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      (currentPage === item.page || (currentPage === 'admin' && item.id === 'admin') || (currentPage === 'dashboard' && item.id === 'dashboard'))
                        ? 'text-green-700'
                        : 'text-gray-700 hover:text-green-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="mr-4">
              <NotificationDropdown
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onNotificationClick={(notification) => {
                  if (notification.actionUrl) {
                    if (notification.actionUrl === '/events') {
                      onNavigate('events');
                    } else if (notification.actionUrl === '/profile') {
                      onNavigate('profile');
                    }
                  }
                }}
                onViewAllClick={() => onNavigate('notifications')}
              />
            </div>
            
            <div className="relative">
              <div className="flex items-center">
                <img 
                  className="h-8 w-8 rounded-full" 
                  src="https://placehold.co/32x32" 
                  alt="User profile picture"
                />
                <button
                  onClick={() => onNavigate('profile')}
                  className="ml-2 text-gray-700 font-medium hover:text-green-700 focus:outline-none"
                >
                  {user.name}
                </button>
                <button
                  onClick={onLogout}
                  className="ml-4 px-3 py-1 text-sm text-gray-600 hover:text-green-700 focus:outline-none"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;