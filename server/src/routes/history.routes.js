import { Router } from 'express';
import {
  trackReadingProgress,
  getUserHistory,
  deleteHistoryEntry,
} from '../controllers/history.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateUser);

router.post('/track', trackReadingProgress);
router.get('/', getUserHistory);
router.delete('/:articleId', deleteHistoryEntry);

export default router;
