import { useState, FC } from 'react';
import { User } from '../App';

interface NavbarProps {
  user: User;
  currentPage: string;
  onNavigate: (page: 'dashboard' | 'profile') => void;
  onLogout: () => void;
}

const Navbar: FC<NavbarProps> = ({ user, currentPage, onNavigate, onLogout }) => {
  const [hasNotifications, setHasNotifications] = useState(true);

  const navigation = [
    { id: 'dashboard', label: 'Home', page: 'dashboard' as const },
    { id: 'events', label: 'Events', page: 'dashboard' as const },
    { id: 'profile', label: 'Profile', page: 'profile' as const },
    { id: 'history', label: 'History', page: 'dashboard' as const },
  ];

  if (user.role === 'admin') {
    navigation.push({ id: 'admin', label: 'Admin', page: 'dashboard' as const });
  }

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
                      currentPage === item.page
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
            <div className="relative mr-4">
              <button 
                onClick={() => setHasNotifications(!hasNotifications)}
                className="p-1 rounded-full text-gray-700 hover:text-green-700 focus:outline-none"
              >
                <i className="fas fa-bell text-xl"></i>
                {hasNotifications && (
                  <span className="notification-dot"></span>
                )}
              </button>
            </div>
            
            <div className="relative">
              <div className="flex items-center">
                <img 
                  className="h-8 w-8 rounded-full" 
                  src="https://placehold.co/32x32" 
                  alt="User profile picture"
                />
                <span className="ml-2 text-gray-700 font-medium">
                  {user.name}
                </span>
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