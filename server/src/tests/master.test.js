import { execSync } from 'child_process';
import path from 'path';

const testSuites = [
  { name: '1. Models & Database Constraints', file: 'src/tests/models.test.js' },
  { name: '2. Auth & Session Management', file: 'src/tests/auth.test.js' },
  { name: '3. Article CRUD & Retrieval', file: 'src/tests/article.test.js' },
  { name: '4. External News Service', file: 'src/tests/externalNews.test.js' },
  { name: '5. Search & Trending Engine', file: 'src/tests/searchAndTrending.test.js' },
  { name: '6. Engagement & Bookmarks', file: 'src/tests/engagement.test.js' },
  { name: '7. CMS & Editorial Workflows', file: 'src/tests/cms.test.js' },
  { name: '8. Admin Dashboard & Audit Logs', file: 'src/tests/admin.test.js' },
  { name: '9. Analytics & Event Ingestion', file: 'src/tests/analytics.test.js' },
  { name: '10. AI News Intelligence Layer', file: 'src/tests/ai.test.js' },
  { name: '11. Personalization & Scoring', file: 'src/tests/recommendation.test.js' },
  { name: '12. Real-Time Updates & Sockets', file: 'src/tests/realtime.test.js' },
  { name: '13. Media Storage & Sharp WebP', file: 'src/tests/media.test.js' },
  { name: '14. Publishing State Machine', file: 'src/tests/workflow.test.js' },
  { name: '15. Security, IDOR & RBAC Matrix', file: 'src/tests/security.test.js' },
];

async function runMasterTestSuite() {
  console.log('========================================================================');
  console.log('       NEWSSPHERE — PHASE 16 MASTER TEST SUITE & QUALITY GATE           ');
  console.log('========================================================================\n');

  let passedSuites = 0;
  let failedSuites = 0;
  const startTime = Date.now();

  for (const suite of testSuites) {
    process.stdout.write(` Running [${suite.name}] ... `);
    try {
      execSync(`node ${suite.file}`, { stdio: 'pipe' });
      console.log('✅ PASSED');
      passedSuites++;
    } catch (err) {
      console.log('❌ FAILED');
      console.error(`\nFailure output for ${suite.name}:\n`, err.stdout?.toString() || err.message);
      failedSuites++;
    }
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n========================================================================');
  console.log('                   MASTER TEST RUNNER SUMMARY RESULTS                    ');
  console.log('========================================================================');
  console.log(` Total Test Suites  : ${testSuites.length}`);
  console.log(` Passed Test Suites : ${passedSuites} ✅`);
  console.log(` Failed Test Suites : ${failedSuites} ${failedSuites === 0 ? '' : '❌'}`);
  console.log(` Total Execution    : ${durationSec} seconds`);
  console.log('========================================================================\n');

  if (failedSuites > 0) {
    console.error('Quality Gate Failed: Some test suites failed execution.');
    process.exit(1);
  } else {
    console.log('✨ Quality Gate Passed: All 15 automated test suites passed clean! ✨\n');
  }
}

runMasterTestSuite();
