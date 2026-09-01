import api from './api';

export const externalNewsService = {
  getLatestExternalNews: async (params = {}) => {
    return await api.get('/external-news/latest', { params });
  },

  getExternalNewsByCategory: async (category, params = {}) => {
    return await api.get(`/external-news/category/${category}`, { params });
  },

  searchExternalNews: async (query, params = {}) => {
    return await api.get('/external-news/search', { params: { q: query, ...params } });
  },
};
