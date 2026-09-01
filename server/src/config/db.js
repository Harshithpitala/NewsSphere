import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`[MongoDB] Connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    // In dev without running mongo instance, don't crash hard if optional DB connection fails during initial setup test
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
