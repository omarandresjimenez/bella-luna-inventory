import { describe, it, expect, beforeEach } from '@jest/globals';
import { CartController } from '../../../interface/controllers/CartController';
import { createMockRequest, createMockResponse } from '../../test-utils';

// Mock dependencies
jest.mock('../../../application/services/CartService');

describe('CartController', () => {
  let cartController: CartController;
  let mockCartService: any;

  beforeEach(() => {
    mockCartService = {
      getCart: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
    };

    cartController = new CartController(mockCartService);
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should get cart for authenticated customer', async () => {
      const customerId = 'cust-123';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
      });
      const res = createMockResponse();

      mockCartService.getCart.mockResolvedValue({
        id: 'cart-1',
        customerId,
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            quantity: 2,
            price: 50.0,
          },
        ],
      });

      await cartController.getCart(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockCartService.getCart).toHaveBeenCalledWith(undefined, customerId);
    });

    it('should get cart for anonymous session', async () => {
      const sessionId = 'session-123';
      const req = createMockRequest({
        headers: { 'x-session-id': sessionId },
      });
      const res = createMockResponse();

      mockCartService.getCart.mockResolvedValue({
        id: 'cart-1',
        sessionId,
        items: [],
      });

      await cartController.getCart(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockCartService.getCart).toHaveBeenCalledWith(sessionId, undefined);
    });

    it('should set sessionId header from response', async () => {
      const sessionId = 'session-123';
      const req = createMockRequest({
        headers: { 'x-session-id': sessionId },
      });
      const res = createMockResponse();

      mockCartService.getCart.mockResolvedValue({
        id: 'cart-1',
        sessionId,
        items: [],
      });

      await cartController.getCart(req as any, res);

      expect(res.setHeader).toHaveBeenCalledWith('X-Session-Id', sessionId);
    });

    it('should return 500 on service error', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
      });
      const res = createMockResponse();

      mockCartService.getCart.mockRejectedValue(new Error('Service error'));

      await cartController.getCart(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should return empty cart if no items', async () => {
      const customerId = 'cust-123';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
      });
      const res = createMockResponse();

      mockCartService.getCart.mockResolvedValue({
        id: 'cart-1',
        customerId,
        items: [],
      });

      await cartController.getCart(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          items: [],
        })
      );
    });
  });

  describe('addItem', () => {
    it('should add item to cart with valid data', async () => {
      const customerId = 'cust-123';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
        body: {
          productId: 'prod-1',
          variantId: 'var-1',
          quantity: 2,
        },
      });
      const res = createMockResponse();

      mockCartService.addItem.mockResolvedValue({
        id: 'cart-1',
        customerId,
        items: [
          {
            id: 'item-1',
            productId: 'prod-1',
            variantId: 'var-1',
            quantity: 2,
            unitPrice: 50.0,
          },
        ],
      });

      await cartController.addItem(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockCartService.addItem).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 'prod-1',
          quantity: 2,
        }),
        undefined,
        customerId
      );
    });

    it('should return 400 on validation error', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        body: {
          productId: 'prod-1',
          quantity: 0, // Invalid: zero quantity
        },
      });
      const res = createMockResponse();

      await cartController.addItem(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if product not found', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        body: {
          productId: 'nonexistent',
          variantId: 'var-1',
          quantity: 1,
        },
      });
      const res = createMockResponse();

      mockCartService.addItem.mockRejectedValue(
        new Error('Producto no encontrado')
      );

      await cartController.addItem(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle cart merge for authenticated anonymous user', async () => {
      const customerId = 'cust-123';
      const sessionId = 'session-123';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
        headers: { 'x-session-id': sessionId },
        body: {
          productId: 'prod-1',
          variantId: 'var-1',
          quantity: 1,
        },
      });
      const res = createMockResponse();

      mockCartService.addItem.mockResolvedValue({
        id: 'cart-1',
        customerId,
        items: [],
      });

      await cartController.addItem(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 500 on service error', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        body: {
          productId: 'prod-1',
          variantId: 'var-1',
          quantity: 1,
        },
      });
      const res = createMockResponse();

      mockCartService.addItem.mockRejectedValue(
        new Error('Database error')
      );

      await cartController.addItem(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateItem', () => {
    it('should update item quantity', async () => {
      const customerId = 'cust-123';
      const itemId = 'item-1';
      const req = createMockRequest({
        params: { id: itemId },
        user: { userId: customerId, role: 'CUSTOMER' },
        body: { quantity: 5 },
      });
      const res = createMockResponse();

      mockCartService.updateItem.mockResolvedValue({
        id: 'cart-1',
        customerId,
        items: [
          {
            id: itemId,
            productId: 'prod-1',
            quantity: 5,
            unitPrice: 50.0,
          },
        ],
      });

      await cartController.updateItem(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockCartService.updateItem).toHaveBeenCalled();
    });

    it('should return 400 on invalid quantity', async () => {
      const req = createMockRequest({
        params: { id: 'item-1' },
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        body: { quantity: 0 },
      });
      const res = createMockResponse();

      await cartController.updateItem(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if item not found', async () => {
      const req = createMockRequest({
        params: { id: 'nonexistent' },
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        body: { quantity: 5 },
      });
      const res = createMockResponse();

      mockCartService.updateItem.mockRejectedValue(
        new Error('Item no encontrado')
      );

      await cartController.updateItem(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should verify customer ownership', async () => {
      const req = createMockRequest({
        params: { id: 'item-1' },
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        body: { quantity: 5 },
      });
      const res = createMockResponse();

      mockCartService.updateItem.mockRejectedValue(
        new Error('Acceso denegado')
      );

      await cartController.updateItem(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', async () => {
      const customerId = 'cust-123';
      const itemId = 'item-1';
      const req = createMockRequest({
        params: { id: itemId },
        user: { userId: customerId, role: 'CUSTOMER' },
      });
      const res = createMockResponse();

      mockCartService.removeItem.mockResolvedValue({
        id: 'cart-1',
        customerId,
        items: [],
      });

      await cartController.removeItem(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockCartService.removeItem).toHaveBeenCalledWith(customerId, itemId);
    });

    it('should return 404 if item not found', async () => {
      const req = createMockRequest({
        params: { id: 'nonexistent' },
        user: { userId: 'cust-123', role: 'CUSTOMER' },
      });
      const res = createMockResponse();

      mockCartService.removeItem.mockRejectedValue(
        new Error('Item no encontrado')
      );

      await cartController.removeItem(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on service error', async () => {
      const req = createMockRequest({
        params: { id: 'item-1' },
        user: { userId: 'cust-123', role: 'CUSTOMER' },
      });
      const res = createMockResponse();

      mockCartService.removeItem.mockRejectedValue(
        new Error('Database error')
      );

      await cartController.removeItem(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', async () => {
      const customerId = 'cust-123';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
      });
      const res = createMockResponse();

      mockCartService.clearCart.mockResolvedValue({
        id: 'cart-1',
        customerId,
        items: [],
      });

      await cartController.clearCart(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockCartService.clearCart).toHaveBeenCalledWith(customerId);
    });

    it('should return 200 even if cart already empty', async () => {
      const customerId = 'cust-123';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
      });
      const res = createMockResponse();

      mockCartService.clearCart.mockResolvedValue({
        id: 'cart-1',
        customerId,
        items: [],
      });

      await cartController.clearCart(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 500 on service error', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
      });
      const res = createMockResponse();

      mockCartService.clearCart.mockRejectedValue(
        new Error('Database error')
      );

      await cartController.clearCart(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Session management', () => {
    it('should maintain sessionId for anonymous users', async () => {
      const sessionId = 'session-456';
      const req = createMockRequest({
        headers: { 'x-session-id': sessionId },
      });
      const res = createMockResponse();

      mockCartService.getCart.mockResolvedValue({
        id: 'cart-1',
        sessionId,
        items: [],
      });

      await cartController.getCart(req as any, res);

      expect(res.setHeader).toHaveBeenCalledWith('X-Session-Id', sessionId);
    });

    it('should not set sessionId for authenticated users', async () => {
      const customerId = 'cust-123';
      const req = createMockRequest({
        user: { userId: customerId, role: 'CUSTOMER' },
      });
      const res = createMockResponse();

      mockCartService.getCart.mockResolvedValue({
        id: 'cart-1',
        customerId,
        items: [],
      });

      await cartController.getCart(req as any, res);

      // For authenticated users, sessionId should not be set
      expect(res.setHeader).not.toHaveBeenCalledWith(
        'X-Session-Id',
        expect.anything()
      );
    });
  });

  describe('Error handling', () => {
    it('should handle product not found errors', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        body: {
          productId: 'nonexistent',
          quantity: 1,
        },
      });
      const res = createMockResponse();

      mockCartService.addItem.mockRejectedValue(
        new Error('Producto no encontrado')
      );

      await cartController.addItem(req as any, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle bad request errors', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
        body: {
          productId: 'prod-1',
          quantity: 1,
        },
      });
      const res = createMockResponse();

      mockCartService.addItem.mockRejectedValue(
        new Error('Stock insuficiente')
      );

      await cartController.addItem(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle internal server errors', async () => {
      const req = createMockRequest({
        user: { userId: 'cust-123', role: 'CUSTOMER' },
      });
      const res = createMockResponse();

      mockCartService.getCart.mockRejectedValue(
        new Error('Unexpected error')
      );

      await cartController.getCart(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
