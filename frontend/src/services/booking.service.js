import { fetchWithAuth } from './api';

export const bookingService = {
  /**
   * Tạo booking mới (Customer)
   * Yêu cầu người dùng phải đăng nhập (gửi kèm token)
   */
  createBookingSinglePage: async (bookingData) => {
    try {
      const response = await fetchWithAuth('/bookings/single-page', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });
      return response;
    } catch (error) {
      console.error('Lỗi khi tạo booking:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách dịch vụ
   */
  getServices: async () => {
    try {
      // Dùng fetchWithAuth hoặc fetch thông thường tuỳ thuộc vào việc API có cần token hay không
      // Ở đây /api/services là public, nhưng fetchWithAuth cũng hoạt động cho public route
      const response = await fetchWithAuth('/services', { method: 'GET' });
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách dịch vụ:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách thợ cắt (Barbers)
   */
  getBarbers: async () => {
    try {
      const response = await fetchWithAuth('/barbers', { method: 'GET' });
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thợ cắt:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách ngày nghỉ của Barber
   */
  getBarberAbsences: async (barberId) => {
    try {
      const response = await fetchWithAuth(`/barbers/${barberId}/absences`, { method: 'GET' });
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy lịch nghỉ của thợ cắt:', error);
      return { absentDates: [] }; // Fallback
    }
  },

  /**
   * Lấy danh sách khung giờ trống
   */
  checkAvailability: async (data) => {
    try {
      const response = await fetchWithAuth('/bookings/check-availability', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response;
    } catch (error) {
      console.error('Lỗi khi check availability:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách khung giờ động (đã lọc overlap)
   */
  getAvailableSlots: async (data) => {
    try {
      // Dùng fetch thay vì fetchWithAuth nếu route này là public.
      // Nhưng theo backend route, tôi để trống authenticate middleware nên nó là public.
      const response = await fetchWithAuth('/bookings/available-slots', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return response;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khung giờ:', error);
      throw error;
    }
  },
};
