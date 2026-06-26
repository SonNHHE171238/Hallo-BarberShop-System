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
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết một booking theo ID
   */
  getBookingById: async (bookingId) => {
    try {
      return await fetchWithAuth(`/bookings/${bookingId}`, { method: 'GET' });
    } catch (error) {
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
      throw error;
    }
  },

  /**
   * API for Barber Dashboard
   */
  getBarberTodayBookings: async () => {
    try {
      return await fetchWithAuth('/bookings/barber/today', { method: 'GET' });
    } catch (error) {
      throw error;
    }
  },

  updateBookingStatus: async (bookingId, status) => {
    try {
      return await fetchWithAuth(`/bookings/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * API for Customer Booking History
   */
  getMyBookings: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/bookings/me?${queryString}` : '/bookings/me';
      
      return await fetchWithAuth(url, { method: 'GET' });
    } catch (error) {
      throw error;
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      return await fetchWithAuth(`/bookings/${bookingId}/cancel`, {
        method: 'PUT'
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Đổi lịch hẹn cho customer
   * @param {string} bookingId - ID của booking cần đổi
   * @param {Object} data - { newDate: "YYYY-MM-DD", newTimeSlot: "HH:MM", note: string }
   */
  rescheduleBooking: async (bookingId, data) => {
    try {
      return await fetchWithAuth(`/bookings/${bookingId}/reschedule`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách khung giờ trống cho một barber vào một ngày cụ thể (dùng cho đổi lịch)
   * @param {string} barberId
   * @param {string} date - "YYYY-MM-DD"
   * @param {number} durationMinutes
   */
  getAvailableSlotsForReschedule: async (barberId, date, durationMinutes) => {
    try {
      const response = await fetchWithAuth('/bookings/available-slots', {
        method: 'POST',
        body: JSON.stringify({ barberId, date, durationMinutes })
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};
