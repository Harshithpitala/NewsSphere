import api from './api';

export const reactionService = {
  toggleReaction: async (articleId, type = 'like') => {
    return await api.post('/reactions', { articleId, type });
  },

  removeReaction: async (articleId) => {
    return await api.delete(`/reactions/${articleId}`);
  },

  getArticleReactions: async (articleId) => {
    return await api.get(`/reactions/article/${articleId}`);
  },

  getUserLikedArticles: async (params = {}) => {
    return await api.get('/reactions/my-likes', { params });
  },
};
