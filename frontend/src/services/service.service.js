import axios from 'axios';
import { fetchWithAuth } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
        
        return fetchWithAuth(`/services?${queryParams.toString()}`, {
            method: 'GET',
        });
    },
    createService: async (payload) => {
        if (payload instanceof FormData) {
            const res = await axios.post(`${API_URL}/services`, payload, { withCredentials: true });
            return res.data;
        }
        return fetchWithAuth('/services', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },
    updateService: async (id, payload) => {
        if (payload instanceof FormData) {
            const res = await axios.put(`${API_URL}/services/${id}`, payload, { withCredentials: true });
            return res.data;
        }
        return fetchWithAuth(`/services/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    },
    deleteService: async (id) => {
        return fetchWithAuth(`/services/${id}`, {
            method: 'DELETE',
        });
    }
};
