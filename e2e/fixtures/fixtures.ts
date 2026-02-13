import { test as base } from '@playwright/test';
import { login, customerLogin, adminLogin, logout } from '../helpers/auth';

type TestFixtures = {
  authenticatedPage: void;
  customerAuthenticatedPage: void;
  adminAuthenticatedPage: void;
};

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await customerLogin(page, 'customer@example.com', 'password123');
    await use();
    await logout(page);
  },

  customerAuthenticatedPage: async ({ page }, use) => {
    await customerLogin(page, 'customer@example.com', 'password123');
    await use();
  },

  adminAuthenticatedPage: async ({ page }, use) => {
    await adminLogin(page, 'admin@example.com', 'admin123');
    await use();
  },
});

export { expect } from '@playwright/test';
