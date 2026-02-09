import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_KEY || '',
  },

  // SendGrid
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@bellaluna.com',
  },

  // Redis (optional)
  redis: {
    url: process.env.REDIS_URL,
  },
};

// Validation
if (!config.jwt.secret || config.jwt.secret === 'default-secret-change-in-production') {
  console.warn('⚠️  WARNING: Using default JWT secret. Change this in production!');
}

if (!config.supabase.url || !config.supabase.serviceKey) {
  console.warn('⚠️  WARNING: Supabase credentials not configured');
}

if (!config.sendgrid.apiKey) {
  console.warn('⚠️  WARNING: SendGrid API key not configured');
}
