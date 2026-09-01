import { z } from 'zod';

export const summarySchema = z.object({
  summary: z.string().min(10),
  bulletPoints: z.array(z.string()).min(1),
});

export const keyPointsSchema = z.object({
  keyPoints: z.array(z.string()).min(1),
});

export const explainSimplySchema = z.object({
  simpleExplanation: z.string().min(10),
});

export const headlinesSchema = z.object({
  headlines: z.array(z.string()).min(1),
});

export const categorySuggestionsSchema = z.object({
  suggestedCategoryIds: z.array(z.string()),
  reasoning: z.string().optional(),
});

export const tagSuggestionsSchema = z.object({
  suggestedTagIds: z.array(z.string()),
});
