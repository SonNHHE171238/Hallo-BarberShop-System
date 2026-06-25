import { fetchWithAuth } from './api';

export const barberService = {
  getHistoryBookings: async (params) => {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.append('date', params.date);
    if (params?.page) searchParams.append('page', params.page);
    
    const queryString = searchParams.toString();
    const url = `/bookings/barber/history${queryString ? `?${queryString}` : ''}`;
    
    return await fetchWithAuth(url);
  }
};
