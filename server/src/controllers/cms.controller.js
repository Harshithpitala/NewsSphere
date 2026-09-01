import { Article } from '../models/Article.js';
import { Category } from '../models/Category.js';
import { Tag } from '../models/Tag.js';
import { AuditLog } from '../models/AuditLog.js';
import { APIError } from '../utils/APIError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateUniqueSlug } from '../utils/slugify.js';
import { calculateReadingTime } from '../utils/readingTime.js';
import { workflowService } from '../services/workflow.service.js';
import { socketEmitter } from '../services/socket.service.js';
import { ARTICLE_STATUS, ROLES } from '../constants/enums.js';

// ==================================================
// JOURNALIST CMS CONTROLLERS
// ==================================================

// @desc    Get journalist dashboard stats & recent stories
// @route   GET /api/v1/cms/journalist/dashboard
// @access  Private (JOURNALIST, EDITOR, ADMIN)
export const getJournalistDashboard = asyncHandler(async (req, res) => {
  const authorId = req.user._id;

  const [
    totalDrafts,
    totalSubmitted,
    totalUnderReview,
    totalApproved,
    totalRejected,
    totalPublished,
    recentArticles,
  ] = await Promise.all([
    Article.countDocuments({ author: authorId, status: ARTICLE_STATUS.DRAFT }),
    Article.countDocuments({ author: authorId, status: ARTICLE_STATUS.SUBMITTED }),
    Article.countDocuments({ author: authorId, status: ARTICLE_STATUS.UNDER_REVIEW }),
    Article.countDocuments({ author: authorId, status: ARTICLE_STATUS.APPROVED }),
    Article.countDocuments({ author: authorId, status: ARTICLE_STATUS.REJECTED }),
    Article.countDocuments({ author: authorId, status: ARTICLE_STATUS.PUBLISHED }),
    Article.find({ author: authorId })
      .populate('category', 'name slug')
      .sort({ updatedAt: -1 })
      .limit(6)
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalDrafts,
        totalSubmitted,
        totalUnderReview,
        totalApproved,
        totalRejected,
        totalPublished,
        totalArticles: totalDrafts + totalSubmitted + totalUnderReview + totalApproved + totalRejected + totalPublished,
      },
      recentArticles,
    },
  });
});

// @desc    Get journalist articles with pagination & status filters
// @route   GET /api/v1/cms/journalist/articles
// @access  Private (JOURNALIST, EDITOR, ADMIN)
export const getJournalistArticles = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const { status, search } = req.query;

  const filter = { author: req.user._id };

  if (status && Object.values(ARTICLE_STATUS).includes(status.toUpperCase())) {
    filter.status = status.toUpperCase();
  }

  if (search && search.trim()) {
    filter.title = { $regex: search.trim(), $options: 'i' };
  }

  const totalItems = await Article.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const articles = await Article.find(filter)
    .populate('category', 'name slug')
    .populate('editor', 'name role')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

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

// @desc    Create new CMS article (Draft or Submitted)
// @route   POST /api/v1/cms/articles
// @access  Private (JOURNALIST, EDITOR, ADMIN)
export const createCMSArticle = asyncHandler(async (req, res, next) => {
  const { title, subtitle, content, category, tags, coverImage, seo, submitForReview } = req.body;

  if (!title || title.trim().length < 5) {
    return next(new APIError(400, 'Title is required and must be at least 5 characters'));
  }

  if (!content || content.trim().length === 0) {
    return next(new APIError(400, 'Article content cannot be empty'));
  }

  if (!category) {
    return next(new APIError(400, 'Article category is required'));
  }

  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) {
    return next(new APIError(404, 'Category not found'));
  }

  const slug = await generateUniqueSlug(title);
  const readingTimeMinutes = calculateReadingTime(content);

  const initialStatus = submitForReview ? ARTICLE_STATUS.SUBMITTED : ARTICLE_STATUS.DRAFT;

  const article = await Article.create({
    title: title.trim(),
    subtitle: subtitle ? subtitle.trim() : '',
    slug,
    content,
    coverImage: coverImage || '',
    category,
    tags: Array.isArray(tags) ? tags : [],
    author: req.user._id,
    status: initialStatus,
    readingTimeMinutes,
    seo: {
      metaTitle: seo?.metaTitle || title.trim(),
      metaDescription: seo?.metaDescription || subtitle || '',
      canonicalUrl: seo?.canonicalUrl || '',
    },
  });

  await workflowService.logAction({
    actorId: req.user._id,
    action: initialStatus === ARTICLE_STATUS.SUBMITTED ? 'ARTICLE_SUBMIT' : 'ARTICLE_CREATE',
    targetId: article._id,
    metadata: { title: article.title, status: article.status },
  });

  res.status(201).json({
    success: true,
    message: submitForReview ? 'Article created and submitted for review' : 'Draft saved successfully',
    data: article,
  });
});

