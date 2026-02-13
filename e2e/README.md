# E2E Testing Suite - Bella Luna Inventory

Complete end-to-end testing suite using Playwright for the Bella Luna Inventory management system.

## Installation

Playwright is already installed. To install additional browsers (if needed):

```bash
npx playwright install
```

## Test Structure

The E2E tests are organized into the following test suites:

### 0. **Complete User Journey Tests** (`complete-user-journey.spec.ts`) ⭐ NEW
Complete end-to-end user journey with 15+ validation steps:
- Load home page and validate page structure
- Browse products by category
- Select product and view details
- Select product variants (size, color, etc.)
- Add product to cart with validation
- Login with customer account
- View shopping cart contents
- Proceed to checkout
- Select delivery address
- Select delivery method
- Select payment method
- Review order summary
- Complete order placement
- Verify order confirmation
- **See [COMPLETE_JOURNEY_README.md](COMPLETE_JOURNEY_README.md) for full details**

### 1. **Authentication Tests** (`auth.spec.ts`)
- User registration with validation
- Login with valid credentials
- Error handling for invalid credentials
- Logout functionality

### 2. **Shopping Flow Tests** (`shopping.spec.ts`)
- Browse products on home page
- View product details
- Add products to cart
- View cart items
- Update cart item quantities
- Remove items from cart
- Proceed to checkout

### 3. **Checkout & Orders Tests** (`checkout.spec.ts`)
- Create new addresses during checkout
- Select address and delivery method
- Complete order with cash payment
- View order history
- View order details
- Filter orders by status

### 4. **Favorites Tests** (`favorites.spec.ts`)
- Add products to favorites
- Remove products from favorites
- View favorites page
- Remove items from favorites page
- Add favorites to cart

### 5. **Admin Tests** (`admin.spec.ts`)

#### Products
- View products list
- Search products
- View product details
- Create new products
- Edit products
- Delete products

#### Categories
- View categories list
- Create new categories
- Delete categories

### 6. **Performance & Accessibility Tests** (`performance.spec.ts`)

#### Performance
- Page load time verification
- Product page load time

#### Accessibility
- Heading hierarchy validation
- Image alt text verification
- Link text validation
- Keyboard navigation

## Test Statistics

| Suite | Tests | Coverage |
|-------|-------|----------|
| Complete User Journey | 3 | Full customer flow (15 steps per test) |
| Authentication | 4 | Register, login, errors, logout |
| Shopping Flow | 7 | Browse, add to cart, manage |
| Checkout & Orders | 6 | Address, payment, order history |
| Favorites | 5 | Add, remove, manage favorites |
| Admin Operations | 8 | Product & category management |
| Performance & Quality | 11 | Load time, accessibility, responsive |
| **TOTAL** | **44** | **Complete application coverage** |
- Focus management

#### Error Handling
- 404 error handling
- Network error handling
- Form validation

#### Responsive Design
- Mobile viewport (375x667)
- Tablet viewport (768x1024)
- Desktop viewport (1920x1080)

## Running Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run Tests in UI Mode
Interactive mode with visual test explorer:
```bash
npm run test:e2e:ui
```

### Run Tests in Debug Mode
Step through tests with debugger:
```bash
npm run test:e2e:debug
```

### Run Tests in Headed Mode
See browser window while tests run:
```bash
npm run test:e2e:headed
```

### Run Specific Test File
```bash
npx playwright test e2e/auth.spec.ts
```

### Run Tests Matching Pattern
```bash
npx playwright test -g "should login"
```

### Run Tests for Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Configuration

The Playwright configuration (`playwright.config.ts`) includes:

- **Base URL**: `http://localhost:5173`
- **Test Directory**: `./e2e`
- **Report Format**: HTML
- **Screenshots**: On failure only
- **Trace**: On first retry
- **Browsers**: Chromium, Firefox, WebKit
- **Web Servers**: Automatically starts frontend (5173) and backend (3000)

## Test Data Requirements

Before running tests, ensure:

