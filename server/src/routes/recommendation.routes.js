import { Router } from 'express';
import {
  getRecommendations,
  getUserPreferences,
  updateUserPreferences,
  dismissRecommendation,
} from '../controllers/recommendation.controller.js';
import { optionalAuth, authenticateUser } from '../middlewares/auth.middleware.js';

const router = Router();

// Recommendation feed (Strictly uses req.user._id if authenticated, never accepts arbitrary userId)
router.get('/', optionalAuth, getRecommendations);

// User Personalization Settings & Interacted Interests
router.get('/preferences', authenticateUser, getUserPreferences);
router.put('/preferences', authenticateUser, updateUserPreferences);
router.post('/dismiss/:articleId', authenticateUser, dismissRecommendation);

export default router;
