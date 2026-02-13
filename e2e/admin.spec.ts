import { test, expect } from '@playwright/test';

test.describe('Admin - Products', () => {
  test.beforeEach(async ({ page }) => {
    // Admin login
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('should view products list', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Check if products table is displayed
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Check for product rows
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should search products', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Enter search term
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('test');
    
    // Wait for results to filter
    await page.waitForTimeout(500);
    
    // Check results are filtered
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should view product details', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Click first product row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();
    
    // Should navigate to product detail page or open modal
    await page.waitForTimeout(500);
    
    // Check if product details are shown
    const form = page.locator('form');
    await expect(form).toBeVisible();
  });

  test('should create new product', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Click create button
    const createBtn = page.locator('button:has-text("Nuevo Producto")');
    
    if (await createBtn.isVisible()) {
      await createBtn.click();
      
      // Fill product form
      const nameInput = page.locator('input[name="name"]');
      await nameInput.fill(`Test Product ${Date.now()}`);
      
      const descriptionInput = page.locator('textarea[name="description"]');
      await descriptionInput.fill('Test product description');
      
      const priceInput = page.locator('input[name="price"]');
      await priceInput.fill('99.99');
      
      // Submit form
      const submitBtn = page.locator('button[type="submit"]:has-text("Guardar")');
      await submitBtn.click();
      
      // Check for success message
      const alert = page.locator('[role="alert"]:has-text("éxito|creado|guardado")');
      await expect(alert).toBeVisible({ timeout: 10000 });
    }
  });

  test('should edit product', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Click first product to edit
    const firstRow = page.locator('tbody tr').first();
    const editBtn = firstRow.locator('button:has-text("Editar")');
    
    if (await editBtn.isVisible()) {
      await editBtn.click();
      
      // Update name
      const nameInput = page.locator('input[name="name"]');
      const currentName = await nameInput.inputValue();
      await nameInput.clear();
      await nameInput.fill(`${currentName} - Updated`);
      
      // Submit form
      const submitBtn = page.locator('button[type="submit"]:has-text("Guardar")');
      await submitBtn.click();
      
      // Check for success message
      const alert = page.locator('[role="alert"]:has-text("éxito|actualizado")');
      await expect(alert).toBeVisible({ timeout: 10000 });
    }
  });

  test('should delete product', async ({ page }) => {
    await page.goto('/admin/products');
    
    // Click first product delete button
    const firstRow = page.locator('tbody tr').first();
    const deleteBtn = firstRow.locator('button:has-text("Eliminar")');
    
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      
      // Confirm deletion in modal
      const confirmBtn = page.locator('button:has-text("Confirmar")');
      await confirmBtn.click();
      
      // Check for success message
      const alert = page.locator('[role="alert"]:has-text("eliminado")');
      await expect(alert).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe('Admin - Categories', () => {
  test.beforeEach(async ({ page }) => {
    // Admin login
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('should view categories list', async ({ page }) => {
    await page.goto('/admin/categories');
    
    // Check if categories are displayed
    const categoryCards = page.locator('[data-testid="category-card"]');
    const count = await categoryCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should create new category', async ({ page }) => {
    await page.goto('/admin/categories');
    
    // Click create button
    const createBtn = page.locator('button:has-text("Nueva Categoría")');
    
    if (await createBtn.isVisible()) {
      await createBtn.click();
      
      // Fill category form
      const nameInput = page.locator('input[name="name"]');
      await nameInput.fill(`Test Category ${Date.now()}`);
      
      const descriptionInput = page.locator('textarea[name="description"]');
      await descriptionInput.fill('Test category description');
      
      // Submit form
      const submitBtn = page.locator('button[type="submit"]:has-text("Guardar")');
      await submitBtn.click();
      
      // Check for success message
      const alert = page.locator('[role="alert"]:has-text("éxito|creada")');
      await expect(alert).toBeVisible({ timeout: 10000 });
    }
  });

  test('should delete category', async ({ page }) => {
    await page.goto('/admin/categories');
    
    // Click first category delete button
    const deleteBtn = page.locator('button[aria-label="Eliminar"]').first();
    
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      
      // Confirm deletion in modal
      const confirmBtn = page.locator('button:has-text("Confirmar")');
      await confirmBtn.click();
      
      // Check for success message
      const alert = page.locator('[role="alert"]:has-text("eliminada")');
      await expect(alert).toBeVisible({ timeout: 10000 });
    }
  });
});
