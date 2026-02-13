# E2E Testing Architecture & Flow Diagram

## 📊 Test Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLAYWRIGHT E2E TEST SUITE                     │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
            ┌──────────────┐ ┌──────────┐ ┌──────────┐
            │  Chromium    │ │ Firefox  │ │ WebKit   │
            │  (Chrome)    │ │          │ │ (Safari) │
            └──────────────┘ └──────────┘ └──────────┘
                    │            │            │
                    └────────────┼────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
            ┌──────────────┐ ┌──────────┐ ┌──────────┐
            │   Mobile     │ │  Tablet  │ │ Desktop  │
            │ 375x667      │ │ 768x1024 │ │1920x1080 │
            └──────────────┘ └──────────┘ └──────────┘
```

## 🧪 Test Suite Structure

```
PLAYWRIGHT CONFIG (playwright.config.ts)
    │
    ├─ Base URL: http://localhost:5173
    ├─ Test Directory: ./e2e
    │
    └─ Web Servers (Auto-start)
        ├─ Frontend: npm run dev (5173)
        └─ Backend: npm run dev (3000)
            │
            ├─ Reporter: HTML
            ├─ Reporter: JSON
            ├─ Reporter: JUnit XML
            │
            ├─ Screenshots: On Failure
            ├─ Videos: On Failure
            ├─ Traces: On First Retry
            │
            └─ Test Suites
                │
                ├─ 📋 auth.spec.ts (4 tests)
                │   ├─ Register
                │   ├─ Login
                │   ├─ Invalid Login
                │   └─ Logout
                │
                ├─ 🛒 shopping.spec.ts (7 tests)
                │   ├─ Browse
                │   ├─ View Details
                │   ├─ Add to Cart
                │   ├─ View Cart
                │   ├─ Update Quantity
                │   ├─ Remove Item
                │   └─ Checkout
                │
                ├─ 📦 checkout.spec.ts (6 tests)
                │   ├─ Create Address
                │   ├─ Select Address
                │   ├─ Complete Order
                │   ├─ View History
                │   ├─ View Details
                │   └─ Filter Orders
                │
                ├─ ❤️ favorites.spec.ts (5 tests)
                │   ├─ Add Favorite
                │   ├─ Remove Favorite
                │   ├─ View Page
                │   ├─ Remove from Page
                │   └─ Add to Cart
                │
                ├─ 👨‍💼 admin.spec.ts (8 tests)
                │   ├─ View Products
                │   ├─ Search Products
                │   ├─ Create Product
                │   ├─ Edit Product
                │   ├─ Delete Product
                │   ├─ View Categories
                │   ├─ Create Category
                │   └─ Delete Category
                │
                └─ ⚡ performance.spec.ts (11 tests)
                    ├─ Load Time
                    ├─ Accessibility
                    ├─ Error Handling
                    └─ Responsive Design
```

## 🔄 Test Execution Flow

```
START TEST RUN
    │
    ├─ Start Servers
    │   ├─ Frontend (5173)
    │   └─ Backend (3000)
    │
    ├─ Load Configuration
    │   └─ playwright.config.ts
    │
    ├─ Execute Tests
    │   │
    │   ├─ auth.spec.ts
    │   │   ├─ Test 1: Register ✓
    │   │   ├─ Test 2: Login ✓
    │   │   ├─ Test 3: Invalid Login ✓
    │   │   └─ Test 4: Logout ✓
    │   │
    │   ├─ shopping.spec.ts
    │   │   ├─ Test 1: Browse ✓
    │   │   ├─ Test 2: Details ✓
    │   │   └─ ... (7 total)
    │   │
    │   └─ ... (more test files)
    │
    ├─ Generate Reports
    │   ├─ HTML Report
    │   ├─ JSON Report
    │   └─ JUnit Report
    │
    ├─ Collect Artifacts
    │   ├─ Screenshots
    │   ├─ Videos
    │   └─ Traces
    │
    └─ END TEST RUN
        │
        ├─ Success ✓ → Exit 0
        ├─ Failure ✗ → Exit 1 (with details)
        └─ Summary printed
```

## 🔗 Data Flow in Tests

```
TEST EXECUTION
    │
    ├─ Arrange (Setup)
    │   ├─ Load test-data.ts
    │   ├─ Set baseURL
    │   └─ Initialize page
    │
    ├─ Act (User Actions)
    │   ├─ Navigate to URL
    │   ├─ Fill forms
    │   ├─ Click buttons
    │   └─ Scroll/Interact
    │
    └─ Assert (Verification)
        ├─ Check visibility
        ├─ Verify text
        ├─ Confirm navigation
        └─ Validate state
```

## 🎯 Test Coverage Map

```
FRONTEND APPLICATION
├─ Authentication Pages
│   ├─ /login ..................... 2 tests (valid, invalid)
│   ├─ /register .................. 1 test
│   └─ Logout ..................... 1 test
│
├─ Customer Pages
│   ├─ / (Home) ................... 3 tests (browse, details, cart)
│   ├─ /products .................. 2 tests (browse, search)
│   ├─ /products/:id .............. 3 tests (details, add cart, favorite)
│   ├─ /cart ...................... 3 tests (view, update, remove)
│   ├─ /checkout .................. 2 tests (address, payment)
│   ├─ /orders .................... 3 tests (history, details, filter)
│   └─ /favorites ................. 2 tests (view, manage)
│
└─ Admin Pages
    ├─ /admin/login ................ 1 test
    ├─ /admin/products ............. 5 tests (CRUD, search)
    ├─ /admin/categories ........... 2 tests (create, delete)
    └─ /admin/attributes ........... Covered by test framework
