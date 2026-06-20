import { fetchWithAuth } from './api';

export const adminBarberService = {
    getAllAdminBarbers: async () => {
        return fetchWithAuth('/admin/barbers', {
            method: 'GET',
        });
    },

    createAdminBarber: async (body) => {
        return fetchWithAuth('/admin/barbers/create', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    updateAdminBarber: async (barberId, body) => {
        return fetchWithAuth(`/admin/barbers/${barberId}`, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },

    deactivateAdminBarber: async (barberId) => {
        return fetchWithAuth(`/admin/barbers/${barberId}/deactivate`, {
            method: 'PATCH',
        });
    },

    activateAdminBarber: async (barberId) => {
        return fetchWithAuth(`/admin/barbers/${barberId}/activate`, {
            method: 'PATCH',
        });
    },
};
