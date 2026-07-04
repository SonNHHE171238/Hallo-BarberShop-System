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

    deactivateAdminBarber: async (barberId, action) => {
        return fetchWithAuth(`/admin/barbers/${barberId}/deactivate`, {
            method: 'PATCH',
            body: JSON.stringify({ action }),
        });
    },

    getUpcomingBookings: async (barberId) => {
        return fetchWithAuth(`/admin/barbers/${barberId}/upcoming-bookings?t=${Date.now()}`, {
            method: 'GET',
        });
    },

    activateAdminBarber: async (barberId) => {
        return fetchWithAuth(`/admin/barbers/${barberId}/activate`, {
            method: 'PATCH',
        });
    },
};

export const adminDashboardService = {
    getMetrics: async () => {
        return fetchWithAuth('/bookings/admin/metrics', { method: 'GET' });
    },
    getTopBarbers: async () => {
        return fetchWithAuth('/bookings/admin/top-barbers', { method: 'GET' });
    },
    getChartStats: async (from, to, mode = 'day') => {
        let url = '/bookings/chart-stats?mode=' + mode;
        if (from) url += '&from=' + from;
        if (to) url += '&to=' + to;
        return fetchWithAuth(url, { method: 'GET' });
    },
    getRecentAppointments: async () => {
        return fetchWithAuth('/bookings/all?limit=5', { method: 'GET' });
    }
};
