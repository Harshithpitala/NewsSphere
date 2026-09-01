import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

const router = Router();

router.get(
  '/health',
  asyncHandler(async (req, res) => {
    const dbStateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const dbState = dbStateMap[mongoose.connection.readyState] || 'unknown';

    res.status(200).json({
      success: true,
      message: 'NewsSphere Backend API Operational',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbState,
        server: 'healthy',
      },
    });
  })
);

export default router;
