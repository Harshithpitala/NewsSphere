import { Category } from '../models/Category.js';
import { Article } from '../models/Article.js';
import { APIError } from '../utils/APIError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ARTICLE_STATUS } from '../constants/enums.js';

// @desc    Get active categories ordered by priority
// @route   GET /api/v1/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();

  res.status(200).json({
    success: true,
    data: categories,
  });
});

// @desc    Get category detail by slug
// @route   GET /api/v1/categories/:slug
// @access  Public
export const getCategoryBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const category = await Category.findOne({ slug: slug.toLowerCase(), isActive: true }).lean();
  if (!category) {
    return next(new APIError(404, 'Category not found'));
  }

  const articleCount = await Article.countDocuments({
    category: category._id,
    status: ARTICLE_STATUS.PUBLISHED,
  });

  res.status(200).json({
    success: true,
    data: {
      ...category,
      articleCount,
    },
  });
});
