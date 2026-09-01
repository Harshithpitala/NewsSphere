import api from './api';

export const analyticsClientService = {
  getOverview: async (params = {}) => {
    return await api.get('/admin/analytics/overview', { params });
  },

  getViewsOverTime: async (params = {}) => {
    return await api.get('/admin/analytics/views', { params });
  },

  getTopArticles: async (params = {}) => {
    return await api.get('/admin/analytics/articles', { params });
  },

  getCategoryAnalytics: async (params = {}) => {
    return await api.get('/admin/analytics/categories', { params });
  },

  getAuthorAnalytics: async (params = {}) => {
    return await api.get('/admin/analytics/authors', { params });
  },

  getSearchAnalytics: async (params = {}) => {
    return await api.get('/admin/analytics/searches', { params });
  },

  getReadingAnalytics: async () => {
    return await api.get('/admin/analytics/reading');
  },

  exportCSV: async (range = '30d') => {
    window.open(`${api.defaults.baseURL}/admin/analytics/export?range=${range}`, '_blank');
  },
};
