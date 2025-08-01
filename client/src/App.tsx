import { useState } from 'react';
import './index.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Navbar from './components/Navbar';
import Events from './components/Events';
import History from './components/History';
import VolunteerMatchingForm from './components/VolunteerMatchingForm';
import Notifications from './components/Notifications';
import NotificationToast from './components/NotificationToast';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const LoginWithCallback = Login as React.FC<{ onLoginSuccess?: () => void }>;


const AppContent = () => {
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard' | 'admin' | 'profile' | 'events' | 'history' | 'notifications' | 'matching'>('login');
  const { user, loading, logout } = useAuth();
  const { notifications } = useNotifications();

  const handleLogout = () => {
    logout();
    setCurrentPage('login');
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} onNavigate={(page) => setCurrentPage(page)} />;
      case 'admin':
        return <Dashboard user={user} onNavigate={(page) => setCurrentPage(page)} />;
      case 'profile':
        return <Profile user={user} />;
      case 'events':
        return <Events user={user} />;
      case 'history':
        return <History user={user} />;
      case 'notifications':
        return <Notifications user={user} />;
      case 'matching':
        return <VolunteerMatchingForm />;
      default:
        return <Dashboard user={user} onNavigate={(page) => setCurrentPage(page)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <Navbar 
          user={user} 
          currentPage={currentPage}
          onNavigate={(page) => setCurrentPage(page)}
          onLogout={handleLogout}
        />
      )}
      <div className="page-transition">
        {renderCurrentPage()}
      </div>
      {user && <NotificationToast notifications={notifications} />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;