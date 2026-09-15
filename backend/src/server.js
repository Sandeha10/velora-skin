import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

// Connect Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Velora Skin Server] Running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle Unhandled Promise Rejections (e.g. Database dropped)
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] ${err.name}: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful Shutdown on termination signal
process.on('SIGTERM', () => {
  console.log('[SIGTERM Received] Shutting down gracefully...');
  server.close(() => {
    console.log('[Process Terminated]');
  });
});