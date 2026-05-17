import api from './axios';

export const billingApi = {
  createCheckoutSession: async () => {
    try {
      const response = await api.post('/api/billing/create-checkout-session');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to create upgrade session';
    }
  },

  confirmCheckoutSession: async (sessionId) => {
    try {
      const response = await api.post('/api/billing/confirm', { sessionId });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to confirm premium upgrade';
    }
  },

  cancelPremium: async () => {
    try {
      const response = await api.post('/api/billing/cancel');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to cancel premium membership';
    }
  },
};
