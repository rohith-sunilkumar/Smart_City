import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    console.log('[AuthContext] Checking auth, token exists:', !!token);

    if (token) {
      try {
        // Validate token with backend and get fresh user data
        console.log('[AuthContext] Validating token with backend...');
        const response = await authAPI.getMe();
        const userData = response.data.data.user;
        
        console.log('[AuthContext] User authenticated:', userData.name, userData.role);
        
        // Update localStorage with fresh user data
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch (error) {
        console.error('[AuthContext] Auth check failed:', error.response?.status, error.response?.data?.message);
        
        // Token is invalid or user not found - clear auth
        // Only logout if not already on login/register page to prevent loops
        const currentPath = window.location.pathname;
        if (!['/login', '/register'].includes(currentPath)) {
          console.log('[AuthContext] Clearing invalid auth and redirecting to login');
          logout();
          window.location.href = '/login';
        } else {
          // Just clear storage without redirect
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    } else {
      console.log('[AuthContext] No token found');
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data.data;
      
      // Don't auto-login admins - they need mayor approval first
      if (user.role === 'admin') {
        return { 
          success: true, 
          user,
          needsApproval: true 
        };
      }
      
      // Auto-login citizens and mayors
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    token: localStorage.getItem('token')
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
