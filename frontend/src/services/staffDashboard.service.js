import { fetchWithAuth } from './api';

export const staffDashboardService = {
  getMetrics: async () => {
    return await fetchWithAuth('/staff/dashboard/metrics');
  },
  
  getUpcomingBookings: async () => {
    return await fetchWithAuth('/staff/dashboard/upcoming-bookings');
  },
  
  getBarbersStatus: async () => {
    return await fetchWithAuth('/staff/dashboard/barbers-status');
  },
  
  updateStatus: async (bookingId, payload) => {
    // Nếu payload là string, đóng gói lại thành object { status: payload } cho tương thích ngược
    const data = typeof payload === 'string' ? { status: payload } : payload;
    return await fetchWithAuth(`/staff/dashboard/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  createPaymentLink: async (payload) => {
    return await fetchWithAuth('/payment/create-link', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getAppointmentsList: async (params) => {
    // Chuyển object params thành query string (ví dụ: ?date=...&barberId=...)
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.append('date', params.date);
    if (params?.barberId) searchParams.append('barberId', params.barberId);
    if (params?.status) searchParams.append('status', params.status);
    
    const queryString = searchParams.toString();
    const url = `/staff/appointments${queryString ? `?${queryString}` : ''}`;
    
    return await fetchWithAuth(url);
  },

  getBookingById: async (id) => {
    return await fetchWithAuth(`/staff/bookings/${id}`);
  },

  searchCustomerByPhone: async (phone) => {
    return await fetchWithAuth(`/staff/customers/search?phone=${encodeURIComponent(phone)}`);
  }
};
