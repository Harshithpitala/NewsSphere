import mongoose from 'mongoose';
import { REACTION_TYPES } from '../constants/enums.js';

const reactionSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: Object.values(REACTION_TYPES),
      default: REACTION_TYPES.LIKE,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce single exclusive reaction per user/article pair
reactionSchema.index({ user: 1, article: 1 }, { unique: true });
reactionSchema.index({ article: 1, type: 1 });

export const Reaction = mongoose.model('Reaction', reactionSchema);
