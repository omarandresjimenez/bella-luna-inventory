import dotenv from 'dotenv';
import { initializeEnv, getEnv } from './config/env';
import app from './app';

dotenv.config();

// Initialize and validate environment variables
initializeEnv();

const env = getEnv();
const PORT = env.PORT;

// Only start server in development (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}

export default app;
