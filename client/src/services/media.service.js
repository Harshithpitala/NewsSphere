import api from './api';

export const mediaService = {
  uploadMedia: async (formData, onUploadProgress) => {
    return await api.post('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
  },

  getMediaList: async (params = {}) => {
    return await api.get('/media', { params });
  },

  getMediaById: async (id) => {
    return await api.get(`/media/${id}`);
  },

  updateMediaMetadata: async (id, data) => {
    return await api.patch(`/media/${id}`, data);
  },

  deleteMedia: async (id) => {
    return await api.delete(`/media/${id}`);
  },
};
