import { fetchWithAuth } from './api';

export const authService = {
  login: async (email, password) => {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  loginWithGoogle: async (accessToken) => {
    return fetchWithAuth('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    });
  },

  register: async (name, email, phone, password) => {
    return fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    });
  },

  verifyOtp: async (email, otp) => {
    return fetchWithAuth('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  resendOtp: async (email) => {
    return fetchWithAuth('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  forgotPassword: async (email) => {
    return fetchWithAuth('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (userId, token, newPassword) => {
    return fetchWithAuth('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ userId, token, newPassword }),
    });
  },

  logout: async () => {
    return fetchWithAuth('/auth/logout', {
      method: 'POST',
    });
  },

  getMe: async () => {
    return fetchWithAuth('/auth/me', {
      method: 'GET',
    });
  },

  changePassword: async (currentPassword, newPassword) => {
    return fetchWithAuth('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  updateProfile: async (data) => {
    return fetchWithAuth('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
};
