import { Article } from '../../models/Article.js';
import { Category } from '../../models/Category.js';
import { Tag } from '../../models/Tag.js';
import { geminiProvider } from './providers/geminiProvider.js';
import { prompts } from './prompts.js';
import {
  summarySchema,
  keyPointsSchema,
  explainSimplySchema,
  headlinesSchema,
  categorySuggestionsSchema,
  tagSuggestionsSchema,
} from './schemas.js';
import { analyticsService } from '../analytics.service.js';
import { APIError } from '../../utils/APIError.js';

export const aiService = {
  /**
   * Summarize Article (Reader Tool)
   */
  summarizeArticle: async (articleId, userId = null) => {
    const article = await Article.findById(articleId);
    if (!article) throw new APIError(404, 'Article not found');

    // Check if valid cached summary exists
    if (article.aiMetadata?.aiSummary && article.aiMetadata.aiSummary.length > 20) {
      analyticsService.logEvent({
        event: 'ARTICLE_READ',
        userId,
        articleId,
        metadata: { tool: 'AI_SUMMARY_CACHED' },
      });
      return {
        summary: article.aiMetadata.aiSummary,
        bulletPoints: article.aiMetadata.aiKeyPoints?.length
          ? article.aiMetadata.aiKeyPoints
          : [article.aiMetadata.aiSummary],
        cached: true,
      };
    }

    const promptText = prompts.summarizeArticle(article.title, article.content);
    const rawResult = await geminiProvider.generateContent(promptText);

    // Validate Schema
    let parsedResult;
    try {
      parsedResult = summarySchema.parse(rawResult);
    } catch (err) {
      parsedResult = {
        summary: `Summary of "${article.title}": ${article.summary || article.content.slice(0, 200)}...`,
        bulletPoints: [article.title, article.subtitle || 'Main news event overview.'],
      };
    }

    // Cache summary into Article document
    article.aiMetadata = {
      ...article.aiMetadata,
      aiSummary: parsedResult.summary,
      aiKeyPoints: parsedResult.bulletPoints,
    };
    await article.save();

    analyticsService.logEvent({
      event: 'ARTICLE_READ',
      userId,
      articleId,
      metadata: { tool: 'AI_SUMMARY' },
    });

    return { ...parsedResult, cached: false };
  },

  /**
   * Extract Key Points (Reader Tool)
   */
  extractKeyPoints: async (articleId, userId = null) => {
    const article = await Article.findById(articleId);
    if (!article) throw new APIError(404, 'Article not found');

    if (article.aiMetadata?.aiKeyPoints && article.aiMetadata.aiKeyPoints.length > 0) {
      return { keyPoints: article.aiMetadata.aiKeyPoints, cached: true };
    }

    const promptText = prompts.extractKeyPoints(article.title, article.content);
    const rawResult = await geminiProvider.generateContent(promptText);

    let parsedResult;
    try {
      parsedResult = keyPointsSchema.parse(rawResult);
    } catch (err) {
      parsedResult = {
        keyPoints: [
          `Major announcement regarding "${article.title}".`,
          `Category focus: ${article.category?.name || 'General News'}.`,
        ],
      };
    }

    article.aiMetadata = {
      ...article.aiMetadata,
      aiKeyPoints: parsedResult.keyPoints,
    };
    await article.save();

    return { ...parsedResult, cached: false };
  },

  /**
   * Explain Simply (Reader Tool)
   */
  explainSimply: async (articleId, userId = null) => {
    const article = await Article.findById(articleId);
    if (!article) throw new APIError(404, 'Article not found');

    if (article.aiMetadata?.aiExplainSimply && article.aiMetadata.aiExplainSimply.length > 10) {
      return { simpleExplanation: article.aiMetadata.aiExplainSimply, cached: true };
    }

    const promptText = prompts.explainSimply(article.title, article.content);
    const rawResult = await geminiProvider.generateContent(promptText);

    let parsedResult;
    try {
      parsedResult = explainSimplySchema.parse(rawResult);
    } catch (err) {
      parsedResult = {
        simpleExplanation: `In simple terms, this story is about ${article.title}. It explains what happened and why it matters to everyday readers.`,
      };
    }

    article.aiMetadata = {
      ...article.aiMetadata,
      aiExplainSimply: parsedResult.simpleExplanation,
    };
    await article.save();

    return { ...parsedResult, cached: false };
  },

  /**
   * Headline Suggestions (Editorial Tool)
   */
  suggestHeadlines: async (articleId, userId = null) => {
    const article = await Article.findById(articleId);
    if (!article) throw new APIError(404, 'Article not found');

    const promptText = prompts.suggestHeadlines(article.title, article.content);
    const rawResult = await geminiProvider.generateContent(promptText);

    let parsedResult;
    try {
      parsedResult = headlinesSchema.parse(rawResult);
    } catch (err) {
      parsedResult = {
        headlines: [
          `Analysis: ${article.title}`,
          `Breaking News: ${article.title}`,
          `Update on ${article.title}`,
          `Key Takeaways: ${article.title}`,
        ],
      };
    }

    return parsedResult;
  },

  /**
   * Category Suggestions (Editorial Tool)
   */
  suggestCategory: async (articleId, userId = null) => {
    const article = await Article.findById(articleId);
    if (!article) throw new APIError(404, 'Article not found');

    const availableCategories = await Category.find().select('name slug').lean();
    const promptText = prompts.suggestCategory(article.title, article.content, availableCategories);
    const rawResult = await geminiProvider.generateContent(promptText);

    let parsedResult;
    try {
      parsedResult = categorySuggestionsSchema.parse(rawResult);
    } catch (err) {
      parsedResult = { suggestedCategoryIds: [article.category?.toString()].filter(Boolean) };
    }

    // Filter to ensure suggested category IDs exist in DB
    const validCategoryDocs = await Category.find({
      $or: [
        { _id: { $in: parsedResult.suggestedCategoryIds.filter((id) => id.match(/^[0-9a-fA-F]{24}$/)) } },
        { name: { $regex: article.title.split(' ')[0], $options: 'i' } },
      ],
    }).select('name slug').lean();

    return { suggestions: validCategoryDocs };
  },

  /**
   * Tag Suggestions (Editorial Tool)
   */
  suggestTags: async (articleId, userId = null) => {
    const article = await Article.findById(articleId);
    if (!article) throw new APIError(404, 'Article not found');

    const availableTags = await Tag.find().select('name slug').limit(20).lean();
    const promptText = prompts.suggestTags(article.title, article.content, availableTags);
    const rawResult = await geminiProvider.generateContent(promptText);

    let parsedResult;
    try {
      parsedResult = tagSuggestionsSchema.parse(rawResult);
    } catch (err) {
      parsedResult = { suggestedTagIds: [] };
    }

    const validTagDocs = await Tag.find({
      _id: { $in: parsedResult.suggestedTagIds.filter((id) => id.match(/^[0-9a-fA-F]{24}$/)) },
    }).select('name slug').lean();

    return { suggestions: validTagDocs.length > 0 ? validTagDocs : availableTags.slice(0, 4) };
  },

  /**
   * Similar Article Detection (Editorial Tool)
   */
  findSimilarArticles: async (articleId) => {
    const article = await Article.findById(articleId);
    if (!article) throw new APIError(404, 'Article not found');

    // Title keyword extraction
    const keywords = article.title
      .replace(/[^\w\s]/gi, '')
      .split(' ')
      .filter((w) => w.length > 3)
      .slice(0, 3);

    const regexPattern = keywords.join('|');

    const similarArticles = await Article.find({
      _id: { $ne: articleId },
      status: 'PUBLISHED',
      $or: [
        { category: article.category },
        { title: { $regex: regexPattern, $options: 'i' } },
      ],
    })
      .select('title slug category publishedAt coverImage')
      .populate('category', 'name slug')
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean();

    return { similarArticles };
  },
};
