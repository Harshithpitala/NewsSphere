import { Article } from '../models/Article.js';
import { Category } from '../models/Category.js';
import { Tag } from '../models/Tag.js';
import { APIError } from '../utils/APIError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateUniqueSlug } from '../utils/slugify.js';
import { calculateReadingTime } from '../utils/readingTime.js';
import { calculateTrendingScore } from '../utils/decayCalculator.js';
import { ARTICLE_STATUS, ROLES } from '../constants/enums.js';
import { analyticsService } from '../services/analytics.service.js';

// @desc    Get paginated public articles with filtering
// @route   GET /api/v1/articles
// @access  Public
export const getArticles = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const { category, tag, author, featured, breaking, status } = req.query;

  const query = {};

  // Status filtering: Public calls default to PUBLISHED
  if (status && req.user && [ROLES.JOURNALIST, ROLES.EDITOR, ROLES.ADMIN].includes(req.user.role)) {
    query.status = status;
  } else {
    query.status = ARTICLE_STATUS.PUBLISHED;
  }

  // Category filter by slug or ID
  if (category) {
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      query.category = category;
    } else {
      const catDoc = await Category.findOne({ slug: category.toLowerCase() }).select('_id');
      if (catDoc) query.category = catDoc._id;
    }
  }

  // Tag filter by slug or ID
  if (tag) {
    if (tag.match(/^[0-9a-fA-F]{24}$/)) {
      query.tags = tag;
    } else {
      const tagDoc = await Tag.findOne({ slug: tag.toLowerCase() }).select('_id');
      if (tagDoc) query.tags = tagDoc._id;
    }
  }

  // Author filter
  if (author) {
    query.author = author;
  }

  if (featured === 'true') query.isFeatured = true;
  if (breaking === 'true') query.isBreaking = true;

  const totalItems = await Article.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const articles = await Article.find(query)
    .populate('author', 'name email avatar bio role')
    .populate('category', 'name slug icon')
    .populate('tags', 'name slug')
    .sort({ publishedAt: -1, createdAt: -1 })
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

// @desc    Advanced Article Search
// @route   GET /api/v1/articles/search
// @access  Public
export const searchArticles = asyncHandler(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const { q, category, tag, author, from, to, sort = 'relevance' } = req.query;

  const query = { status: ARTICLE_STATUS.PUBLISHED };

  // Keyword Text Search using MongoDB Text Index
  if (q && q.trim().length > 0) {
    const sanitizedQuery = q.trim().replace(/[^\w\s-]/gi, '');
    if (sanitizedQuery.length > 0) {
      query.$text = { $search: sanitizedQuery };
    }
  }

  // Category Filter
  if (category) {
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      query.category = category;
    } else {
      const catDoc = await Category.findOne({ slug: category.toLowerCase() }).select('_id');
      if (catDoc) query.category = catDoc._id;
    }
  }

  // Tag Filter
  if (tag) {
    if (tag.match(/^[0-9a-fA-F]{24}$/)) {
      query.tags = tag;
    } else {
      const tagDoc = await Tag.findOne({ slug: tag.toLowerCase() }).select('_id');
      if (tagDoc) query.tags = tagDoc._id;
    }
  }

  // Author Filter
  if (author && author.match(/^[0-9a-fA-F]{24}$/)) {
    query.author = author;
  }

  // Date Range Filter
  if (from || to) {
    query.publishedAt = {};
    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate.getTime())) query.publishedAt.$gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate.getTime())) query.publishedAt.$lte = toDate;
    }
  }

  // Sorting logic
  let sortOption = {};
  let projection = {};

  if (q && sort === 'relevance') {
    projection = { score: { $meta: 'textScore' } };
    sortOption = { score: { $meta: 'textScore' }, publishedAt: -1 };
  } else if (sort === 'newest') {
    sortOption = { publishedAt: -1, createdAt: -1 };
  } else if (sort === 'oldest') {
    sortOption = { publishedAt: 1, createdAt: 1 };
  } else if (sort === 'views') {
    sortOption = { viewsCount: -1, publishedAt: -1 };
  } else {
    sortOption = { publishedAt: -1 };
  }

  const totalItems = await Article.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const articles = await Article.find(query, projection)
    .populate('author', 'name email avatar bio role')
    .populate('category', 'name slug icon')
    .populate('tags', 'name slug')
    .sort(sortOption)
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

