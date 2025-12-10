import api from './api';

export const register = async (userData) => {
  try {
    const response = await api.post('/api/auth/register', userData);
    
    // If we get a success response with token
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return { success: true, user: response.data.user };
    }
    
    // If we get a success response but no token (shouldn't happen, but just in case)
    if (response.data.success === false) {
      return response.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Auth service error:', error);
    
    // If we have a response with error data
    if (error.response?.data) {
      throw new Error(error.response.data.error || 
                     error.response.data.message || 
                     'Registration failed');
    }
    
    // For network errors or other issues
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

export const login = async (credentials) => {
  console.log('Login attempt started with credentials:', {
    email: credentials.email,
    hasPassword: !!credentials.password
  });
  
  try {
    console.log('Sending login request to /api/auth/login');
    const response = await api.post('/api/auth/login', {
      email: credentials.email,
      password: credentials.password
    }, {
      withCredentials: true // Important for cookies
    });

    console.log('Login response received:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });

    // Handle response with token in body (for API clients)
    if (response.data.token) {
      console.log('Login successful (token in body), storing token and user data');
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user || response.data.data));
      
      // Set default auth header for subsequent requests
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Trigger login event
      const userData = response.data.user || response.data.data;
      authEventEmitter.triggerLogin(userData);
      
      return { 
        success: true, 
        user: userData,
        token: response.data.token 
      };
    } 
    // Handle response with user data but no explicit token (might be in cookie)
    else if (response.data.user || response.data.data) {
      console.log('Login successful (token in cookie), storing user data');
      const userData = response.data.user || response.data.data;
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Get token from cookie if available
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
        
      if (token) {
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      authEventEmitter.triggerLogin(userData);
      return { 
        success: true, 
        user: userData,
        token: token
      };
    }
    
    console.warn('Login response missing token and user data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    
    // If we have a response with error data
    if (error.response?.data) {
      throw new Error(error.response.data.error || 
                     error.response.data.message || 
                     'Login failed. Please check your credentials.');
    }
    
    // For network errors or other issues
    throw new Error(error.message || 'An unexpected error occurred during login');
  }
};

export const logout = async () => {
  try {
    await api.get('/api/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  delete api.defaults.headers.common['Authorization'];
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const updateProfile = async (userData) => {
  const response = await api.put('/api/auth/updatedetails', userData);
  if (response.data.user) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const changePassword = async (passwords) => {
  const response = await api.put('/api/auth/updatepassword', passwords);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/api/auth/forgotpassword', { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await api.put(`/api/auth/resetpassword/${token}`, { password });
  return response.data;
};

/**
 * Get the current authentication token
 * @returns {string|null} The authentication token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

// Event emitter for auth state changes
const authEventEmitter = {
  listeners: {
    login: [],
    logout: []
  },
  onLogin(callback) {
    this.listeners.login.push(callback);
  },
  onLogout(callback) {
    this.listeners.logout.push(callback);
  },
  triggerLogin(user) {
    this.listeners.login.forEach(callback => callback(user));
  },
  triggerLogout() {
    this.listeners.logout.forEach(callback => callback());
  }
};

export { authEventEmitter };
