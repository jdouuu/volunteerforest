import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService, { Volunteer } from '../services/api';

interface AuthContextType {
  user: Volunteer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<Volunteer>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Volunteer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on app start
    const checkAuth = async () => {
      try {
        const token = apiService.getAuthToken();
        if (token) {
          const response = await apiService.verifyToken();
          if (response.success) {
            setUser(response.data.user);
          } else {
            // Token is invalid, clear it
            apiService.removeAuthToken();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        apiService.removeAuthToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiService.login({ email, password });
      
      if (response.success) {
        const { volunteer, token } = response.data;
        apiService.setAuthToken(token);
        setUser(volunteer);
        return true;
      } else {
        console.error('Login failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiService.register({ name, email, password });
      
      if (response.success) {
        const { volunteer, token } = response.data;
        apiService.setAuthToken(token);
        setUser(volunteer);
        return true;
      } else {
        console.error('Registration failed:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.removeAuthToken();
    setUser(null);
  };

  const updateUser = (userData: Partial<Volunteer>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 