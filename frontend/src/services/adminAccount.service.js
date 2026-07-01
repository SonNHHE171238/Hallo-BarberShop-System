import { fetchWithAuth } from './api';

export const adminAccountService = {
    getAllAccounts: async () => {
        return fetchWithAuth('/admin/accounts', {
            method: 'GET',
        });
    },

    createAccount: async (body) => {
        return fetchWithAuth('/admin/accounts', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    updateAccount: async (accountId, data) => {
        return fetchWithAuth(`/admin/accounts/${accountId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deleteAccount: async (accountId) => {
        return fetchWithAuth(`/admin/accounts/${accountId}`, {
            method: 'DELETE',
        });
    },
};
