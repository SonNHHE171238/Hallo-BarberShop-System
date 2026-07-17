import { fetchWithAuth } from './api';

export const notificationService = {
  getMyNotifications: async () => {
    try {
      // The API should return the whole response object or data based on fetchWithAuth logic
      // In fetchWithAuth it returns data.data if success is true, but since we map to res.data in UI,
      // actually fetchWithAuth returns either data.data directly, or full object if fullResponse: true.
      // We will just use fetchWithAuth and return a structure { success: true, data: response } 
      // or since our components expect res.success, let's use {fullResponse: true} to get the whole JSON
      const response = await fetchWithAuth('/notifications/my', { method: 'GET', fullResponse: true });
      return response;
    } catch (error) {
      throw error;
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await fetchWithAuth(`/notifications/${id}/read`, { method: 'PUT', fullResponse: true });
      return response;
    } catch (error) {
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await fetchWithAuth('/notifications/read-all', { method: 'PUT', fullResponse: true });
      return response;
    } catch (error) {
      throw error;
    }
  }
};
