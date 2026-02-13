# Complete User Journey Test - Visual Guide

## Test Flow Diagram

```
┌────────────────────────────────────────────────────────────┐
│                    START: HOME PAGE                         │
│              Load Application & Validate                    │
└────────────────────────┬─────────────────────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  STEP 1: Browse Home Page       │
        │  ✓ Page loads                   │
        │  ✓ Navigation visible           │
        │  ✓ Products displayed           │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  STEP 2: Select Category        │
        │  ✓ Click category link          │
        │  ✓ Products filtered            │
        │  ✓ Product count > 0            │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  STEP 3: Select Product         │
        │  ✓ Click product card           │
        │  ✓ Details page loads           │
        │  ✓ Title & description visible  │
        │  ✓ Price displayed              │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  STEP 4: Select Variants        │
        │  ✓ Find variant selectors       │
        │  ✓ Select variant option        │
        │  ✓ UI updates with selection    │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  STEP 5: Add to Cart            │
        │  ✓ Click "Add to Cart"          │
        │  ✓ Success message appears      │
        │  ✓ Cart updated                 │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  STEP 6: Navigate to Login      │
        │  ✓ Go to /login                 │
        │  ✓ Login form displayed         │
        │  ✓ Email & password fields      │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  STEP 7: Login                  │
        │  ✓ Fill email                   │
        │  ✓ Fill password                │
        │  ✓ Submit form                  │
        │  ✓ Redirect to home             │
        │  ✓ User menu appears            │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  STEP 8: View Cart              │
        │  ✓ Go to /cart                  │
        │  ✓ Cart items displayed         │
        │  ✓ Cart summary visible         │
        │  ✓ Items count > 0              │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  STEP 9: Checkout               │
        │  ✓ Click "Proceed to Payment"   │
        │  ✓ Go to /checkout              │
        │  ✓ Checkout page loads          │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  STEP 10: Select Address        │
        │  ✓ Find address options         │
        │  ✓ Select existing OR create    │
        │  ✓ Confirm selection            │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  STEP 11: Delivery Method       │
        │  ✓ Find delivery options        │
        │  ✓ Select method                │
        │  ✓ Confirm selection            │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  STEP 12: Payment Method        │
        │  ✓ Find payment options         │
        │  ✓ Select method                │
        │  ✓ Confirm selection            │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  STEP 13: Review Summary        │
        │  ✓ Order summary visible        │
        │  ✓ Items displayed              │
        │  ✓ Total price shown            │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  STEP 14: Place Order           │
        │  ✓ Click "Confirm Order"        │
        │  ✓ Success message              │
        │  ✓ Order placed                 │
        └────────────────┬────────────────┘
                         │
        ┌────────────────▼────────────────┐
        │  STEP 15: Verify Confirmation   │
        │  ✓ Go to /orders                │
        │  ✓ Order appears in list        │
        │  ✓ Status visible               │
        │  ✓ Order number shown           │
        └────────────────┬────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│            ✅ COMPLETE JOURNEY VALIDATED                  │
│                   15 STEPS PASSED                        │
└───────────────────────────────────────────────────────────┘
```

## Page Load Validation

Each page validates:

```
HOME PAGE
├─ Navigation visible ✓
├─ Products displayed ✓
├─ Search/filter available ✓
└─ Page fully rendered ✓

CATEGORY PAGE
├─ Category name shown ✓
├─ Products filtered ✓
├─ Product count > 0 ✓
└─ Breadcrumb visible ✓

PRODUCT DETAILS PAGE
├─ Product title ✓
├─ Description ✓
├─ Price displayed ✓
├─ Images shown ✓
├─ Variants available ✓
├─ "Add to Cart" button ✓
└─ Reviews/ratings ✓

CART PAGE
├─ Cart items listed ✓
├─ Quantities editable ✓
├─ Remove buttons ✓
├─ Subtotal calculated ✓
├─ Tax calculated ✓
├─ Total displayed ✓
├─ Proceed button ✓
└─ Continue shopping link ✓

LOGIN PAGE
├─ Email input ✓
├─ Password input ✓
├─ Submit button ✓
├─ Remember me (if any) ✓
├─ Register link ✓
└─ Error messages ✓

HOME PAGE (After Login)
├─ User menu/profile ✓
├─ Logout option ✓
├─ My Orders link ✓
├─ My Addresses link ✓
├─ My Favorites link ✓
└─ Welcome message ✓

CHECKOUT PAGE
├─ Shipping address section ✓
├─ Address selection ✓
├─ Add address button ✓
├─ Delivery method options ✓
├─ Payment method options ✓
├─ Order summary ✓
├─ Total with tax/shipping ✓
├─ Place order button ✓
└─ Terms agreement ✓

ORDERS PAGE
├─ Orders list ✓
├─ Order numbers ✓
├─ Order dates ✓
├─ Order statuses ✓
├─ Order totals ✓
├─ View details buttons ✓
└─ Filter/sort options ✓
```

