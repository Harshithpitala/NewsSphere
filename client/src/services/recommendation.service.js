import api from './api';

export const recommendationClientService = {
  getRecommendations: async (params = {}) => {
    return await api.get('/recommendations', { params });
  },

  getUserPreferences: async () => {
    return await api.get('/recommendations/preferences');
  },

  updateUserPreferences: async (data) => {
    return await api.put('/recommendations/preferences', data);
  },

  dismissRecommendation: async (articleId) => {
    return await api.post(`/recommendations/dismiss/${articleId}`);
  },
};
