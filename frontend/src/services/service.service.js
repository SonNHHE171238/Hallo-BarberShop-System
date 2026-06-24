import { fetchWithAuth } from './api';

export const customerServiceApi = {
    getAllServices: async () => {
        return fetchWithAuth('/services', {
            method: 'GET',
        });
    }
};

export const serviceService = {
    getAllServices: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.category) queryParams.append('category', params.category);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        
        return fetchWithAuth(`/admin/services?${queryParams.toString()}`, {
            method: 'GET',
        });
    },
    createService: async (payload) => {
        return fetchWithAuth('/admin/services', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },
    updateService: async (id, payload) => {
        return fetchWithAuth(`/admin/services/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    },
    deleteService: async (id) => {
        return fetchWithAuth(`/admin/services/${id}`, {
            method: 'DELETE',
        });
    }
};
