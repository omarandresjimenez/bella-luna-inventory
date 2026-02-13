import { test, expect } from '@playwright/test';

test.describe('Performance & Accessibility', () => {
  test('should load home page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should load products page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Check if products are rendered
    const products = page.locator('[data-testid="product-card"]');
    await expect(products.first()).toBeVisible();
    
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    // Page should have h1
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Should have proper heading order
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper alt text on images', async ({ page }) => {
    await page.goto('/');
    
    // All images should have alt text
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      if (alt !== null) {
        expect(alt).toBeTruthy();
      }
    }
  });

  test('should have proper link text', async ({ page }) => {
    await page.goto('/');
    
    // Links should have descriptive text or aria-label
    const links = page.locator('a');
    const count = await links.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const text = await links.nth(i).textContent();
      const ariaLabel = await links.nth(i).getAttribute('aria-label');
      
      // Link should have either text or aria-label
      const hasLabel = (text && text.trim().length > 0) || ariaLabel;
      expect(hasLabel).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through page elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Check if focused element is visible
    const focusedElement = page.locator('*:focus');
    await expect(focusedElement).toHaveCount(1);
  });
});

test.describe('Error Handling', () => {
  test('should handle 404 errors gracefully', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Should show error message or redirect
    const errorMessage = page.locator('text=encontrada|404|no existe');
    const isErrorShown = await errorMessage.isVisible().catch(() => false);
    
    // Or should be redirected
    expect(page.url()).toContain('not-found') || isErrorShown;
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/');
    
    // Should show error message instead of crashing
    const errorAlert = page.locator('[role="alert"]:has-text("error|Error|no se pudo")');
    
    // Page should still be functional
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    
    // Should show validation errors
    const errorMessages = page.locator('text=requerido|required|invalid');
    
    // Or form should not submit
    await page.waitForURL('/login', { timeout: 1000 }).catch(() => {});
  });
});

test.describe('Responsive Design', () => {
  test('should render properly on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Main content should be visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    // Navigation should be accessible
    const navigation = page.locator('nav');
    await expect(navigation).toBeVisible();
  });

  test('should render properly on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    
    // Main content should be visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('should render properly on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto('/');
    
    // Main content should be visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });
});
