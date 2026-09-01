import api from './api';

export const reportService = {
  createReport: async ({ targetType, targetId, reason, details }) => {
    return await api.post('/reports', { targetType, targetId, reason, details });
  },
};
