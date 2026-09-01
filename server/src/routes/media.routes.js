import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadMedia,
  getMediaList,
  getMediaById,
  updateMediaMetadata,
  deleteMedia,
} from '../controllers/media.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/rbac.middleware.js';
import { ROLES } from '../constants/enums.js';

const tempDir = path.join(process.cwd(), 'uploads', 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

const router = Router();

// All media endpoints require authentication (JOURNALIST, EDITOR, ADMIN)
router.use(authenticateUser);
router.use(requireRole(ROLES.JOURNALIST, ROLES.EDITOR, ROLES.ADMIN));

router.post('/', upload.array('files', 5), uploadMedia);
router.get('/', getMediaList);
router.get('/:id', getMediaById);
router.patch('/:id', updateMediaMetadata);
router.delete('/:id', deleteMedia);

export default router;
