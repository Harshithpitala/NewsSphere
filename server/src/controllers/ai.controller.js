import { aiService } from '../services/ai/aiService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Summarize article (Reader AI Tool)
// @route   POST /api/v1/ai/articles/:articleId/summarize
// @access  Public / Optional Auth
export const summarizeArticle = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const result = await aiService.summarizeArticle(articleId, req.user?._id);
  res.status(200).json({
    success: true,
    data: result,
  });
});

// @desc    Extract key points (Reader AI Tool)
// @route   POST /api/v1/ai/articles/:articleId/key-points
// @access  Public / Optional Auth
export const extractKeyPoints = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const result = await aiService.extractKeyPoints(articleId, req.user?._id);
  res.status(200).json({
    success: true,
    data: result,
  });
});

// @desc    Explain Simply (Reader AI Tool)
// @route   POST /api/v1/ai/articles/:articleId/explain-simply
// @access  Public / Optional Auth
export const explainSimply = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const result = await aiService.explainSimply(articleId, req.user?._id);
  res.status(200).json({
    success: true,
    data: result,
  });
});

// @desc    Suggest alternative headlines (Editorial Tool)
// @route   POST /api/v1/ai/articles/:articleId/headlines
// @access  Private (JOURNALIST, EDITOR, ADMIN)
export const suggestHeadlines = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const result = await aiService.suggestHeadlines(articleId, req.user?._id);
  res.status(200).json({
    success: true,
    data: result,
  });
});

// @desc    Suggest category (Editorial Tool)
// @route   POST /api/v1/ai/articles/:articleId/category-suggestions
// @access  Private (JOURNALIST, EDITOR, ADMIN)
export const suggestCategory = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const result = await aiService.suggestCategory(articleId, req.user?._id);
  res.status(200).json({
    success: true,
    data: result,
  });
});

// @desc    Suggest tags (Editorial Tool)
// @route   POST /api/v1/ai/articles/:articleId/tag-suggestions
// @access  Private (JOURNALIST, EDITOR, ADMIN)
export const suggestTags = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const result = await aiService.suggestTags(articleId, req.user?._id);
  res.status(200).json({
    success: true,
    data: result,
  });
});

// @desc    Find similar published stories (Editorial Tool)
// @route   POST /api/v1/ai/articles/:articleId/similar
// @access  Private (JOURNALIST, EDITOR, ADMIN)
export const findSimilarArticles = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const result = await aiService.findSimilarArticles(articleId);
  res.status(200).json({
    success: true,
    data: result,
  });
});
