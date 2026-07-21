import { fetchWithAuth } from './api';

export const rosterService = {
  getAllRosters: async () => {
    return fetchWithAuth('/rosters', {
      method: 'GET',
    });
  },

  getRosterDetails: async (id) => {
    return fetchWithAuth(`/rosters/${id}`, {
      method: 'GET',
    });
  },

  createRoster: async (data) => {
    return fetchWithAuth('/rosters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateRosterStatus: async (id, status) => {
    return fetchWithAuth(`/rosters/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  adminAdjustShift: async (id, userId, registeredShifts, adjustmentNote) => {
    return fetchWithAuth(`/rosters/${id}/registrations/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ registeredShifts, adjustmentNote }),
    });
  },

  publishRoster: async (id) => {
    return fetchWithAuth(`/rosters/${id}/publish`, {
      method: 'POST',
    });
  },

  getCurrentRoster: async () => {
    return fetchWithAuth('/rosters/current/active', {
      method: 'GET',
    });
  },

  getCurrentPublishedRoster: async () => {
    return fetchWithAuth('/rosters/current/published', {
      method: 'GET',
    });
  }
};
