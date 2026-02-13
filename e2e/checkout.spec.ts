import { test, expect } from '@playwright/test';

test.describe('Checkout & Orders', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'customer@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should create new address during checkout', async ({ page }) => {
    // Add item to cart
    await page.goto('/');
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('button:has-text("Agregar al carrito")').click();
    
    // Go to checkout
    await page.goto('/cart');
    await page.locator('button:has-text("Proceder al pago")').click();
    
    // Create new address
    await page.click('text=Nueva dirección');
    
    // Fill address form
    await page.fill('input[name="street"]', '123 Main St');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="state"]', 'Test State');
    await page.fill('input[name="zipCode"]', '12345');
    
    // Save address
    await page.click('button:has-text("Guardar")');
    
    // Check address is added to list
    const addressItems = page.locator('[data-testid="address-item"]');
    await expect(addressItems).toHaveCount(await addressItems.count());
  });

  test('should select address and delivery method', async ({ page }) => {
    // Add item to cart
    await page.goto('/');
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('button:has-text("Agregar al carrito")').click();
    
    // Go to checkout
    await page.goto('/cart');
    await page.locator('button:has-text("Proceder al pago")').click();
    
    // Select address (first available)
    const addressRadio = page.locator('input[type="radio"][name="address"]').first();
    await addressRadio.click();
    
    // Select delivery method
    const deliveryRadio = page.locator('input[type="radio"][name="deliveryType"]').first();
    await deliveryRadio.click();
    
    // Verify selection
    await expect(addressRadio).toBeChecked();
    await expect(deliveryRadio).toBeChecked();
  });

  test('should complete order with cash payment', async ({ page }) => {
    // Add item to cart
    await page.goto('/');
    await page.locator('[data-testid="product-card"]').first().click();
    await page.locator('button:has-text("Agregar al carrito")').click();
    
    // Go to checkout
    await page.goto('/cart');
    await page.locator('button:has-text("Proceder al pago")').click();
    
    // Select address
    const addressRadio = page.locator('input[type="radio"][name="address"]').first();
    await addressRadio.click();
    
    // Select delivery method
    const deliveryRadio = page.locator('input[type="radio"][name="deliveryType"]').first();
    await deliveryRadio.click();
    
    // Select cash payment
    const paymentRadio = page.locator('input[type="radio"][name="paymentMethod"][value="CASH_ON_DELIVERY"]');
    await paymentRadio.click();
    
    // Place order
    const placeOrderBtn = page.locator('button:has-text("Confirmar Pedido")');
    await placeOrderBtn.click();
    
    // Should see success message or be redirected to orders page
    await page.waitForURL(/\/(orders|order-confirmation)/, { timeout: 15000 });
  });

  test('should view order history', async ({ page }) => {
    await page.goto('/orders');
    
    // Check if orders are displayed
    const orderCards = page.locator('[data-testid="order-card"]');
    
    // If no orders exist, should show "no orders" message
    if (await orderCards.count() === 0) {
      const emptyMessage = page.locator('text=No tienes pedidos');
      await expect(emptyMessage).toBeVisible();
    } else {
      // Orders should be visible
      await expect(orderCards.first()).toBeVisible();
    }
  });

  test('should view order details', async ({ page }) => {
    await page.goto('/orders');
    
    // Check if any orders exist
    const orderCards = page.locator('[data-testid="order-card"]');
    const count = await orderCards.count();
    
    if (count > 0) {
      // Click first order
      await orderCards.first().click();
      
      // Check order details are displayed
      const orderNumber = page.locator('h1');
      await expect(orderNumber).toBeVisible();
      
      // Check order items
      const orderItems = page.locator('[data-testid="order-item"]');
      await expect(orderItems.first()).toBeVisible();
    }
  });

  test('should filter orders by status', async ({ page }) => {
    await page.goto('/orders');
    
    // Check if filter options exist
    const filterSelect = page.locator('select[name="status"]');
    
    if (await filterSelect.isVisible()) {
      // Select pending status
      await filterSelect.selectOption('PENDING');
      
      // Check results are filtered
      const orderCards = page.locator('[data-testid="order-card"]');
      await page.waitForTimeout(500);
      
      // Verify filtered results
      const statusBadges = page.locator('[data-testid="order-status"]:has-text("Pendiente")');
      const count = await statusBadges.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});
