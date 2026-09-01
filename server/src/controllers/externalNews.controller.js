import { asyncHandler } from '../utils/asyncHandler.js';
import { fetchExternalLatestNews } from '../services/news/externalNews.service.js';

// @desc    Get normalized external news stories
// @route   GET /api/v1/external-news/latest
// @access  Public
export const getLatestExternalNews = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const { category, q } = req.query;

  const result = await fetchExternalLatestNews({ page, limit, category, query: q });

  res.status(200).json(result);
});

// @desc    Get normalized external news by category
// @route   GET /api/v1/external-news/category/:category
// @access  Public
export const getExternalNewsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const result = await fetchExternalLatestNews({ page, limit, category });

  res.status(200).json(result);
});

// @desc    Search external news articles
// @route   GET /api/v1/external-news/search
// @access  Public
export const searchExternalNews = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const result = await fetchExternalLatestNews({ page, limit, query: q });

  res.status(200).json(result);
});
