import { ARTICLE_STATUS, ROLES } from '../constants/enums.js';
import { APIError } from '../utils/APIError.js';
import { AuditLog } from '../models/AuditLog.js';

// Centralized state transition map defining valid next states
const VALID_TRANSITIONS = {
  [ARTICLE_STATUS.DRAFT]: [ARTICLE_STATUS.SUBMITTED],
  [ARTICLE_STATUS.SUBMITTED]: [ARTICLE_STATUS.UNDER_REVIEW, ARTICLE_STATUS.REJECTED, ARTICLE_STATUS.APPROVED],
  [ARTICLE_STATUS.UNDER_REVIEW]: [ARTICLE_STATUS.APPROVED, ARTICLE_STATUS.REJECTED, ARTICLE_STATUS.PUBLISHED],
  [ARTICLE_STATUS.REJECTED]: [ARTICLE_STATUS.DRAFT, ARTICLE_STATUS.SUBMITTED],
  [ARTICLE_STATUS.APPROVED]: [ARTICLE_STATUS.PUBLISHED, ARTICLE_STATUS.DRAFT],
  [ARTICLE_STATUS.PUBLISHED]: [ARTICLE_STATUS.DRAFT], // Can unpublish/archive back to DRAFT
};

export const workflowService = {
  /**
   * Validate state transition and user role authorization
   */
  validateTransition: (currentStatus, targetStatus, user, articleAuthorId) => {
    // 1. Check if target status is valid for current status
    const allowedTargets = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedTargets.includes(targetStatus)) {
      throw new APIError(
        400,
        `Invalid workflow transition from ${currentStatus} to ${targetStatus}`
      );
    }

    // 2. Role-based transition permissions
    const isOwner = user && articleAuthorId && user._id.toString() === articleAuthorId.toString();
    const isEditorOrAdmin = [ROLES.EDITOR, ROLES.ADMIN].includes(user.role);

    // Journalist can only submit their own drafts/rejected articles
    if (user.role === ROLES.JOURNALIST) {
      if (!isOwner) {
        throw new APIError(403, 'You can only manage your own articles');
      }
      if (![ARTICLE_STATUS.SUBMITTED, ARTICLE_STATUS.DRAFT].includes(targetStatus)) {
        throw new APIError(403, 'Journalists can only save drafts or submit articles for review');
      }
    }

    // Only Editor or Admin can move to UNDER_REVIEW, APPROVED, REJECTED, or PUBLISHED
    if (
      [
        ARTICLE_STATUS.UNDER_REVIEW,
        ARTICLE_STATUS.APPROVED,
        ARTICLE_STATUS.REJECTED,
        ARTICLE_STATUS.PUBLISHED,
      ].includes(targetStatus) &&
      !isEditorOrAdmin
    ) {
      throw new APIError(403, 'Only Editors and Admins can perform editorial review or publishing actions');
    }

    return true;
  },

  /**
   * Create an audit log entry for workflow transition
   */
  logAction: async ({ actorId, action, targetId, metadata = {}, ipAddress = '' }) => {
    try {
      await AuditLog.create({
        actor: actorId,
        action,
        targetEntity: 'Article',
        targetId,
        metadata,
        ipAddress,
      });
    } catch (err) {
      console.error('[Workflow AuditLog Error]:', err.message);
    }
  },
};
