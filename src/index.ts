import dotenv from 'dotenv';
import { initializeEnv, getEnv } from './config/env';
import app from './app';

dotenv.config();

// Initialize and validate environment variables
initializeEnv();

const env = getEnv();
const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
});
