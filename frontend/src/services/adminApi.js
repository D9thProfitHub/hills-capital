import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.hillscapitaltrade.com';

// Create axios instance with auth
const adminApi = axios.create({
  baseURL: `${API_BASE_URL}/api/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to headers
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTHENTICATION ====================
export const authApi = {
  login: (credentials) => adminApi.post('/login', credentials),
};

// ==================== USER MANAGEMENT ====================
export const userApi = {
  getUsers: (params = {}) => adminApi.get('/users', { params }),
  getUserById: (id) => adminApi.get(`/users/${id}`),
  createUser: (userData) => adminApi.post('/users', userData),
  updateUser: (id, userData) => adminApi.put(`/users/${id}`, userData),
  deleteUser: (id) => adminApi.delete(`/users/${id}`),
  updateUserRole: (id, role) => adminApi.put(`/users/${id}/role`, { role }),
  updateUserStatus: (id, status) => adminApi.put(`/users/${id}/status`, { status }),
};

// ==================== INVESTMENT PLANS ====================


// ==================== TRADING BOT REQUESTS ====================
export const botApi = {
  getRequests: (status = 'all') => adminApi.get('/bot-requests', { params: { status } }),
  updateStatus: (id, statusData) => adminApi.put(`/bot-requests/${id}/status`, statusData),
};

// ==================== COPY TRADING REQUESTS ====================
export const copyTradingApi = {
  /**
   * Get all copy trading requests with optional filters
   * @param {Object} filters - Filter options { status, userId, traderId, page, limit }
   * @returns {Promise} Axios response with requests data
   */
  getRequests: (filters = {}) => {
    const params = new URLSearchParams();

    // Add filters to params if provided
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    return adminApi.get(`/copy-trading-requests?${params.toString()}`);
  },

  /**
   * Get a single copy trading request by ID
   * @param {string} id - Request ID
   * @returns {Promise} Axios response with request data
   */
  getRequest: (id) => adminApi.get(`/copy-trading-requests/${id}`),

  /**
   * Create a new copy trading request
   * @param {Object} requestData - Request data
   * @returns {Promise} Axios response with created request
   */
  createRequest: (requestData) => adminApi.post('/copy-trading-requests', requestData),

  /**
   * Update a copy trading request
   * @param {string} id - Request ID
   * @param {Object} updateData - Data to update
   * @returns {Promise} Axios response with updated request
   */
  updateRequest: (id, updateData) => adminApi.put(`/copy-trading-requests/${id}`, updateData),

  /**
   * Delete a copy trading request
   * @param {string} id - Request ID
   * @returns {Promise} Axios response
   */
  deleteRequest: (id) => adminApi.delete(`/copy-trading-requests/${id}`),

  /**
   * Update request status (approve/reject)
   * @param {string} id - Request ID
   * @param {Object} statusData - { status, notes }
   * @returns {Promise} Axios response with updated request
   */
  updateStatus: (id, statusData) =>
    adminApi.put(`/copy-trading-requests/${id}/status`, statusData),

  /**
   * Get available traders for assignment
   * @returns {Promise} Axios response with traders list
   */
  getTraders: () => adminApi.get('/traders'),

  /**
   * Get pending copy trading requests
   * @returns {Promise} Axios response with pending requests
   */
  getPendingRequests: () => adminApi.get('/copy-trading-requests?status=pending'),

  /**
   * Assign a trader to a copy trading request
   * @param {string} requestId - Request ID
   * @param {string} traderId - Trader ID to assign
   * @returns {Promise} Axios response with updated request
   */
  assignTrader: (requestId, traderId) =>
    adminApi.put(`/copy-trading-requests/${requestId}/assign`, { traderId }),

  /**
   * Get copy trading statistics
   * @returns {Promise} Axios response with statistics
   */
  getStats: () => adminApi.get('/copy-trading/stats'),

  /**
   * Get copy trading request history
   * @param {Object} filters - Optional filters { userId, traderId, status, dateFrom, dateTo }
   * @returns {Promise} Axios response with history data
   */
  getHistory: (filters = {}) => {
    const params = new URLSearchParams();

    // Add filters to params if provided
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    return adminApi.get(`/copy-trading/history?${params.toString()}`);
  },

  /**
   * Export copy trading requests to CSV/Excel
   * @param {Object} filters - Optional filters { status, dateFrom, dateTo }
   * @returns {Promise} Axios response with file download
   */
  exportRequests: (filters = {}) => {
    const params = new URLSearchParams();

    // Add filters to params if provided
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    return adminApi.get(`/copy-trading/export?${params.toString()}`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    });
  },
};

// ==================== SIGNALS ====================
export const signalsApi = {
  getSignals: (status = 'all') => adminApi.get('/signals', { params: { status } }),
  createSignal: (signalData) => adminApi.post('/signals', signalData),
  updateSignal: (id, signalData) => adminApi.put(`/signals/${id}`, signalData),
  deleteSignal: (id) => adminApi.delete(`/signals/${id}`),
  activateSignal: (id) => adminApi.put(`/signals/${id}/activate`),
  closeSignal: (id, closeData) => adminApi.put(`/signals/${id}/close`, closeData),
};

// ==================== EDUCATION ====================
export const educationApi = {
  getContent: (type = 'all') => adminApi.get('/education', { params: { type } }),
  createContent: (contentData) => adminApi.post('/education', contentData),
  updateContent: (id, contentData) => adminApi.put(`/education/${id}`, contentData),
  deleteContent: (id) => adminApi.delete(`/education/${id}`),
  togglePublish: (id) => adminApi.put(`/education/${id}/publish`),
};

// ==================== AFFILIATES ====================
export const affiliatesApi = {
  getAffiliates: () => adminApi.get('/affiliates'),
  getAffiliate: (id) => adminApi.get(`/affiliates/${id}`),
  createAffiliate: (data) => adminApi.post('/affiliates', data),
  updateAffiliate: (id, data) => adminApi.put(`/affiliates/${id}`, data),
  deleteAffiliate: (id) => adminApi.delete(`/affiliates/${id}`),
  updateStatus: (id, status) => adminApi.put(`/affiliates/${id}/status`, { status }),
};

// ==================== SUBSCRIPTIONS ====================
export const subscriptionsApi = {
  getSubscriptions: () => adminApi.get('/subscriptions'),
  getSubscription: (id) => adminApi.get(`/subscriptions/${id}`),
  createSubscription: (data) => adminApi.post('/subscriptions', data),
  updateSubscription: (id, data) => adminApi.put(`/subscriptions/${id}`, data),
  deleteSubscription: (id) => adminApi.delete(`/subscriptions/${id}`),
  updateStatus: (id, status) => adminApi.put(`/subscriptions/${id}/status`, { status }),
  renew: (id) => adminApi.put(`/subscriptions/${id}/renew`),
  cancelAutoRenew: (id) => adminApi.put(`/subscriptions/${id}/cancel-autorenew`),
};

// ==================== SYSTEM STATS ====================
export const statsApi = {
  getSystemStats: () => adminApi.get('/system-stats'),
  getOverview: () => adminApi.get('/overview'),
  getRecentActivities: () => adminApi.get('/recent-activities'),
  getTopInvestors: () => adminApi.get('/top-investors'),
};

export default adminApi;
