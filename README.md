# 📰 NewsSphere — Advanced AI-Powered Digital News Platform

NewsSphere is a modern, enterprise-grade AI digital news platform featuring personalized recommendation algorithms, real-time Socket.IO update streams, editorial publishing workflows (Journalist Desk, Editor Review Queue, Admin Moderation Suite), media optimization pipeline (Sharp WebP responsive delivery), and AI reader intelligence.

---

## 🌟 Key Features

1. **Editorial & Public News Experience**:
   - High-impact newspaper-inspired editorial layout with dark/light themes.
   - Breaking news ticker & real-time Socket.IO toast banners.
   - Category feeds, topic tags, and full-text search engine.

2. **Personalization & Recommendation Engine**:
   - Explainable scoring algorithm combining implicit reading signals (reading depth, completion %, bookmarks, reactions, searches) with decay half-life factors.
   - 40% Category diversity guard and privacy-first user isolation.

3. **AI News Intelligence Layer**:
   - Executive story summaries, key takeaways, and simplified explanations.
   - Server-side API key protection with graceful fallback routines.

4. **Multi-Role Publishing & CMS**:
   - **Journalist Desk**: Draft creation, autosave, cover photo selector/uploader.
   - **Editor Console**: Submission queues, approval/rejection notes, scheduled publishing.
   - **Admin Dashboard**: System health, user role management, content reports, media library, and analytics charts.

5. **Advanced Media Management**:
   - Sharp WebP compression at 82% quality.
   - 3-tier responsive image generation (`small` 400w, `medium` 800w, `large` 1200w).
   - Live article deletion protection & IDOR security safeguards.

6. **Quality Engineering & Automated Test Suite**:
   - 15 automated test suites covering DB constraints, Auth, Workflows, Search, Recommendations, Socket.IO, Media, and Security/RBAC matrix (`npm test`).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, TanStack Query, Framer Motion, Axios, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO, Mongoose, Multer, Sharp Image Processing, Zod Validation, Helmet, Rate Limiter
- **Database**: MongoDB (Local / Atlas Cloud)
- **Deployment**: Vercel (Frontend), Render (Backend API), MongoDB Atlas (Cloud DB)

---

## 🚀 Local Quickstart Guide

### 1. Prerequisites
- Node.js v18+
- MongoDB instance running locally on `mongodb://127.0.0.1:27017` or Atlas connection string.

### 2. Environment Setup
Copy `.env.example` to `.env` in the `server/` directory:
```bash
cp server/.env.example server/.env
```

### 3. Install Dependencies
```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 4. Seed Seed Data
Populate categories, tags, default users (Admin, Editor, Journalist, User), and published news articles:
```bash
cd server
npm run seed
```

**Verified Test Account Credentials**:
- **Admin**: `admin@newssphere.com` / `DevPassword123!`
- **Editor**: `editor@newssphere.com` / `DevPassword123!`
- **Journalist**: `priya@newssphere.com` / `DevPassword123!`
- **User**: `user@newssphere.com` / `DevPassword123!`

### 5. Run Local Development Servers
```bash
# Terminal 1 - Backend Server (Port 5000)
cd server
npm run dev

# Terminal 2 - Frontend Client (Port 5173)
cd client
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

Run the master test suite executing all 15 system test suites:

```bash
cd server
npm test
```

Build production client bundle:
```bash
cd client
npm run build
```

---

## 🌐 Production Deployment

Refer to [`DEPLOYMENT.md`](./DEPLOYMENT.md) for full step-by-step production deployment instructions for **Vercel** (Frontend), **Render** (Backend), and **MongoDB Atlas** (Database).
