import { Page } from '@playwright/test';

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
}

export async function customerLogin(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
}

export async function adminLogin(page: Page, email: string, password: string) {
  await page.goto('/admin/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/admin');
}

export async function logout(page: Page) {
  // Click user menu
  await page.click('[data-testid="user-menu-button"]');
  // Click logout
  await page.click('text=Cerrar sesión');
  await page.waitForURL('/login');
}

export async function addProductToCart(page: Page, productName: string, quantity: number = 1) {
  // Search or navigate to product
  await page.goto('/');
  
  // Click on product (adjust selector as needed)
  await page.click(`text=${productName}`);
  
  // Wait for product page to load
  await page.waitForSelector('button:has-text("Agregar al carrito")');
  
  // Set quantity if needed
  if (quantity > 1) {
    const quantityInput = page.locator('input[aria-label="Cantidad"]');
    await quantityInput.clear();
    await quantityInput.fill(quantity.toString());
  }
  
  // Add to cart
  await page.click('button:has-text("Agregar al carrito")');
  
  // Wait for success message or cart update
  await page.waitForSelector('[role="alert"]');
}

export async function viewCart(page: Page) {
  await page.goto('/cart');
}

export async function checkoutCart(page: Page) {
  await page.goto('/checkout');
}
