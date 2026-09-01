import { Comment } from '../models/Comment.js';
import { Article } from '../models/Article.js';
import { APIError } from '../utils/APIError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { COMMENT_STATUS, ROLES, ARTICLE_STATUS } from '../constants/enums.js';
import { socketEmitter } from '../services/socket.service.js';

// @desc    Get comments for an article (Top-level & Nested Replies)
// @route   GET /api/v1/articles/:articleId/comments
// @access  Public (Optional Auth to check user liked status)
export const getArticleComments = asyncHandler(async (req, res, next) => {
  const { articleId } = req.params;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const article = await Article.findById(articleId);
  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  // Count top-level comments
  const totalItems = await Comment.countDocuments({
    article: articleId,
    parentComment: null,
    status: COMMENT_STATUS.APPROVED,
  });
  const totalPages = Math.ceil(totalItems / limit) || 1;

  // Fetch top-level comments
  const topComments = await Comment.find({
    article: articleId,
    parentComment: null,
    status: COMMENT_STATUS.APPROVED,
  })
    .populate('user', 'name avatar role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Fetch replies for each top-level comment
  const commentIds = topComments.map((c) => c._id);
  const replies = await Comment.find({
    article: articleId,
    parentComment: { $in: commentIds },
    status: COMMENT_STATUS.APPROVED,
  })
    .populate('user', 'name avatar role')
    .sort({ createdAt: 1 })
    .lean();

  const userIdStr = req.user ? req.user._id.toString() : null;

  const formatComment = (c) => {
    const isLikedByCurrentUser = userIdStr
      ? (c.likedBy || []).some((id) => id.toString() === userIdStr)
      : false;
    return {
      ...c,
      isLikedByCurrentUser,
    };
  };

  // Group replies under parent comments
  const commentsWithReplies = topComments.map((comment) => {
    const childReplies = replies
      .filter((r) => r.parentComment.toString() === comment._id.toString())
      .map(formatComment);
    return {
      ...formatComment(comment),
      replies: childReplies,
    };
  });

  res.status(200).json({
    success: true,
    data: commentsWithReplies,
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

// @desc    Create comment or reply
// @route   POST /api/v1/articles/:articleId/comments
// @access  Private
export const createComment = asyncHandler(async (req, res, next) => {
  const { articleId } = req.params;
  const { content, parentComment } = req.body;

  if (!content || content.trim().length === 0) {
    return next(new APIError(400, 'Comment content cannot be empty'));
  }

  if (content.trim().length > 1000) {
    return next(new APIError(400, 'Comment cannot exceed 1000 characters'));
  }

  const article = await Article.findById(articleId);
  if (!article || article.status !== ARTICLE_STATUS.PUBLISHED) {
    return next(new APIError(404, 'Published article not found'));
  }

  // Validate parent comment if reply
  if (parentComment) {
    const parent = await Comment.findById(parentComment);
    if (!parent) {
      return next(new APIError(404, 'Parent comment not found'));
    }
    if (parent.article.toString() !== articleId) {
      return next(new APIError(400, 'Parent comment does not belong to this article'));
    }
  }

  const comment = await Comment.create({
    article: articleId,
    user: req.user._id,
    parentComment: parentComment || null,
    content: content.trim(),
    status: COMMENT_STATUS.APPROVED,
    likedBy: [],
  });

  // Increment Article commentsCount atomically
  await Article.findByIdAndUpdate(articleId, { $inc: { commentsCount: 1 } });

  const populated = await Comment.findById(comment._id).populate('user', 'name avatar role').lean();

  // Broadcast real-time comment_added event
  socketEmitter.emitCommentAdded(articleId, populated);

  res.status(201).json({
    success: true,
    message: 'Comment posted successfully',
    data: {
      ...populated,
      isLikedByCurrentUser: false,
      replies: [],
    },
  });
});

// @desc    Update comment content
// @route   PATCH /api/v1/comments/:commentId
// @access  Private (Author only)
export const updateComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return next(new APIError(400, 'Comment content cannot be empty'));
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new APIError(404, 'Comment not found'));
  }

  // IDOR & Permission check
  if (comment.user.toString() !== req.user._id.toString()) {
    return next(new APIError(403, 'You are not authorized to edit this comment'));
  }

  comment.content = content.trim();
  comment.isEdited = true;
  await comment.save();

  const updated = await Comment.findById(comment._id).populate('user', 'name avatar role').lean();

  res.status(200).json({
    success: true,
    message: 'Comment updated successfully',
    data: updated,
  });
});

// @desc    Delete comment
// @route   DELETE /api/v1/comments/:commentId
// @access  Private (Author, EDITOR, ADMIN)
export const deleteComment = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new APIError(404, 'Comment not found'));
  }

  // Permission Check
  const isAuthor = comment.user.toString() === req.user._id.toString();
  const isEditorOrAdmin = [ROLES.EDITOR, ROLES.ADMIN].includes(req.user.role);

  if (!isAuthor && !isEditorOrAdmin) {
    return next(new APIError(403, 'You are not authorized to delete this comment'));
  }

  await Comment.findByIdAndDelete(commentId);

  // Decrement Article commentsCount atomically
  await Article.findByIdAndUpdate(comment.article, { $inc: { commentsCount: -1 } });

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully',
  });
});

// @desc    Toggle like state on a comment (1 like per user)
// @route   POST /api/v1/comments/:commentId/like
// @access  Private
export const toggleCommentLike = asyncHandler(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new APIError(404, 'Comment not found'));
  }

  if (!comment.likedBy) {
    comment.likedBy = [];
  }

  const userIdStr = req.user._id.toString();
  const likedIndex = comment.likedBy.findIndex((id) => id.toString() === userIdStr);

  if (likedIndex > -1) {
    // User already liked -> Unlike comment
    comment.likedBy.splice(likedIndex, 1);
    comment.likesCount = Math.max(0, comment.likesCount - 1);
  } else {
    // User hasn't liked -> Like comment
    comment.likedBy.push(req.user._id);
    comment.likesCount += 1;
  }

  await comment.save();

  res.status(200).json({
    success: true,
    message: likedIndex > -1 ? 'Comment unliked' : 'Comment liked',
    likesCount: comment.likesCount,
    isLikedByCurrentUser: likedIndex === -1,
  });
});

// @desc    Get comments authored by current user
// @route   GET /api/v1/comments/my-comments
// @access  Private
export const getUserComments = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const totalItems = await Comment.countDocuments({ user: req.user._id });
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const comments = await Comment.find({ user: req.user._id })
    .populate({
      path: 'article',
      select: 'title slug coverImage category',
      populate: { path: 'category', select: 'name slug' },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    data: comments,
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
