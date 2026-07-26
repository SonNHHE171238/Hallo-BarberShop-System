import { fetchWithAuth } from './api';

export const importReceiptService = {
  createReceipt: async (data) => {
    try {
      const response = await fetchWithAuth('/import-receipts', {
        method: 'POST',
        body: JSON.stringify(data),
        fullResponse: true
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  getReceipts: async (status = '') => {
    try {
      const response = await fetchWithAuth(`/import-receipts${status ? `?status=${status}` : ''}`, {
        method: 'GET',
        fullResponse: true
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  approveReceipt: async (id) => {
    try {
      const response = await fetchWithAuth(`/import-receipts/${id}/approve`, {
        method: 'PUT',
        fullResponse: true
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  rejectReceipt: async (id) => {
    try {
      const response = await fetchWithAuth(`/import-receipts/${id}/reject`, {
        method: 'PUT',
        fullResponse: true
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};
