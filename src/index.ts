import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { initializeEnv, getEnv } from './config/env.js';
import app from './app.js';
import { prisma } from './infrastructure/database/prisma.js';
import { NotificationService } from './services/NotificationService.js';

dotenv.config();

// Initialize and validate environment variables
initializeEnv();

const env = getEnv();
const PORT = env.PORT;

// Only start server in development (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  // Test database connection before starting server
  prisma.$connect()
    .then(() => {
      // Create HTTP server
      const httpServer = createServer(app);

      // Initialize Socket.io
      const io = new SocketIOServer(httpServer, {
        cors: {
          origin: process.env.FRONTEND_URL || 'http://localhost:5173',
          methods: ['GET', 'POST'],
          credentials: true,
        },
        transports: ['websocket', 'polling'],
      });

      // Initialize notification service
      NotificationService.initialize(io);

      const server = httpServer.listen(PORT, () => {
        console.log(`[Server] Backend running on port ${PORT}`);
        console.log(`[Server] Socket.io listening at ws://localhost:${PORT}/socket.io`);
        console.log(`[Server] CORS enabled for ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      });

      // Handle unhandled errors
      process.on('unhandledRejection', (reason, promise) => {
      });

      process.on('uncaughtException', (error) => {
        process.exit(1);
      });
    })
    .catch((error) => {
      process.exit(1);
    });
}

export default app;
