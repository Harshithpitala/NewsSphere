import mongoose from 'mongoose';

const readingHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
    },
    readingProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    readingTimeSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// One history record per user-article pair, updated on repeat reads
readingHistorySchema.index({ user: 1, article: 1 }, { unique: true });
readingHistorySchema.index({ user: 1, lastReadAt: -1 });

export const ReadingHistory = mongoose.model('ReadingHistory', readingHistorySchema);
