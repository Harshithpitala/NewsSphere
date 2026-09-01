import api from './api';

export const historyService = {
  trackProgress: async ({ articleId, progressPercentage, readingTimeSeconds }) => {
    return await api.post('/history/track', { articleId, progressPercentage, readingTimeSeconds });
  },

  getUserHistory: async (params = {}) => {
    return await api.get('/history', { params });
  },

  deleteHistoryEntry: async (articleId) => {
    return await api.delete(`/history/${articleId}`);
  },
};
