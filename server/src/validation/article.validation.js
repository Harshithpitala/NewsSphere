import { z } from 'zod';
import { ARTICLE_STATUS } from '../constants/enums.js';

export const createArticleSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  subtitle: z.string().max(300, 'Subtitle cannot exceed 300 characters').optional(),
  content: z.string().min(10, 'Article content must be at least 10 characters'),
  summary: z.string().max(1000, 'Summary cannot exceed 1000 characters').optional(),
  category: z.string().min(1, 'Category ID is required'),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().optional(),
  status: z.enum(Object.values(ARTICLE_STATUS)).optional(),
  isFeatured: z.boolean().optional(),
  isBreaking: z.boolean().optional(),
  scheduledPublishAt: z.string().datetime().optional().nullable(),
});

export const updateArticleSchema = createArticleSchema.partial();
