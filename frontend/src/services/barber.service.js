import { fetchWithAuth } from './api';

export const barberService = {
  getHistoryBookings: async (params) => {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.append('date', params.date);
    if (params?.page) searchParams.append('page', params.page);
    
    const queryString = searchParams.toString();
    const url = `/bookings/barber/history${queryString ? `?${queryString}` : ''}`;
    
    return await fetchWithAuth(url);
  },
  
  getMeBarber: async () => {
    return await fetchWithAuth('/barbers/me');
  },

  updateAvailability: async (isAvailable) => {
    return await fetchWithAuth('/barbers/me/availability', {
      method: 'PUT',
      body: JSON.stringify({ isAvailable })
    });
  },

  getBookingDetail: async (id) => {
    return await fetchWithAuth(`/bookings/barber/detail/${id}`);
  },

  getMe: async () => {
    return await fetchWithAuth('/barbers/me');
  },

  updateMyProfile: async (payload) => {
    return await fetchWithAuth('/barbers/me/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  uploadGalleryImages: async (formData) => {
    return await fetchWithAuth('/barbers/me/gallery', {
      method: 'POST',
      body: formData
    });
  },

  removeGalleryImage: async (imageUrl) => {
    return await fetchWithAuth('/barbers/me/gallery', {
      method: 'DELETE',
      body: JSON.stringify({ imageUrl })
    });
  }
};
