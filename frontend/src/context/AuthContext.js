import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as authLogin, logout as authLogout, getCurrentUser, register as authRegister } from '../services/authService';
import { showSuccess, showError } from '../services/notificationService';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          // Set the default Authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          try {
            // Verify the token is still valid
            const currentUser = JSON.parse(userData);
            setUser(currentUser);
            setIsAuthenticated(true);
            
            // Optionally, you can make an API call to validate the token
            // await api.get('/auth/validate');
          } catch (error) {
            console.error('Error validating token:', error);
            // If token validation fails, clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete api.defaults.headers.common['Authorization'];
          }
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

  // Login function
  const login = async (credentials) => {
    try {
      const data = await authLogin(credentials);
      
      // Set the default Authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      // Update state
      setUser(data.user);
      setIsAuthenticated(true);
      
      // Store user data and token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
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

  // Register function
  const register = async (userData) => {
    try {
      const data = await authRegister(userData);
      setUser(data.user);
      showSuccess('Registration successful! Please check your email to verify your account.');
      return data;
    } catch (error) {
      showError(error.message || 'Registration failed');
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authLogout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with client-side logout even if API call fails
    } finally {
      // Clear auth state
      setUser(null);
      setIsAuthenticated(false);
      
      // Remove stored data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      
      showSuccess('Successfully logged out');
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      const updatedUser = response.data.user;
      
      // Update local state
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      showSuccess('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      showError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    isAuthenticated,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
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
