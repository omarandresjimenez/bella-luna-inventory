import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { vi } from 'vitest';

// Define mock handlers
export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      success: true,
      data: {
        customer: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
        token: 'mock-token',
      },
    });
  }),

  http.post('/api/auth/admin/login', () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
        },
        token: 'mock-admin-token',
      },
    });
  }),

  http.post('/api/auth/register', () => {
    return HttpResponse.json({
      success: true,
      data: {
        customer: {
          id: '1',
          email: 'new@example.com',
          firstName: 'New',
          lastName: 'User',
        },
        token: 'mock-token',
      },
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      },
    });
  }),

  http.post('/api/auth/verify-email', () => {
    return HttpResponse.json({
      success: true,
      data: { message: 'Email verified', token: 'verified-token' },
    });
  }),

  http.post('/api/auth/verify-email-token', () => {
    return HttpResponse.json({
      success: true,
      data: { message: 'Email verified', token: 'verified-token' },
    });
  }),

  // Products endpoints
  http.get('/api/products', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          name: 'Test Product',
          slug: 'test-product',
          basePrice: 100,
          salePrice: 90,
        },
      ],
    });
  }),

  http.get('/api/products/:slug', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        name: 'Test Product',
        slug: params.slug,
        basePrice: 100,
        salePrice: 90,
      },
    });
  }),

  // Categories endpoints
  http.get('/api/categories', () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          name: 'Test Category',
          slug: 'test-category',
        },
      ],
    });
  }),

  http.get('/api/categories/:slug', ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        name: 'Test Category',
        slug: params.slug,
      },
    });
  }),

  // Cart endpoints
  http.get('/api/cart', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        items: [],
        subtotal: 0,
        total: 0,
      },
    });
  }),

  http.post('/api/cart/items', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        items: [{ id: 'item-1', quantity: 1 }],
        subtotal: 100,
        total: 100,
      },
    });
  }),

  http.patch('/api/cart/items/:itemId', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        items: [{ id: 'item-1', quantity: 2 }],
        subtotal: 200,
        total: 200,
      },
    });
  }),

  http.delete('/api/cart/items/:itemId', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        items: [],
        subtotal: 0,
        total: 0,
      },
    });
  }),

  // Favorites endpoints
  http.get('/api/favorites', () => {
    return HttpResponse.json({
      success: true,
      data: {
        products: [],
      },
    });
  }),

  http.get('/api/favorites/product-ids', () => {
    return HttpResponse.json({
      success: true,
      data: {
        productIds: [],
      },
    });
  }),

  http.get('/api/favorites/check/:productId', () => {
    return HttpResponse.json({
      success: true,
      data: {
        isFavorite: false,
      },
    });
  }),

  http.post('/api/favorites', () => {
    return HttpResponse.json({
      success: true,
      data: { message: 'Added to favorites' },
    });
  }),

  http.delete('/api/favorites/:productId', () => {
    return HttpResponse.json({
      success: true,
      data: { message: 'Removed from favorites' },
    });
  }),

  // Orders endpoints
  http.get('/api/orders', () => {
    return HttpResponse.json({
      success: true,
      data: {
        orders: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
      },
    });
  }),

  http.get('/api/orders/:id', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        status: 'PENDING',
        total: 100,
      },
    });
  }),

  http.post('/api/orders', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        status: 'PENDING',
        total: 100,
      },
    });
  }),

  // Addresses endpoints
  http.get('/api/addresses', () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),

  http.post('/api/addresses', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        street: 'Test Street',
        city: 'Test City',
      },
    });
  }),

  http.patch('/api/addresses/:id', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        street: 'Updated Street',
        city: 'Test City',
      },
    });
  }),

  http.delete('/api/addresses/:id', () => {
    return HttpResponse.json({
      success: true,
      data: { message: 'Address deleted' },
    });
  }),

  // Admin endpoints
  http.get('/api/admin/products', () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),

  http.get('/api/admin/categories', () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),

  http.get('/api/admin/orders', () => {
    return HttpResponse.json({
      success: true,
      data: {
        orders: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
      },
    });
  }),

  http.get('/api/admin/analytics/dashboard', () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalOrders: 100,
        totalRevenue: 10000,
        avgOrderValue: 100,
        ordersByStatus: [],
        lowStockProducts: [],
        outOfStockCount: 0,
      },
    });
  }),

  http.get('/api/admin/users', () => {
    return HttpResponse.json({
      success: true,
      data: {
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      },
    });
  }),

  http.get('/api/admin/customers', () => {
    return HttpResponse.json({
      success: true,
      data: {
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      },
    });
  }),

  // Customer profile
  http.get('/api/customer/profile', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      },
    });
  }),

  http.put('/api/customer/profile', () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        email: 'test@example.com',
        firstName: 'Updated',
        lastName: 'User',
      },
    });
  }),

  http.put('/api/customer/profile/password', () => {
    return HttpResponse.json({
      success: true,
      data: { message: 'Password updated' },
    });
  }),

  // Health check
  http.get('/api/health', () => {
    return HttpResponse.json({
      success: true,
      message: 'OK',
    });
  }),
];

// Setup MSW server
export const server = setupServer(...handlers);

// Test data factories
export const createMockProduct = (overrides = {}) => ({
  id: '1',
  name: 'Test Product',
  slug: 'test-product',
  description: 'Test description',
  basePrice: 100,
  salePrice: 90,
  baseCost: 50,
  sku: 'TEST-001',
  isActive: true,
  isFeatured: false,
  trackStock: true,
  categories: [],
  images: [],
  variants: [],
  attributes: [],
  ...overrides,
});

export const createMockCategory = (overrides = {}) => ({
  id: '1',
  name: 'Test Category',
  slug: 'test-category',
  description: 'Test category description',
  isActive: true,
  isFeatured: false,
  imageUrl: null,
  parentId: null,
  ...overrides,
});

export const createMockCart = (overrides = {}) => ({
  id: '1',
  items: [],
  subtotal: 0,
  total: 0,
  itemCount: 0,
  ...overrides,
});

export const createMockCartItem = (overrides = {}) => ({
  id: 'item-1',
  quantity: 1,
  price: 100,
  total: 100,
  variant: {
    id: 'variant-1',
    variantSku: 'VARIANT-001',
    price: 100,
    product: {
      id: '1',
      name: 'Test Product',
      slug: 'test-product',
      images: [],
    },
  },
  ...overrides,
});

export const createMockOrder = (overrides = {}) => ({
  id: '1',
  status: 'PENDING',
  total: 100,
  subtotal: 90,
  tax: 10,
  deliveryType: 'HOME_DELIVERY',
  paymentMethod: 'CASH_ON_DELIVERY',
  customerNotes: null,
  adminNotes: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  items: [],
  address: null,
  ...overrides,
});

export const createMockCustomer = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phone: '1234567890',
  birthDate: null,
  isVerified: true,
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
  isActive: true,
  ...overrides,
});

export const createMockAddress = (overrides = {}) => ({
  id: '1',
  street: '123 Test St',
  city: 'Test City',
  state: 'Test State',
  zipCode: '12345',
  country: 'Test Country',
  isDefault: false,
  ...overrides,
});

// Query client wrapper helper
export const createMockQueryClient = () => {
  return {
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
    removeQueries: vi.fn(),
  };
};
