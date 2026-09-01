import { Router } from 'express';
import {
  getAdminDashboard,
  getAdminUsers,
  getAdminUserById,
  updateUserRole,
  updateUserStatus,
  getAdminArticles,
  deleteAdminArticle,
  getAdminCategories,
  createAdminCategory,
  deleteAdminCategory,
  getAdminTags,
  createAdminTag,
  getAdminComments,
  deleteAdminComment,
  getAdminReports,
  updateAdminReportStatus,
  getAdminAuditLogs,
} from '../controllers/admin.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { ROLES } from '../constants/enums.js';

const router = Router();

// All Admin endpoints strictly enforce Authentication AND Admin Role Authorization
router.use(authenticateUser);
router.use(requireRole(ROLES.ADMIN));

// Overview Dashboard
router.get('/dashboard', getAdminDashboard);

// User Management
router.get('/users', getAdminUsers);
router.get('/users/:id', getAdminUserById);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);

// Article Moderation
router.get('/articles', getAdminArticles);
router.delete('/articles/:id', deleteAdminArticle);

// Category & Tag Management
router.get('/categories', getAdminCategories);
router.post('/categories', createAdminCategory);
router.delete('/categories/:id', deleteAdminCategory);

router.get('/tags', getAdminTags);
router.post('/tags', createAdminTag);

// Comment & Report Moderation
router.get('/comments', getAdminComments);
router.delete('/comments/:id', deleteAdminComment);

router.get('/reports', getAdminReports);
router.patch('/reports/:id', updateAdminReportStatus);

// Audit Trail Logs
router.get('/audit-logs', getAdminAuditLogs);

export default router;
