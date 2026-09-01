import { Reaction } from '../models/Reaction.js';
import { Article } from '../models/Article.js';
import { APIError } from '../utils/APIError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { REACTION_TYPES, ARTICLE_STATUS } from '../constants/enums.js';

// @desc    Toggle or switch single article reaction (1 reaction per user per article)
// @route   POST /api/v1/reactions
// @access  Private
export const toggleReaction = asyncHandler(async (req, res, next) => {
  const { articleId, type = REACTION_TYPES.LIKE } = req.body;

  if (!articleId) {
    return next(new APIError(400, 'Article ID is required'));
  }

  const normalizedType = type.toUpperCase();
  const validTypes = Object.values(REACTION_TYPES);
  if (!validTypes.includes(normalizedType)) {
    return next(new APIError(400, `Invalid reaction type: ${type}`));
  }

  const article = await Article.findById(articleId);
  if (!article || article.status !== ARTICLE_STATUS.PUBLISHED) {
    return next(new APIError(404, 'Published article not found'));
  }

  // Check if user already reacted to this article
  const existingReaction = await Reaction.findOne({
    user: req.user._id,
    article: articleId,
  });

  if (existingReaction) {
    if (existingReaction.type === normalizedType) {
      // User clicked same reaction type -> Remove reaction
      await Reaction.findByIdAndDelete(existingReaction._id);
      await Article.findByIdAndUpdate(articleId, { $inc: { likesCount: -1 } });

      return res.status(200).json({
        success: true,
        message: 'Reaction removed',
        userReaction: null,
      });
    } else {
      // User switched reaction type (e.g. LIKE -> LOVE)
      existingReaction.type = normalizedType;
      await existingReaction.save();

      return res.status(200).json({
        success: true,
        message: 'Reaction updated',
        userReaction: normalizedType.toLowerCase(),
        data: existingReaction,
      });
    }
  }

  // Create new reaction
  const reaction = await Reaction.create({
    user: req.user._id,
    article: articleId,
    type: normalizedType,
  });

  // Increment Article total likesCount
  await Article.findByIdAndUpdate(articleId, { $inc: { likesCount: 1 } });

  res.status(201).json({
    success: true,
    message: 'Reaction added',
    userReaction: normalizedType.toLowerCase(),
    data: reaction,
  });
});

// @desc    Remove article reaction
// @route   DELETE /api/v1/reactions/:articleId
// @access  Private
export const removeReaction = asyncHandler(async (req, res) => {
  const { articleId } = req.params;

  const reaction = await Reaction.findOneAndDelete({ user: req.user._id, article: articleId });

  if (reaction) {
    await Article.findByIdAndUpdate(articleId, { $inc: { likesCount: -1 } });
  }

  res.status(200).json({
    success: true,
    message: 'Reaction removed successfully',
    userReaction: null,
  });
});

// @desc    Get article reaction stats & current user reaction
// @route   GET /api/v1/reactions/article/:articleId
// @access  Public
export const getArticleReactions = asyncHandler(async (req, res) => {
  const { articleId } = req.params;

  const reactions = await Reaction.find({ article: articleId }).lean();
  const totalReactions = reactions.length;

  const countsByType = {
    LIKE: 0,
    LOVE: 0,
    INSIGHTFUL: 0,
    THINKING: 0,
    like: 0,
    love: 0,
    insightful: 0,
    thinking: 0,
  };

  reactions.forEach((r) => {
    const t = r.type ? r.type.toUpperCase() : 'LIKE';
    const lower = t.toLowerCase();
    countsByType[t] = (countsByType[t] || 0) + 1;
    countsByType[lower] = (countsByType[lower] || 0) + 1;
  });

  let userReaction = null;
  if (req.user) {
    const userRec = reactions.find((r) => r.user.toString() === req.user._id.toString());
    if (userRec) userReaction = userRec.type.toLowerCase();
  }

  res.status(200).json({
    success: true,
    data: {
      totalReactions,
      countsByType,
      userReaction,
    },
  });
});

// @desc    Get articles liked/reacted by current user
// @route   GET /api/v1/reactions/my-likes
// @access  Private
export const getUserLikedArticles = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const totalItems = await Reaction.countDocuments({ user: req.user._id });
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const reactions = await Reaction.find({ user: req.user._id })
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

  const articles = reactions.map((r) => r.article).filter(Boolean);

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
