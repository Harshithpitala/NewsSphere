import { workflowService } from '../services/workflow.service.js';
import { ARTICLE_STATUS, ROLES } from '../constants/enums.js';

export const runCMSTests = async () => {
  console.log('[Test] Running Phase 9 Journalist & Editor CMS Tests...\n');

  try {
    // 1. Test Valid Workflow State Transitions
    console.log('1. Testing State Transition Rules...');
    
    // DRAFT -> SUBMITTED (Journalist)
    const journalistUser = { _id: '111', role: ROLES.JOURNALIST };
    const isValidDraftToSubmit = workflowService.validateTransition(
      ARTICLE_STATUS.DRAFT,
      ARTICLE_STATUS.SUBMITTED,
      journalistUser,
      '111'
    );
    console.log(`   ✓ DRAFT -> SUBMITTED by Journalist owner: ${isValidDraftToSubmit}`);

    // SUBMITTED -> UNDER_REVIEW (Editor)
    const editorUser = { _id: '222', role: ROLES.EDITOR };
    const isValidSubmitToReview = workflowService.validateTransition(
      ARTICLE_STATUS.SUBMITTED,
      ARTICLE_STATUS.UNDER_REVIEW,
      editorUser,
      '111'
    );
    console.log(`   ✓ SUBMITTED -> UNDER_REVIEW by Editor: ${isValidSubmitToReview}`);

    // UNDER_REVIEW -> REJECTED (Editor)
    const isValidReviewToReject = workflowService.validateTransition(
      ARTICLE_STATUS.UNDER_REVIEW,
      ARTICLE_STATUS.REJECTED,
      editorUser,
      '111'
    );
    console.log(`   ✓ UNDER_REVIEW -> REJECTED by Editor: ${isValidReviewToReject}`);

    // UNDER_REVIEW -> APPROVED (Editor)
    const isValidReviewToApprove = workflowService.validateTransition(
      ARTICLE_STATUS.UNDER_REVIEW,
      ARTICLE_STATUS.APPROVED,
      editorUser,
      '111'
    );
    console.log(`   ✓ UNDER_REVIEW -> APPROVED by Editor: ${isValidReviewToApprove}`);

    // APPROVED -> PUBLISHED (Editor)
    const isValidApproveToPublish = workflowService.validateTransition(
      ARTICLE_STATUS.APPROVED,
      ARTICLE_STATUS.PUBLISHED,
      editorUser,
      '111'
    );
    console.log(`   ✓ APPROVED -> PUBLISHED by Editor: ${isValidApproveToPublish}`);

    // 2. Test Invalid Transitions & RBAC Rejections
    console.log('\n2. Testing Permission & Invalid Transition Enforcement...');

    // Journalist trying to approve -> Should throw 403
    try {
      workflowService.validateTransition(
        ARTICLE_STATUS.UNDER_REVIEW,
        ARTICLE_STATUS.APPROVED,
        journalistUser,
        '111'
      );
      console.error('   ❌ FAILED: Journalist was allowed to approve!');
      process.exit(1);
    } catch (err) {
      console.log('   ✓ Journalist approval blocked with 403:', err.message);
    }

    // Invalid transition DRAFT -> PUBLISHED directly -> Should throw 400
    try {
      workflowService.validateTransition(
        ARTICLE_STATUS.DRAFT,
        ARTICLE_STATUS.PUBLISHED,
        editorUser,
        '111'
      );
      console.error('   ❌ FAILED: DRAFT -> PUBLISHED direct jump was allowed!');
      process.exit(1);
    } catch (err) {
      console.log('   ✓ Direct jump DRAFT -> PUBLISHED blocked with 400:', err.message);
    }

    console.log('\n[Test] All Journalist & Editor CMS tests passed successfully! ✨\n');
  } catch (error) {
    console.error('[Test Error] CMS test failed:', error);
    process.exit(1);
  }
};

if (process.argv[1].endsWith('cms.test.js')) {
  runCMSTests();
}
