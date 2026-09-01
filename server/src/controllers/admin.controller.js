import { User } from '../models/User.js';
import { Article } from '../models/Article.js';
import { Category } from '../models/Category.js';
import { Tag } from '../models/Tag.js';
import { Comment } from '../models/Comment.js';
import { Report } from '../models/Report.js';
import { Bookmark } from '../models/Bookmark.js';
import { ReadingHistory } from '../models/ReadingHistory.js';
import { AuditLog } from '../models/AuditLog.js';
import { APIError } from '../utils/APIError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createSlug } from '../utils/slugify.js';
import { ROLES, ARTICLE_STATUS, REPORT_STATUS } from '../constants/enums.js';

// ==================================================
// 1. ADMIN DASHBOARD OVERVIEW METRICS
// ==================================================

// @desc    Get real-time database system overview counts
// @route   GET /api/v1/admin/dashboard
// @access  Private (ADMIN only)
export const getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    adminUsers,
    journalistUsers,
    editorUsers,
    totalArticles,
    publishedArticles,
    draftArticles,
    underReviewArticles,
    approvedArticles,
    rejectedArticles,
    featuredArticles,
    breakingArticles,
    totalComments,
    totalReports,
    pendingReports,
    totalCategories,
    totalTags,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isSuspended: false }),
    User.countDocuments({ isSuspended: true }),
    User.countDocuments({ role: ROLES.ADMIN }),
    User.countDocuments({ role: ROLES.JOURNALIST }),
    User.countDocuments({ role: ROLES.EDITOR }),
    Article.countDocuments(),
    Article.countDocuments({ status: ARTICLE_STATUS.PUBLISHED }),
    Article.countDocuments({ status: ARTICLE_STATUS.DRAFT }),
    Article.countDocuments({ status: ARTICLE_STATUS.UNDER_REVIEW }),
    Article.countDocuments({ status: ARTICLE_STATUS.APPROVED }),
    Article.countDocuments({ status: ARTICLE_STATUS.REJECTED }),
    Article.countDocuments({ isFeatured: true }),
    Article.countDocuments({ isBreaking: true }),
    Comment.countDocuments(),
    Report.countDocuments(),
    Report.countDocuments({ status: REPORT_STATUS.PENDING }),
    Category.countDocuments(),
    Tag.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        suspended: suspendedUsers,
        roles: {
          admin: adminUsers,
          editor: editorUsers,
          journalist: journalistUsers,
          user: totalUsers - (adminUsers + editorUsers + journalistUsers),
        },
      },
      articles: {
        total: totalArticles,
        published: publishedArticles,
        draft: draftArticles,
        underReview: underReviewArticles,
        approved: approvedArticles,
        rejected: rejectedArticles,
        featured: featuredArticles,
        breaking: breakingArticles,
      },
      comments: {
        total: totalComments,
      },
      reports: {
        total: totalReports,
        pending: pendingReports,
      },
      system: {
        categories: totalCategories,
        tags: totalTags,
      },
    },
  });
});

// ==================================================
// 2. USER MANAGEMENT CONTROLLERS
// ==================================================

// @desc    Get paginated users list with search & filters
// @route   GET /api/v1/admin/users
// @access  Private (ADMIN only)
export const getAdminUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const { role, status, search } = req.query;

  const filter = {};

  if (role && Object.values(ROLES).includes(role.toUpperCase())) {
    filter.role = role.toUpperCase();
  }

  if (status) {
    if (status.toUpperCase() === 'SUSPENDED') filter.isSuspended = true;
    if (status.toUpperCase() === 'ACTIVE') filter.isSuspended = false;
  }

  if (search && search.trim()) {
    filter.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const totalItems = await User.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const users = await User.find(filter)
    .select('-password -passwordResetToken -emailVerificationToken')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    data: users,
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

// @desc    Get single user details & activity stats
// @route   GET /api/v1/admin/users/:id
// @access  Private (ADMIN only)
export const getAdminUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select('-password -passwordResetToken -emailVerificationToken')
    .lean();

  if (!user) {
    return next(new APIError(404, 'User not found'));
  }

  const [articlesCount, commentsCount, bookmarksCount, historyCount] = await Promise.all([
    Article.countDocuments({ author: id }),
    Comment.countDocuments({ user: id }),
    Bookmark.countDocuments({ user: id }),
    ReadingHistory.countDocuments({ user: id }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      user,
      stats: {
        articlesCount,
        commentsCount,
        bookmarksCount,
        historyCount,
      },
    },
  });
});

