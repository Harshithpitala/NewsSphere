import { Bookmark } from '../models/Bookmark.js';
import { Article } from '../models/Article.js';
import { APIError } from '../utils/APIError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ARTICLE_STATUS } from '../constants/enums.js';

// @desc    Add article to user bookmarks
// @route   POST /api/v1/bookmarks
// @access  Private
export const addBookmark = asyncHandler(async (req, res, next) => {
  const { articleId } = req.body;

  if (!articleId) {
    return next(new APIError(400, 'Article ID is required'));
  }

  const article = await Article.findById(articleId);
  if (!article || article.status !== ARTICLE_STATUS.PUBLISHED) {
    return next(new APIError(404, 'Published article not found'));
  }

  // Check existing
  const existing = await Bookmark.findOne({ user: req.user._id, article: articleId });
  if (existing) {
    return res.status(200).json({ success: true, message: 'Article already bookmarked', data: existing });
  }

  const bookmark = await Bookmark.create({
    user: req.user._id,
    article: articleId,
  });

  // Increment Article bookmarksCount atomically
  await Article.findByIdAndUpdate(articleId, { $inc: { bookmarksCount: 1 } });

  res.status(201).json({
    success: true,
    message: 'Article bookmarked successfully',
    data: bookmark,
  });
});

// @desc    Remove article from user bookmarks
// @route   DELETE /api/v1/bookmarks/:articleId
// @access  Private
export const removeBookmark = asyncHandler(async (req, res, next) => {
  const { articleId } = req.params;

  const bookmark = await Bookmark.findOneAndDelete({ user: req.user._id, article: articleId });

  if (bookmark) {
    // Decrement Article bookmarksCount atomically (prevent < 0)
    await Article.findByIdAndUpdate(articleId, {
      $inc: { bookmarksCount: -1 },
    });
  }

  res.status(200).json({
    success: true,
    message: 'Bookmark removed successfully',
  });
});

// @desc    Get user's bookmarked articles
// @route   GET /api/v1/bookmarks
// @access  Private
export const getUserBookmarks = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const totalItems = await Bookmark.countDocuments({ user: req.user._id });
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const bookmarks = await Bookmark.find({ user: req.user._id })
    .populate({
      path: 'article',
      populate: [
        { path: 'author', select: 'name avatar bio role' },
        { path: 'category', select: 'name slug icon' },
      ],
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const articles = bookmarks.map((b) => b.article).filter(Boolean);

  res.status(200).json({
    success: true,
    data: articles,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

// @desc    Check if article is bookmarked by current user
// @route   GET /api/v1/bookmarks/check/:articleId
// @access  Private
export const checkBookmark = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const bookmark = await Bookmark.findOne({ user: req.user._id, article: articleId });

  res.status(200).json({
    success: true,
    isBookmarked: !!bookmark,
  });
});
