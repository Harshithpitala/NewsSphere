import api from './api';

export const bookmarkService = {
  addBookmark: async (articleId) => {
    return await api.post('/bookmarks', { articleId });
  },

  removeBookmark: async (articleId) => {
    return await api.delete(`/bookmarks/${articleId}`);
  },

  getUserBookmarks: async (params = {}) => {
    return await api.get('/bookmarks', { params });
  },

  checkBookmark: async (articleId) => {
    return await api.get(`/bookmarks/check/${articleId}`);
  },
};
