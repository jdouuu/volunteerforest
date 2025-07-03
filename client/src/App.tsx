import { useState } from 'react';
import './index.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Navbar from './components/Navbar';
import Events from './components/Events';
import NotificationToast from './components/NotificationToast';
import { NotificationProvider, useNotifications } from './context/NotificationContext';

export type UserRole = 'volunteer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard' | 'profile' | 'events'>('login');
  const [user, setUser] = useState<User | null>(null);
  const { notifications } = useNotifications();

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'dashboard':
        return <Dashboard user={user} onNavigate={setCurrentPage} />;
      case 'profile':
        return <Profile user={user} />;
      case 'events':
        return <Events user={user} />;
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <Navbar 
          user={user} 
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
        />
      )}
      {renderCurrentPage()}
      {user && <NotificationToast notifications={notifications} />}
    </div>
  );
};

function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

export default App;