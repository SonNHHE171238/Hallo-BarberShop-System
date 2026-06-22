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
  
  updateCheckIn: async (bookingId, isCheckedIn) => {
    return await fetchWithAuth(`/staff/dashboard/bookings/${bookingId}/checkin`, {
      method: 'PUT',
      body: JSON.stringify({ isCheckedIn })
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

  searchCustomerByPhone: async (phone) => {
    return await fetchWithAuth(`/staff/customers/search?phone=${encodeURIComponent(phone)}`);
  }
};
