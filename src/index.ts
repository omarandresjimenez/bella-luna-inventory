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
      console.log('✅ Database connected');
      const server = app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
      });

      // Handle unhandled errors
      process.on('unhandledRejection', (reason, promise) => {
        console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      });

      process.on('uncaughtException', (error) => {
        console.error('❌ Uncaught Exception:', error);
        process.exit(1);
      });
    })
    .catch((error) => {
      console.error('❌ Failed to connect to database:', error);
      process.exit(1);
    });
}

export default app;
