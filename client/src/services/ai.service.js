import api from './api';

export const aiClientService = {
  summarizeArticle: async (articleId) => {
    return await api.post(`/ai/articles/${articleId}/summarize`);
  },

  extractKeyPoints: async (articleId) => {
    return await api.post(`/ai/articles/${articleId}/key-points`);
  },

  explainSimply: async (articleId) => {
    return await api.post(`/ai/articles/${articleId}/explain-simply`);
  },

  suggestHeadlines: async (articleId) => {
    return await api.post(`/ai/articles/${articleId}/headlines`);
  },

  suggestCategory: async (articleId) => {
    return await api.post(`/ai/articles/${articleId}/category-suggestions`);
  },

  suggestTags: async (articleId) => {
    return await api.post(`/ai/articles/${articleId}/tag-suggestions`);
  },

  findSimilarArticles: async (articleId) => {
    return await api.post(`/ai/articles/${articleId}/similar`);
  },
};
