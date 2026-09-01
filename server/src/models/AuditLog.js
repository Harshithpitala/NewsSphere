import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'ROLE_CHANGE',
        'ARTICLE_CREATE',
        'ARTICLE_UPDATE',
        'ARTICLE_SUBMIT',
        'ARTICLE_UNDER_REVIEW',
        'ARTICLE_APPROVE',
        'ARTICLE_REJECT',
        'ARTICLE_PUBLISH',
        'ARTICLE_SCHEDULE',
        'ARTICLE_FEATURE',
        'ARTICLE_BREAKING',
        'ARTICLE_DELETE',
        'USER_SUSPEND',
        'COMMENT_MODERATE',
        'SETTINGS_CHANGE',
        'MEDIA_UPLOAD',
        'MEDIA_UPDATE',
        'MEDIA_DELETE',
      ],
    },
    targetEntity: {
      type: String,
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
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

auditLogSchema.index({ actor: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
