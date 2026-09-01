import { Report } from '../models/Report.js';
import { Comment } from '../models/Comment.js';
import { APIError } from '../utils/APIError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Submit content report (Comment / Article)
// @route   POST /api/v1/reports
// @access  Private
export const createReport = asyncHandler(async (req, res, next) => {
  const { targetType, targetId, reason, details } = req.body;

  if (!targetType || !targetId || !reason) {
    return next(new APIError(400, 'targetType, targetId, and reason are required fields'));
  }

  if (!['COMMENT', 'ARTICLE', 'USER'].includes(targetType)) {
    return next(new APIError(400, 'Invalid targetType'));
  }

  if (!['SPAM', 'HARASSMENT', 'MISINFORMATION', 'OTHER'].includes(reason)) {
    return next(new APIError(400, 'Invalid report reason'));
  }

  // Check duplicate report by same user
  const existing = await Report.findOne({
    reporter: req.user._id,
    targetType,
    targetId,
  });

  if (existing) {
    return res.status(200).json({
      success: true,
      message: 'Report already submitted for this item.',
      data: existing,
    });
  }

  const report = await Report.create({
    reporter: req.user._id,
    targetType,
    targetId,
    reason,
    details: details || '',
  });

  // If reporting a comment, increment Comment reportCount
  if (targetType === 'COMMENT') {
    await Comment.findByIdAndUpdate(targetId, { $inc: { reportCount: 1 } });
  }

  res.status(201).json({
    success: true,
    message: 'Report submitted successfully. Thank you for keeping NewsSphere safe.',
    data: report,
  });
});
