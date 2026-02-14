import { Response, Request } from 'express';

export interface TestRequest extends Request {
  user?: {
    userId: string;
    email?: string;
    role: 'ADMIN' | 'CUSTOMER';
  };
  query: Record<string, string | string[]>;
  params: Record<string, string>;
  body: Record<string, unknown>;
}

export interface TestResponse extends Response {
  _getStatusCode(): number;
  _getJSONData(): Record<string, unknown>;
}

export function createMockResponse(): TestResponse {
  const res = {} as TestResponse;

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.header = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);

  let statusCode = 200;
  let jsonData: Record<string, unknown> = {};

  res.status = jest.fn().mockImplementation((code: number) => {
    statusCode = code;
    return res;
  });

  res.json = jest.fn().mockImplementation((data: Record<string, unknown>) => {
    jsonData = data;
    return res;
  });

  res._getStatusCode = () => statusCode;
  res._getJSONData = () => jsonData;

  return res;
}

export function createMockRequest(overrides?: Partial<TestRequest>): TestRequest {
  return {
    user: {
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'CUSTOMER',
    },
    query: {},
    params: {},
    body: {},
    ...overrides,
  };
}

export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  password: 'hashed-password',
  role: 'ADMIN' as const,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockCustomer = {
  id: 'customer-1',
  email: 'customer@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '555-1234',
  password: 'hashed-password',
  isVerified: true,
  emailVerificationToken: null,
  emailVerificationExpiry: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockProduct = {
  id: 'prod-1',
  sku: 'PROD-001',
  name: 'Test Product',
  slug: 'test-product',
  description: 'A test product',
  unitCost: 50,
  salePrice: 100,
  quantity: 100,
  minStock: 10,
  maxStock: 500,
  location: 'A1',
  barcode: '123456789',
  isActive: true,
  isFeatured: false,
  categoryId: 'cat-1',
  supplierId: null,
  image: null,
  categories: [],
  variants: [],
  images: [],
  discountPercent: '0',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockCategory = {
  id: 'cat-1',
  name: 'Electronics',
  slug: 'electronics',
  description: 'Electronic products',
  parentId: null,
  image: null,
  isFeatured: false,
  displayOrder: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockOrder = {
  id: 'order-1',
  orderNumber: 'ORD-001',
  customerId: 'customer-1',
  status: 'PENDING' as const,
  subtotal: 100,
  tax: 10,
  shippingCost: 5,
  total: 115,
  shippingAddress: '123 Main St',
  notes: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockCart = {
  id: 'cart-1',
  customerId: 'customer-1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockAddress = {
  id: 'addr-1',
  customerId: 'customer-1',
  street: '123 Main St',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  country: 'USA',
  isDefault: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export class TestDataBuilder {
  static aProduct(overrides = {}) {
    return { ...mockProduct, ...overrides };
  }

  static aCategory(overrides = {}) {
    return { ...mockCategory, ...overrides };
  }

  static aCustomer(overrides = {}) {
    return { ...mockCustomer, ...overrides };
  }

  static anOrder(overrides = {}) {
    return { ...mockOrder, ...overrides };
  }

  static anAddress(overrides = {}) {
    return { ...mockAddress, ...overrides };
  }

  static aUser(overrides = {}) {
    return { ...mockUser, ...overrides };
  }
}
