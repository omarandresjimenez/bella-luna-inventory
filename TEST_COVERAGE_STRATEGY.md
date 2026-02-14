# Test Coverage Strategy - Bella Luna Inventory

## Overview
Comprehensive testing strategy for both Frontend (React 19 + TypeScript + Vite) and Backend (Node.js + Express + Prisma) with emphasis on best practices.

---

## 📊 Current Coverage Status

### ✅ Frontend (Vitest + React Testing Library)
**Configuration**: Vitest 4.0.18, React Testing Library, MSW for API mocking
- **Unit Tests**: 6 test files
  - `api.test.ts` - API service methods (312 lines)
  - `useAuth.test.tsx` - Auth hook
  - `useFavorites.test.tsx` - Favorites hook
  - `useProducts.test.tsx` - Products hook
  - `adminApi.test.ts` - Admin API service
  - `authApi.test.ts` - Auth API service

- **Integration Tests**: 9 test files
  - `admin.test.tsx` - Admin dashboard flows
  - `auth.test.tsx` - Authentication flows
  - `cart-checkout.test.tsx` - Cart & checkout
  - `cart-hooks.test.tsx` - Cart hooks
  - `products.test.tsx` - Product listing & filtering
  - `e2e.test.tsx` - End-to-end flows
  - `hooks.test.tsx` - Hook integration
  - `cart-shopping-flow.test.ts` - Complete shopping flow

- **Test Setup**: 
  - MSW handlers for 50+ API endpoints
  - Mock data factory
  - Custom test utilities
  - JSDOM environment

### ❌ Backend (MISSING - CRITICAL)
**Current State**: E2E tests only via Playwright
- **Missing**:
  - Unit tests for services
  - Unit tests for controllers
  - Integration tests for API endpoints
  - DTO validation tests
  - Repository pattern tests
  - Error handling tests

---

## 🎯 Test Pyramid Target

```
         /\
        /  \      E2E Tests (10%)
       /____\     - Critical user flows
      /      \    - Full app integration
     /________\
    /          \  Integration Tests (30%)
   /____________\ - Service integration
  /              \ - API endpoint testing
 /________________\
/                  \  Unit Tests (60%)
/__________________\ - Services, hooks, utilities
                     - Controllers, middleware
                     - Validators, helpers
```

---

## 📋 Testing Standards

### Frontend Testing

