import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should register a new customer', async ({ page }) => {
    await page.goto('/register');
    
    // Fill registration form
    const randomEmail = `customer${Date.now()}@example.com`;
    await page.fill('input[name="email"]', randomEmail);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to login or home
    await page.waitForURL(/\/(login|home|)/, { timeout: 10000 });
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form
    await page.fill('input[name="email"]', 'customer@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to home
    await page.waitForURL('/', { timeout: 10000 });
    
    // Check for user menu or logged-in indicator
    const userMenu = page.locator('[data-testid="user-menu-button"]');
    await expect(userMenu).toBeVisible();
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login form with invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show error message
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/error|invalid|credenciales/i);
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'customer@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Logout
    await page.click('[data-testid="user-menu-button"]');
    await page.click('text=Cerrar sesión');
    
    // Should redirect to login
    await page.waitForURL('/login');
  });
});
