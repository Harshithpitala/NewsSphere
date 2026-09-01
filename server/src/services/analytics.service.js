import { AnalyticsLog } from '../models/AnalyticsLog.js';
import { Article } from '../models/Article.js';
import { User } from '../models/User.js';
import { Comment } from '../models/Comment.js';
import { Reaction } from '../models/Reaction.js';
import { Bookmark } from '../models/Bookmark.js';
import { ReadingHistory } from '../models/ReadingHistory.js';
import { Category } from '../models/Category.js';

export const analyticsService = {
  /**
   * Helper to safely log analytics event
   */
  logEvent: async ({
    event,
    userId = null,
    articleId = null,
    categoryId = null,
    authorId = null,
    searchQuery = '',
    durationSeconds = 0,
    metadata = {},
  }) => {
    try {
      await AnalyticsLog.create({
        event,
        user: userId,
        article: articleId,
        category: categoryId,
        author: authorId,
        searchQuery: searchQuery.trim().toLowerCase(),
        durationSeconds,
        metadata,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('[Analytics Event Logging Error]:', err.message);
    }
  },

  /**
   * Calculate Date Range Filter Bounds
   */
  getDateBounds: (range = '30d', customStart = null, customEnd = null) => {
    const end = customEnd ? new Date(customEnd) : new Date();
    let start = new Date();

    switch (range) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
      case 'custom':
        if (customStart) start = new Date(customStart);
        else start.setDate(end.getDate() - 30);
        break;
      case '30d':
      default:
        start.setDate(end.getDate() - 30);
        break;
    }

    return { start, end };
  },

  /**
   * Overview Metrics
   */
  getOverview: async (range, customStart, customEnd) => {
    const { start, end } = analyticsService.getDateBounds(range, customStart, customEnd);
    const dateMatch = { timestamp: { $gte: start, $lte: end } };

    const [
      totalViews,
      totalReactions,
      totalBookmarks,
      totalComments,
      publishedArticlesCount,
      totalUsersCount,
    ] = await Promise.all([
      AnalyticsLog.countDocuments({ ...dateMatch, event: 'ARTICLE_VIEW' }),
      Reaction.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Bookmark.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Comment.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Article.countDocuments({ status: 'PUBLISHED' }),
      User.countDocuments(),
    ]);

    const totalInteractions = totalReactions + totalComments + totalBookmarks;
    // Formula: (Reactions + Comments + Bookmarks) / Views
    const engagementRate = totalViews > 0 ? Number(((totalInteractions / totalViews) * 100).toFixed(2)) : 0;

    return {
      dateRange: { start, end },
      totalViews,
      totalReactions,
      totalBookmarks,
      totalComments,
      publishedArticlesCount,
      totalUsersCount,
      engagementRate, // Percentage
    };
  },

  /**
   * Views Over Time Aggregation
   */
  getViewsOverTime: async (range, customStart, customEnd) => {
    const { start, end } = analyticsService.getDateBounds(range, customStart, customEnd);

    const timeSeries = await AnalyticsLog.aggregate([
      {
        $match: {
          event: 'ARTICLE_VIEW',
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          views: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return timeSeries.map((item) => ({ date: item._id, views: item.views }));
  },

  /**
   * Top Articles Aggregation
   */
  getTopArticles: async (range, limit = 10) => {
    const { start, end } = analyticsService.getDateBounds(range);

    const topArticlesAgg = await AnalyticsLog.aggregate([
      {
        $match: {
          event: 'ARTICLE_VIEW',
          article: { $ne: null },
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$article',
          viewsCount: { $sum: 1 },
        },
      },
      { $sort: { viewsCount: -1 } },
      { $limit: limit },
    ]);

    const articleIds = topArticlesAgg.map((item) => item._id);
    const articles = await Article.find({ _id: { $in: articleIds } })
      .populate('author', 'name role')
      .populate('category', 'name slug')
      .lean();

    return topArticlesAgg
      .map((item) => {
        const art = articles.find((a) => a._id.toString() === item._id.toString());
        if (!art) return null;
        return {
          _id: art._id,
          title: art.title,
          slug: art.slug,
          author: art.author,
          category: art.category,
          views: item.viewsCount,
          likesCount: art.likesCount || 0,
          commentsCount: art.commentsCount || 0,
          bookmarksCount: art.bookmarksCount || 0,
        };
      })
      .filter(Boolean);
  },

  /**
   * Category Performance Aggregation
   */
  getCategoryPerformance: async (range) => {
    const { start, end } = analyticsService.getDateBounds(range);

    const categoriesAgg = await AnalyticsLog.aggregate([
      {
        $match: {
          event: 'ARTICLE_VIEW',
          category: { $ne: null },
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$category',
          views: { $sum: 1 },
        },
      },
      { $sort: { views: -1 } },
    ]);

    const categoryIds = categoriesAgg.map((c) => c._id);
    const categories = await Category.find({ _id: { $in: categoryIds } }).lean();

    return Promise.all(
      categoriesAgg.map(async (item) => {
        const cat = categories.find((c) => c._id.toString() === item._id.toString());
        const articleCount = await Article.countDocuments({ category: item._id, status: 'PUBLISHED' });
        return {
          _id: item._id,
          name: cat?.name || 'Uncategorized',
          slug: cat?.slug || '',
          views: item.views,
          articleCount,
        };
      })
    );
  },

  /**
   * Author Performance Aggregation
   */
  getAuthorPerformance: async (range) => {
    const { start, end } = analyticsService.getDateBounds(range);

    const authorsAgg = await AnalyticsLog.aggregate([
      {
        $match: {
          event: 'ARTICLE_VIEW',
          author: { $ne: null },
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$author',
          totalViews: { $sum: 1 },
        },
      },
      { $sort: { totalViews: -1 } },
      { $limit: 15 },
    ]);

    const authorIds = authorsAgg.map((a) => a._id);
    const authors = await User.find({ _id: { $in: authorIds } }).select('name email role avatar').lean();

    return Promise.all(
      authorsAgg.map(async (item) => {
        const author = authors.find((a) => a._id.toString() === item._id.toString());
        const [articlesPublished, articles] = await Promise.all([
          Article.countDocuments({ author: item._id, status: 'PUBLISHED' }),
          Article.find({ author: item._id }).select('likesCount commentsCount bookmarksCount').lean(),
        ]);

        const totalLikes = articles.reduce((sum, a) => sum + (a.likesCount || 0), 0);
        const totalComments = articles.reduce((sum, a) => sum + (a.commentsCount || 0), 0);

        return {
          author: author || { name: 'Unknown Author', role: 'JOURNALIST' },
          articlesPublished,
          totalViews: item.totalViews,
          avgViewsPerArticle: articlesPublished > 0 ? Math.round(item.totalViews / articlesPublished) : item.totalViews,
          totalLikes,
          totalComments,
        };
      })
    );
  },

  /**
   * Search Terms Insights
   */
  getSearchAnalytics: async (range) => {
    const { start, end } = analyticsService.getDateBounds(range);

    const topSearches = await AnalyticsLog.aggregate([
      {
        $match: {
          event: 'SEARCH',
          searchQuery: { $ne: '' },
          timestamp: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$searchQuery',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return topSearches.map((s) => ({ term: s._id, count: s.count }));
  },

  /**
   * Reading Behavior Analytics
   */
  getReadingAnalytics: async () => {
    const totalRecords = await ReadingHistory.countDocuments();
    if (totalRecords === 0) {
      return {
        totalReaders: 0,
        avgProgress: 0,
        completionRate: 0,
        avgDurationMinutes: 0,
      };
    }

    const agg = await ReadingHistory.aggregate([
      {
        $group: {
          _id: null,
          avgProgress: { $avg: '$scrollPercentage' },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] },
          },
          avgDuration: { $avg: '$durationSeconds' },
        },
      },
    ]);

    const result = agg[0] || {};
    return {
      totalReaders: totalRecords,
      avgProgress: Math.round(result.avgProgress || 0),
      completionRate: Math.round(((result.completedCount || 0) / totalRecords) * 100),
      avgDurationMinutes: Math.round((result.duration / 60) || 1),
    };
  },
};
