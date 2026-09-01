import mongoose from 'mongoose';
import crypto from 'crypto';

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address'],
    },
    status: {
      type: String,
      enum: ['SUBSCRIBED', 'UNSUBSCRIBED'],
      default: 'SUBSCRIBED',
    },
    unsubscribeToken: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(20).toString('hex'),
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

newsletterSubscriberSchema.index({ status: 1, createdAt: -1 });

export const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
