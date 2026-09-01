import { Tag } from '../models/Tag.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get popular tags
// @route   GET /api/v1/tags
// @access  Public
export const getTags = asyncHandler(async (req, res) => {
  const tags = await Tag.find({}).sort({ articleCount: -1, name: 1 }).limit(30).lean();

  res.status(200).json({
    success: true,
    data: tags,
  });
});
