import { Router } from 'express';
import {
  getAnalyticsOverview,
  getViewsOverTime,
  getTopArticles,
  getCategoryAnalytics,
  getAuthorAnalytics,
  getSearchAnalytics,
  getReadingAnalytics,
  exportAnalyticsCSV,
} from '../controllers/analytics.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { ROLES } from '../constants/enums.js';

const router = Router();

// All Analytics endpoints strictly require Authentication AND ADMIN authorization
router.use(authenticateUser);
router.use(requireRole(ROLES.ADMIN));

router.get('/overview', getAnalyticsOverview);
router.get('/views', getViewsOverTime);
router.get('/articles', getTopArticles);
router.get('/categories', getCategoryAnalytics);
router.get('/authors', getAuthorAnalytics);
router.get('/searches', getSearchAnalytics);
router.get('/reading', getReadingAnalytics);
router.get('/export', exportAnalyticsCSV);

export default router;
