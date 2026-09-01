import { Router } from 'express';
import {
  toggleReaction,
  removeReaction,
  getArticleReactions,
  getUserLikedArticles,
} from '../controllers/reaction.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = Router();

// Public route to view reaction stats
router.get('/article/:articleId', (req, res, next) => {
  // Optional auth to attach user state
  authenticateUser(req, res, () => {
    getArticleReactions(req, res, next);
  });
});

// Protected routes
router.post('/', authenticateUser, toggleReaction);
router.delete('/:articleId', authenticateUser, removeReaction);
router.get('/my-likes', authenticateUser, getUserLikedArticles);

export default router;
