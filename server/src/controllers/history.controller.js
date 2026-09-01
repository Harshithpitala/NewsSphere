import { ReadingHistory } from '../models/ReadingHistory.js';
import { Article } from '../models/Article.js';
import { APIError } from '../utils/APIError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Track/upsert reading progress & reading time
// @route   POST /api/v1/history/track
// @access  Private
export const trackReadingProgress = asyncHandler(async (req, res, next) => {
  const { articleId, progressPercentage = 0, readingTimeSeconds = 0 } = req.body;

  if (!articleId) {
    return next(new APIError(400, 'Article ID is required'));
  }

  const article = await Article.findById(articleId);
  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  const progress = Math.min(100, Math.max(0, parseInt(progressPercentage, 10) || 0));
  const isCompleted = progress >= 80;

  // Upsert history entry cleanly to prevent duplicate rows
  const history = await ReadingHistory.findOneAndUpdate(
    { user: req.user._id, article: articleId },
    {
      $set: {
        lastReadAt: new Date(),
        completed: isCompleted,
      },
      $max: {
        readingProgress: progress,
      },
      $inc: {
        readingTimeSeconds: Math.max(0, parseInt(readingTimeSeconds, 10) || 0),
      },
    },
    { upsert: true, new: true }
  );

  res.status(200).json({
    success: true,
    data: history,
  });
});

// @desc    Get user's reading history
// @route   GET /api/v1/history
// @access  Private
export const getUserHistory = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const totalItems = await ReadingHistory.countDocuments({ user: req.user._id });
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const historyEntries = await ReadingHistory.find({ user: req.user._id })
    .populate({
      path: 'article',
      populate: [
        { path: 'author', select: 'name avatar bio role' },
        { path: 'category', select: 'name slug icon' },
      ],
    })
    .sort({ lastReadAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    data: historyEntries,
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

// @desc    Delete entry from user's reading history
// @route   DELETE /api/v1/history/:articleId
// @access  Private
export const deleteHistoryEntry = asyncHandler(async (req, res) => {
  const { articleId } = req.params;

  await ReadingHistory.findOneAndDelete({ user: req.user._id, article: articleId });

  res.status(200).json({
    success: true,
    message: 'Reading history entry removed',
  });
});