#### 1. Unit Tests (60%)
**Scope**: Individual functions, hooks, utilities
**Tools**: Vitest, React Testing Library
**Pattern**:
```typescript
describe('Component/Function', () => {
  describe('specific behavior', () => {
    it('should do expected action when condition met', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

**Coverage Requirements**:
- All exported functions
- Happy paths
- Error cases
- Edge cases
- Conditional branches (>80% coverage)

#### 2. Integration Tests (30%)
**Scope**: Component interactions, hook usage, service integration
**Pattern**:
```typescript
describe('Feature Flow', () => {
  beforeEach(() => {
    // Setup
  });

  it('should complete user journey from start to end', async () => {
    // User interactions
    // API calls (mocked)
    // State changes
    // Assertions
  });
});
```

#### 3. E2E Tests (10%)
**Scope**: Critical user workflows
**Tools**: Playwright
**Coverage**:
- Login/Register
- Product browsing
- Shopping cart
- Checkout
- Admin dashboard

### Backend Testing

#### 1. Unit Tests (Service Layer)
**Scope**: Business logic, data transformations
**Framework**: Jest (to be added)
**Pattern**:
```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let repository: RepositoryName;

  beforeEach(() => {
    repository = mockDeep<RepositoryName>();
    service = new ServiceName(repository);
  });

  describe('methodName', () => {
    it('should return expected result when given valid input', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

#### 2. Controller Tests
**Scope**: Request/Response handling, validation
**Coverage**:
- Happy path (200/201)
- Validation errors (400)
- Unauthorized (401)
- Forbidden (403)
- Not found (404)
- Server errors (500)

#### 3. Integration Tests (API)
**Scope**: Full request → response cycle
**Coverage**:
- Authentication flows
- Data persistence
- Business logic execution
- Error handling

#### 4. DTO Validation Tests
**Scope**: Zod schema validation
**Coverage**:
- Valid payloads
- Missing required fields
- Invalid data types
- Custom validation rules

---

## 📂 Directory Structure

```
Frontend:
frontend/src/test/
├── setup.ts                    ✅ Configured
├── mocks/
│   ├── server.ts              ✅ 50+ handlers
│   ├── data.ts                ✅ Mock data
│   └── utils.ts               ✅ Helper utilities
├── unit/
│   ├── hooks/
│   │   ├── useAuth.test.tsx    ✅
│   │   ├── useFavorites.test.tsx ✅
│   │   ├── useProducts.test.tsx ✅
│   │   ├── useCustomer.test.tsx ❌ MISSING
│   │   └── useCart.test.tsx    ❌ MISSING
│   ├── services/
│   │   ├── api.test.ts         ✅
│   │   ├── adminApi.test.ts    ✅
│   │   ├── authApi.test.ts     ✅
│   │   ├── customerApi.test.ts ❌ MISSING
│   │   ├── publicApi.test.ts   ❌ MISSING
│   │   └── apiClient.test.ts   ✅
│   └── utils/
│       ├── validation.test.ts  ❌ MISSING
│       └── helpers.test.ts     ❌ MISSING
└── integration/
    ├── admin.test.tsx          ✅
    ├── auth.test.tsx           ✅
    ├── cart-checkout.test.tsx  ✅
    ├── products.test.tsx       ✅
    └── admin-settings.test.tsx ❌ MISSING

Backend:
src/tests/                      ❌ MISSING ENTIRE DIR
├── unit/
│   ├── services/
│   │   ├── AuthService.test.ts
│   │   ├── ProductService.test.ts
│   │   ├── CartService.test.ts
│   │   ├── OrderService.test.ts
│   │   ├── CategoryService.test.ts
│   │   ├── AddressService.test.ts
│   │   ├── FavoriteService.test.ts
│   │   └── PaymentService.test.ts
│   ├── controllers/
│   │   ├── AuthController.test.ts
│   │   ├── ProductController.test.ts
│   │   ├── CartController.test.ts
│   │   ├── OrderController.test.ts
│   │   └── AdminController.test.ts
│   ├── validators/
│   │   └── dtos.test.ts
│   └── utils/
│       ├── validation.test.ts
│       └── responses.test.ts
└── integration/
    ├── auth.test.ts
    ├── products.test.ts
    ├── cart.test.ts
    ├── orders.test.ts
    └── admin.test.ts
```

---

## 🔧 Implementation Roadmap

### Phase 1: Backend Setup (Days 1-2)
- [ ] Add Jest to backend `package.json`
- [ ] Configure Jest (jest.config.js)
- [ ] Add test database setup
- [ ] Create test utilities/helpers
- [ ] Mock Prisma client

### Phase 2: Backend Service Tests (Days 3-4)
- [ ] AuthService tests
- [ ] ProductService tests
- [ ] CartService tests
- [ ] OrderService tests
- [ ] AddressService tests
- [ ] Target: 80%+ coverage

### Phase 3: Backend Controller & Integration (Days 5-6)
- [ ] Controller tests (request/response handling)
- [ ] DTO validation tests
- [ ] API integration tests
- [ ] Error handling tests

### Phase 4: Frontend Gap Coverage (Days 7)
- [ ] Add missing hook tests
- [ ] Add service integration tests
- [ ] Add utility tests
- [ ] Increase coverage to 90%+

### Phase 5: Coverage Reports & CI/CD (Days 8)
- [ ] Configure coverage reporters
- [ ] Add coverage thresholds
- [ ] Set up CI/CD testing
- [ ] Generate coverage reports

---

## ✅ Best Practices Implemented

### Frontend
- ✅ MSW for API mocking (not axios mocking)
- ✅ Custom render utilities
- ✅ Proper async/await handling
- ✅ QueryClient provider setup
- ✅ Auth context mocking
- ✅ localStorage/sessionStorage cleanup
- ✅ Test isolation (beforeEach/afterEach)

### Backend (To Implement)
- [ ] Dependency injection for testability
- [ ] Repository pattern abstraction
- [ ] Service layer separation
- [ ] Mock database for tests
- [ ] Proper error handling tests
- [ ] Test data builders/factories
- [ ] Descriptive test names
- [ ] Arrange-Act-Assert pattern

---

## 📊 Coverage Metrics

### Frontend Target
```
Statements  : > 85%
Branches    : > 80%
Functions   : > 85%
Lines       : > 85%
```

### Backend Target
```
Statements  : > 80%
Branches    : > 75%
Functions   : > 80%
Lines       : > 80%
```

---

## 🚀 Running Tests

### Frontend
```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# Specific file
npm run test useAuth.test.tsx
```

### Backend (Once configured)
```bash
# All tests
npm test

# Watch mode
npm test --watch

# With coverage
npm test --coverage

# Specific test
npm test auth.test.ts
```

### E2E
```bash
# Run all E2E tests
npm run test:e2e

# UI mode
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

---

## 🎓 Key Testing Principles

1. **Test Behavior, Not Implementation**
   - What does the user see?
   - What happens when user interacts?
   - Don't test internal state details

2. **Arrange-Act-Assert Pattern**
   - Clear setup phase
   - Single action
   - Explicit assertions

3. **Descriptive Names**
   - `it('should return filtered products when category filter applied')`
   - NOT `it('filters')`

4. **Isolated Tests**
   - No test dependencies
   - Clean setup/teardown
   - Independent execution

5. **Meaningful Assertions**
   - Test what matters to users
   - Not implementation details
   - Specific error messages

6. **DRY Principle**
   - Use helpers for common setup
   - Data builders/factories
   - Custom render functions

7. **Error Path Testing**
   - Success cases (60%)
   - Error cases (30%)
   - Edge cases (10%)

---

## 📌 Next Steps

1. **Review** this strategy with team
2. **Start Phase 1** with Jest backend setup
3. **Create test utilities** for backend
4. **Implement service tests** with mocks
5. **Generate coverage reports**
6. **Set CI/CD testing gates**

---

**Last Updated**: February 14, 2026
**Status**: Strategy Document - Ready for Implementation
**Priority**: HIGH - Backend testing is critical gap
