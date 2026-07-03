import { fetchWithAuth } from './api';

export const customerService = {
  getDashboardData: async () => {
    return await fetchWithAuth('/customer/dashboard');
  },
  getAllBarbers: async () => {
    return await fetchWithAuth('/barbers', { method: 'GET' });
  }
};