## Test Assertions

### Navigation Assertions
```
await page.goto(url)                    - Navigate to page
await page.waitForURL(url)              - Wait for URL change
await page.waitForSelector(selector)    - Wait for element
```

### Visibility Assertions
```
await expect(element).toBeVisible()     - Element visible
await expect(element).toBeHidden()      - Element hidden
await expect(element).toHaveCount(n)    - Element count
```

### Content Assertions
```
await expect(element).toContainText()   - Text content
await expect(element).toHaveText()      - Exact text
await expect(element).toHaveAttribute() - HTML attribute
```

### Form Assertions
```
await expect(input).toHaveValue()       - Input value
await expect(checkbox).toBeChecked()    - Checkbox state
await expect(radio).toBeChecked()       - Radio state
```

## Step-by-Step Validation Example

```typescript
// STEP 1: Load home page
test.step('Load home page', async () => {
  await page.goto('/');                          // Navigate
  await page.waitForSelector('main');            // Wait for load
  const nav = page.locator('nav');
  await expect(nav).toBeVisible();               // Validate
  console.log('✅ Home page loaded');
});

// STEP 2: Browse by category
test.step('Browse products by category', async () => {
  const categoryLink = page.locator('[data-testid="category-link"]').first();
  await categoryLink.click();                    // Click category
  await page.waitForSelector('[data-testid="product-card"]');
  const products = page.locator('[data-testid="product-card"]');
  const count = await products.count();
  expect(count).toBeGreaterThan(0);             // Validate count
  console.log(`✅ ${count} products loaded`);
});

// STEP 3: View product details
test.step('Select product', async () => {
  const product = page.locator('[data-testid="product-card"]').first();
  await product.click();                         // Click product
  await page.waitForSelector('h1');
  const title = page.locator('h1').first();
  await expect(title).toBeVisible();             // Validate visible
  console.log(`✅ Product: ${await title.textContent()}`);
});
```

## Running the Test

```bash
# Run complete journey test
npx playwright test e2e/complete-user-journey.spec.ts

# Run with UI
npx playwright test e2e/complete-user-journey.spec.ts --ui

# Run specific test
npx playwright test e2e/complete-user-journey.spec.ts -g "complete full purchase"

# View results
npx playwright show-report
```

## Expected Output

```
✅ Home page loaded successfully
✅ Category selected, 12 products found
✅ Product selected: Wireless Headphones
✅ Variant selected: Blue-Large
✅ Product added to cart: Product added successfully
✅ Login page loaded correctly
✅ Login successful, redirected to home page
✅ Cart page loaded with 1 item(s)
✅ Checkout page loaded
✅ Delivery address selected
✅ Delivery method selected: Home Delivery
✅ Payment method selected: Cash on Delivery
✅ Order summary visible
✅ Order placement completed
✅ Order status: Pending
✅ Order number: #ORD-2026021200001

========== 🎉 COMPLETE USER JOURNEY VALIDATED ==========
✅ Step 1: Home page loaded
✅ Step 2: Products by category browsed
✅ Step 3: Product details viewed
✅ Step 4: Product variants selected
✅ Step 5: Product added to cart
✅ Step 6: Login page accessed
✅ Step 7: Customer logged in
✅ Step 8: Shopping cart reviewed
✅ Step 9: Checkout page accessed
✅ Step 10: Delivery address selected
✅ Step 11: Delivery method selected
✅ Step 12: Payment method selected
✅ Step 13: Order summary reviewed
✅ Step 14: Order placed successfully
✅ Step 15: Order confirmation validated
========== ✨ ALL STEPS COMPLETED SUCCESSFULLY ✨ ==========
```

## Customization Points

### Change Test Email/Password
```typescript
await emailInput.fill('your-email@test.com');
await passwordInput.fill('your-password');
```

### Select Different Product
```typescript
// Select second product
await productCards.nth(1).click();
```

### Skip Variant Selection
```typescript
// Variants optional in test
if (await variantSelects.count() > 0) {
  // Select variant
}
```

### Test Multiple Products
```typescript
// Add multiple products to cart
for (let i = 0; i < 2; i++) {
  await productCards.nth(i).click();
  await addToCartBtn.click();
  await page.goBack();
}
```

## Performance Targets

| Step | Target Time |
|------|-------------|
| Load Home | <3s |
| Select Product | <2s |
| Add to Cart | <2s |
| Login | <3s |
| Checkout | <3s |
| Place Order | <5s |
| **Total Journey** | **<30s** |

---

**Complete User Journey E2E Test - Comprehensive Coverage** ✨
