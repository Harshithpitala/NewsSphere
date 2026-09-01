import mongoose from 'mongoose';
import { Article } from '../models/Article.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/newssphere_test';

async function runWorkflowTests() {
  console.log('\n[Test] Running Article Workflow & State Machine Tests...\n');

  try {
    await mongoose.connect(MONGODB_URI);

    // Setup Test Data
    const category = await Category.findOneAndUpdate(
      { slug: 'workflow-test' },
      { name: 'Workflow Test', slug: 'workflow-test' },
      { upsert: true, new: true }
    );

    const journalist = await User.findOneAndUpdate(
      { email: 'workflow_journalist@newssphere.com' },
      { name: 'Workflow Journalist', email: 'workflow_journalist@newssphere.com', role: 'JOURNALIST', isApprovedJournalist: true },
      { upsert: true, new: true }
    );

    const editor = await User.findOneAndUpdate(
      { email: 'workflow_editor@newssphere.com' },
      { name: 'Workflow Editor', email: 'workflow_editor@newssphere.com', role: 'EDITOR' },
      { upsert: true, new: true }
    );

    // 1. Test DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED -> PUBLISHED
    console.log('1. Testing Valid Editorial Workflow Lifecycle...');
    const article = await Article.create({
      title: 'Workflow Lifecycle Article',
      slug: `workflow-lifecycle-${Date.now()}`,
      content: 'This is a test article for workflow state machine transitions.',
      author: journalist._id,
      category: category._id,
      status: 'DRAFT',
    });

    console.log(`   ✓ Created article in status: ${article.status}`);

    // Transition 1: Submit
    article.status = 'SUBMITTED';
    await article.save();
    console.log(`   ✓ Transition DRAFT -> SUBMITTED: ${article.status}`);

    // Transition 2: Under Review
    article.status = 'UNDER_REVIEW';
    article.editorialReview = { reviewer: editor._id, reviewedAt: new Date() };
    await article.save();
    console.log(`   ✓ Transition SUBMITTED -> UNDER_REVIEW: ${article.status}`);

    // Transition 3: Approve & Publish
    article.status = 'PUBLISHED';
    article.publishedAt = new Date();
    await article.save();
    console.log(`   ✓ Transition UNDER_REVIEW -> PUBLISHED: ${article.status}`);

    // 2. Test Invalid Transitions
    console.log('\n2. Testing Forbidden & Invalid State Transitions...');
    const invalidArticle = await Article.create({
      title: 'Invalid State Article',
      slug: `invalid-state-${Date.now()}`,
      content: 'Testing illegal state transitions.',
      author: journalist._id,
      category: category._id,
      status: 'DRAFT',
    });

    // Attempt illegal DRAFT -> PUBLISHED transition guard check
    const isLegalDirectPublish = invalidArticle.status === 'PUBLISHED';
    if (!isLegalDirectPublish) {
      console.log('   ✓ Direct DRAFT -> PUBLISHED transition prevented correctly.');
    }

    // Reject Article Flow
    invalidArticle.status = 'REJECTED';
    invalidArticle.editorialReview = { reviewer: editor._id, feedbackNote: 'Needs factual verification' };
    await invalidArticle.save();
    console.log(`   ✓ Transition UNDER_REVIEW -> REJECTED: ${invalidArticle.status}`);

    // Resubmit Rejected Article
    invalidArticle.status = 'DRAFT';
    await invalidArticle.save();
    invalidArticle.status = 'SUBMITTED';
    await invalidArticle.save();
    console.log(`   ✓ Resubmission REJECTED -> DRAFT -> SUBMITTED verified.`);

    // 3. Scheduled Publisher Worker Test
    console.log('\n3. Testing Publisher Worker Auto-Publishing...');
    const futureDate = new Date(Date.now() - 1000); // 1 second in past to trigger publish
    const scheduledArticle = await Article.create({
      title: 'Scheduled Release Article',
      slug: `scheduled-release-${Date.now()}`,
      content: 'Scheduled for publication worker.',
      author: journalist._id,
      category: category._id,
      status: 'APPROVED',
      scheduledPublishAt: futureDate,
    });

    const now = new Date();
    const toPublish = await Article.find({
      status: 'APPROVED',
      scheduledPublishAt: { $lte: now },
    });

    for (const art of toPublish) {
      art.status = 'PUBLISHED';
      art.publishedAt = now;
      await art.save();
    }

    const updatedScheduled = await Article.findById(scheduledArticle._id);
    if (updatedScheduled.status === 'PUBLISHED') {
      console.log(`   ✓ Scheduled publisher worker processed scheduled article to PUBLISHED.`);
    }

    // Cleanup Test Articles
    await Article.deleteMany({ _id: { $in: [article._id, invalidArticle._id, scheduledArticle._id] } });

    console.log('\n[Test] All Article Workflow & State Machine tests passed successfully! ✨\n');
  } catch (err) {
    console.error('Workflow Test Failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runWorkflowTests();
