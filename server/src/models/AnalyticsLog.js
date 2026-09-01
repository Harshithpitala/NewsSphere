import mongoose from 'mongoose';

const analyticsLogSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      enum: [
        'ARTICLE_VIEW',
        'ARTICLE_READ',
        'READING_PROGRESS',
        'LIKE',
        'BOOKMARK',
        'COMMENT',
        'SEARCH',
        'CATEGORY_INTERACTION',
        'SHARE',
      ],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    searchQuery: {
      type: String,
      default: '',
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    ipHash: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

analyticsLogSchema.index({ event: 1, timestamp: -1 });
analyticsLogSchema.index({ article: 1, timestamp: -1 });
analyticsLogSchema.index({ category: 1, timestamp: -1 });
analyticsLogSchema.index({ author: 1, timestamp: -1 });
analyticsLogSchema.index({ timestamp: -1 });

export const AnalyticsLog = mongoose.model('AnalyticsLog', analyticsLogSchema);
