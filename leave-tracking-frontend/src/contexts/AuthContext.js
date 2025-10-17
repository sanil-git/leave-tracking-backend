import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Auto-detect API URL: use localhost for development, production backend for production
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : 'https://leave-tracking-backend.onrender.com');

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const currentToken = token; // capture token at call time to avoid race on logout
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (response.ok) {
        // If user logged out while request was in flight, ignore this response
        if (localStorage.getItem('token') !== currentToken) {
          setLoading(false);
          return;
        }
        const userData = await response.json();
        setUser(userData);
      } else if (response.status === 401) {
        // Only logout on 401 Unauthorized (invalid token)
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
      // For other errors (network, 500, etc), keep user logged in
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Don't logout on network errors - keep user logged in
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only depend on token, not the function

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        const errorData = await response.json();
        console.log('Login error response:', { status: response.status, errorData });
        
        let errorMessage = errorData.error || errorData.message || 'Login failed';
        
        // Provide more helpful error messages
        if (response.status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        console.log('Returning error:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || errorData.message || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    // Increment a simple logout timestamp to break any in-flight profile requests
    localStorage.setItem('logout_at', String(Date.now()));
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoading(false);
    
    // Force a small delay to ensure state updates are processed
    setTimeout(() => {
      // Additional cleanup if needed
      console.log('User logged out successfully');
    }, 100);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
