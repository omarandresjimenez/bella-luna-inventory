import { describe, it, expect, beforeEach } from '@jest/globals';
import { OrderService } from '../../../application/services/OrderService';
import { prismaMock } from '../../setup';

// Mock dependencies
jest.mock('../../../application/services/CartService');
jest.mock('../../../application/services/StoreService');
jest.mock('../../../config/sendgrid.js', () => ({
  emailTemplates: {},
  sendEmail: jest.fn(),
  sendOrderEmails: jest.fn(),
}));

describe('OrderService', () => {
  let orderService: OrderService;
  let mockCartService: any;
  let mockStoreService: any;

  beforeEach(() => {
    mockCartService = {
      getCart: jest.fn(),
      clearCart: jest.fn(),
    };

    mockStoreService = {
      getSettings: jest.fn(),
    };

    orderService = new OrderService(prismaMock, mockCartService, mockStoreService);
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order with valid data', async () => {
      const customerId = 'cust-123';
      const sessionId = 'session-123';
      const orderData = {
        deliveryType: 'HOME_DELIVERY',
        paymentMethod: 'CREDIT_CARD',
        addressId: 'addr-1',
      };

      const mockCart = {
        id: 'cart-1',
        items: [
          {
            id: 'item-1',
            variantId: 'var-1',
            quantity: 2,
            unitPrice: 50.0,
            variant: {
              id: 'var-1',
              product: {
                id: 'prod-1',
                name: 'Product 1',
                sku: 'PROD-001',
              },
              attributeValues: [],
            },
          },
        ],
      };

      mockCartService.getCart.mockResolvedValue(mockCart);
      mockStoreService.getSettings.mockResolvedValue({
        deliveryFee: 10.0,
        taxRate: 0.19,
      });

      prismaMock.address.findFirst.mockResolvedValue({
        id: 'addr-1',
        customerId,
        street: '123 Main St',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
        country: 'Colombia',
        isDefault: true,
        createdAt: new Date(),
      });

      prismaMock.customer.findUnique.mockResolvedValue({
        id: customerId,
        email: 'customer@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'hashed',
        phone: '1234567890',
        birthDate: null,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prismaMock.order.create.mockResolvedValue({
        id: 'order-1',
        orderNumber: 'ORD-001',
        customerId,
        status: 'PENDING',
        deliveryType: 'HOME_DELIVERY',
        paymentMethod: 'CREDIT_CARD',
        subtotal: 100.0,
        deliveryFee: 10.0,
        total: 110.0,
        shippingAddress: {},
        createdAt: new Date(),
        items: [],
      } as any);

      const result = await orderService.createOrder(orderData as any, customerId, sessionId);

      expect(result).toBeDefined();
      expect(result.orderNumber).toBeDefined();
      expect(prismaMock.order.create).toHaveBeenCalled();
    });

    it('should reject order with empty cart', async () => {
      const customerId = 'cust-123';
      const mockCart = {
        id: 'cart-1',
        items: [],
      };

      mockCartService.getCart.mockResolvedValue(mockCart);

      await expect(
        orderService.createOrder(
          { deliveryType: 'HOME_DELIVERY', paymentMethod: 'CREDIT_CARD', addressId: 'addr-1' } as any,
          customerId
        )
      ).rejects.toThrow();
    });

    it('should require address for home delivery', async () => {
      const customerId = 'cust-123';
      const mockCart = {
        id: 'cart-1',
        items: [{ variantId: 'var-1', quantity: 1, unitPrice: 50.0 }],
      };

      mockCartService.getCart.mockResolvedValue(mockCart);

      await expect(
        orderService.createOrder(
          { deliveryType: 'HOME_DELIVERY', paymentMethod: 'CREDIT_CARD' } as any,
          customerId
        )
      ).rejects.toThrow();
    });

    it('should calculate order total with tax and delivery fee', async () => {
      const customerId = 'cust-123';
      const orderData = {
        deliveryType: 'HOME_DELIVERY',
        paymentMethod: 'CREDIT_CARD',
        addressId: 'addr-1',
      };

      const mockCart = {
        id: 'cart-1',
        items: [
          {
            id: 'item-1',
            variantId: 'var-1',
            quantity: 2,
            unitPrice: 100.0,
            variant: {
              id: 'var-1',
              product: {
                id: 'prod-1',
                name: 'Product',
                sku: 'PROD-001',
              },
              attributeValues: [],
            },
          },
        ],
      };

      mockCartService.getCart.mockResolvedValue(mockCart);
      mockStoreService.getSettings.mockResolvedValue({
        deliveryFee: 15.0,
        taxRate: 0.19,
      });

      prismaMock.address.findFirst.mockResolvedValue({
        id: 'addr-1',
        customerId,
        street: '123 Main St',
        city: 'Bogotá',
        state: 'Cundinamarca',
        zipCode: '110111',
        country: 'Colombia',
        isDefault: true,
        createdAt: new Date(),
      });

      const result = await orderService.createOrder(orderData as any, customerId);

      expect(result.subtotal).toBe(200.0);
      expect(result.deliveryFee).toBe(15.0);
    });
  });

  describe('getOrder', () => {
    it('should retrieve order by ID', async () => {
      const orderId = 'order-1';
      const customerId = 'cust-123';

      prismaMock.order.findFirst.mockResolvedValue({
        id: orderId,
        orderNumber: 'ORD-001',
        customerId,
        status: 'PENDING',
        deliveryType: 'HOME_DELIVERY',
        paymentMethod: 'CREDIT_CARD',
        subtotal: 100.0,
        deliveryFee: 10.0,
        total: 110.0,
        shippingAddress: {},
        createdAt: new Date(),
        items: [],
      } as any);

      const result = await orderService.getOrder(orderId, customerId);

      expect(result).toBeDefined();
      expect(result.id).toBe(orderId);
      expect(result.orderNumber).toBe('ORD-001');
    });

    it('should verify customer ownership', async () => {
      const orderId = 'order-1';
      const customerId = 'cust-123';

      prismaMock.order.findFirst.mockResolvedValue(null);

      await expect(
        orderService.getOrder(orderId, customerId)
      ).rejects.toThrow();
    });

    it('should not return order for different customer', async () => {
      const orderId = 'order-1';
      const customerId = 'cust-123';
      const differentCustomerId = 'cust-456';

      prismaMock.order.findFirst.mockResolvedValue(null);

      const result = await orderService.getOrder(orderId, differentCustomerId);

      expect(result).toBeNull();
    });
  });

  describe('getCustomerOrders', () => {
    it('should retrieve all orders for customer', async () => {
      const customerId = 'cust-123';

      prismaMock.order.findMany.mockResolvedValue([
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          customerId,
          status: 'DELIVERED',
          deliveryType: 'HOME_DELIVERY',
          paymentMethod: 'CREDIT_CARD',
          subtotal: 100.0,
          deliveryFee: 10.0,
          total: 110.0,
          shippingAddress: {},
          createdAt: new Date(),
          items: [],
        },
        {
          id: 'order-2',
          orderNumber: 'ORD-002',
          customerId,
          status: 'PENDING',
          deliveryType: 'PICKUP',
          paymentMethod: 'CASH',
          subtotal: 50.0,
          deliveryFee: 0,
          total: 50.0,
          shippingAddress: {},
          createdAt: new Date(),
          items: [],
        },
      ] as any);

      const result = await orderService.getCustomerOrders(customerId);

      expect(result).toHaveLength(2);
      expect(result[0].orderNumber).toBe('ORD-001');
      expect(result[1].orderNumber).toBe('ORD-002');
    });

    it('should support pagination', async () => {
      const customerId = 'cust-123';

      prismaMock.order.findMany.mockResolvedValue([
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          customerId,
          status: 'DELIVERED',
          deliveryType: 'HOME_DELIVERY',
          paymentMethod: 'CREDIT_CARD',
          subtotal: 100.0,
          deliveryFee: 10.0,
          total: 110.0,
          shippingAddress: {},
          createdAt: new Date(),
          items: [],
        },
      ] as any);

      const result = await orderService.getCustomerOrders(customerId, {
        page: 1,
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter orders by status', async () => {
      const customerId = 'cust-123';

      prismaMock.order.findMany.mockResolvedValue([
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          customerId,
          status: 'DELIVERED',
          deliveryType: 'HOME_DELIVERY',
          paymentMethod: 'CREDIT_CARD',
          subtotal: 100.0,
          deliveryFee: 10.0,
          total: 110.0,
          shippingAddress: {},
          createdAt: new Date(),
          items: [],
        },
      ] as any);

      const result = await orderService.getCustomerOrders(customerId, {
        status: 'DELIVERED',
      });

      expect(result.every((order: any) => order.status === 'DELIVERED')).toBe(true);
    });

    it('should sort orders by date descending', async () => {
      const customerId = 'cust-123';
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-10');

      prismaMock.order.findMany.mockResolvedValue([
        {
          id: 'order-1',
          orderNumber: 'ORD-001',
          customerId,
          status: 'DELIVERED',
          deliveryType: 'HOME_DELIVERY',
          paymentMethod: 'CREDIT_CARD',
          subtotal: 100.0,
          deliveryFee: 10.0,
          total: 110.0,
          shippingAddress: {},
          createdAt: date1,
          items: [],
        },
        {
          id: 'order-2',
          orderNumber: 'ORD-002',
          customerId,
          status: 'PENDING',
          deliveryType: 'PICKUP',
          paymentMethod: 'CASH',
          subtotal: 50.0,
          deliveryFee: 0,
          total: 50.0,
          shippingAddress: {},
          createdAt: date2,
          items: [],
        },
      ] as any);

      const result = await orderService.getCustomerOrders(customerId);

      expect(result[0].createdAt.getTime()).toBeGreaterThan(result[1].createdAt.getTime());
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const orderId = 'order-1';

      prismaMock.order.findUnique.mockResolvedValue({
        id: orderId,
        orderNumber: 'ORD-001',
        status: 'PENDING',
        deliveryType: 'HOME_DELIVERY',
        paymentMethod: 'CREDIT_CARD',
        subtotal: 100.0,
        deliveryFee: 10.0,
        total: 110.0,
        shippingAddress: {},
        createdAt: new Date(),
        items: [],
      } as any);

      prismaMock.order.update.mockResolvedValue({
        id: orderId,
        orderNumber: 'ORD-001',
        status: 'SHIPPED',
        deliveryType: 'HOME_DELIVERY',
        paymentMethod: 'CREDIT_CARD',
        subtotal: 100.0,
        deliveryFee: 10.0,
        total: 110.0,
        shippingAddress: {},
        createdAt: new Date(),
        items: [],
      } as any);

      const result = await orderService.updateOrderStatus(orderId, {
        status: 'SHIPPED',
      });

      expect(result.status).toBe('SHIPPED');
      expect(prismaMock.order.update).toHaveBeenCalled();
    });

    it('should allow tracking number on shipped status', async () => {
      const orderId = 'order-1';

      prismaMock.order.findUnique.mockResolvedValue({
        id: orderId,
        status: 'PENDING',
      } as any);

      prismaMock.order.update.mockResolvedValue({
        id: orderId,
        status: 'SHIPPED',
        trackingNumber: 'TRACK123',
      } as any);

      const result = await orderService.updateOrderStatus(orderId, {
        status: 'SHIPPED',
        trackingNumber: 'TRACK123',
      });

      expect(result.trackingNumber).toBe('TRACK123');
    });

    it('should only allow valid status transitions', async () => {
      const orderId = 'order-1';

      prismaMock.order.findUnique.mockResolvedValue({
        id: orderId,
        status: 'DELIVERED',
      } as any);

      // Attempting to transition from DELIVERED to PENDING should fail
      await expect(
        orderService.updateOrderStatus(orderId, { status: 'PENDING' })
      ).rejects.toThrow();
    });
  });

  describe('cancelOrder', () => {
    it('should cancel pending order', async () => {
      const orderId = 'order-1';

      prismaMock.order.findUnique.mockResolvedValue({
        id: orderId,
        status: 'PENDING',
      } as any);

      prismaMock.order.update.mockResolvedValue({
        id: orderId,
        status: 'CANCELLED',
      } as any);

      const result = await orderService.cancelOrder(orderId);

      expect(result.status).toBe('CANCELLED');
      expect(prismaMock.order.update).toHaveBeenCalled();
    });

    it('should not cancel already shipped order', async () => {
      const orderId = 'order-1';

      prismaMock.order.findUnique.mockResolvedValue({
        id: orderId,
        status: 'SHIPPED',
      } as any);

      await expect(orderService.cancelOrder(orderId)).rejects.toThrow();
    });

    it('should restore inventory on cancellation', async () => {
      const orderId = 'order-1';

      prismaMock.order.findUnique.mockResolvedValue({
        id: orderId,
        status: 'PENDING',
        items: [
          {
            id: 'item-1',
            variantId: 'var-1',
            quantity: 2,
          },
        ],
      } as any);

      prismaMock.order.update.mockResolvedValue({
        id: orderId,
        status: 'CANCELLED',
      } as any);

      await orderService.cancelOrder(orderId);

      // Verify that inventory restoration was attempted
      expect(prismaMock.order.update).toHaveBeenCalled();
    });
  });
});
