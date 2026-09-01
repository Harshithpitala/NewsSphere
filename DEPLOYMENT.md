# 🚀 NewsSphere Production Deployment Guide

This guide provides step-by-step instructions for deploying NewsSphere in a production cloud environment.

---

## 🏗️ 1. Production Architecture Overview

- **Frontend**: **Vercel** (React 18 + Vite SPA, Tailwind CSS)
- **Backend API & Real-Time**: **Render** (Node.js Express + Socket.IO Server)
- **Database**: **MongoDB Atlas** (Managed Cloud Database Cluster)
- **Media Optimization**: **Sharp WebP** local storage / Cloud Media Storage
- **AI Intelligence**: **Google Gemini 1.5 Flash API** (Server-Side Only)

```
[ Browser User ] ───► [ Vercel Frontend ] (https://newssphere.vercel.app)
                            │
                            ▼ (REST API & WebSockets over HTTPS/WSS)
                     [ Render Backend ] (https://newssphere-api.onrender.com)
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
       [MongoDB Atlas] [Gemini AI]  [Media Storage]
```

---

## 🔑 2. Environment Variables Matrix

### Backend Environment Variables (Render Dashboard)

| Variable | Required? | Category | Description | Example / Default |
| :--- | :---: | :--- | :--- | :--- |
| `NODE_ENV` | **Yes** | System | Environment mode | `production` |
| `PORT` | **Yes** | System | Render assigned port | Set dynamically by Render |
| `MONGODB_URI` | **Yes** | Database | MongoDB Atlas Connection String | `mongodb+srv://app_user:pass@cluster.mongodb.net/newssphere` |
| `JWT_SECRET` | **Yes** | Security | 32+ char secret for auth JWT tokens | `min_32_chars_random_secure_jwt_secret_key` |
| `JWT_EXPIRES_IN` | Optional | Security | Token expiration duration | `7d` |
| `COOKIE_SECRET` | **Yes** | Security | Secret for signed cookies | `random_secure_cookie_secret_key` |
| `CLIENT_URL` | **Yes** | CORS | Allowed Vercel Frontend domain(s) | `https://newssphere.vercel.app` |
| `SERVER_URL` | **Yes** | Assets | Render Backend URL for asset resolution | `https://newssphere-api.onrender.com` |
| `GEMINI_API_KEY` | Optional | AI | Google Gemini API Key for AI features | `AIzaSy...` |
| `NEWS_API_KEY` | Optional | News | External NewsAPI.org Key | `5275e...` |

### Frontend Environment Variables (Vercel Dashboard)

> ⚠️ **SECURITY NOTICE**: Only expose public safe variables starting with `VITE_`. Never store `JWT_SECRET`, `MONGODB_URI`, or `GEMINI_API_KEY` on Vercel!

| Variable | Required? | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| `VITE_API_URL` | **Yes** | Backend API base path | `https://newssphere-api.onrender.com/api/v1` |
| `VITE_SERVER_URL` | **Yes** | Backend server root URL for uploads & assets | `https://newssphere-api.onrender.com` |
| `VITE_SOCKET_URL` | **Yes** | Backend Socket.IO server URL | `https://newssphere-api.onrender.com` |
| `VITE_SITE_NAME` | Optional | Digital news site title | `NewsSphere` |

---

## 🗄️ 3. Step 1: Set Up MongoDB Atlas Database

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new cluster (e.g. Shared M0 Free Tier or Dedicated).
3. Under **Database Access**, create a dedicated database user:
   - User Name: `newssphere_app_user`
   - Password: Autogenerate strong password
   - Built-in Role: `readWriteAnyDatabase` (or specific access to `newssphere` database).
4. Under **Network Access**, add IP Access List entry:
   - Click **Add IP Address** $\rightarrow$ Select `Allow Access from Anywhere` (`0.0.0.0/0`) so Render cloud instances can connect.
5. Click **Connect** $\rightarrow$ Choose **Drivers (Node.js)**.
6. Copy the connection string format:
   `mongodb+srv://newssphere_app_user:<password>@cluster0.mongodb.net/newssphere?retryWrites=true&w=majority`

---

## 🖥️ 4. Step 2: Deploy Backend Server to Render

1. Log in to [Render](https://render.com).
2. Click **New +** $\rightarrow$ Select **Web Service**.
3. Connect your NewsSphere GitHub repository.
4. Fill out service settings:
   - **Name**: `newssphere-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free or Starter
5. Under **Environment Variables**, add the Backend variables documented above:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET` = `<Your Secret>`
   - `COOKIE_SECRET` = `<Your Secret>`
   - `CLIENT_URL` = `https://newssphere.vercel.app`
   - `SERVER_URL` = `https://newssphere-api.onrender.com`
6. Click **Create Web Service**.
7. Once deployed, verify the live health endpoint in your browser:
   `https://newssphere-api.onrender.com/api/v1/health`
   Expected response:
   ```json
   {
     "success": true,
     "message": "NewsSphere Backend API Operational",
     "services": {
       "database": "connected",
       "server": "healthy"
     }
   }
   ```

---

## 🌐 5. Step 3: Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your NewsSphere GitHub repository.
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   - `VITE_API_URL` = `https://newssphere-api.onrender.com/api/v1`
   - `VITE_SERVER_URL` = `https://newssphere-api.onrender.com`
   - `VITE_SOCKET_URL` = `https://newssphere-api.onrender.com`
6. Click **Deploy**.
7. SPA client-side routing rewrites are handled automatically by `client/vercel.json`.

---

## 🧪 6. Production Smoke-Test Checklist

Verify the deployed application using the following checklist:

- [ ] **Homepage & Public News**: Open `https://newssphere.vercel.app`. Verify hero banner, categories, and articles load cleanly.
- [ ] **Search**: Perform a search query (e.g. "AI" or "Smith"). Verify search results render.
- [ ] **User Registration & Login**: Register a test reader account or log in as Admin (`admin@newssphere.com`).
- [ ] **Engagement**: Bookmark an article and react with a Like. Verify counter increments.
- [ ] **Journalist & Editor CMS**: Log in as Journalist (`priya@newssphere.com`). Create an article draft and submit for review.
- [ ] **Editor Approval**: Log in as Editor (`editor@newssphere.com`). Approve the submitted draft.
- [ ] **Real-Time Updates**: Open two browser tabs. Publish a breaking story in one tab and verify the live `🔴 LIVE BREAKING NEWS` popup appears in the second tab without refreshing.
- [ ] **AI Tools**: Click "Summarize Story" or "Key Takeaways" on an article page. Verify AI output renders.
- [ ] **Admin Dashboard**: Open `/admin`. Verify user management, media library, and analytics charts.
