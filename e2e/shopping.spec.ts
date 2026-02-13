import { test, expect } from '@playwright/test';

test.describe('Shopping Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'customer@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should browse products on home page', async ({ page }) => {
    await page.goto('/');
    
    // Check if products are displayed
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible();
  });

  test('should view product details', async ({ page }) => {
    await page.goto('/');
    
    // Click first product
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Check for product details
    await page.waitForSelector('h1');
    const title = page.locator('h1');
    await expect(title).toBeVisible();
  });

  test('should add product to cart', async ({ page }) => {
    await page.goto('/');
    
    // Click first product
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Add to cart
    const addToCartBtn = page.locator('button:has-text("Agregar al carrito")');
    await addToCartBtn.click();
    
    // Check for success message
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
  });

  test('should view cart items', async ({ page }) => {
    // Add item to cart first
    await page.goto('/');
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('button:has-text("Agregar al carrito")').click();
    
    // Navigate to cart
    await page.goto('/cart');
    
    // Check cart items are displayed
    const cartItems = page.locator('[data-testid="cart-item"]');
    await expect(cartItems.first()).toBeVisible();
  });

  test('should update cart item quantity', async ({ page }) => {
    // Add item to cart first
    await page.goto('/');
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('button:has-text("Agregar al carrito")').click();
    
    // Navigate to cart
    await page.goto('/cart');
    
    // Update quantity
    const quantityInput = page.locator('input[aria-label="Cantidad"]').first();
    await quantityInput.clear();
    await quantityInput.fill('5');
    
    // Click update or wait for auto-save
    await page.waitForTimeout(500);
    
    // Verify quantity is updated
    await expect(quantityInput).toHaveValue('5');
  });

  test('should remove item from cart', async ({ page }) => {
    // Add item to cart first
    await page.goto('/');
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('button:has-text("Agregar al carrito")').click();
    
    // Navigate to cart
    await page.goto('/cart');
    
    // Remove item
    const removeBtn = page.locator('button:has-text("Eliminar")').first();
    await removeBtn.click();
    
    // Check for confirmation dialog
    const confirmBtn = page.locator('button:has-text("Confirmar")');
    await confirmBtn.click();
    
    // Cart should be empty or item removed
    const cartItems = page.locator('[data-testid="cart-item"]');
    const count = await cartItems.count();
    expect(count).toBe(0);
  });

  test('should proceed to checkout', async ({ page }) => {
    // Add item to cart first
    await page.goto('/');
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('button:has-text("Agregar al carrito")').click();
    
    // Navigate to cart
    await page.goto('/cart');
    
    // Click checkout
    const checkoutBtn = page.locator('button:has-text("Proceder al pago")');
    await checkoutBtn.click();
    
    // Should navigate to checkout
    await page.waitForURL('/checkout');
  });
});
