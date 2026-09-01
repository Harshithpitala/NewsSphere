import api from './api';

export const articleService = {
  getArticles: async (params = {}) => {
    return await api.get('/articles', { params });
  },

  searchArticles: async (params = {}) => {
    return await api.get('/articles/search', { params });
  },

  getSearchSuggestions: async (query) => {
    return await api.get('/articles/search/suggestions', { params: { q: query } });
  },

  getTrendingArticles: async (params = {}) => {
    return await api.get('/articles/trending', { params });
  },

  getArticleBySlug: async (slug) => {
    return await api.get(`/articles/slug/${slug}`);
  },

  getArticleById: async (id) => {
    return await api.get(`/articles/${id}`);
  },

  getRelatedArticles: async (id) => {
    return await api.get(`/articles/${id}/related`);
  },

  createArticle: async (articleData) => {
    return await api.post('/articles', articleData);
  },

  updateArticle: async (id, articleData) => {
    return await api.put(`/articles/${id}`, articleData);
  },

  deleteArticle: async (id) => {
    return await api.delete(`/articles/${id}`);
  },

  publishArticle: async (id) => {
    return await api.patch(`/articles/${id}/publish`);
  },

  toggleFeatured: async (id, flags) => {
    return await api.patch(`/articles/${id}/feature`, flags);
  },
};
