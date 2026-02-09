import dotenv from 'dotenv';
import app from '../src/app';

dotenv.config();

// Vercel serverless handler
export default app;
