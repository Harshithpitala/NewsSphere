import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dns from 'dns';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { startScheduledPublisher } from './services/publisher.service.js';

// Force Node.js to resolve IPv4 addresses first for outbound connections (SMTP/MongoDB)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Routers
import healthRouter from './routes/health.routes.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import articleRouter from './routes/article.routes.js';
import categoryRouter from './routes/category.routes.js';
import tagRouter from './routes/tag.routes.js';
import externalNewsRouter from './routes/externalNews.routes.js';
import bookmarkRouter from './routes/bookmark.routes.js';
import reactionRouter from './routes/reaction.routes.js';
import commentRouter from './routes/comment.routes.js';
import reportRouter from './routes/report.routes.js';
import historyRouter from './routes/history.routes.js';
import cmsRouter from './routes/cms.routes.js';
import adminRouter from './routes/admin.routes.js';
import analyticsRouter from './routes/analytics.routes.js';
import aiRouter from './routes/ai.routes.js';
import recommendationRouter from './routes/recommendation.routes.js';
import mediaRouter from './routes/media.routes.js';

import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const httpServer = createServer(app);

app.set('trust proxy', 1);

const parseOrigins = (urlStr) => {
  if (!urlStr) return ['http://localhost:5173', 'https://news-sphere-peach.vercel.app'];
  return urlStr.split(',').map((s) => s.trim().replace(/\/$/, ''));
};

const allowedOrigins = parseOrigins(env.CLIENT_URL);

const corsOriginHandler = (origin, callback) => {
  if (!origin) return callback(null, true);
  const cleanOrigin = origin.replace(/\/$/, '');
  if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes('*')) {
    return callback(null, true);
  }
  if (cleanOrigin.endsWith('.vercel.app') || cleanOrigin.includes('localhost')) {
    return callback(null, true);
  }
  return callback(null, true);
};

// Socket.IO Setup
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: corsOriginHandler,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_article_room', (articleId) => {
    socket.join(`article:${articleId}`);
  });

  socket.on('leave_article_room', (articleId) => {
    socket.leave(`article:${articleId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Middleware Architecture
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: corsOriginHandler,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.COOKIE_SECRET));

// Static Media Folder Setup
app.use('/uploads', express.static('uploads'));

// Routes Configuration
app.use('/api/v1', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/articles', articleRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/tags', tagRouter);
app.use('/api/v1/external-news', externalNewsRouter);
app.use('/api/v1/bookmarks', bookmarkRouter);
app.use('/api/v1/reactions', reactionRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/reports', reportRouter);
app.use('/api/v1/history', historyRouter);
app.use('/api/v1/cms', cmsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/admin/analytics', analyticsRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/recommendations', recommendationRouter);
app.use('/api/v1/media', mediaRouter);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Database connection & HTTP listener initialization
connectDB();

if (process.env.NODE_ENV !== 'test' && !process.argv[1]?.includes('.test.')) {
  startScheduledPublisher();
  httpServer.listen(env.PORT, () => {
    console.log(`\n🚀 NewsSphere Server running on ${env.SERVER_URL}`);
    console.log(`📡 Healthcheck: ${env.SERVER_URL}/api/v1/health\n`);
  });
}

export default app;
