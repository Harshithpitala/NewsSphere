import { Router } from 'express';
import {
  summarizeArticle,
  extractKeyPoints,
  explainSimply,
  suggestHeadlines,
  suggestCategory,
  suggestTags,
  findSimilarArticles,
} from '../controllers/ai.controller.js';
import { optionalAuth, authenticateUser } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { ROLES } from '../constants/enums.js';

const router = Router();

// Reader AI Endpoints (Public with optional auth)
router.post('/articles/:articleId/summarize', optionalAuth, summarizeArticle);
router.post('/articles/:articleId/key-points', optionalAuth, extractKeyPoints);
router.post('/articles/:articleId/explain-simply', optionalAuth, explainSimply);

// Editorial AI Endpoints (Strictly require JOURNALIST, EDITOR, or ADMIN role)
router.post(
  '/articles/:articleId/headlines',
  authenticateUser,
  requireRole(ROLES.JOURNALIST, ROLES.EDITOR, ROLES.ADMIN),
  suggestHeadlines
);

router.post(
  '/articles/:articleId/category-suggestions',
  authenticateUser,
  requireRole(ROLES.JOURNALIST, ROLES.EDITOR, ROLES.ADMIN),
  suggestCategory
);

router.post(
  '/articles/:articleId/tag-suggestions',
  authenticateUser,
  requireRole(ROLES.JOURNALIST, ROLES.EDITOR, ROLES.ADMIN),
  suggestTags
);

router.post(
  '/articles/:articleId/similar',
  authenticateUser,
  requireRole(ROLES.JOURNALIST, ROLES.EDITOR, ROLES.ADMIN),
  findSimilarArticles
);

export default router;
