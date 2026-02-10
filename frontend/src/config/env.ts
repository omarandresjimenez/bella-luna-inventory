import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url('Invalid API URL').default('http://localhost:3000/api'),
});

export type FrontendEnvConfig = z.infer<typeof envSchema>;

let cachedEnv: FrontendEnvConfig | null = null;

/**
 * Validate and return frontend environment variables
 * @throws {z.ZodError} if validation fails
 */
export function getFrontendEnv(): FrontendEnvConfig {
  if (cachedEnv) {
    return cachedEnv;
  }

  const result = envSchema.safeParse(import.meta.env);

  if (!result.success) {
    const errors = result.error.errors
      .map((err) => `${err.path.join('.')}: ${err.message}`)
      .join('\n');
    console.error(`Environment validation failed:\n${errors}`);
    throw new Error(`Environment validation failed:\n${errors}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

// Validate on module load
try {
  getFrontendEnv();
  console.log('✅ Frontend environment variables validated');
} catch (error) {
  console.error('❌ Frontend environment validation failed:', error);
  // In development, we can continue with defaults; in production, we should fail
  if (import.meta.env.PROD) {
    throw error;
  }
}
