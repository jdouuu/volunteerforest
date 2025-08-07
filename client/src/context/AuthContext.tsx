import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService, { Volunteer } from '../services/api';

interface AuthContextType {
  user: Volunteer | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<Volunteer>) => void;
  clearError: () => void;
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
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    // Check if user is already logged in on app start
    const checkAuth = async () => {
      try {
        const token = apiService.getAuthToken();
        console.log('Checking existing auth token:', token ? 'exists' : 'none');
        
        if (token) {
          const response = await apiService.verifyToken();
          console.log('Token verification response:', response);
          
          if (response.success) {
            setUser(response.data.user);
          } else {
            // Token is invalid, clear it
            console.log('Token invalid, clearing auth');
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

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('🔑 AUTH CONTEXT - Starting login attempt for:', email);
      setLoading(true);
      setError(null); // Clear previous errors
      
      const response = await apiService.login({ email, password });
      console.log('🔑 AUTH CONTEXT - Received login response:', response);
      
      if (response.success) {
        const { volunteer, token } = response.data;
        console.log('🔑 AUTH CONTEXT - Login successful, setting user:', volunteer);
        apiService.setAuthToken(token);
        setUser(volunteer);
        return { success: true };
      } else {
        const message = response.message || 'Login failed';
        console.log('🔑 AUTH CONTEXT - Login failed with message:', message);
        setError(message);
        return { success: false, message };
      }
    } catch (error) {
      console.error('🔑 AUTH CONTEXT - Login error:', error);
      const message = 'Login failed. Please try again.';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const response = await apiService.register({ name, email, password });
      
      if (response.success) {
        const { volunteer, token } = response.data;
        apiService.setAuthToken(token);
        setUser(volunteer);
        return { success: true };
      } else {
        const message = response.message || 'Registration failed';
        setError(message);
        return { success: false, message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = 'Registration failed. Please try again.';
      setError(message);
      return { success: false, message };
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
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 