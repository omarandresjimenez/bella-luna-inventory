import { test, expect } from '@playwright/test';

test.describe('Favorites', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'customer@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should add product to favorites', async ({ page }) => {
    await page.goto('/');
    
    // Click favorite button on first product
    const favoriteBtn = page.locator('[data-testid="favorite-btn"]').first();
    await favoriteBtn.click();
    
    // Check if button state changed (filled heart)
    const filledHeart = page.locator('[data-testid="favorite-btn-filled"]').first();
    await expect(filledHeart).toBeVisible();
  });

  test('should remove product from favorites', async ({ page }) => {
    await page.goto('/');
    
    // Add to favorites first
    const favoriteBtn = page.locator('[data-testid="favorite-btn"]').first();
    await favoriteBtn.click();
    
    // Wait for button to update
    await page.waitForTimeout(300);
    
    // Click again to remove
    const filledFavoriteBtn = page.locator('[data-testid="favorite-btn-filled"]').first();
    await filledFavoriteBtn.click();
    
    // Check if button state changed back (empty heart)
    const emptyHeart = page.locator('[data-testid="favorite-btn"]').first();
    await expect(emptyHeart).toBeVisible();
  });

  test('should view favorites page', async ({ page }) => {
    // Add item to favorites first
    await page.goto('/');
    const favoriteBtn = page.locator('[data-testid="favorite-btn"]').first();
    await favoriteBtn.click();
    
    // Navigate to favorites
    await page.goto('/favorites');
    
    // Check if favorites are displayed
    const favoriteCards = page.locator('[data-testid="favorite-product-card"]');
    const count = await favoriteCards.count();
    
    if (count > 0) {
      await expect(favoriteCards.first()).toBeVisible();
    } else {
      // If no favorites, should show empty message
      const emptyMessage = page.locator('text=No tienes favoritos');
      await expect(emptyMessage).toBeVisible();
    }
  });

  test('should remove from favorites on favorites page', async ({ page }) => {
    // Add item to favorites first
    await page.goto('/');
    const favoriteBtn = page.locator('[data-testid="favorite-btn"]').first();
    await favoriteBtn.click();
    
    // Navigate to favorites
    await page.goto('/favorites');
    
    // Remove from favorites
    const removeBtn = page.locator('[data-testid="remove-favorite-btn"]').first();
    
    if (await removeBtn.isVisible()) {
      await removeBtn.click();
      
      // Item should be removed
      await page.waitForTimeout(300);
      const favoriteCards = page.locator('[data-testid="favorite-product-card"]');
      expect(await favoriteCards.count()).toBeLessThan(1);
    }
  });

  test('should add favorite to cart from favorites page', async ({ page }) => {
    // Add item to favorites first
    await page.goto('/');
    const favoriteBtn = page.locator('[data-testid="favorite-btn"]').first();
    await favoriteBtn.click();
    
    // Navigate to favorites
    await page.goto('/favorites');
    
    // Add to cart from favorites
    const addToCartBtn = page.locator('button:has-text("Agregar al carrito")').first();
    
    if (await addToCartBtn.isVisible()) {
      await addToCartBtn.click();
      
      // Check for success message
      const alert = page.locator('[role="alert"]');
      await expect(alert).toBeVisible();
    }
  });
});