// @desc    Update CMS article
// @route   PUT /api/v1/cms/articles/:id
// @access  Private (Author Journalist, or EDITOR, ADMIN)
export const updateCMSArticle = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, subtitle, content, category, tags, coverImage, seo, submitForReview } = req.body;

  const article = await Article.findById(id);
  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  const isOwner = article.author.toString() === req.user._id.toString();
  const isEditorOrAdmin = [ROLES.EDITOR, ROLES.ADMIN].includes(req.user.role);

  if (!isOwner && !isEditorOrAdmin) {
    return next(new APIError(403, 'You are not authorized to edit this article'));
  }

  // Journalists can only edit DRAFT or REJECTED articles
  if (req.user.role === ROLES.JOURNALIST && ![ARTICLE_STATUS.DRAFT, ARTICLE_STATUS.REJECTED].includes(article.status)) {
    return next(new APIError(400, `Cannot edit article in ${article.status} status`));
  }

  if (title && title.trim() !== article.title) {
    article.title = title.trim();
    article.slug = await generateUniqueSlug(title.trim(), id);
  }

  if (subtitle !== undefined) article.subtitle = subtitle.trim();
  if (content !== undefined) {
    article.content = content;
    article.readingTimeMinutes = calculateReadingTime(content);
  }
  if (category) article.category = category;
  if (tags) article.tags = Array.isArray(tags) ? tags : [];
  if (coverImage !== undefined) article.coverImage = coverImage;
  if (seo) {
    article.seo = {
      metaTitle: seo.metaTitle || article.seo?.metaTitle || '',
      metaDescription: seo.metaDescription || article.seo?.metaDescription || '',
      canonicalUrl: seo.canonicalUrl || article.seo?.canonicalUrl || '',
    };
  }

  if (submitForReview) {
    workflowService.validateTransition(article.status, ARTICLE_STATUS.SUBMITTED, req.user, article.author);
    article.status = ARTICLE_STATUS.SUBMITTED;
    article.rejectionReason = ''; // Clear prior rejection feedback
  }

  await article.save();

  await workflowService.logAction({
    actorId: req.user._id,
    action: submitForReview ? 'ARTICLE_SUBMIT' : 'ARTICLE_UPDATE',
    targetId: article._id,
    metadata: { title: article.title, status: article.status },
  });

  res.status(200).json({
    success: true,
    message: submitForReview ? 'Article updated and submitted for review' : 'Article updated successfully',
    data: article,
  });
});

// @desc    Submit article for review
// @route   POST /api/v1/cms/articles/:id/submit
// @access  Private (Author Journalist, EDITOR, ADMIN)
export const submitCMSArticle = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  workflowService.validateTransition(article.status, ARTICLE_STATUS.SUBMITTED, req.user, article.author);

  if (!article.content || article.content.trim().length === 0) {
    return next(new APIError(400, 'Cannot submit an article with empty content'));
  }

  article.status = ARTICLE_STATUS.SUBMITTED;
  article.rejectionReason = '';
  await article.save();

  await workflowService.logAction({
    actorId: req.user._id,
    action: 'ARTICLE_SUBMIT',
    targetId: article._id,
    metadata: { title: article.title },
  });

  res.status(200).json({
    success: true,
    message: 'Article submitted for editorial review',
    data: article,
  });
});

// @desc    Get single article by ID for journalist editing
// @route   GET /api/v1/cms/articles/:id
// @access  Private (JOURNALIST, EDITOR, ADMIN)
export const getCMSArticleById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id)
    .populate('category', 'name slug')
    .populate('tags', 'name slug')
    .populate('author', 'name role')
    .populate('editor', 'name role');

  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  const isOwner = article.author._id.toString() === req.user._id.toString();
  const isEditorOrAdmin = [ROLES.EDITOR, ROLES.ADMIN].includes(req.user.role);

  if (!isOwner && !isEditorOrAdmin) {
    return next(new APIError(403, 'You are not authorized to view this article'));
  }

  res.status(200).json({
    success: true,
    data: article,
  });
});

// ==================================================
// EDITOR CMS CONTROLLERS
// ==================================================

