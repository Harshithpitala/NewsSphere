import api from './api';

export const adminService = {
  // Dashboard Overview
  getDashboard: async () => {
    return await api.get('/admin/dashboard');
  },

  // User Management
  getUsers: async (params = {}) => {
    return await api.get('/admin/users', { params });
  },

  getUserById: async (id) => {
    return await api.get(`/admin/users/${id}`);
  },

  updateUserRole: async (id, role) => {
    return await api.patch(`/admin/users/${id}/role`, { role });
  },

  updateUserStatus: async (id, isSuspended) => {
    return await api.patch(`/admin/users/${id}/status`, { isSuspended });
  },

  // Article Moderation
  getArticles: async (params = {}) => {
    return await api.get('/admin/articles', { params });
  },

  deleteArticle: async (id) => {
    return await api.delete(`/admin/articles/${id}`);
  },

  // Categories & Tags
  getCategories: async () => {
    return await api.get('/admin/categories');
  },

  createCategory: async (data) => {
    return await api.post('/admin/categories', data);
  },

  deleteCategory: async (id) => {
    return await api.delete(`/admin/categories/${id}`);
  },

  getTags: async () => {
    return await api.get('/admin/tags');
  },

  createTag: async (data) => {
    return await api.post('/admin/tags', data);
  },

  // Comment Moderation
  getComments: async (params = {}) => {
    return await api.get('/admin/comments', { params });
  },

  deleteComment: async (id) => {
    return await api.delete(`/admin/comments/${id}`);
  },

  // Report Moderation
  getReports: async (params = {}) => {
    return await api.get('/admin/reports', { params });
  },

  updateReportStatus: async (id, status) => {
    return await api.patch(`/admin/reports/${id}`, { status });
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    return await api.get('/admin/audit-logs', { params });
  },
};
