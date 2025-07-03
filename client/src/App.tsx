import { useState } from 'react';
import './index.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Navbar from './components/Navbar';
import Events from './components/Events';

export type UserRole = 'volunteer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard' | 'profile' | 'events'>('login');
  const [user, setUser] = useState<User | null>(null);

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
    </div>
  );
}

export default App;