# Complete User Journey E2E Test

## Overview

This comprehensive E2E test covers the **complete end-to-end user journey** from browsing products to completing an order. It validates the entire customer experience with detailed assertions at every step.

## Test Coverage

### Main Test: Complete Purchase Flow (15 Steps)

1. **Load Home Page**
   - Validates page loads correctly
   - Checks navigation is visible
   - Verifies main content is rendered

2. **Browse Products by Category**
   - Selects product category (if available)
   - Validates products load
   - Counts displayed products

3. **Select a Product**
   - Clicks on a product card
   - Validates product details page loads
   - Checks product title and description

4. **Select Product Variants**
   - Finds variant selectors (size, color, etc.)
   - Selects variant options
   - Validates selection updates UI

5. **Add Product to Cart**
   - Clicks "Add to Cart" button
   - Validates success message
   - Confirms cart updated

6. **Navigate to Login**
   - Goes to login page
   - Validates login form is displayed
   - Checks email and password fields

7. **Perform Login**
   - Fills email field
   - Fills password field
   - Submits login form
   - Validates redirect to home page
   - Checks user menu appears

8. **View Shopping Cart**
   - Navigates to cart page
   - Validates cart items are displayed
   - Checks cart summary is visible
   - Counts items in cart

9. **Proceed to Checkout**
   - Clicks checkout button
   - Validates checkout page loads
   - Confirms navigation to /checkout

10. **Select Delivery Address**
    - Selects existing address OR creates new
    - Validates selection
    - Checks address form (if creating new)

11. **Select Delivery Method**
    - Selects shipping option
    - Validates selection
    - Confirms UI updates

12. **Select Payment Method**
    - Selects payment option
    - Validates selection
    - Checks payment label

13. **Review Order Summary**
    - Validates order summary displays
    - Checks order items listed
    - Confirms total price visible

14. **Place Order**
    - Clicks place order button
    - Validates success message
    - Checks redirect to orders page

15. **Verify Order Confirmation**
    - Navigates to orders page
    - Validates new order appears
    - Checks order status
    - Verifies order number

### Additional Tests

**Quick Purchase for Authenticated User**
- Tests expedited checkout for logged-in users
- Validates address pre-population
- Confirms checkout accessibility

**Cart Consistency Validation**
- Adds product and checks cart
- Validates product name matches
- Confirms totals are calculated

## Running the Complete User Journey Test

### Command
```bash
npx playwright test e2e/complete-user-journey.spec.ts
```

### Interactive Mode
```bash
npx playwright test e2e/complete-user-journey.spec.ts --ui
```

### Debug Mode
```bash
npx playwright test e2e/complete-user-journey.spec.ts --debug
```

### Watch Browser
```bash
npx playwright test e2e/complete-user-journey.spec.ts --headed
```

### Specific Test
```bash
npx playwright test e2e/complete-user-journey.spec.ts -g "complete full purchase flow"
```

## Pre-Testing Requirements

Before running this test, ensure:

1. **Test User Account Exists**
   ```
   Email: customer@example.com
   Password: password123
   ```

2. **Database is Seeded**
   ```bash
   npm run db:seed
   ```

3. **Products Available**
   - At least one product in database
   - Product variants (if testing variant selection)
   - Product categories (if testing category browsing)

4. **Addresses Available (optional)**
   - Existing addresses for the test customer (for address selection step)
   - Or allow new address creation

5. **Servers Running**
   - Playwright will auto-start, or use:
     ```bash
     npm run dev              # Backend
     npm run dev              # Frontend (in separate terminal)
     ```

## Test Output

Each step logs validation results:

```
✅ Home page loaded successfully
✅ Category selected, 12 products found
✅ Product selected: Wireless Headphones
✅ Variant selected: Blue-Large
✅ Product added to cart: Product added to cart successfully
✅ Login page loaded correctly
✅ Login successful, redirected to home page
✅ Cart page loaded with 1 item(s)
✅ Checkout page loaded
✅ Delivery address selected
✅ Delivery method selected: Home Delivery
✅ Payment method selected: Cash on Delivery
✅ Order summary visible: Subtotal: $99.99...
✅ Order placement completed
✅ Order status: Pending
✅ Order number: #ORD-2026021200001
```

## Debugging Failed Steps

If a step fails:

1. **Run in Debug Mode**
   ```bash
   npx playwright test e2e/complete-user-journey.spec.ts --debug
   ```

2. **View HTML Report**
   ```bash
   npx playwright show-report
   ```

3. **Check Screenshots**
   - Report contains failure screenshots
   - Shows exact page state at failure

4. **Review Trace**
   - Trace files available in report
   - Can step through entire test

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Product card not found" | Seed database with products, check product page structure |
| "Checkout page not loading" | Ensure cart has items, check /checkout route exists |
| "Address not showing" | Create test customer addresses first or enable new address creation |
| "Login fails" | Verify customer@example.com account exists in database |
| "Cart items missing" | Check cart API endpoint, verify session storage |

## Customization

### Modify Test Credentials
Edit in test file or environment:
```typescript
const testEmail = 'your-test@example.com';
const testPassword = 'your-password';
```

### Change Product Selection
```typescript
// Select second product instead of first
await productCards.nth(1).click();
```

### Skip Variant Selection
Remove or modify the variant selection step:
```typescript
// Option: Check if variants exist
if (await variantSelects.count() === 0) {
  console.log('No variants to select');
}
```

### Test Different Payment Methods
```typescript
// Select cash on delivery
await paymentRadios.filter({ has: page.locator('text=Cash on Delivery') }).click();
```

## Performance Metrics

Expected test execution times:
- **Complete Journey**: 45-60 seconds
- **Quick Purchase**: 30-40 seconds
- **Cart Validation**: 20-30 seconds

Total test suite: ~120 seconds

## Assertions Performed

✅ Page visibility checks
✅ Element existence validation
✅ Form input validation
✅ Navigation confirmation
✅ Success message verification
✅ Data consistency checks
✅ UI state validation
✅ Redirect URL verification
✅ Content matching
✅ Count verification

## Next Steps

1. **Run the test**
   ```bash
   npx playwright test e2e/complete-user-journey.spec.ts
   ```

2. **View results**
   ```bash
   npx playwright show-report
   ```

3. **Add more scenarios**
   - Multiple products
   - Different payment methods
   - Address creation flow
   - Order modification

4. **Integrate with CI/CD**
   - Add to GitHub Actions workflow
   - Run on every commit
   - Monitor test results

## Documentation References

- See [e2e/README.md](README.md) for general E2E testing docs
- See [../E2E_QUICK_START.md](../E2E_QUICK_START.md) for commands
- See test file comments for step-by-step details

## Tips

✅ **Use --headed mode** to watch the test run
✅ **Use --debug mode** to step through individual actions
✅ **Check console output** for detailed step validation
✅ **Review HTML report** for visual failures
✅ **Use codegen** to generate selectors if steps fail

---

**Status:** Ready to test
**Total Tests:** 3 complete test scenarios
**Coverage:** Full customer journey from browse to order completion
