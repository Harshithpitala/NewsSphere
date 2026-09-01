import { Router } from 'express';
import {
  getJournalistDashboard,
  getJournalistArticles,
  getCMSArticleById,
  createCMSArticle,
  updateCMSArticle,
  submitCMSArticle,
  getEditorDashboard,
  getEditorSubmissionsQueue,
  getEditorSubmissionById,
  startArticleReview,
  approveArticle,
  rejectArticle,
  publishArticle,
  scheduleArticle,
  toggleFeaturedArticle,
  toggleBreakingArticle,
} from '../controllers/cms.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/rbac.middleware.js';
import { ROLES } from '../constants/enums.js';

const router = Router();

// All CMS endpoints require authentication
router.use(authenticateUser);

// ==================================================
// JOURNALIST CMS ROUTES (JOURNALIST, EDITOR, ADMIN)
// ==================================================
router.get(
  '/journalist/dashboard',
  authorizeRoles(ROLES.JOURNALIST, ROLES.EDITOR, ROLES.ADMIN),
  getJournalistDashboard
);

router.get(
  '/journalist/articles',
  authorizeRoles(ROLES.JOURNALIST, ROLES.EDITOR, ROLES.ADMIN),
  getJournalistArticles
);

router.get(
  '/articles/:id',
  authorizeRoles(ROLES.JOURNALIST, ROLES.EDITOR, ROLES.ADMIN),
  getCMSArticleById
);

router.post(
  '/articles',
  authorizeRoles(ROLES.JOURNALIST, ROLES.EDITOR, ROLES.ADMIN),
  createCMSArticle
);

router.put(
  '/articles/:id',
  authorizeRoles(ROLES.JOURNALIST, ROLES.EDITOR, ROLES.ADMIN),
  updateCMSArticle
);

router.post(
  '/articles/:id/submit',
  authorizeRoles(ROLES.JOURNALIST, ROLES.EDITOR, ROLES.ADMIN),
  submitCMSArticle
);

// ==================================================
// EDITOR CMS ROUTES (EDITOR, ADMIN ONLY)
// ==================================================
router.get(
  '/editor/dashboard',
  authorizeRoles(ROLES.EDITOR, ROLES.ADMIN),
  getEditorDashboard
);

router.get(
  '/editor/submissions',
  authorizeRoles(ROLES.EDITOR, ROLES.ADMIN),
  getEditorSubmissionsQueue
);

router.get(
  '/editor/submissions/:id',
  authorizeRoles(ROLES.EDITOR, ROLES.ADMIN),
  getEditorSubmissionById
);

router.post(
  '/editor/submissions/:id/review',
  authorizeRoles(ROLES.EDITOR, ROLES.ADMIN),
  startArticleReview
);

router.post(
  '/editor/submissions/:id/approve',
  authorizeRoles(ROLES.EDITOR, ROLES.ADMIN),
  approveArticle
);

router.post(
  '/editor/submissions/:id/reject',
  authorizeRoles(ROLES.EDITOR, ROLES.ADMIN),
  rejectArticle
);

router.post(
  '/editor/submissions/:id/publish',
  authorizeRoles(ROLES.EDITOR, ROLES.ADMIN),
  publishArticle
);

router.post(
  '/editor/submissions/:id/schedule',
  authorizeRoles(ROLES.EDITOR, ROLES.ADMIN),
  scheduleArticle
);

router.post(
  '/editor/submissions/:id/featured',
  authorizeRoles(ROLES.EDITOR, ROLES.ADMIN),
  toggleFeaturedArticle
);

router.post(
  '/editor/submissions/:id/breaking',
  authorizeRoles(ROLES.EDITOR, ROLES.ADMIN),
  toggleBreakingArticle
);

export default router;
