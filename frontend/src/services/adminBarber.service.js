import { fetchWithAuth } from './api';

export const adminBarberService = {
  getAllAdminBarbers: async () => {
    try {
      const response = await fetchWithAuth('/admin/barbers', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách barbers:', error);
      throw error;
    }
  }
};
