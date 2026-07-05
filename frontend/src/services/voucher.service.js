import { fetchWithAuth } from './api';

export const voucherService = {
  // Admin endpoints
  getAllVouchers: async (params = {}) => {
    try {
      // Remove undefined params
      const cleanParams = Object.entries(params).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== '') acc[k] = v;
        return acc;
      }, {});
      
      const queryParams = new URLSearchParams(cleanParams).toString();
      const url = queryParams ? `/vouchers?${queryParams}` : '/vouchers';
      return await fetchWithAuth(url, { method: 'GET', fullResponse: true });
    } catch (error) {
      throw error;
    }
  },

  createVoucher: async (data) => {
    try {
      return await fetchWithAuth('/vouchers', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw error;
    }
  },

  updateVoucher: async (id, data) => {
    try {
      return await fetchWithAuth(`/vouchers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw error;
    }
  },

  deleteVoucher: async (id) => {
    try {
      return await fetchWithAuth(`/vouchers/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw error;
    }
  },

  // Customer endpoints
  applyVoucher: async (code, totalAmount, customerPhone = null) => {
    try {
      return await fetchWithAuth('/vouchers/apply', {
        method: 'POST',
        body: JSON.stringify({ code, totalAmount, customerPhone }),
      });
    } catch (error) {
      throw error;
    }
  }
};
