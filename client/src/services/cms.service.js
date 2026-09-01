import api from './api';

export const cmsService = {
  // Journalist Endpoints
  getJournalistDashboard: async () => {
    return await api.get('/cms/journalist/dashboard');
  },

  getJournalistArticles: async (params = {}) => {
    return await api.get('/cms/journalist/articles', { params });
  },

  getArticleById: async (id) => {
    return await api.get(`/cms/articles/${id}`);
  },

  createArticle: async (data) => {
    return await api.post('/cms/articles', data);
  },

  updateArticle: async (id, data) => {
    return await api.put(`/cms/articles/${id}`, data);
  },

  submitArticle: async (id) => {
    return await api.post(`/cms/articles/${id}/submit`);
  },

  // Editor Endpoints
  getEditorDashboard: async () => {
    return await api.get('/cms/editor/dashboard');
  },

  getEditorSubmissions: async (params = {}) => {
    return await api.get('/cms/editor/submissions', { params });
  },

  getEditorSubmissionById: async (id) => {
    return await api.get(`/cms/editor/submissions/${id}`);
  },

  startReview: async (id) => {
    return await api.post(`/cms/editor/submissions/${id}/review`);
  },

  approveArticle: async (id) => {
    return await api.post(`/cms/editor/submissions/${id}/approve`);
  },

  rejectArticle: async (id, rejectionReason) => {
    return await api.post(`/cms/editor/submissions/${id}/reject`, { rejectionReason });
  },

  publishArticle: async (id) => {
    return await api.post(`/cms/editor/submissions/${id}/publish`);
  },

  scheduleArticle: async (id, scheduledPublishAt) => {
    return await api.post(`/cms/editor/submissions/${id}/schedule`, { scheduledPublishAt });
  },

  toggleFeatured: async (id) => {
    return await api.post(`/cms/editor/submissions/${id}/featured`);
  },

  toggleBreaking: async (id) => {
    return await api.post(`/cms/editor/submissions/${id}/breaking`);
  },
};
