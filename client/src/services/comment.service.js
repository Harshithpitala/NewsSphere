import api from './api';

export const commentService = {
  getArticleComments: async (articleId, params = {}) => {
    return await api.get(`/comments/article/${articleId}`, { params });
  },

  createComment: async (articleId, { content, parentComment }) => {
    return await api.post(`/comments/article/${articleId}`, { content, parentComment });
  },

  updateComment: async (commentId, content) => {
    return await api.patch(`/comments/${commentId}`, { content });
  },

  deleteComment: async (commentId) => {
    return await api.delete(`/comments/${commentId}`);
  },

  toggleCommentLike: async (commentId) => {
    return await api.post(`/comments/${commentId}/like`);
  },

  getUserComments: async (params = {}) => {
    return await api.get('/comments/my-comments', { params });
  },
};
