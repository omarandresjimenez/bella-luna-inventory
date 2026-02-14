import { describe, it, expect, beforeEach } from '@jest/globals';
import { OrderController } from '../../../interface/controllers/OrderController';
import { createMockRequest, createMockResponse } from '../../test-utils';

// Mock dependencies
jest.mock('../../../application/services/OrderService');

describe('OrderController', () => {
  let orderController: OrderController;
  let mockOrderService: any;

  beforeEach(() => {
    mockOrderService = {
      createOrder: jest.fn(),
      getCustomerOrders: jest.fn(),
      getOrderById: jest.fn(),
      cancelOrder: jest.fn(),
    };

    orderController = new OrderController(mockOrderService);
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order with valid data', async () => {
      const customerId = 'cust-123';
      const req = createMockRequest({
        user: { userId: customerId, email: 'customer@example.com', role: 'CUSTOMER' },
        body: {
          deliveryType: 'HOME_DELIVERY',
          paymentMethod: 'CREDIT_CARD',
          addressId: 'addr-1',
        },
      });
      const res = createMockResponse();

      mockOrderService.createOrder.mockResolvedValue({
        id: 'order-1',
        orderNumber: 'ORD-001',
        customerId,
        status: 'PENDING',
        deliveryType: 'HOME_DELIVERY',
        paymentMethod: 'CREDIT_CARD',
        subtotal: 100.0,
        deliveryFee: 10.0,
        total: 110.0,
        createdAt: new Date(),
        items: [],
      });

      await orderController.createOrder(req as any, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockOrderService.createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          deliveryType: 'HOME_DELIVERY',
          paymentMethod: 'CREDIT_CARD',
          addressId: 'addr-1',
        }),
        customerId,
        undefined
      );
    });

    it('should return 400 on validation error', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', email: 'customer@example.com', role: 'CUSTOMER' },
        body: {
          // Missing required fields
          deliveryType: 'INVALID_TYPE',
        },
      });
      const res = createMockResponse();

      await orderController.createOrder(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if cart is empty', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', email: 'customer@example.com', role: 'CUSTOMER' },
        body: {
          deliveryType: 'HOME_DELIVERY',
          paymentMethod: 'CREDIT_CARD',
          addressId: 'addr-1',
        },
      });
      const res = createMockResponse();

      mockOrderService.createOrder.mockRejectedValue(
        new Error('El carrito está vacío')
      );

      await orderController.createOrder(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if address not found', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', email: 'customer@example.com', role: 'CUSTOMER' },
        body: {
          deliveryType: 'HOME_DELIVERY',
          paymentMethod: 'CREDIT_CARD',
          addressId: 'nonexistent',
        },
      });
      const res = createMockResponse();

      mockOrderService.createOrder.mockRejectedValue(
        new Error('Dirección no encontrada')
      );

      await orderController.createOrder(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should include sessionId if provided', async () => {
      const customerId = 'cust-123';
      const sessionId = 'session-123';
      const req = createMockRequest({
        user: { userId: customerId, email: 'customer@example.com', role: 'CUSTOMER' },
        headers: { 'x-session-id': sessionId },
        body: {
          deliveryType: 'HOME_DELIVERY',
          paymentMethod: 'CREDIT_CARD',
          addressId: 'addr-1',
        },
      });
      const res = createMockResponse();

      mockOrderService.createOrder.mockResolvedValue({
        id: 'order-1',
        orderNumber: 'ORD-001',
        customerId,
        status: 'PENDING',
        deliveryType: 'HOME_DELIVERY',
        paymentMethod: 'CREDIT_CARD',
        subtotal: 100.0,
        deliveryFee: 10.0,
        total: 110.0,
        createdAt: new Date(),
        items: [],
      });

      await orderController.createOrder(req as any, res);

      expect(mockOrderService.createOrder).toHaveBeenCalledWith(
        expect.anything(),
        customerId,
        sessionId
      );
    });

    it('should return 500 on service error', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        body: {
          deliveryType: 'HOME_DELIVERY',
          paymentMethod: 'CREDIT_CARD',
          addressId: 'addr-1',
        },
      });
      const res = createMockResponse();

      mockOrderService.createOrder.mockRejectedValue(
        new Error('Database error')
      );

      await orderController.createOrder(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getMyOrders', () => {
    it('should retrieve customer orders', async () => {
      const customerId = 'cust-123';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
        query: { page: '1', limit: '10' },
      });
      const res = createMockResponse();

      mockOrderService.getCustomerOrders.mockResolvedValue({
        orders: [
          {
            id: 'order-1',
            orderNumber: 'ORD-001',
            status: 'DELIVERED',
            total: 110.0,
            createdAt: new Date(),
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
        },
      });

      await orderController.getMyOrders(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockOrderService.getCustomerOrders).toHaveBeenCalledWith(customerId, expect.any(Object));
    });

    it('should filter orders by status', async () => {
      const customerId = 'cust-123';
      const req = createMockRequest({
        user: { userId: customerId, email: 'customer@example.com', role: 'CUSTOMER' },
        query: { status: 'DELIVERED' },
      });
      const res = createMockResponse();

      mockOrderService.getCustomerOrders.mockResolvedValue({
        orders: [
          {
            id: 'order-1',
            orderNumber: 'ORD-001',
            status: 'DELIVERED',
            total: 110.0,
            createdAt: new Date(),
          },
        ],
      });

      await orderController.getMyOrders(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should support pagination', async () => {
      const customerId = 'cust-123';
      const req = createMockRequest({
        user: { userId: customerId, email: 'customer@example.com', role: 'CUSTOMER' },
        query: { page: '2', limit: '5' },
      });
      const res = createMockResponse();

      mockOrderService.getCustomerOrders.mockResolvedValue({
        orders: [],
        pagination: {
          page: 2,
          limit: 5,
          total: 0,
        },
      });

      await orderController.getMyOrders(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 500 on service error', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', email: 'customer@example.com', role: 'CUSTOMER' },
        query: {},
      });
      const res = createMockResponse();

      mockOrderService.getCustomerOrders.mockRejectedValue(
        new Error('Database error')
      );

      await orderController.getMyOrders(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getOrderById', () => {
    it('should retrieve specific order', async () => {
      const customerId = 'cust-123';
      const orderId = 'order-1';
      const req = createMockRequest({
        user: { userId: customerId, email: 'customer@example.com', role: 'CUSTOMER' },
        params: { id: orderId },
      });
      const res = createMockResponse();

      mockOrderService.getOrderById.mockResolvedValue({
        id: orderId,
        orderNumber: 'ORD-001',
        customerId,
        status: 'DELIVERED',
        subtotal: 100.0,
        deliveryFee: 10.0,
        total: 110.0,
        createdAt: new Date(),
        items: [
          {
            id: 'item-1',
            productName: 'Product 1',
            quantity: 2,
            unitPrice: 50.0,
          },
        ],
      });

      await orderController.getOrderById(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockOrderService.getOrderById).toHaveBeenCalledWith(orderId, customerId);
    });

    it('should return 404 if order not found', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        params: { id: 'nonexistent' },
      });
      const res = createMockResponse();

      mockOrderService.getOrderById.mockRejectedValue(
        new Error('Orden no encontrada')
      );

      await orderController.getOrderById(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should not return order for different customer', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-different', role: 'CUSTOMER' },
        params: { id: 'order-1' },
      });
      const res = createMockResponse();

      mockOrderService.getOrderById.mockRejectedValue(
        new Error('Orden no encontrada')
      );

      await orderController.getOrderById(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on service error', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        params: { id: 'order-1' },
      });
      const res = createMockResponse();

      mockOrderService.getOrderById.mockRejectedValue(
        new Error('Database error')
      );

      await orderController.getOrderById(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel pending order', async () => {
      const customerId = 'cust-123';
      const orderId = 'order-1';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
        params: { id: orderId },
      });
      const res = createMockResponse();

      mockOrderService.cancelOrder.mockResolvedValue({
        id: orderId,
        orderNumber: 'ORD-001',
        customerId,
        status: 'CANCELLED',
        subtotal: 100.0,
        deliveryFee: 10.0,
        total: 110.0,
        createdAt: new Date(),
        items: [],
      });

      await orderController.cancelOrder(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockOrderService.cancelOrder).toHaveBeenCalledWith(orderId, customerId);
    });

    it('should return 400 if order cannot be cancelled', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        params: { id: 'order-shipped' },
      });
      const res = createMockResponse();

      mockOrderService.cancelOrder.mockRejectedValue(
        new Error('No se puede cancelar esta orden')
      );

      await orderController.cancelOrder(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if order not found', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        params: { id: 'nonexistent' },
      });
      const res = createMockResponse();

      mockOrderService.cancelOrder.mockRejectedValue(
        new Error('Orden no encontrada')
      );

      await orderController.cancelOrder(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should verify customer ownership before cancellation', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-different', role: 'CUSTOMER' },
        params: { id: 'order-1' },
      });
      const res = createMockResponse();

      mockOrderService.cancelOrder.mockRejectedValue(
        new Error('Orden no encontrada')
      );

      await orderController.cancelOrder(req as any, res);

      expect(mockOrderService.cancelOrder).toHaveBeenCalledWith('order-1', 'cust-different');
    });

    it('should return 500 on service error', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        params: { id: 'order-1' },
      });
      const res = createMockResponse();

      mockOrderService.cancelOrder.mockRejectedValue(
        new Error('Database error')
      );

      await orderController.cancelOrder(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Order validation', () => {
    it('should validate delivery type', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        body: {
          deliveryType: 'INVALID_TYPE',
          paymentMethod: 'CREDIT_CARD',
          addressId: 'addr-1',
        },
      });
      const res = createMockResponse();

      await orderController.createOrder(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should validate payment method', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        body: {
          deliveryType: 'HOME_DELIVERY',
          paymentMethod: 'INVALID_METHOD',
          addressId: 'addr-1',
        },
      });
      const res = createMockResponse();

      await orderController.createOrder(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Error handling', () => {
    it('should handle missing required fields', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        body: {
          // Missing all required fields
        },
      });
      const res = createMockResponse();

      await orderController.createOrder(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle unknown service errors', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
      });
      const res = createMockResponse();

      mockOrderService.getCustomerOrders.mockRejectedValue({
        status: 500,
        message: 'Unknown error',
      });

      await orderController.getMyOrders(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Order response format', () => {
    it('should include order items in response', async () => {
      const customerId = 'cust-123';
      const orderId = 'order-1';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
        params: { id: orderId },
      });
      const res = createMockResponse();

      mockOrderService.getOrderById.mockResolvedValue({
        id: orderId,
        orderNumber: 'ORD-001',
        customerId,
        status: 'PENDING',
        subtotal: 100.0,
        deliveryFee: 10.0,
        total: 110.0,
        createdAt: new Date(),
        items: [
          {
            id: 'item-1',
            productName: 'Product 1',
            quantity: 2,
            unitPrice: 50.0,
            totalPrice: 100.0,
          },
        ],
      });

      await orderController.getOrderById(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          items: expect.any(Array),
        })
      );
    });

    it('should include order totals in response', async () => {
      const customerId = 'cust-123';
      const orderId = 'order-1';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
        params: { id: orderId },
      });
      const res = createMockResponse();

      mockOrderService.getOrderById.mockResolvedValue({
        id: orderId,
        orderNumber: 'ORD-001',
        customerId,
        status: 'PENDING',
        subtotal: 100.0,
        deliveryFee: 10.0,
        discount: 0,
        total: 110.0,
        createdAt: new Date(),
        items: [],
      });

      await orderController.getOrderById(req as any, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          subtotal: expect.any(Number),
          deliveryFee: expect.any(Number),
          total: expect.any(Number),
        })
      );
    });
  });
});
