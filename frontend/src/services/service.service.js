import { fetchWithAuth } from './api';

export const serviceService = {
  createService: async (body) => {
    return fetchWithAuth('/services', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  getAllServices: async (queryParams = {}) => {
    const queryString = new URLSearchParams(queryParams).toString();
    return fetchWithAuth(`/services${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  updateService: async (id, body) => {
    return fetchWithAuth(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  deleteService: async (id) => {
    return fetchWithAuth(`/services/${id}`, {
      method: 'DELETE',
    });
  },
};