// @desc    Get Search Suggestions / Autocomplete
// @route   GET /api/v1/articles/search/suggestions
// @access  Public
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(200).json({ success: true, suggestions: { articles: [], categories: [], tags: [] } });
  }

  const cleanQuery = q.trim();
  const regex = new RegExp(cleanQuery, 'i');

  const [articles, categories, tags] = await Promise.all([
    Article.find({ title: regex, status: ARTICLE_STATUS.PUBLISHED }).select('title slug').limit(5).lean(),
    Category.find({ name: regex, isActive: true }).select('name slug icon').limit(3).lean(),
    Tag.find({ name: regex }).select('name slug').limit(3).lean(),
  ]);

  res.status(200).json({
    success: true,
    suggestions: {
      articles,
      categories,
      tags,
    },
  });
});

// @desc    Get Decaying Trending Articles
// @route   GET /api/v1/articles/trending
// @access  Public
export const getTrendingArticles = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  const { category } = req.query;

  const query = { status: ARTICLE_STATUS.PUBLISHED };

  if (category) {
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      query.category = category;
    } else {
      const catDoc = await Category.findOne({ slug: category.toLowerCase() }).select('_id');
      if (catDoc) query.category = catDoc._id;
    }
  }

  // Fetch candidate published articles
  const candidateArticles = await Article.find(query)
    .populate('author', 'name avatar bio role')
    .populate('category', 'name slug icon')
    .populate('tags', 'name slug')
    .lean();

  // Calculate dynamic decaying score for each article
  const scoredArticles = candidateArticles.map((art) => {
    const score = calculateTrendingScore(art);
    return {
      ...art,
      trendingScore: score,
    };
  });

  // Sort by decaying trendingScore DESC
  scoredArticles.sort((a, b) => b.trendingScore - a.trendingScore);

  const totalItems = scoredArticles.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const paginated = scoredArticles.slice(skip, skip + limit);

  res.status(200).json({
    success: true,
    data: paginated,
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

// @desc    Get article by slug & increment view count
// @route   GET /api/v1/articles/slug/:slug
// @access  Public
export const getArticleBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const article = await Article.findOne({ slug: slug.toLowerCase() })
    .populate('author', 'name email avatar bio role')
    .populate('category', 'name slug icon description')
    .populate('tags', 'name slug');

  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  // Check if article is published or user has permission to view draft
  if (article.status !== ARTICLE_STATUS.PUBLISHED) {
    const isAuthor = req.user && req.user._id.toString() === article.author._id.toString();
    const isEditorOrAdmin = req.user && [ROLES.EDITOR, ROLES.ADMIN].includes(req.user.role);

    if (!isAuthor && !isEditorOrAdmin) {
      return next(new APIError(404, 'Article not found'));
    }
  }

  // Increment view count atomically
  await Article.findByIdAndUpdate(article._id, { $inc: { viewsCount: 1 } });
  article.viewsCount += 1;

  // Log Analytics Event (Non-blocking)
  analyticsService.logEvent({
    event: 'ARTICLE_VIEW',
    userId: req.user?._id,
    articleId: article._id,
    categoryId: article.category?._id || article.category,
    authorId: article.author?._id || article.author,
  });

  res.status(200).json({
    success: true,
    data: article,
  });
});

// @desc    Get article by ID
// @route   GET /api/v1/articles/:id
// @access  Public
export const getArticleById = asyncHandler(async (req, res, next) => {
  const article = await Article.findById(req.params.id)
    .populate('author', 'name email avatar bio role')
    .populate('category', 'name slug icon')
    .populate('tags', 'name slug');

  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  res.status(200).json({
    success: true,
    data: article,
  });
});

// @desc    Get related articles by category & tags
// @route   GET /api/v1/articles/:id/related
// @access  Public
export const getRelatedArticles = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const targetArticle = await Article.findById(id).select('category tags');
  if (!targetArticle) {
    return next(new APIError(404, 'Article not found'));
  }

  const related = await Article.find({
    _id: { $ne: id },
    status: ARTICLE_STATUS.PUBLISHED,
    $or: [{ category: targetArticle.category }, { tags: { $in: targetArticle.tags } }],
  })
    .populate('author', 'name avatar')
    .populate('category', 'name slug')
    .sort({ publishedAt: -1 })
    .limit(4)
    .lean();

  res.status(200).json({
    success: true,
    data: related,
  });
});

