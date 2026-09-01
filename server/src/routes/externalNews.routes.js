import { Router } from 'express';
import {
  getLatestExternalNews,
  getExternalNewsByCategory,
  searchExternalNews,
} from '../controllers/externalNews.controller.js';

const router = Router();

router.get('/latest', getLatestExternalNews);
router.get('/category/:category', getExternalNewsByCategory);
router.get('/search', searchExternalNews);

export default router;
