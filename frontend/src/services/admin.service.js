import { fetchWithAuth, API_BASE_URL } from './api';

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

    exportBarbers: async () => {
        const url = `${API_BASE_URL}/admin/barbers/export`;
        const resp = await fetch(url, { method: 'GET', credentials: 'include' });
        if (!resp.ok) {
            const txt = await resp.text();
            throw new Error(txt || 'Không thể xuất file.');
        }
        const blob = await resp.blob();
        return blob;
    },

    exportBarbersXLSX: async () => {
        const url = `${API_BASE_URL}/admin/barbers/export/xlsx`;
        const resp = await fetch(url, { method: 'GET', credentials: 'include' });
        if (!resp.ok) {
            const txt = await resp.text();
            throw new Error(txt || 'Không thể xuất file.');
        }
        const blob = await resp.blob();
        return blob;
    },
};