// @desc    Change user role (with last-admin protection & audit logging)
// @route   PATCH /api/v1/admin/users/:id/role
// @access  Private (ADMIN only)
export const updateUserRole = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !Object.values(ROLES).includes(role.toUpperCase())) {
    return next(new APIError(400, 'Valid role is required (USER, JOURNALIST, EDITOR, ADMIN)'));
  }

  const targetRole = role.toUpperCase();

  const targetUser = await User.findById(id);
  if (!targetUser) {
    return next(new APIError(404, 'User not found'));
  }

  // Prevent self-downgrading
  if (req.user._id.toString() === id && targetRole !== ROLES.ADMIN) {
    return next(new APIError(400, 'You cannot downgrade your own ADMIN account role'));
  }

  // Last-admin protection check
  if (targetUser.role === ROLES.ADMIN && targetRole !== ROLES.ADMIN) {
    const adminCount = await User.countDocuments({ role: ROLES.ADMIN, isSuspended: false });
    if (adminCount <= 1) {
      return next(new APIError(400, 'Cannot downgrade the last remaining active Admin account'));
    }
  }

  const oldRole = targetUser.role;
  targetUser.role = targetRole;
  await targetUser.save();

  // Create Audit Log Entry
  await AuditLog.create({
    actor: req.user._id,
    action: 'ROLE_CHANGE',
    targetEntity: 'User',
    targetId: targetUser._id,
    metadata: { oldRole, newRole: targetRole, userEmail: targetUser.email },
  });

  res.status(200).json({
    success: true,
    message: `User role updated to ${targetRole}`,
    data: { _id: targetUser._id, name: targetUser.name, role: targetUser.role },
  });
});

// @desc    Toggle user account status (Suspend / Restore)
// @route   PATCH /api/v1/admin/users/:id/status
// @access  Private (ADMIN only)
export const updateUserStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { isSuspended } = req.body;

  if (isSuspended === undefined) {
    return next(new APIError(400, 'isSuspended boolean flag is required'));
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    return next(new APIError(404, 'User not found'));
  }

  // Prevent self-suspension
  if (req.user._id.toString() === id && isSuspended) {
    return next(new APIError(400, 'You cannot suspend your own account'));
  }

  // Last-admin protection check
  if (targetUser.role === ROLES.ADMIN && isSuspended) {
    const activeAdminCount = await User.countDocuments({ role: ROLES.ADMIN, isSuspended: false });
    if (activeAdminCount <= 1) {
      return next(new APIError(400, 'Cannot suspend the last active Admin account'));
    }
  }

  targetUser.isSuspended = Boolean(isSuspended);
  await targetUser.save();

  // Create Audit Log Entry
  await AuditLog.create({
    actor: req.user._id,
    action: 'USER_SUSPEND',
    targetEntity: 'User',
    targetId: targetUser._id,
    metadata: { isSuspended: targetUser.isSuspended, userEmail: targetUser.email },
  });

  res.status(200).json({
    success: true,
    message: `User account has been ${targetUser.isSuspended ? 'SUSPENDED' : 'RESTORED'}`,
    data: { _id: targetUser._id, name: targetUser.name, isSuspended: targetUser.isSuspended },
  });
});

// ==================================================
// 3. ARTICLE MANAGEMENT CONTROLLERS
// ==================================================

// @desc    Get all articles for admin management
// @route   GET /api/v1/admin/articles
// @access  Private (ADMIN only)
export const getAdminArticles = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const { status, category, search } = req.query;

  const filter = {};

  if (status && Object.values(ARTICLE_STATUS).includes(status.toUpperCase())) {
    filter.status = status.toUpperCase();
  }

  if (category) filter.category = category;

  if (search && search.trim()) {
    filter.title = { $regex: search.trim(), $options: 'i' };
  }

  const totalItems = await Article.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const articles = await Article.find(filter)
    .populate('author', 'name email role')
    .populate('editor', 'name role')
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
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

// @desc    Delete article (Admin override)
// @route   DELETE /api/v1/admin/articles/:id
// @access  Private (ADMIN only)
export const deleteAdminArticle = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    return next(new APIError(404, 'Article not found'));
  }

  await Article.findByIdAndDelete(id);

  // Clean up comments for this article
  await Comment.deleteMany({ article: id });

  await AuditLog.create({
    actor: req.user._id,
    action: 'ARTICLE_DELETE',
    targetEntity: 'Article',
    targetId: id,
    metadata: { title: article.title, author: article.author },
  });

  res.status(200).json({
    success: true,
    message: 'Article and associated comments permanently deleted by Admin',
  });
});

// ==================================================
// 4. CATEGORY & TAG MANAGEMENT CONTROLLERS
// ==================================================

// @desc    Get categories with article counts
// @route   GET /api/v1/admin/categories
// @access  Private (ADMIN only)
export const getAdminCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ displayOrder: 1, name: 1 }).lean();

  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const articleCount = await Article.countDocuments({ category: cat._id });
      return { ...cat, articleCount };
    })
  );

  res.status(200).json({
    success: true,
    data: categoriesWithCounts,
  });
});

