import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as authLogin, logout as authLogout, register as authRegister } from '../services/authService';
import { showSuccess, showError } from '../services/notificationService';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const currentUser = JSON.parse(userData);

          // Ensure subscription_level is always present
          setUser({
            ...currentUser,
            subscription_level: currentUser?.subscription_level || 'free'
          });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login
  const login = async (credentials) => {
    try {
      const data = await authLogin(credentials);

      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

      const userWithSubscription = {
        ...(data.user || {}),
        subscription_level: data.user?.subscription_level || 'free'
      };

      setUser(userWithSubscription);
      setIsAuthenticated(true);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userWithSubscription));

      showSuccess('Successfully logged in');
      return data;
    } catch (error) {
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];

      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      showError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Register
  const register = async (userData) => {
    try {
      const data = await authRegister(userData);

      const userWithSubscription = {
        ...(data.user || {}),
        subscription_level: data.user?.subscription_level || 'free'
      };

      setUser(userWithSubscription);
      setIsAuthenticated(true);

      // Store user in localStorage (no token yet unless backend provides one)
      localStorage.setItem('user', JSON.stringify(userWithSubscription));

      showSuccess('Registration successful! Please check your email to verify your account.');
      return data;
    } catch (error) {
      showError(error.message || 'Registration failed');
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authLogout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];

      showSuccess('Successfully logged out');
    }
  };

  // Update user data
  const updateUser = (userData) => {
    const updatedUser = {
      ...(userData || {}),
      subscription_level: userData?.subscription_level || user?.subscription_level || 'free'
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      const updatedUser = {
        ...(response.data.user || {}),
        subscription_level: response.data.user?.subscription_level || user?.subscription_level || 'free'
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      showSuccess('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      showError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return {
    user: context.user,
    loading: context.loading,
    isAuthenticated: context.isAuthenticated,
    isAdmin: context.user?.role === 'admin',
    login: context.login,
    logout: context.logout,
    register: context.register,
    updateUser: context.updateUser,
    updateProfile: context.updateProfile
  };
};

export default AuthContext;