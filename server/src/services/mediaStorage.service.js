import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { APIError } from '../utils/APIError.js';
import { env } from '../config/env.js';

let sharp = null;
try {
  sharp = (await import('sharp')).default;
} catch (e) {
  console.log('[Media Storage] Sharp not available, running basic image handler fallback.');
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit

export const mediaStorageService = {
  /**
   * Validate Uploaded Image Metadata & File Integrity
   */
  validateImageFile: async (file) => {
    if (!file) {
      throw new APIError(400, 'No image file uploaded');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new APIError(400, 'Unsupported image format. Allowed formats: JPEG, PNG, WebP, AVIF, GIF');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new APIError(400, 'Image exceeds the maximum allowed size of 10 MB');
    }

    let width = 800;
    let height = 600;

    if (sharp && file.path) {
      try {
        const metadata = await sharp(file.path).metadata();
        width = metadata.width || width;
        height = metadata.height || height;

        if (width < 100 || height < 100) {
          throw new APIError(400, 'Image dimensions too small. Minimum required: 100x100px');
        }

        if (width > 8000 || height > 8000) {
          throw new APIError(400, 'Image dimensions exceed maximum allowed limit of 8000x8000px');
        }
      } catch (err) {
        if (err instanceof APIError) throw err;
        // Continue if metadata reading fails on non-image payload
      }
    }

    return { width, height };
  },

  /**
   * Process & Optimize Uploaded Image (WebP Conversion + Responsive Sizes)
   */
  processAndSaveImage: async (file, user) => {
    const { width, height } = await mediaStorageService.validateImageFile(file);

    const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueId = crypto.randomBytes(8).toString('hex');
    const sanitizedBase = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const webpFilename = `${sanitizedBase}_${uniqueId}.webp`;
    const webpPath = path.join(uploadsDir, webpFilename);

    const publicUrl = `/uploads/images/${webpFilename}`;
    let responsiveUrls = {
      small: publicUrl,
      medium: publicUrl,
      large: publicUrl,
    };

    if (sharp && file.path) {
      try {
        // Convert primary image to WebP with quality 82%
        await sharp(file.path).webp({ quality: 82 }).toFile(webpPath);

        // Generate Small variant (400px width)
        const smallFilename = `${sanitizedBase}_${uniqueId}_small.webp`;
        await sharp(file.path).resize(400).webp({ quality: 80 }).toFile(path.join(uploadsDir, smallFilename));
        responsiveUrls.small = `/uploads/images/${smallFilename}`;

        // Generate Medium variant (800px width)
        const mediumFilename = `${sanitizedBase}_${uniqueId}_medium.webp`;
        await sharp(file.path).resize(800).webp({ quality: 82 }).toFile(path.join(uploadsDir, mediumFilename));
        responsiveUrls.medium = `/uploads/images/${mediumFilename}`;

        // Generate Large variant (1200px width)
        const largeFilename = `${sanitizedBase}_${uniqueId}_large.webp`;
        await sharp(file.path).resize(1200).webp({ quality: 85 }).toFile(path.join(uploadsDir, largeFilename));
        responsiveUrls.large = `/uploads/images/${largeFilename}`;

        // Clean up temporary multer upload file
        if (fs.existsSync(file.path) && file.path !== webpPath) {
          fs.unlinkSync(file.path);
        }
      } catch (err) {
        console.error('[Media Processor Error]:', err.message);
      }
    } else if (file.path && fs.existsSync(file.path)) {
      // Fallback: move uploaded file to uploadsDir if sharp is unavailable
      const destPath = path.join(uploadsDir, `${sanitizedBase}_${uniqueId}${path.extname(file.originalname)}`);
      fs.renameSync(file.path, destPath);
      const fallbackUrl = `/uploads/images/${path.basename(destPath)}`;
      return {
        originalFilename: file.originalname,
        filename: path.basename(destPath),
        url: fallbackUrl,
        provider: 'LOCAL',
        mimeType: file.mimetype,
        fileSize: file.size,
        width,
        height,
        responsiveUrls: { small: fallbackUrl, medium: fallbackUrl, large: fallbackUrl },
      };
    }

    const stats = fs.existsSync(webpPath) ? fs.statSync(webpPath) : { size: file.size };

    return {
      originalFilename: file.originalname,
      filename: webpFilename,
      url: publicUrl,
      provider: 'LOCAL',
      mimeType: 'image/webp',
      fileSize: stats.size,
      width,
      height,
      responsiveUrls,
    };
  },

  /**
   * Safely Delete Local Media Files
   */
  deleteMediaFiles: async (media) => {
    if (media.provider === 'LOCAL' && media.filename) {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'images');
      const filesToDelete = [
        path.join(uploadsDir, media.filename),
        path.join(uploadsDir, media.filename.replace('.webp', '_small.webp')),
        path.join(uploadsDir, media.filename.replace('.webp', '_medium.webp')),
        path.join(uploadsDir, media.filename.replace('.webp', '_large.webp')),
      ];

      filesToDelete.forEach((filePath) => {
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.error(`Failed to delete media file ${filePath}:`, e.message);
          }
        }
      });
    }
  },
};
