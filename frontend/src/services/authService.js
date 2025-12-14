import api from './api';

// --- Register ---
export const register = async (userData) => {
  try {
    // Call PHP endpoint directly
    const response = await api.post('/register.php', userData);

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return { success: true, user: response.data.user };
    }

    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.error || error.response.data.message || 'Registration failed');
    }
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

// --- Login ---
export const login = async (credentials) => {
  try {
    const response = await api.post('/login.php', {
      email: credentials.email,
      password: credentials.password
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      authEventEmitter.triggerLogin(response.data.user);
      return { success: true, user: response.data.user, token: response.data.token };
    }

    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (error.response?.data) {
      throw new Error(error.response.data.error || error.response.data.message || 'Login failed');
    }
    throw new Error(error.message || 'An unexpected error occurred during login');
  }
};

// --- Logout ---
export const logout = async () => {
  try {
    // If you want a PHP logout endpoint, create logout.php
    await api.get('/logout.php');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    authEventEmitter.triggerLogout();
  }
};

// --- Get current user (via me.php) ---
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/me.php');
    return response.data.user || null;
  } catch {
    return null;
  }
};

// --- Event emitter for auth state changes ---
const authEventEmitter = {
  listeners: { login: [], logout: [] },
  onLogin(callback) { this.listeners.login.push(callback); },
  onLogout(callback) { this.listeners.logout.push(callback); },
  triggerLogin(user) { this.listeners.login.forEach(cb => cb(user)); },
  triggerLogout() { this.listeners.logout.forEach(cb => cb()); }
};

export { authEventEmitter };