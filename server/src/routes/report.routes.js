import { Router } from 'express';
import { createReport } from '../controllers/report.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticateUser);

router.post('/', createReport);

export default router;
