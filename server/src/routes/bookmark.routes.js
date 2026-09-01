import { Router } from 'express';
import {
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  checkBookmark,
} from '../controllers/bookmark.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateUser);

router.post('/', addBookmark);
router.delete('/:articleId', removeBookmark);
router.get('/', getUserBookmarks);
router.get('/check/:articleId', checkBookmark);

export default router;
