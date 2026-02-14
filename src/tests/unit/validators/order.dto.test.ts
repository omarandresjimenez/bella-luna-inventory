import { describe, it, expect } from '@jest/globals';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderFilterSchema,
} from '../../../application/dtos/order.dto';

describe('Order DTOs', () => {
  describe('createOrderSchema', () => {
    const validOrderData = {
      customerId: 'cust-123',
      items: [
        {
          productId: 'prod-1',
          variantId: 'var-1',
          quantity: 2,
          price: 49.99,
        },
      ],
      shippingAddressId: 'addr-1',
      paymentMethodId: 'pm-1',
      notes: 'Please ship quickly',
    };

    it('should validate correct order data', () => {
      const result = createOrderSchema.safeParse(validOrderData);
      expect(result.success).toBe(true);
    });

    it('should require at least one item', () => {
      const invalidData = { ...validOrderData, items: [] };
      const result = createOrderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject zero quantity', () => {
      const invalidData = {
        ...validOrderData,
        items: [
          {
            productId: 'prod-1',
            variantId: 'var-1',
            quantity: 0,
            price: 49.99,
          },
        ],
      };
      const result = createOrderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative quantity', () => {
      const invalidData = {
        ...validOrderData,
        items: [
          {
            productId: 'prod-1',
            variantId: 'var-1',
            quantity: -5,
            price: 49.99,
          },
        ],
      };
      const result = createOrderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative price', () => {
      const invalidData = {
        ...validOrderData,
        items: [
          {
            productId: 'prod-1',
            variantId: 'var-1',
            quantity: 2,
            price: -10,
          },
        ],
      };
      const result = createOrderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow optional notes', () => {
      const dataWithoutNotes = { ...validOrderData, notes: undefined };
      const result = createOrderSchema.safeParse(dataWithoutNotes);
      expect(result.success).toBe(true);
    });

    it('should allow empty notes string', () => {
      const dataWithEmptyNotes = { ...validOrderData, notes: '' };
      const result = createOrderSchema.safeParse(dataWithEmptyNotes);
      expect(result.success).toBe(true);
    });

    it('should allow multiple items', () => {
      const dataWithMultipleItems = {
        ...validOrderData,
        items: [
          {
            productId: 'prod-1',
            variantId: 'var-1',
            quantity: 2,
            price: 49.99,
          },
          {
            productId: 'prod-2',
            variantId: 'var-2',
            quantity: 1,
            price: 99.99,
          },
          {
            productId: 'prod-3',
            quantity: 3,
            price: 29.99,
          },
        ],
      };
      const result = createOrderSchema.safeParse(dataWithMultipleItems);
      expect(result.success).toBe(true);
    });

    it('should validate with coupon code', () => {
      const dataWithCoupon = {
        ...validOrderData,
        couponCode: 'SAVE20',
      };
      const result = createOrderSchema.safeParse(dataWithCoupon);
      expect(result.success).toBe(true);
    });

    it('should require customerId, items, and shippingAddressId', () => {
      const minimalData = {
        customerId: 'cust-123',
        items: [
          {
            productId: 'prod-1',
            quantity: 1,
            price: 49.99,
          },
        ],
        shippingAddressId: 'addr-1',
      };
      const result = createOrderSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });
  });

  describe('updateOrderStatusSchema', () => {
    it('should validate order status update', () => {
      const validUpdate = {
        status: 'SHIPPED',
      };
      const result = updateOrderStatusSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should validate all valid statuses', () => {
      const validStatuses = [
        'PENDING',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'REFUNDED',
      ];
      validStatuses.forEach((status) => {
        const result = updateOrderStatusSchema.safeParse({ status });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid status', () => {
      const invalidUpdate = {
        status: 'INVALID_STATUS',
      };
      const result = updateOrderStatusSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it('should allow optional tracking number', () => {
      const updateWithTracking = {
        status: 'SHIPPED',
        trackingNumber: 'TRACK123456789',
      };
      const result = updateOrderStatusSchema.safeParse(updateWithTracking);
      expect(result.success).toBe(true);
    });

    it('should allow optional notes on status change', () => {
      const updateWithNotes = {
        status: 'CANCELLED',
        notes: 'Customer requested cancellation',
      };
      const result = updateOrderStatusSchema.safeParse(updateWithNotes);
      expect(result.success).toBe(true);
    });

    it('should require status field', () => {
      const result = updateOrderStatusSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('orderFilterSchema', () => {
    it('should validate correct query parameters', () => {
      const validQuery = {
        page: 1,
        limit: 10,
        status: 'DELIVERED',
      };
      const result = orderFilterSchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should use default pagination values', () => {
      const result = orderFilterSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject zero page', () => {
      const invalidQuery = { page: 0 };
      const result = orderFilterSchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    it('should reject zero or negative limit', () => {
      const testCases = [
        { limit: 0 },
        { limit: -5 },
      ];
      testCases.forEach((query) => {
        const result = orderFilterSchema.safeParse(query);
        expect(result.success).toBe(false);
      });
    });

    it('should allow filtering by status', () => {
      const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
      statuses.forEach((status) => {
        const result = orderFilterSchema.safeParse({ status });
        expect(result.success).toBe(true);
      });
    });

    it('should allow filtering by date range', () => {
      const queryWithDates = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
      };
      const result = orderFilterSchema.safeParse(queryWithDates);
      expect(result.success).toBe(true);
    });

    it('should allow sorting options', () => {
      const sortOptions = ['newest', 'oldest', 'total_asc', 'total_desc'];
      sortOptions.forEach((sort) => {
        const result = orderFilterSchema.safeParse({ sort });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid sort option', () => {
      const result = orderFilterSchema.safeParse({ sort: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('should allow searching by order ID', () => {
      const result = orderFilterSchema.safeParse({ search: 'ORDER-123' });
      expect(result.success).toBe(true);
    });

    it('should allow complex query with multiple filters', () => {
      const complexQuery = {
        page: 2,
        limit: 20,
        status: 'SHIPPED',
        sort: 'newest',
        startDate: '2024-06-01T00:00:00Z',
        search: 'customer-name',
      };
      const result = orderFilterSchema.safeParse(complexQuery);
      expect(result.success).toBe(true);
    });
  });
});
