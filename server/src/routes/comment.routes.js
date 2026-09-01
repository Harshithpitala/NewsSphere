import { Router } from 'express';
import {
  getArticleComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  getUserComments,
} from '../controllers/comment.controller.js';
import { authenticateUser, optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Article-scoped public & protected comment endpoints
router.get('/article/:articleId', optionalAuth, getArticleComments);
router.post('/article/:articleId', authenticateUser, createComment);

// Individual comment action endpoints
router.patch('/:commentId', authenticateUser, updateComment);
router.delete('/:commentId', authenticateUser, deleteComment);
router.post('/:commentId/like', authenticateUser, toggleCommentLike);
router.get('/my-comments', authenticateUser, getUserComments);

export default router;
