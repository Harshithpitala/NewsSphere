import { Media } from '../models/Media.js';
import { Article } from '../models/Article.js';
import { AuditLog } from '../models/AuditLog.js';
import { mediaStorageService } from '../services/mediaStorage.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { APIError } from '../utils/APIError.js';
import { ROLES } from '../constants/enums.js';

// @desc    Upload new image file(s) & save metadata
// @route   POST /api/v1/media
// @access  Private (JOURNALIST, EDITOR, ADMIN)
export const uploadMedia = asyncHandler(async (req, res, next) => {
  const files = req.files || (req.file ? [req.file] : []);

  if (files.length === 0) {
    return next(new APIError(400, 'Please select an image file to upload'));
  }

  const uploadedMediaList = [];

  for (const file of files) {
    const processed = await mediaStorageService.processAndSaveImage(file, req.user);

    const media = await Media.create({
      owner: req.user._id,
      originalFilename: processed.originalFilename,
      filename: processed.filename,
      url: processed.url,
      provider: processed.provider,
      mimeType: processed.mimeType,
      fileSize: processed.fileSize,
      width: processed.width,
      height: processed.height,
      altText: req.body.altText || processed.originalFilename,
      caption: req.body.caption || '',
      credit: req.body.credit || '',
      responsiveUrls: processed.responsiveUrls,
      usedInArticles: [],
    });

    await AuditLog.create({
      actor: req.user._id,
      action: 'MEDIA_UPLOAD',
      targetEntity: 'Media',
      targetId: media._id,
      metadata: { filename: media.filename, originalFilename: media.originalFilename, fileSize: media.fileSize },
    });

    uploadedMediaList.push(media);
  }

  res.status(201).json({
    success: true,
    message: `${uploadedMediaList.length} image(s) uploaded and optimized successfully`,
    data: uploadedMediaList.length === 1 ? uploadedMediaList[0] : uploadedMediaList,
  });
});

// @desc    Get paginated media library items
// @route   GET /api/v1/media
// @access  Private (JOURNALIST, EDITOR, ADMIN)
export const getMediaList = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const skip = (page - 1) * limit;

  const { search, mimeType, owner } = req.query;
  const query = {};

  // Journalist sees own uploads by default unless explicitly querying as Editor/Admin
  if (req.user.role === ROLES.JOURNALIST) {
    query.owner = req.user._id;
  } else if (owner) {
    query.owner = owner;
  }

  if (mimeType) {
    query.mimeType = mimeType;
  }

  if (search && search.trim().length > 0) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [{ originalFilename: regex }, { altText: regex }, { caption: regex }, { credit: regex }];
  }

  const totalItems = await Media.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const mediaList = await Media.find(query)
    .populate('owner', 'name email avatar role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    data: mediaList,
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

// @desc    Get single media item by ID
// @route   GET /api/v1/media/:id
// @access  Private (JOURNALIST, EDITOR, ADMIN)
export const getMediaById = asyncHandler(async (req, res, next) => {
  const media = await Media.findById(req.params.id)
    .populate('owner', 'name email avatar role')
    .populate('usedInArticles', 'title slug status')
    .lean();

  if (!media) {
    return next(new APIError(404, 'Media item not found'));
  }

  res.status(200).json({
    success: true,
    data: media,
  });
});

// @desc    Update media metadata (Alt text, caption, credit)
// @route   PATCH /api/v1/media/:id
// @access  Private (JOURNALIST, EDITOR, ADMIN)
export const updateMediaMetadata = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { altText, caption, credit } = req.body;

  const media = await Media.findById(id);
  if (!media) {
    return next(new APIError(404, 'Media item not found'));
  }

  // IDOR Protection: Only Owner or ADMIN can edit metadata
  const isOwner = media.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    return next(new APIError(403, 'Unauthorized: You can only edit your own media metadata'));
  }

  if (typeof altText === 'string') media.altText = altText.trim();
  if (typeof caption === 'string') media.caption = caption.trim();
  if (typeof credit === 'string') media.credit = credit.trim();

  await media.save();

  await AuditLog.create({
    actor: req.user._id,
    action: 'MEDIA_UPDATE',
    targetEntity: 'Media',
    targetId: media._id,
    metadata: { altText: media.altText, caption: media.caption, credit: media.credit },
  });

  res.status(200).json({
    success: true,
    message: 'Media metadata updated successfully',
    data: media,
  });
});

// @desc    Delete media file & record (Protection: Prevents deletion if used in live articles)
// @route   DELETE /api/v1/media/:id
// @access  Private (JOURNALIST, EDITOR, ADMIN)
export const deleteMedia = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const media = await Media.findById(id);
  if (!media) {
    return next(new APIError(404, 'Media item not found'));
  }

  // IDOR & Permission Check
  const isOwner = media.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    return next(new APIError(403, 'Unauthorized: You can only delete your own media uploads'));
  }

  // Used Media Protection: Check if media is referenced by articles
  const referencingArticles = await Article.find({
    $or: [{ coverImage: media.url }, { coverImage: { $regex: media.filename } }],
  })
    .select('title slug')
    .lean();

  if (referencingArticles.length > 0) {
    return next(
      new APIError(
        400,
        `Cannot delete media: It is currently used as cover image by ${referencingArticles.length} article(s) ("${referencingArticles[0].title}"). Please replace or unassign the image first.`
      )
    );
  }

  // Clean up local disk files
  await mediaStorageService.deleteMediaFiles(media);

  await Media.findByIdAndDelete(id);

  await AuditLog.create({
    actor: req.user._id,
    action: 'MEDIA_DELETE',
    targetEntity: 'Media',
    targetId: id,
    metadata: { filename: media.filename, originalFilename: media.originalFilename },
  });

  res.status(200).json({
    success: true,
    message: 'Media file and record deleted successfully',
  });
});
