import { fetchWithAuth } from './api';

export const customerService = {
  getDashboardData: async () => {
    return await fetchWithAuth('/customer/dashboard');
  }
};
