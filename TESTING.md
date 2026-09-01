# 🧪 NewsSphere Quality Engineering & Testing Documentation

This document outlines the testing architecture, quality gates, environment configuration, automated test suites, security permission matrices, and regression verification for the NewsSphere AI-Powered Digital News Platform.

---

## 🔺 1. Testing Strategy Pyramid

NewsSphere enforces a multi-layered testing pyramid to guarantee platform reliability, data security, and seamless user experiences:

```
                  ┌───────────────────────────┐
                  │   Manual Verification     │
                  ├───────────────────────────┤
                  │   Production Build Check  │
                  ├───────────────────────────┤
                  │  Security & IDOR Tests    │
                  ├───────────────────────────┤
                  │  End-to-End Workflow Tests │
                  ├───────────────────────────┤
                  │  API Integration Tests    │
                  └───────────────────────────┘
                  │  Unit & Business Logic    │
                  └───────────────────────────┘
```

---

## 🛠️ 2. Test Frameworks & Tools

- **Backend Unit & Integration Testing**: Native Node.js test scripts & Assert utilities (`npm test`).
- **Database Layer Isolation**: MongoDB in-memory / dedicated test database instance (`mongodb://127.0.0.1:27017/newssphere_test`).
- **Media Optimization Testing**: `Sharp` WebP image validation & file buffer inspections.
- **Real-Time Testing**: Socket.IO client-server event emitters & room isolation checks.
- **Frontend Build Verification**: Vite production compiler & bundle optimization check (`npm run build`).

---

## ⚙️ 3. Test Environment & Configuration

Automated tests operate in an isolated environment that never mutates production data or calls paid external APIs.

### Test Environment Variables (`.env.test.example`)
```env
NODE_ENV=test
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/newssphere_test
JWT_SECRET=newssphere_test_jwt_secret_key_32bytes_minimum_length_spec
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
MOCK_EXTERNAL_NEWS=true
MOCK_AI_PROVIDERS=true
ENABLE_TEST_LOGGING=false
```

---

## 🚀 4. How to Run Automated Test Suites

From the `server/` directory, execute:

### Run All 15 Test Suites (Master Quality Gate):
```bash
npm test
# or
npm run test:all
```

### Run Individual Test Suites:
```bash
npm run test:models           # 1. Models & Database Constraints
npm run test:auth             # 2. Auth & Session Management
npm run test:articles         # 3. Article CRUD & Retrieval
npm run test:external-news    # 4. External News Service
npm run test:search-trending  # 5. Search & Trending Engine
npm run test:engagement       # 6. Engagement & Bookmarks
npm run test:cms              # 7. CMS & Editorial Workflows
npm run test:admin            # 8. Admin Dashboard & Audit Logs
npm run test:analytics        # 9. Analytics & Event Ingestion
npm run test:ai               # 10. AI News Intelligence Layer
npm run test:recommendations  # 11. Personalization & Scoring
npm run test:realtime         # 12. Real-Time Updates & Sockets
npm run test:media            # 13. Media Storage & Sharp WebP
npm run test:workflow         # 14. Publishing State Machine
npm run test:security         # 15. Security, IDOR & RBAC Matrix
```

---

## 🔒 5. Security & RBAC Authorization Matrix

| User Role | Public Content | Personal Features | Journalist CMS | Editor Review | Admin Dashboard | System Settings |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **USER** | ✅ ALLOWED | ✅ ALLOWED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED |
| **JOURNALIST** | ✅ ALLOWED | ✅ ALLOWED | ✅ OWN ONLY | ❌ DENIED | ❌ DENIED | ❌ DENIED |
| **EDITOR** | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | ❌ DENIED | ❌ DENIED |
| **ADMIN** | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED |

---

## 📋 6. System Regression Matrix

| Module / System | Status | Verified Functionality |
| :--- | :---: | :--- |
| **1. Authentication & RBAC** | ✅ PASS | Registration, login, JWT cookies, role checks, password hashing. |
| **2. Public News Reading** | ✅ PASS | Homepage layout, hero banners, article detail view, categories. |
| **3. Search & Filtering** | ✅ PASS | Full-text title/content search, tag & category filters, pagination. |
| **4. Trending Engine** | ✅ PASS | Decaying popularity score formula, minimum view thresholds. |
| **5. Bookmarks & Reactions** | ✅ PASS | Toggle bookmarks, like/dislike reactions, counter increments. |
| **6. Comments System** | ✅ PASS | Nested comments, owner deletion, moderation flag filtering. |
| **7. Reading History** | ✅ PASS | Auto-logging reading history, scroll depth calculation. |
| **8. Journalist CMS** | ✅ PASS | Draft creation, autosave, cover image upload, submit for review. |
| **9. Editor Console** | ✅ PASS | Review queue, approval, rejection with feedback, scheduling. |
| **10. Admin Moderation** | ✅ PASS | User role management, content reports, audit log trails. |
| **11. Analytics & Insights** | ✅ PASS | View tracking, category analytics, author performance stats. |
| **12. AI News Intelligence** | ✅ PASS | Summary generation, key takeaways, simple explanations, mock fallback. |
| **13. Personalization Engine**| ✅ PASS | Signal affinity scoring, diversity guards, cold-start fallback. |
| **14. Real-Time Socket.IO** | ✅ PASS | Live breaking news banners, real-time comment room updates. |
| **15. Media & Uploads** | ✅ PASS | Sharp WebP responsive compression, IDOR, deletion protection. |
| **16. Publishing Workflow** | ✅ PASS | DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED -> PUBLISHED. |
| **17. Dark Mode & UI** | ✅ PASS | Contrast compliance, theme persistence, responsive tailwind layouts. |
| **18. Frontend Production** | ✅ PASS | Vite production build compiled with 0 compilation errors. |
| **19. Quality Gate** | ✅ PASS | All 15 automated backend test suites passed clean. |

---

## 🏁 7. Quality Gate Result

```text
========================================================================
                   MASTER TEST RUNNER SUMMARY RESULTS                    
========================================================================
 Total Test Suites  : 15
 Passed Test Suites : 15 ✅
 Failed Test Suites : 0 
 Total Execution    : 10.56 seconds
========================================================================

✨ Quality Gate Passed: All 15 automated test suites passed clean! ✨
```
