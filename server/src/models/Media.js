import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Media owner is required'],
      index: true,
    },
    originalFilename: {
      type: String,
      required: true,
      trim: true,
    },
    filename: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      enum: ['LOCAL', 'CLOUDINARY'],
      default: 'LOCAL',
    },
    publicId: {
      type: String,
      default: '',
    },
    mimeType: {
      type: String,
      required: true,
      enum: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
    },
    fileSize: {
      type: Number,
      required: true, // in bytes
    },
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
    altText: {
      type: String,
      default: '',
      maxlength: [300, 'Alt text cannot exceed 300 characters'],
    },
    caption: {
      type: String,
      default: '',
      maxlength: [500, 'Caption cannot exceed 500 characters'],
    },
    credit: {
      type: String,
      default: '',
      maxlength: [200, 'Credit cannot exceed 200 characters'],
    },
    responsiveUrls: {
      small: { type: String, default: '' },
      medium: { type: String, default: '' },
      large: { type: String, default: '' },
    },
    usedInArticles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Search Index on filename, altText, caption, credit
mediaSchema.index({ originalFilename: 'text', altText: 'text', caption: 'text', credit: 'text' });

export const Media = mongoose.model('Media', mediaSchema);
