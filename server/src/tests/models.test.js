import {
  User,
  Category,
  Tag,
  Article,
  Comment,
  Reaction,
  Bookmark,
  ReadingHistory,
  Notification,
  Report,
  AnalyticsLog,
  NewsletterSubscriber,
  AuditLog,
  Media,
} from '../models/index.js';
import { ROLES, ARTICLE_STATUS } from '../constants/enums.js';

export const runModelValidationCheck = () => {
  console.log('[Test] Running Mongoose Model Validation & Compilation Checks...');

  const models = [
    { name: 'User', model: User },
    { name: 'Category', model: Category },
    { name: 'Tag', model: Tag },
    { name: 'Article', model: Article },
    { name: 'Comment', model: Comment },
    { name: 'Reaction', model: Reaction },
    { name: 'Bookmark', model: Bookmark },
    { name: 'ReadingHistory', model: ReadingHistory },
    { name: 'Notification', model: Notification },
    { name: 'Report', model: Report },
    { name: 'AnalyticsLog', model: AnalyticsLog },
    { name: 'NewsletterSubscriber', model: NewsletterSubscriber },
    { name: 'AuditLog', model: AuditLog },
    { name: 'Media', model: Media },
  ];

  models.forEach(({ name, model }) => {
    if (!model || !model.modelName) {
      throw new Error(`Model ${name} failed to compile or export.`);
    }
    console.log(`  ✓ ${name} model compiled successfully (${Object.keys(model.schema.paths).length} fields).`);
  });

  // Verify Role & Status Enums
  console.log('[Test] Verifying Enum Definitions...');
  if (!Object.values(ROLES).includes('ADMIN')) throw new Error('Role ADMIN missing');
  if (!Object.values(ARTICLE_STATUS).includes('PUBLISHED')) throw new Error('Status PUBLISHED missing');
  console.log('  ✓ Roles & Article Status enums validated.');

  console.log('[Test] All 14 Mongoose models compiled and verified cleanly!\n');
};

if (process.argv[1].endsWith('models.test.js')) {
  runModelValidationCheck();
}
