# E2E Testing Quick Start Guide

## 🚀 Getting Started

### 1. Prepare Your Environment

```bash
# Ensure you're in the project root
cd bella_luna_inventory

# Make sure all dependencies are installed
npm install
```

### 2. Prepare Test Data

```bash
# Seed database with test data
npm run db:seed

# Or if you need to reset the database
npx prisma migrate reset
npm run db:seed
```

### 3. Create Test User Accounts

**Customer Account:**
- Email: `customer@example.com`
- Password: `password123`

**Admin Account:**
- Email: `admin@example.com`
- Password: `admin123`

You can create these manually through the UI or add them to your seed script.

## 🧪 Running Tests

### Quick Start (All Tests)
```bash
npm run test:e2e
```

### Interactive Mode (Recommended for Development)
```bash
npm run test:e2e:ui
```

This opens Playwright's UI where you can:
- Click to run individual tests
- Step through tests
- Inspect elements
- View traces and screenshots

### Debug Mode
```bash
npm run test:e2e:debug
```

This opens the Playwright Inspector where you can:
- Step through each action
- Evaluate expressions
- Inspect DOM
- Resume/pause execution

### Watch Browser While Testing
```bash
npm run test:e2e:headed
```

### Run Specific Tests
```bash
# Run authentication tests only
npx playwright test auth.spec.ts

# Run tests matching a pattern
npx playwright test -g "should login"

# Run on specific browser
npx playwright test --project=chromium
```

## 📊 Viewing Results

After running tests, view the HTML report:

```bash
npx playwright show-report
```

This shows:
- Test execution timeline
- Pass/fail status
- Screenshots on failure
- Execution traces for debugging

## 🛠️ Troubleshooting

### Servers Not Starting
If you see connection errors to `localhost:3000` or `localhost:5173`:

**Option 1: Let Playwright manage servers**
```bash
npm run test:e2e
```

**Option 2: Start servers manually first**
```bash
# In one terminal
npm run dev  # Backend

# In another terminal
cd frontend
npm run dev  # Frontend

# Then in a third terminal
npm run test:e2e
```

### Database Issues
```bash
# Reset database
npx prisma migrate reset

# Reseed data
npm run db:seed
```

### Port Already in Use
```bash
# Kill Node processes
taskkill /F /IM node.exe

# Wait 2 seconds
timeout /t 2

# Try tests again
npm run test:e2e
```

### Element Not Found
- Use `npx playwright codegen http://localhost:5173` to generate selectors
- Ensure components have `data-testid` attributes
- Check element visibility with Inspector

## 📝 Writing New Tests

### Template for New Test File

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/page');
    
    // Act
    await page.click('button');
    
    // Assert
    const result = page.locator('[data-testid="result"]');
    await expect(result).toBeVisible();
  });
});
```

### Adding Data Test IDs to Components

```tsx
// In your React component
<button data-testid="submit-button">
  Submit
</button>

// In your test
await page.click('[data-testid="submit-button"]');
```

## 🎯 Test Execution Examples

### Run All Tests with Detailed Output
```bash
npx playwright test --reporter=verbose
```

### Run Tests and Generate Videos
```bash
npx playwright test --record-video=on
```

### Run Tests with Specific Timeout
```bash
npx playwright test --timeout=60000
```

### Run Tests on All Browsers
```bash
npx playwright test  # Runs on Chromium, Firefox, WebKit
```

## 📈 CI/CD Integration

For GitHub Actions:

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📚 Useful Commands Reference

```bash
# Install browsers
npx playwright install

# Generate selectors interactively
npx playwright codegen http://localhost:5173

# List all tests
npx playwright test --list

# Run tests with specific configuration
npx playwright test --config=playwright.config.ts

# Update snapshots
npx playwright test --update-snapshots

# Run tests without parallelization
npx playwright test --workers=1

# Show browser during test
npx playwright test --headed

# Debug specific test
npx playwright test auth.spec.ts --debug
```

## 🔍 Inspector & Codegen

### Use Playwright Inspector
```bash
npx playwright test --debug
```

### Generate Test Code
```bash
npx playwright codegen http://localhost:5173
```

Click on elements to record interactions, then copy the generated code.

## ✅ Common Assertions

```typescript
// Visibility
await expect(element).toBeVisible();
await expect(element).toBeHidden();

// Text content
await expect(element).toContainText('text');
await expect(element).toHaveText('exact text');

// Attributes
await expect(element).toHaveAttribute('href', '/path');
await expect(element).toHaveClass('active');

// Form inputs
await expect(input).toHaveValue('value');
await expect(checkbox).toBeChecked();

// Count
await expect(elements).toHaveCount(5);

// URLs
await expect(page).toHaveURL('/path');
```

## 🎪 Test Fixtures

Available fixtures:

```typescript
import { test } from './fixtures/fixtures';

test('with auth', async ({ authenticatedPage }) => {
  // Page is logged in as customer
});

test('admin only', async ({ adminAuthenticatedPage }) => {
  // Page is logged in as admin
});
```

## 📞 Getting Help

- Check [Playwright Documentation](https://playwright.dev)
- Review test examples in `e2e/*.spec.ts`
- Use `npx playwright show-report` to see failures
- Enable trace: `trace: 'on'` in config for detailed debugging

---

**Happy Testing! 🎉**
