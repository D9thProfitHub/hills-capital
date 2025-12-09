import api from './api';

// User-side Trading Bot Request API
// Provides helper functions for creating and fetching trading bot requests
// All routes are prefixed with /api/bot-requests (handled by backend auth middleware)
// If your backend uses a different path, simply update the endpoints below.

const ENDPOINT = '/api/bot-requests';

const botRequestApi = {
  /**
   * Create a new trading bot request
   * @param {Object} requestData - { botType, capital, tradingPair, riskLevel, duration, strategy }
   */
  createRequest: (requestData) => api.post(ENDPOINT, requestData),

  /**
   * Fetch the authenticated user's own bot requests
   */
  getMyRequests: () => api.get(ENDPOINT),
};

export default botRequestApi;
