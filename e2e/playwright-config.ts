import { defineConfig } from '@playwright/test';

/**
 * Global test setup configuration
 * Runs before all tests
 */
export default defineConfig({
  // Global timeout for all tests
  timeout: 30 * 1000,
  
  // Global navigation timeout
  navigationTimeout: 30 * 1000,
  
  // Expect timeout
  expect: {
    timeout: 5 * 1000,
  },
  
  // Global configuration
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
    ['list'],
  ],
  
  // Test retry configuration
  use: {
    // Base URL for all tests
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    
    // Trace configuration
    trace: 'on-first-retry',
    
    // Screenshot configuration
    screenshot: 'only-on-failure',
    
    // Video configuration
    video: 'retain-on-failure',
  },
});