```

## 📋 Test Fixture Architecture

```
FIXTURES (e2e/fixtures/fixtures.ts)
    │
    ├─ authenticatedPage
    │   ├─ Logs in customer
    │   ├─ Yields page context
    │   └─ Logs out after test
    │
    ├─ customerAuthenticatedPage
    │   ├─ Logs in customer
    │   ├─ Yields page context
    │   └─ Page stays logged in
    │
    └─ adminAuthenticatedPage
        ├─ Logs in admin
        ├─ Yields page context
        └─ Admin access available
```

## 🛠️ Helper Functions Architecture

```
HELPERS (e2e/helpers/auth.ts)
    │
    ├─ login(page, email, password)
    │   └─ Generic login handler
    │
    ├─ customerLogin(page, email, password)
    │   └─ Customer-specific login
    │
    ├─ adminLogin(page, email, password)
    │   └─ Admin-specific login
    │
    ├─ logout(page)
    │   └─ Generic logout handler
    │
    ├─ addProductToCart(page, name, qty)
    │   └─ Product purchase flow
    │
    ├─ viewCart(page)
    │   └─ Cart navigation
    │
    └─ checkoutCart(page)
        └─ Checkout navigation
```

## 📊 Test Data Organization

```
TEST DATA (e2e/test-data.ts)
    │
    ├─ testUsers
    │   ├─ customer: { email, password, name }
    │   └─ admin: { email, password, name }
    │
    ├─ testProducts
    │   └─ sample: { name, description, price, category }
    │
    ├─ testAddresses
    │   ├─ home: { street, city, state, zip, country }
    │   └─ work: { street, city, state, zip, country }
    │
    ├─ testCategories
    │   ├─ electronics: { name, description }
    │   └─ clothing: { name, description }
    │
    ├─ timeouts
    │   ├─ short: 5000ms
    │   ├─ medium: 10000ms
    │   └─ long: 30000ms
    │
    ├─ urls
    │   ├─ home: '/'
    │   ├─ login: '/login'
    │   ├─ cart: '/cart'
    │   ├─ checkout: '/checkout'
    │   ├─ orders: '/orders'
    │   ├─ favorites: '/favorites'
    │   └─ ... (all URLs)
    │
    ├─ selectors
    │   ├─ Navigation
    │   ├─ Products
    │   ├─ Cart
    │   ├─ Forms
    │   ├─ Messages
    │   └─ Modals
    │
    └─ scenarios
        ├─ validLogin
        ├─ invalidLogin
        └─ validRegistration
```

## 🔄 CI/CD Integration Flow

```
GIT PUSH
    │
    ├─ GitHub Actions Triggered
    │   │
    │   ├─ Set up Node environment
    │   ├─ Install dependencies
    │   ├─ Install Playwright
    │   │
    │   ├─ npm run test:e2e
    │   │   ├─ Start frontend
    │   │   ├─ Start backend
    │   │   ├─ Run 41 tests
    │   │   └─ Collect reports
    │   │
    │   ├─ Generate artifacts
    │   │   ├─ playwright-report/
    │   │   ├─ test-results.json
    │   │   └─ test-results.xml
    │   │
    │   └─ Upload artifacts
    │
    └─ Status: PASS ✓ or FAIL ✗
        └─ Notification sent
```

## 📈 Test Execution Timeline

```
Total Runtime: ~120-150 seconds

auth.spec.ts ..................... 10s
shopping.spec.ts ................. 25s
checkout.spec.ts ................. 35s
favorites.spec.ts ................ 15s
admin.spec.ts .................... 40s
performance.spec.ts .............. 15s
                              ─────────
                              Total: ~140s

+ Server startup ................. 10s
+ Report generation .............. 5s
+ Report upload (CI) ............. 5s
                              ─────────
                              Grand Total: ~160s
```

## 🎯 Assertion Chain Pattern

```
Each Test Follows:
    
1. NAVIGATE
    await page.goto('/path')
    │
2. INTERACT
    await page.click('selector')
    await page.fill('input', 'value')
    │
3. WAIT
    await page.waitForURL('/new-path')
    await page.waitForSelector('[data-testid="element"]')
    │
4. ASSERT
    await expect(element).toBeVisible()
    await expect(element).toContainText('text')
    │
5. VERIFY STATE
    Final check of application state
```

## 🔍 Debugging Stack

```
WHEN A TEST FAILS:

1. Playwright captures:
   ├─ Screenshot (PNG)
   ├─ Video (WebM)
   └─ Trace (ZIP)

2. HTML Report shows:
   ├─ Test name
   ├─ Failure message
   ├─ Step timeline
   └─ Visual artifacts

3. Developer uses:
   ├─ Trace viewer (local)
   ├─ Video playback
   ├─ Inspector (--debug)
   └─ Codegen (--record)
```

## 🎨 Test Environment Isolation

```
Each Test Gets:
    ├─ Fresh browser context
    ├─ Clean page state
    ├─ Independent database (optional)
    ├─ Isolated cookies/storage
    └─ Timeout protection

Tests Do NOT:
    ├─ Share state with other tests
    ├─ Depend on test execution order
    ├─ Interfere with each other
    └─ Leave side effects
```

---

**This architecture ensures:**
- ✅ **Reliability**: Clean isolation between tests
- ✅ **Maintainability**: Centralized test data and helpers
- ✅ **Scalability**: Easy to add new tests
- ✅ **Debuggability**: Rich artifacts on failure
- ✅ **Performance**: Parallel execution where possible
- ✅ **Coverage**: 41 tests covering major user flows