1. **Backend is running or will auto-start**: `npm run dev`
2. **Frontend is running or will auto-start**: `npm run dev` (frontend folder)
3. **Database is seeded with test data**
4. **Test accounts exist**:
   - Customer: `customer@example.com` / `password123`
   - Admin: `admin@example.com` / `admin123`

## Environment Setup

### Before Running Tests
```bash
# Install dependencies
npm install
npm install -D @playwright/test

# Seed database with test data (if needed)
npm run db:seed

# Ensure servers are running or let playwright start them
```

## Test Selectors & Best Practices

Tests use the following selector strategies:

1. **Data Test IDs**: `[data-testid="component-name"]` (preferred)
2. **ARIA Labels**: `[aria-label="Label"]`
3. **Text Content**: `text=Button Text`
4. **Form Inputs**: `input[name="field"]`, `textarea[name="field"]`
5. **Standard HTML**: `button`, `a`, `form`

### Adding Data Test IDs to Components

When adding new features, include data test IDs:

```tsx
// Products
<Card data-testid="product-card">
<Button data-testid="favorite-btn">
<Button data-testid="add-to-cart-btn">

// Cart
<Box data-testid="cart-item">

// Orders
<Box data-testid="order-card">
<Box data-testid="order-item">

// Admin
<Box data-testid="category-card">
```

## Debugging Tests

### View Test Report
After running tests:
```bash
npx playwright show-report
```

### Run Single Test
```bash
npx playwright test e2e/auth.spec.ts -g "should login"
```

### Generate Trace for Investigation
```bash
npx playwright test --trace on
```

## CI/CD Integration

For GitHub Actions or other CI systems:

```bash
npm run test:e2e
```

The configuration respects `CI` environment variable:
- Runs tests serially
- Retries failed tests twice
- Generates full trace and screenshots

## Common Issues & Solutions

### Tests Can't Find Elements
- Ensure selectors match your component structure
- Use `npx playwright codegen http://localhost:5173` to generate selectors
- Check that data-testid attributes are added to components

### Tests Timeout Waiting for Navigation
- Increase timeout: `await page.waitForURL(url, { timeout: 15000 })`
- Ensure form submissions actually navigate
- Check network requests in trace

### Database State Issues
- Ensure clean database before tests
- Use unique data (timestamps) for test data
- Consider resetting database between test runs

### Port Already in Use
- Close existing processes: `taskkill /F /IM node.exe`
- Or configure different ports in `playwright.config.ts`

## Extending Tests

### Add New Test Suite
1. Create new file: `e2e/feature.spec.ts`
2. Import test framework: `import { test, expect } from '@playwright/test';`
3. Define test cases
4. Run: `npx playwright test e2e/feature.spec.ts`

### Use Custom Fixtures
```typescript
import { test, expect } from './fixtures/fixtures';

test('should test with authentication', async ({ authenticatedPage }) => {
  // Page is already logged in
});
```

## Performance Benchmarks

Current test execution times (baseline):
- Authentication: ~5-10 seconds
- Shopping: ~15-20 seconds
- Checkout: ~20-30 seconds
- Admin: ~30-40 seconds
- All tests: ~120-150 seconds

## Test Coverage Goals

Current coverage:
- ✅ Authentication (4 tests)
- ✅ Shopping Flow (7 tests)
- ✅ Checkout & Orders (6 tests)
- ✅ Favorites (5 tests)
- ✅ Admin Operations (8 tests)
- ✅ Performance & Accessibility (11 tests)

**Total: 41 E2E tests**

### Future Test Additions
- [ ] Payment method validation
- [ ] Inventory management
- [ ] User profile management
- [ ] Email notifications
- [ ] Product reviews
- [ ] Discount/Coupon codes
- [ ] Wishlist sharing
- [ ] Multi-language support

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

## Contributing

When adding new features:
1. Write E2E tests covering happy path and error cases
2. Add data-testid attributes to components
3. Update this README with test descriptions
4. Run full test suite before committing
