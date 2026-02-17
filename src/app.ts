import express from 'express';
import helmet from 'helmet';
import routes from './interface/routes/index.js';
import { errorHandler } from './shared/errors/AppError.js';

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL || '',
  'https://bella-luna-chia.vercel.app',
  'https://bella-luna-inventory.vercel.app',
].filter(origin => origin); // Remove empty strings

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin as string;
  
  // Allow requests from allowed origins or all in development
  if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-session-id');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
    },
  });
});

// Error handler
app.use(errorHandler);

// Catch-all for uncaught errors
process.on('unhandledRejection', (reason, promise) => {
});

process.on('uncaughtException', (error) => {
});

export default app;
