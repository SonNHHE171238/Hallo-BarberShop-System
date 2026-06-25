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

    deleteAccount: async (accountId) => {
        return fetchWithAuth(`/admin/accounts/${accountId}`, {
            method: 'DELETE',
        });
    },
};
