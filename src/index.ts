import dotenv from 'dotenv';
import { initializeEnv, getEnv } from './config/env.js';
import app from './app.js';
import { prisma } from './infrastructure/database/prisma.js';

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
      const server = app.listen(PORT, () => {
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