// @desc    Create new article
// @route   POST /api/v1/articles
// @access  Private (JOURNALIST, EDITOR, ADMIN)
export const createArticle = asyncHandler(async (req, res, next) => {
  const {
    title,
    subtitle,
    content,
    summary,
    category,
    tags,
    coverImage,
    status = ARTICLE_STATUS.DRAFT,
    isFeatured = false,
    isBreaking = false,
    scheduledPublishAt,
  } = req.body;

  // Validate category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return next(new APIError(400, 'Invalid Category ID provided'));
  }

  // Generate unique URL-safe slug
  const slug = await generateUniqueSlug(title);

  // Calculate reading time in minutes
  const readingTimeMinutes = calculateReadingTime(content);

  // Determine publishedAt date
  let publishedAt = undefined;
  if (status === ARTICLE_STATUS.PUBLISHED) {
    publishedAt = new Date();
  }

  const article = await Article.create({
    title,
    subtitle,
    slug,
    content,
    summary: summary || title,
    coverImage,
    category,
    tags: tags || [],
    author: req.user._id, // Authenticated author identity enforced
    status,
    isFeatured,
    isBreaking,
    publishedAt,
    scheduledPublishAt,
    readingTimeMinutes,
  });

  // Update tag counts if assigned
  if (tags && tags.length > 0) {
    await Tag.updateMany({ _id: { $in: tags } }, { $inc: { articleCount: 1 } });
  }

  const populated = await Article.findById(article._id)
    .populate('author', 'name email avatar role')
    .populate('category', 'name slug')
    .populate('tags', 'name slug');

  res.status(201).json({
    success: true,
    message: 'Article created successfully',
    data: populated,
  });
});

// @desc    Update article
// @route   PUT /api/v1/articles/:id
// @access  Private (Author can update own draft/article; EDITOR/ADMIN can update any)
export const updateArticle = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  let article = await Article.findById(id);
  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  // IDOR & Permission Check
  const isAuthor = article.author.toString() === req.user._id.toString();
  const isEditorOrAdmin = [ROLES.EDITOR, ROLES.ADMIN].includes(req.user.role);

  if (!isAuthor && !isEditorOrAdmin) {
    return next(new APIError(403, 'You are not authorized to update this article.'));
  }

  const {
    title,
    subtitle,
    content,
    summary,
    category,
    tags,
    coverImage,
    status,
    isFeatured,
    isBreaking,
    scheduledPublishAt,
  } = req.body;

  // Handle title update & new slug generation
  if (title && title !== article.title) {
    article.title = title;
    article.slug = await generateUniqueSlug(title, article._id);
  }

  if (subtitle !== undefined) article.subtitle = subtitle;
  if (summary !== undefined) article.summary = summary;
  if (coverImage !== undefined) article.coverImage = coverImage;
  if (category !== undefined) article.category = category;
  if (tags !== undefined) article.tags = tags;
  if (isFeatured !== undefined && isEditorOrAdmin) article.isFeatured = isFeatured;
  if (isBreaking !== undefined && isEditorOrAdmin) article.isBreaking = isBreaking;
  if (scheduledPublishAt !== undefined) article.scheduledPublishAt = scheduledPublishAt;

  if (content) {
    article.content = content;
    article.readingTimeMinutes = calculateReadingTime(content);
  }

  if (status && status !== article.status) {
    article.status = status;
    if (status === ARTICLE_STATUS.PUBLISHED && !article.publishedAt) {
      article.publishedAt = new Date();
    }
  }

  await article.save();

  const updated = await Article.findById(article._id)
    .populate('author', 'name email avatar role')
    .populate('category', 'name slug')
    .populate('tags', 'name slug');

  res.status(200).json({
    success: true,
    message: 'Article updated successfully',
    data: updated,
  });
});

// @desc    Delete article
// @route   DELETE /api/v1/articles/:id
// @access  Private (Author can delete own; EDITOR/ADMIN can delete any)
export const deleteArticle = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  // Permission Check
  const isAuthor = article.author.toString() === req.user._id.toString();
  const isEditorOrAdmin = [ROLES.EDITOR, ROLES.ADMIN].includes(req.user.role);

  if (!isAuthor && !isEditorOrAdmin) {
    return next(new APIError(403, 'You are not authorized to delete this article.'));
  }

  await Article.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Article deleted successfully',
  });
});

// @desc    Publish article
// @route   PATCH /api/v1/articles/:id/publish
// @access  Private (EDITOR, ADMIN)
export const publishArticle = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  article.status = ARTICLE_STATUS.PUBLISHED;
  if (!article.publishedAt) {
    article.publishedAt = new Date();
  }
  article.editor = req.user._id;

  await article.save();

  res.status(200).json({
    success: true,
    message: 'Article published successfully',
    data: article,
  });
});

// @desc    Toggle featured/breaking state
// @route   PATCH /api/v1/articles/:id/feature
// @access  Private (EDITOR, ADMIN)
export const toggleFeatured = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { isFeatured, isBreaking } = req.body;

  const article = await Article.findById(id);
  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  if (isFeatured !== undefined) article.isFeatured = isFeatured;
  if (isBreaking !== undefined) article.isBreaking = isBreaking;

  await article.save();

  res.status(200).json({
    success: true,
    message: 'Article flags updated',
    data: article,
  });
});
