import api from './api';

export const tagService = {
  getTags: async () => {
    return await api.get('/tags');
  },
};
