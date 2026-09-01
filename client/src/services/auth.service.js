import api from './api';

export const authService = {
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  logout: async () => {
    return await api.post('/auth/logout');
  },

  getMe: async () => {
    return await api.get('/auth/me');
  },

  changePassword: async (passData) => {
    return await api.post('/auth/change-password', passData);
  },

  forgotPassword: async (data) => {
    return await api.post('/auth/forgot-password', data);
  },

  resetPassword: async (data) => {
    return await api.post('/auth/reset-password', data);
  },

  googleAuth: async (googlePayload) => {
    return await api.post('/auth/google', googlePayload);
  },

  getProfile: async () => {
    return await api.get('/users/me');
  },

  updateProfile: async (profileData) => {
    return await api.put('/users/me', profileData);
  },
};
