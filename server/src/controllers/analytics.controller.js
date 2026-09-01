import { analyticsService } from '../services/analytics.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get analytics overview metrics
// @route   GET /api/v1/admin/analytics/overview
// @access  Private (ADMIN only)
export const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const { range = '30d', from, to } = req.query;
  const overview = await analyticsService.getOverview(range, from, to);
  res.status(200).json({
    success: true,
    data: overview,
  });
});

// @desc    Get views over time chart aggregation
// @route   GET /api/v1/admin/analytics/views
// @access  Private (ADMIN only)
export const getViewsOverTime = asyncHandler(async (req, res) => {
  const { range = '30d', from, to } = req.query;
  const timeSeries = await analyticsService.getViewsOverTime(range, from, to);
  res.status(200).json({
    success: true,
    data: timeSeries,
  });
});

// @desc    Get top performing articles
// @route   GET /api/v1/admin/analytics/articles
// @access  Private (ADMIN only)
export const getTopArticles = asyncHandler(async (req, res) => {
  const { range = '30d', limit = 10 } = req.query;
  const topArticles = await analyticsService.getTopArticles(range, parseInt(limit, 10) || 10);
  res.status(200).json({
    success: true,
    data: topArticles,
  });
});

// @desc    Get category analytics
// @route   GET /api/v1/admin/analytics/categories
// @access  Private (ADMIN only)
export const getCategoryAnalytics = asyncHandler(async (req, res) => {
  const { range = '30d' } = req.query;
  const categories = await analyticsService.getCategoryPerformance(range);
  res.status(200).json({
    success: true,
    data: categories,
  });
});

// @desc    Get author performance analytics
// @route   GET /api/v1/admin/analytics/authors
// @access  Private (ADMIN only)
export const getAuthorAnalytics = asyncHandler(async (req, res) => {
  const { range = '30d' } = req.query;
  const authors = await analyticsService.getAuthorPerformance(range);
  res.status(200).json({
    success: true,
    data: authors,
  });
});

// @desc    Get search query insights
// @route   GET /api/v1/admin/analytics/searches
// @access  Private (ADMIN only)
export const getSearchAnalytics = asyncHandler(async (req, res) => {
  const { range = '30d' } = req.query;
  const searches = await analyticsService.getSearchAnalytics(range);
  res.status(200).json({
    success: true,
    data: searches,
  });
});

// @desc    Get reading behavior analytics
// @route   GET /api/v1/admin/analytics/reading
// @access  Private (ADMIN only)
export const getReadingAnalytics = asyncHandler(async (req, res) => {
  const readingStats = await analyticsService.getReadingAnalytics();
  res.status(200).json({
    success: true,
    data: readingStats,
  });
});

// @desc    Export Article Performance CSV Data Foundation
// @route   GET /api/v1/admin/analytics/export
// @access  Private (ADMIN only)
export const exportAnalyticsCSV = asyncHandler(async (req, res) => {
  const { range = '30d' } = req.query;
  const topArticles = await analyticsService.getTopArticles(range, 50);

  let csvContent = 'Article ID,Title,Category,Author,Views,Likes,Comments,Bookmarks\n';
  topArticles.forEach((art) => {
    const titleClean = `"${art.title.replace(/"/g, '""')}"`;
    const catName = `"${(art.category?.name || '').replace(/"/g, '""')}"`;
    const authorName = `"${(art.author?.name || '').replace(/"/g, '""')}"`;
    csvContent += `${art._id},${titleClean},${catName},${authorName},${art.views},${art.likesCount},${art.commentsCount},${art.bookmarksCount}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=newssphere-analytics-${range}.csv`);
  res.status(200).send(csvContent);
});
