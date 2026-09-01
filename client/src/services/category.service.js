import api from './api';

export const categoryService = {
  getCategories: async () => {
    return await api.get('/categories');
  },

  getCategoryBySlug: async (slug) => {
    return await api.get(`/categories/${slug}`);
  },
};
