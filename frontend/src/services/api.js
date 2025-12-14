import axios from 'axios';

// Ensure we're using the correct API URL
const API_URL = process.env.REACT_APP_API_URL || 'https://d9thprofithub.com.ng/api';

console.log('API Base URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for cookies/auth
  credentials: 'include', // Ensure cookies are sent with requests
});

// Set default content type
api.defaults.headers.common['Content-Type'] = 'application/json';

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Current token:', token ? 'exists' : 'missing');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added Authorization header to request');
    } else {
      console.warn('No token found in localStorage');
    }

    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 400) {
      return Promise.reject(new Error(
        error.response.data?.message || 'Invalid request. Please check your input.'
      ));
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;