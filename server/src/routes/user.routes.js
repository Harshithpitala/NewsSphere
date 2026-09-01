import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileSchema } from '../validation/auth.validation.js';

const router = Router();

router.use(authenticateUser);

router.get('/me', getProfile);
router.put('/me', validate(updateProfileSchema), updateProfile);

export default router;