// @desc    Get editor newsroom dashboard stats
// @route   GET /api/v1/cms/editor/dashboard
// @access  Private (EDITOR, ADMIN)
export const getEditorDashboard = asyncHandler(async (req, res) => {
  const [
    pendingSubmissions,
    underReview,
    recentlyApproved,
    recentlyRejected,
    totalPublished,
    scheduledCount,
    queue,
  ] = await Promise.all([
    Article.countDocuments({ status: ARTICLE_STATUS.SUBMITTED }),
    Article.countDocuments({ status: ARTICLE_STATUS.UNDER_REVIEW }),
    Article.countDocuments({ status: ARTICLE_STATUS.APPROVED }),
    Article.countDocuments({ status: ARTICLE_STATUS.REJECTED }),
    Article.countDocuments({ status: ARTICLE_STATUS.PUBLISHED }),
    Article.countDocuments({ scheduledPublishAt: { $gt: new Date() } }),
    Article.find({ status: { $in: [ARTICLE_STATUS.SUBMITTED, ARTICLE_STATUS.UNDER_REVIEW] } })
      .populate('author', 'name avatar role')
      .populate('category', 'name slug')
      .sort({ updatedAt: -1 })
      .limit(6)
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        pendingSubmissions,
        underReview,
        recentlyApproved,
        recentlyRejected,
        totalPublished,
        scheduledCount,
      },
      queue,
    },
  });
});

// @desc    Get editor submission queue with filters
// @route   GET /api/v1/cms/editor/submissions
// @access  Private (EDITOR, ADMIN)
export const getEditorSubmissionsQueue = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const { status, category, search } = req.query;

  const filter = {};

  if (status && Object.values(ARTICLE_STATUS).includes(status.toUpperCase())) {
    filter.status = status.toUpperCase();
  } else {
    // Default queue excludes DRAFT
    filter.status = { $ne: ARTICLE_STATUS.DRAFT };
  }

  if (category) filter.category = category;

  if (search && search.trim()) {
    filter.title = { $regex: search.trim(), $options: 'i' };
  }

  const totalItems = await Article.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const submissions = await Article.find(filter)
    .populate('author', 'name avatar role')
    .populate('editor', 'name role')
    .populate('category', 'name slug')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    data: submissions,
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

// @desc    Get single submission details for review with audit trail
// @route   GET /api/v1/cms/editor/submissions/:id
// @access  Private (EDITOR, ADMIN)
export const getEditorSubmissionById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id)
    .populate('author', 'name avatar role email bio')
    .populate('editor', 'name avatar role')
    .populate('category', 'name slug icon')
    .populate('tags', 'name slug')
    .lean();

  if (!article) {
    return next(new APIError(404, 'Article submission not found'));
  }

  // Fetch audit history for this article
  const auditLogs = await AuditLog.find({ targetEntity: 'Article', targetId: id })
    .populate('actor', 'name role')
    .sort({ timestamp: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: {
      article,
      auditLogs,
    },
  });
});

// @desc    Claim/Start reviewing submission (SUBMITTED -> UNDER_REVIEW)
// @route   POST /api/v1/cms/editor/submissions/:id/review
// @access  Private (EDITOR, ADMIN)
export const startArticleReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  workflowService.validateTransition(article.status, ARTICLE_STATUS.UNDER_REVIEW, req.user, article.author);

  article.status = ARTICLE_STATUS.UNDER_REVIEW;
  article.editor = req.user._id;
  await article.save();

  await workflowService.logAction({
    actorId: req.user._id,
    action: 'ARTICLE_UNDER_REVIEW',
    targetId: article._id,
    metadata: { title: article.title },
  });

  res.status(200).json({
    success: true,
    message: 'Article is now under editorial review',
    data: article,
  });
});

// @desc    Approve article submission
// @route   POST /api/v1/cms/editor/submissions/:id/approve
// @access  Private (EDITOR, ADMIN)
export const approveArticle = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  workflowService.validateTransition(article.status, ARTICLE_STATUS.APPROVED, req.user, article.author);

  article.status = ARTICLE_STATUS.APPROVED;
  article.editor = req.user._id;
  article.rejectionReason = '';
  await article.save();

  await workflowService.logAction({
    actorId: req.user._id,
    action: 'ARTICLE_APPROVE',
    targetId: article._id,
    metadata: { title: article.title },
  });

  res.status(200).json({
    success: true,
    message: 'Article approved for publication',
    data: article,
  });
});

