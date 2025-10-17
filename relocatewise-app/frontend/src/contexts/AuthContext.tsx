'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginForm, RegisterForm, ApiResponse } from '@/types';
import { apiClient } from '@/utils/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginForm) => Promise<boolean>;
  register: (userData: RegisterForm) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
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
  // TEMPORARY: Mock user for testing without authentication
  const [user, setUser] = useState<User | null>({
    _id: 'mock-user-id',
    name: 'Test User',
    email: 'test@example.com',
    currentLocation: {
      city: 'San Francisco',
      country: 'USA'
    },
    destinationCity: {
      city: 'New York',
      country: 'USA'
    },
    moveDate: '2024-12-01',
    travelMode: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [token, setToken] = useState<string | null>('mock-token');
  const [loading, setLoading] = useState(false);

  // TEMPORARY: Skip authentication checks
  useEffect(() => {
    setLoading(false);
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (response.data.success && response.data.data) {
        setUser(response.data.data.user);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('relocatewise_token');
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      localStorage.removeItem('relocatewise_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginForm): Promise<boolean> => {
    // TEMPORARY: Always return success for testing
    console.log('Login attempt:', credentials);
    return true;
  };

  const register = async (userData: RegisterForm): Promise<boolean> => {
    // TEMPORARY: Always return success for testing
    console.log('Registration attempt:', userData);
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('relocatewise_token');
  };

  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    try {
      const response = await apiClient.put<ApiResponse<{ user: User }>>('/auth/profile', profileData);
      
      if (response.data.success && response.data.data) {
        setUser(response.data.data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