// @desc    Create new category
// @route   POST /api/v1/admin/categories
// @access  Private (ADMIN only)
export const createAdminCategory = asyncHandler(async (req, res, next) => {
  const { name, description, icon } = req.body;

  if (!name || name.trim().length < 2) {
    return next(new APIError(400, 'Category name is required (min 2 chars)'));
  }

  const slug = createSlug(name.trim());
  const existing = await Category.findOne({ slug });
  if (existing) {
    return next(new APIError(400, 'Category with this name already exists'));
  }

  const category = await Category.create({
    name: name.trim(),
    slug,
    description: description ? description.trim() : '',
    icon: icon || 'Newspaper',
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

// @desc    Delete category (Safe check)
// @route   DELETE /api/v1/admin/categories/:id
// @access  Private (ADMIN only)
export const deleteAdminCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const articleCount = await Article.countDocuments({ category: id });
  if (articleCount > 0) {
    return next(
      new APIError(
        400,
        `Cannot delete category. ${articleCount} article(s) are currently assigned to it. Deactivate or reassign articles first.`
      )
    );
  }

  await Category.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
});

// @desc    Get tags with article counts
// @route   GET /api/v1/admin/tags
// @access  Private (ADMIN only)
export const getAdminTags = asyncHandler(async (req, res) => {
  const tags = await Tag.find().sort({ name: 1 }).lean();

  const tagsWithCounts = await Promise.all(
    tags.map(async (t) => {
      const articleCount = await Article.countDocuments({ tags: t._id });
      return { ...t, articleCount };
    })
  );

  res.status(200).json({
    success: true,
    data: tagsWithCounts,
  });
});

// @desc    Create new tag
// @route   POST /api/v1/admin/tags
// @access  Private (ADMIN only)
export const createAdminTag = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  if (!name || name.trim().length < 2) {
    return next(new APIError(400, 'Tag name is required (min 2 chars)'));
  }

  const slug = createSlug(name.trim());
  const existing = await Tag.findOne({ slug });
  if (existing) {
    return res.status(200).json({ success: true, data: existing });
  }

  const tag = await Tag.create({
    name: name.trim(),
    slug,
  });

  res.status(201).json({
    success: true,
    message: 'Tag created successfully',
    data: tag,
  });
});

// ==================================================
// 5. COMMENT & REPORT MODERATION CONTROLLERS
// ==================================================

// @desc    Get comments for moderation
// @route   GET /api/v1/admin/comments
// @access  Private (ADMIN only)
export const getAdminComments = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const { search } = req.query;

  const filter = {};
  if (search && search.trim()) {
    filter.content = { $regex: search.trim(), $options: 'i' };
  }

  const totalItems = await Comment.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const comments = await Comment.find(filter)
    .populate('user', 'name email role avatar')
    .populate('article', 'title slug')
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

// @desc    Delete/Moderate comment
// @route   DELETE /api/v1/admin/comments/:id
// @access  Private (ADMIN only)
export const deleteAdminComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);
  if (!comment) {
    return next(new APIError(404, 'Comment not found'));
  }

  await Comment.findByIdAndDelete(id);

  // Decrement Article commentsCount
  await Article.findByIdAndUpdate(comment.article, { $inc: { commentsCount: -1 } });

  await AuditLog.create({
    actor: req.user._id,
    action: 'COMMENT_MODERATE',
    targetEntity: 'Comment',
    targetId: id,
    metadata: { content: comment.content, author: comment.user },
  });

  res.status(200).json({
    success: true,
    message: 'Comment deleted by Admin moderator',
  });
});

// @desc    Get reports list
// @route   GET /api/v1/admin/reports
// @access  Private (ADMIN only)
export const getAdminReports = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const { status, reason } = req.query;

  const filter = {};
  if (status && Object.values(REPORT_STATUS).includes(status.toUpperCase())) {
    filter.status = status.toUpperCase();
  }
  if (reason) filter.reason = reason.toUpperCase();

  const totalItems = await Report.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const reports = await Report.find(filter)
    .populate('reporter', 'name email role')
    .populate('reviewedBy', 'name role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    data: reports,
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

// @desc    Update report status (Resolve / Dismiss)
// @route   PATCH /api/v1/admin/reports/:id
// @access  Private (ADMIN only)
export const updateAdminReportStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !Object.values(REPORT_STATUS).includes(status.toUpperCase())) {
    return next(new APIError(400, 'Valid status is required (PENDING, REVIEWED, DISMISSED)'));
  }

  const report = await Report.findById(id);
  if (!report) {
    return next(new APIError(404, 'Report not found'));
  }

  report.status = status.toUpperCase();
  report.reviewedBy = req.user._id;
  report.reviewedAt = new Date();
  await report.save();

  await AuditLog.create({
    actor: req.user._id,
    action: 'SETTINGS_CHANGE',
    targetEntity: 'Report',
    targetId: report._id,
    metadata: { status: report.status, targetType: report.targetType, targetId: report.targetId },
  });

  res.status(200).json({
    success: true,
    message: `Report status updated to ${report.status}`,
    data: report,
  });
});

// ==================================================
// 6. AUDIT LOG CONTROLLERS
// ==================================================

// @desc    Get audit trail logs (Immutable read-only)
// @route   GET /api/v1/admin/audit-logs
// @access  Private (ADMIN only)
export const getAdminAuditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 15));
  const skip = (page - 1) * limit;

  const { action, targetEntity } = req.query;

  const filter = {};
  if (action) filter.action = action.toUpperCase();
  if (targetEntity) filter.targetEntity = targetEntity;

  const totalItems = await AuditLog.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const logs = await AuditLog.find(filter)
    .populate('actor', 'name email role')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    data: logs,
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
