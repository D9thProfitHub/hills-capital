import api from './api';

const copyTradingApi = {
  // Create a new copy trading request
  createCopyTradingRequest: async (requestData) => {
    try {
      const response = await api.post('/api/users/copy-trading/requests', requestData);
      return response.data;
    } catch (error) {
      console.error('Error creating copy trading request:', error);
      throw error.response?.data || { message: 'Failed to create copy trading request' };
    }
  },

  // Get all copy trading requests for the current user
  getMyCopyTradingRequests: async () => {
    try {
      const response = await api.get('/api/users/copy-trading/my-requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching copy trading requests:', error);
      throw error.response?.data || { message: 'Failed to fetch copy trading requests' };
    }
  },

  // Get a specific copy trading request by ID
  getCopyTradingRequestById: async (id) => {
    try {
      const response = await api.get(`/api/users/copy-trading/requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching copy trading request:', error);
      throw error.response?.data || { message: 'Failed to fetch copy trading request' };
    }
  },

  // Admin: Get all copy trading requests
  getAllCopyTradingRequests: async (status) => {
    try {
      const params = status ? { status } : {};
      const response = await api.get('/api/users/copy-trading/admin/requests', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all copy trading requests:', error);
      throw error.response?.data || { message: 'Failed to fetch all copy trading requests' };
    }
  },

  // Admin: Update copy trading request status
  updateRequestStatus: async (id, status, notes = '') => {
    try {
      const response = await api.put(`/api/users/copy-trading/requests/${id}/status`, { status, notes });
      return response.data;
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error.response?.data || { message: 'Failed to update request status' };
    }
  },

  // Admin: Assign trader to copy trading request
  assignTrader: async (requestId, traderId) => {
    try {
      const response = await api.put(`/api/users/copy-trading/requests/${requestId}/assign`, { traderId });
      return response.data;
    } catch (error) {
      console.error('Error assigning trader:', error);
      throw error.response?.data || { message: 'Failed to assign trader' };
    }
  },

  // Get available traders for assignment
  getAvailableTraders: async () => {
    try {
      const response = await api.get('/api/users/copy-trading/available-traders');
      return response.data;
    } catch (error) {
      console.error('Error fetching available traders:', error);
      throw error.response?.data || { message: 'Failed to fetch available traders' };
    }
  }
};

export default copyTradingApi;
