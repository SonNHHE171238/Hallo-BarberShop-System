import { fetchWithAuth } from './api';

export const absenceService = {
  createRequest: async (data) => {
    return fetchWithAuth('/absences/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyRequests: async (status = '') => {
    const url = status ? `/absences?status=${status}` : '/absences';
    return fetchWithAuth(url, {
      method: 'GET',
    });
  },

  // Dành cho admin/staff
  approveAbsence: async (absenceId) => {
    return fetchWithAuth(`/absences/${absenceId}/approve`, {
      method: 'PUT',
    });
  },

  rejectAbsence: async (absenceId) => {
    return fetchWithAuth(`/absences/${absenceId}/reject`, {
      method: 'PUT',
    });
  },

  resolveBooking: async (absenceId, affectedBookingId, data) => {
    return fetchWithAuth(`/absences/${absenceId}/resolve/${affectedBookingId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
};
