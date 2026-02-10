import type { Product, Category, Cart, Order, Customer, User } from '../types';

export const mockUser: User = {
  id: '1',
  email: 'admin@bellaluna.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
};

export const mockCustomer: Customer = {
  id: '1',
  email: 'customer@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '1234567890',
};

export const mockCategory: Category = {
  id: '1',
  name: 'Electronics',
  slug: 'electronics',
  description: 'Electronic devices and accessories',
  isActive: true,
  isFeatured: true,
  sortOrder: 0,
};

export const mockProduct: Product = {
  id: '1',
  sku: 'PROD-001',
  name: 'Wireless Headphones',
  description: 'High-quality wireless headphones with noise cancellation',
  brand: 'TechBrand',
  slug: 'wireless-headphones',
  baseCost: 50,
  basePrice: 99.99,
  discountPercent: 0,
  trackStock: true,
  isActive: true,
  isFeatured: true,
  categories: [{ category: mockCategory }],
  variants: [
    {
      id: 'v1',
      productId: '1',
      price: 99.99,
      stock: 10,
      isActive: true,
      attributeValues: [
        {
          attributeValue: {
            id: 'av1',
            value: 'black',
            displayValue: 'Black',
            colorHex: '#000000',
            attribute: {
              id: 'attr1',
              name: 'color',
              displayName: 'Color',
              type: 'COLOR_HEX',
            },
          },
        },
      ],
      images: [],
    },
  ],
  images: [
    {
      id: 'img1',
      originalPath: '/images/headphones.jpg',
      thumbnailUrl: '/images/headphones-thumb.jpg',
      smallUrl: '/images/headphones-small.jpg',
      mediumUrl: '/images/headphones-medium.jpg',
      largeUrl: '/images/headphones-large.jpg',
      sortOrder: 0,
      isPrimary: true,
    },
  ],
  attributes: [],
  finalPrice: 99.99,
};

export const mockCart: Cart = {
  id: 'cart1',
  items: [
    {
      id: 'item1',
      variantId: 'v1',
      variant: {
        ...mockProduct.variants[0],
        product: mockProduct,
      },
      quantity: 2,
      unitPrice: 99.99,
    },
  ],
  subtotal: 199.98,
  itemCount: 2,
};

export const mockOrder: Order = {
  id: 'order1',
  orderNumber: 'ORD-001',
  customerId: '1',
  shippingAddress: {
    id: 'addr1',
    street: '123 Main St',
    city: 'Bogotá',
    state: 'Cundinamarca',
    zipCode: '110111',
    country: 'Colombia',
    isDefault: true,
  },
  deliveryType: 'HOME_DELIVERY',
  deliveryFee: 5,
  status: 'PENDING',
  paymentMethod: 'CASH_ON_DELIVERY',
  paymentStatus: 'PENDING',
  subtotal: 199.98,
  discount: 0,
  total: 204.98,
  createdAt: '2026-02-09T10:00:00Z',
  items: [
    {
      id: 'item1',
      productName: 'Wireless Headphones',
      variantName: 'Black',
      quantity: 2,
      unitPrice: 99.99,
      totalPrice: 199.98,
      variant: mockProduct.variants[0],
    },
  ],
};
