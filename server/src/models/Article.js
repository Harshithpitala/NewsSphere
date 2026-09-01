import mongoose from 'mongoose';
import { ARTICLE_STATUS } from '../constants/enums.js';

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, 'Subtitle cannot exceed 300 characters'],
      default: '',
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Article content is required'],
    },
    summary: {
      type: String,
      maxlength: [1000, 'Summary cannot exceed 1000 characters'],
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Article author is required'],
    },
    editor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Article category is required'],
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    status: {
      type: String,
      enum: Object.values(ARTICLE_STATUS),
      default: ARTICLE_STATUS.DRAFT,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBreaking: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    scheduledPublishAt: {
      type: Date,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    uniqueViewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookmarksCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    readingTimeMinutes: {
      type: Number,
      default: 1,
      min: 1,
    },
    trendingScore: {
      type: Number,
      default: 0,
    },
    sourceType: {
      type: String,
      enum: ['INTERNAL', 'EXTERNAL'],
      default: 'INTERNAL',
    },
    externalUrl: {
      type: String,
      default: '',
    },
    externalSource: {
      type: String,
      default: '',
    },
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      canonicalUrl: { type: String, default: '' },
    },
    aiMetadata: {
      aiSummary: { type: String, default: '' },
      aiExplainSimply: { type: String, default: '' },
      aiKeyPoints: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

// Compound & Specific Indexes for Performance
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1, status: 1, publishedAt: -1 });
articleSchema.index({ author: 1, status: 1 });
articleSchema.index({ trendingScore: -1, status: 1 });
articleSchema.index({ isBreaking: 1, status: 1 });
articleSchema.index({ isFeatured: 1, status: 1 });

// Full text search index on Title, Subtitle, and Content
articleSchema.index(
  {
    title: 'text',
    subtitle: 'text',
    content: 'text',
  },
  {
    weights: {
      title: 10,
      subtitle: 5,
      content: 1,
    },
    name: 'ArticleTextIndex',
  }
);

export const Article = mongoose.model('Article', articleSchema);
