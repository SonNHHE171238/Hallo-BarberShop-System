import { fetchWithAuth } from './api';

export const barberService = {
  getMeBarber: async () => {
    return fetchWithAuth('/barbers/me', {
      method: 'GET',
    });
  },

  updateAvailability: async (isAvailable) => {
    return fetchWithAuth('/barbers/me/availability', {
      method: 'PUT',
      body: JSON.stringify({ isAvailable }),
    });
  }
};