// @desc    Reject article submission with feedback
// @route   POST /api/v1/cms/editor/submissions/:id/reject
// @access  Private (EDITOR, ADMIN)
export const rejectArticle = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;

  if (!rejectionReason || rejectionReason.trim().length === 0) {
    return next(new APIError(400, 'Rejection feedback reason is required'));
  }

  const article = await Article.findById(id);
  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  workflowService.validateTransition(article.status, ARTICLE_STATUS.REJECTED, req.user, article.author);

  article.status = ARTICLE_STATUS.REJECTED;
  article.editor = req.user._id;
  article.rejectionReason = rejectionReason.trim();
  await article.save();

  await workflowService.logAction({
    actorId: req.user._id,
    action: 'ARTICLE_REJECT',
    targetId: article._id,
    metadata: { title: article.title, rejectionReason: article.rejectionReason },
  });

  res.status(200).json({
    success: true,
    message: 'Article rejected with editorial feedback',
    data: article,
  });
});

// @desc    Publish approved article
// @route   POST /api/v1/cms/editor/submissions/:id/publish
// @access  Private (EDITOR, ADMIN)
export const publishArticle = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  workflowService.validateTransition(article.status, ARTICLE_STATUS.PUBLISHED, req.user, article.author);

  article.status = ARTICLE_STATUS.PUBLISHED;
  article.editor = req.user._id;
  article.publishedAt = new Date();
  article.scheduledPublishAt = null; // Clear schedule if published immediately
  await article.save();

  // Broadcast real-time Socket.IO events
  socketEmitter.emitArticlePublished(article);
  if (article.isBreaking) {
    socketEmitter.emitBreakingNews(article);
  }

  await workflowService.logAction({
    actorId: req.user._id,
    action: 'ARTICLE_PUBLISH',
    targetId: article._id,
    metadata: { title: article.title, publishedAt: article.publishedAt },
  });

  res.status(200).json({
    success: true,
    message: 'Article published live on NewsSphere',
    data: article,
  });
});

// @desc    Schedule article publication
// @route   POST /api/v1/cms/editor/submissions/:id/schedule
// @access  Private (EDITOR, ADMIN)
export const scheduleArticle = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { scheduledPublishAt } = req.body;

  if (!scheduledPublishAt) {
    return next(new APIError(400, 'Scheduled publish date is required'));
  }

  const scheduleDate = new Date(scheduledPublishAt);
  if (isNaN(scheduleDate.getTime()) || scheduleDate <= new Date()) {
    return next(new APIError(400, 'Scheduled publish date must be in the future'));
  }

  const article = await Article.findById(id);
  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  if (article.status !== ARTICLE_STATUS.APPROVED && article.status !== ARTICLE_STATUS.UNDER_REVIEW) {
    return next(new APIError(400, 'Article must be Approved or Under Review to schedule publication'));
  }

  article.status = ARTICLE_STATUS.APPROVED;
  article.editor = req.user._id;
  article.scheduledPublishAt = scheduleDate;
  await article.save();

  await workflowService.logAction({
    actorId: req.user._id,
    action: 'ARTICLE_SCHEDULE',
    targetId: article._id,
    metadata: { title: article.title, scheduledPublishAt: scheduleDate },
  });

  res.status(200).json({
    success: true,
    message: `Article scheduled to publish at ${scheduleDate.toLocaleString()}`,
    data: article,
  });
});

// @desc    Toggle featured status on article
// @route   POST /api/v1/cms/editor/submissions/:id/featured
// @access  Private (EDITOR, ADMIN)
export const toggleFeaturedArticle = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  article.isFeatured = !article.isFeatured;
  await article.save();

  await workflowService.logAction({
    actorId: req.user._id,
    action: 'ARTICLE_FEATURE',
    targetId: article._id,
    metadata: { title: article.title, isFeatured: article.isFeatured },
  });

  res.status(200).json({
    success: true,
    message: `Article is ${article.isFeatured ? 'now featured' : 'no longer featured'}`,
    isFeatured: article.isFeatured,
  });
});

// @desc    Toggle breaking news status on article
// @route   POST /api/v1/cms/editor/submissions/:id/breaking
// @access  Private (EDITOR, ADMIN)
export const toggleBreakingArticle = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  article.isBreaking = !article.isBreaking;
  await article.save();

  if (article.isBreaking) {
    socketEmitter.emitBreakingNews(article);
  }

  await workflowService.logAction({
    actorId: req.user._id,
    action: 'ARTICLE_BREAKING',
    targetId: article._id,
    metadata: { title: article.title, isBreaking: article.isBreaking },
  });

  res.status(200).json({
    success: true,
    message: `Article breaking news flag is ${article.isBreaking ? 'ACTIVE' : 'OFF'}`,
    isBreaking: article.isBreaking,
  });
});
