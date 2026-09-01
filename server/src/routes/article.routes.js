import { Router } from 'express';
import {
  getArticles,
  searchArticles,
  getSearchSuggestions,
  getTrendingArticles,
  getArticleBySlug,
  getArticleById,
  getRelatedArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  toggleFeatured,
} from '../controllers/article.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { validate } from '../middlewares/validate.js';
import { createArticleSchema, updateArticleSchema } from '../validation/article.validation.js';
import { ROLES } from '../constants/enums.js';

const router = Router();

// Public routes
router.get('/', getArticles);
router.get('/search', searchArticles);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/trending', getTrendingArticles);
router.get('/slug/:slug', getArticleBySlug);
router.get('/:id', getArticleById);
router.get('/:id/related', getRelatedArticles);

// Protected routes (JOURNALIST, EDITOR, ADMIN)
router.post(
  '/',
  authenticateUser,
  requireRole(ROLES.JOURNALIST, ROLES.EDITOR, ROLES.ADMIN),
  validate(createArticleSchema),
  createArticle
);

router.put(
  '/:id',
  authenticateUser,
  requireRole(ROLES.JOURNALIST, ROLES.EDITOR, ROLES.ADMIN),
  validate(updateArticleSchema),
  updateArticle
);

router.delete(
  '/:id',
  authenticateUser,
  requireRole(ROLES.JOURNALIST, ROLES.EDITOR, ROLES.ADMIN),
  deleteArticle
);

// Editorial Publishing & Flag Controls (EDITOR, ADMIN)
router.patch(
  '/:id/publish',
  authenticateUser,
  requireRole(ROLES.EDITOR, ROLES.ADMIN),
  publishArticle
);

router.patch(
  '/:id/feature',
  authenticateUser,
  requireRole(ROLES.EDITOR, ROLES.ADMIN),
  toggleFeatured
);

export default router;
