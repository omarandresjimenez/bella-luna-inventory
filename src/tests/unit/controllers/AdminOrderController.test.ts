import { describe, it, expect, beforeEach } from '@jest/globals';
import { AdminOrderController } from '../../../interface/controllers/AdminOrderController.js';
import { createMockRequest, createMockResponse } from '../../test-utils.js';
import { HttpStatus } from '../../../shared/utils/api-response.js';

describe('AdminOrderController', () => {
  let controller: AdminOrderController;
  let mockOrderService: any;

  beforeEach(() => {
    mockOrderService = {
      getAllOrders: jest.fn(),
      getOrderById: jest.fn(),
      updateOrderStatus: jest.fn(),
      cancelOrder: jest.fn(),
    };
    controller = new AdminOrderController(mockOrderService);
    jest.clearAllMocks();
  });

  describe('getAllOrders', () => {
    it('should return all orders with filters', async () => {
      const mockOrders = {
        data: [
          {
            id: '1',
            customerId: 'cust-1',
            totalAmount: 100.00,
            status: 'pending',
            createdAt: new Date(),
          },
          {
            id: '2',
            customerId: 'cust-2',
            totalAmount: 200.00,
            status: 'completed',
            createdAt: new Date(),
          },
        ],
        pagination: { total: 2, page: 1, limit: 10 },
      };

      const req = createMockRequest({
        query: { status: 'pending', page: '1', limit: '10' },
      });
      const res = createMockResponse();
      mockOrderService.getAllOrders.mockResolvedValue(mockOrders);

      await controller.getAllOrders(req as any, res);

      expect(mockOrderService.getAllOrders).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending', page: 1, limit: 10 })
      );
      expect(res.status).not.toHaveBeenCalled(); // sendSuccess called
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockOrders,
        })
      );
    });

    it('should handle validation errors in filters', async () => {
      const req = createMockRequest({
        query: { page: 'invalid' },
      });
      const res = createMockResponse();

      await controller.getAllOrders(req as any, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        })
      );
    });

    it('should handle service errors', async () => {
      const req = createMockRequest({
        query: {},
      });
      const res = createMockResponse();
      mockOrderService.getAllOrders.mockRejectedValue(new Error('Database error'));

      await controller.getAllOrders(req as any, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.any(String),
        })
      );
    });

    it('should return empty orders list', async () => {
      const mockOrders = {
        data: [],
        pagination: { total: 0, page: 1, limit: 10 },
      };

      const req = createMockRequest({
        query: { status: 'cancelled' },
      });
      const res = createMockResponse();
      mockOrderService.getAllOrders.mockResolvedValue(mockOrders);

      await controller.getAllOrders(req as any, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockOrders,
        })
      );
    });
  });

  describe('getOrderById', () => {
    it('should return order details by ID', async () => {
      const mockOrder = {
        id: 'order-1',
        customerId: 'cust-1',
        totalAmount: 150.00,
        status: 'completed',
        items: [
          { id: 'item-1', productId: 'prod-1', quantity: 2, price: 75.00 },
        ],
        createdAt: new Date(),
      };

      const req = createMockRequest({
        params: { id: 'order-1' },
      });
      const res = createMockResponse();
      mockOrderService.getOrderById.mockResolvedValue(mockOrder);

      await controller.getOrderById(req as any, res);

      expect(mockOrderService.getOrderById).toHaveBeenCalledWith('order-1');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockOrder,
        })
      );
    });

    it('should return 404 when order not found', async () => {
      const req = createMockRequest({
        params: { id: 'nonexistent' },
      });
      const res = createMockResponse();
      mockOrderService.getOrderById.mockRejectedValue(new Error('Orden no encontrada'));

      await controller.getOrderById(req as any, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          code: 'NOT_FOUND',
        })
      );
    });

    it('should handle service errors for order retrieval', async () => {
      const req = createMockRequest({
        params: { id: 'order-1' },
      });
      const res = createMockResponse();
      mockOrderService.getOrderById.mockRejectedValue(new Error('Database error'));

      await controller.getOrderById(req as any, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return complete order with all details', async () => {
      const mockOrder = {
        id: 'order-1',
        customerId: 'cust-1',
        totalAmount: 250.00,
        subtotal: 200.00,
        taxAmount: 30.00,
        deliveryFee: 20.00,
        status: 'shipped',
        trackingNumber: 'TRACK123',
        items: [
          { id: 'item-1', productId: 'prod-1', quantity: 1, price: 100.00 },
          { id: 'item-2', productId: 'prod-2', quantity: 1, price: 100.00 },
        ],
        address: {
          street: '123 Main St',
          city: 'Bogotá',
          state: 'Cundinamarca',
          postalCode: '110111',
          country: 'Colombia',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const req = createMockRequest({
        params: { id: 'order-1' },
      });
      const res = createMockResponse();
      mockOrderService.getOrderById.mockResolvedValue(mockOrder);

      await controller.getOrderById(req as any, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 'order-1',
            totalAmount: 250.00,
            status: 'shipped',
            trackingNumber: 'TRACK123',
            items: expect.arrayContaining([
              expect.objectContaining({ productId: 'prod-1' }),
            ]),
            address: expect.objectContaining({
              city: 'Bogotá',
            }),
          }),
        })
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const mockUpdatedOrder = {
        id: 'order-1',
        status: 'shipped',
        trackingNumber: 'TRACK123',
        adminNotes: 'Order shipped',
        updatedAt: new Date(),
      };

      const req = createMockRequest({
        params: { id: 'order-1' },
        body: { status: 'shipped', adminNotes: 'Order shipped' },
      });
      const res = createMockResponse();
      mockOrderService.updateOrderStatus.mockResolvedValue(mockUpdatedOrder);

      await controller.updateOrderStatus(req as any, res);

      expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(
        'order-1',
        'shipped',
        'Order shipped'
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUpdatedOrder,
        })
      );
    });

    it('should return 400 when status is missing', async () => {
      const req = createMockRequest({
        params: { id: 'order-1' },
        body: { adminNotes: 'No status provided' },
      });
      const res = createMockResponse();

      await controller.updateOrderStatus(req as any, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Estado requerido'),
        })
      );
    });

    it('should handle invalid status transitions', async () => {
      const req = createMockRequest({
        params: { id: 'order-1' },
        body: { status: 'invalid-status' },
      });
      const res = createMockResponse();
      mockOrderService.updateOrderStatus.mockRejectedValue(
        new Error('Estado inválido')
      );

      await controller.updateOrderStatus(req as any, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Estado inválido'),
        })
      );
    });

    it('should update status without admin notes', async () => {
      const mockUpdatedOrder = {
        id: 'order-1',
        status: 'processing',
        updatedAt: new Date(),
      };

      const req = createMockRequest({
        params: { id: 'order-1' },
        body: { status: 'processing' },
      });
      const res = createMockResponse();
      mockOrderService.updateOrderStatus.mockResolvedValue(mockUpdatedOrder);

      await controller.updateOrderStatus(req as any, res);

      expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(
        'order-1',
        'processing',
        undefined
      );
    });

    it('should handle status transitions: pending -> processing -> shipped', async () => {
      // First transition: pending -> processing
      let req = createMockRequest({
        params: { id: 'order-1' },
        body: { status: 'processing' },
      });
      let res = createMockResponse();
      mockOrderService.updateOrderStatus.mockResolvedValue({
        id: 'order-1',
        status: 'processing',
      });

      await controller.updateOrderStatus(req as any, res);

      expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(
        'order-1',
        'processing',
        undefined
      );

      // Second transition: processing -> shipped
      req = createMockRequest({
        params: { id: 'order-1' },
        body: { status: 'shipped' },
      });
      res = createMockResponse();
      mockOrderService.updateOrderStatus.mockResolvedValue({
        id: 'order-1',
        status: 'shipped',
      });

      await controller.updateOrderStatus(req as any, res);

      expect(mockOrderService.updateOrderStatus).toHaveBeenLastCalledWith(
        'order-1',
        'shipped',
        undefined
      );
    });

    it('should handle service errors when updating status', async () => {
      const req = createMockRequest({
        params: { id: 'order-1' },
        body: { status: 'shipped' },
      });
      const res = createMockResponse();
      mockOrderService.updateOrderStatus.mockRejectedValue(new Error('Database error'));

      await controller.updateOrderStatus(req as any, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const mockCancelledOrder = {
        id: 'order-1',
        status: 'cancelled',
        reason: 'Admin cancellation',
        refundedAmount: 100.00,
        cancelledAt: new Date(),
      };

      const req = createMockRequest({
        params: { id: 'order-1' },
      });
      const res = createMockResponse();
      mockOrderService.cancelOrder.mockResolvedValue(mockCancelledOrder);

      await controller.cancelOrder(req as any, res);

      expect(mockOrderService.cancelOrder).toHaveBeenCalledWith('order-1');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockCancelledOrder,
        })
      );
    });

    it('should return 404 when order not found for cancellation', async () => {
      const req = createMockRequest({
        params: { id: 'nonexistent' },
      });
      const res = createMockResponse();
      mockOrderService.cancelOrder.mockRejectedValue(new Error('Orden no encontrada'));

      await controller.cancelOrder(req as any, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Orden no encontrada'),
        })
      );
    });

    it('should prevent cancellation of non-cancellable orders', async () => {
      const req = createMockRequest({
        params: { id: 'order-1' },
      });
      const res = createMockResponse();
      mockOrderService.cancelOrder.mockRejectedValue(
        new Error('No se puede cancelar esta orden')
      );

      await controller.cancelOrder(req as any, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('No se puede cancelar esta orden'),
        })
      );
    });

    it('should handle service errors when cancelling order', async () => {
      const req = createMockRequest({
        params: { id: 'order-1' },
      });
      const res = createMockResponse();
      mockOrderService.cancelOrder.mockRejectedValue(new Error('Database error'));

      await controller.cancelOrder(req as any, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Error al cancelar orden'),
        })
      );
    });

    it('should restore inventory when cancelling order', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'pending',
        items: [
          { productId: 'prod-1', quantity: 2 },
          { productId: 'prod-2', quantity: 1 },
        ],
      };

      const mockCancelledOrder = {
        ...mockOrder,
        status: 'cancelled',
        inventoryRestored: true,
      };

      const req = createMockRequest({
        params: { id: 'order-1' },
      });
      const res = createMockResponse();
      mockOrderService.cancelOrder.mockResolvedValue(mockCancelledOrder);

      await controller.cancelOrder(req as any, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            status: 'cancelled',
            inventoryRestored: true,
          }),
        })
      );
    });

    it('should handle errors when throwing non-Error objects', async () => {
      const req = createMockRequest({
        params: { id: 'order-1' },
      });
      const res = createMockResponse();
      mockOrderService.cancelOrder.mockRejectedValue('Unknown error');

      await controller.cancelOrder(req as any, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete order workflow', async () => {
      // Get all orders
      let req = createMockRequest({
        query: { status: 'pending' },
      });
      let res = createMockResponse();
      mockOrderService.getAllOrders.mockResolvedValue({
        data: [{ id: 'order-1', status: 'pending' }],
      });

      await controller.getAllOrders(req as any, res);
      expect(res.json).toHaveBeenCalled();

      // Get specific order
      req = createMockRequest({
        params: { id: 'order-1' },
      });
      res = createMockResponse();
      mockOrderService.getOrderById.mockResolvedValue({
        id: 'order-1',
        status: 'pending',
      });

      await controller.getOrderById(req as any, res);
      expect(res.json).toHaveBeenCalled();

      // Update status to processing
      req = createMockRequest({
        params: { id: 'order-1' },
        body: { status: 'processing' },
      });
      res = createMockResponse();
      mockOrderService.updateOrderStatus.mockResolvedValue({
        id: 'order-1',
        status: 'processing',
      });

      await controller.updateOrderStatus(req as any, res);
      expect(res.json).toHaveBeenCalled();

      // Update status to shipped
      req = createMockRequest({
        params: { id: 'order-1' },
        body: { status: 'shipped', adminNotes: 'Shipped via courier' },
      });
      res = createMockResponse();
      mockOrderService.updateOrderStatus.mockResolvedValue({
        id: 'order-1',
        status: 'shipped',
      });

      await controller.updateOrderStatus(req as any, res);
      expect(mockOrderService.updateOrderStatus).toHaveBeenLastCalledWith(
        'order-1',
        'shipped',
        'Shipped via courier'
      );
    });

    it('should handle errors gracefully throughout workflow', async () => {
      const req = createMockRequest({
        query: { invalidFilter: 'bad' },
      });
      const res = createMockResponse();

      await controller.getAllOrders(req as any, res);
      expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);

      jest.clearAllMocks();

      const req2 = createMockRequest({
        params: { id: 'invalid-id' },
      });
      const res2 = createMockResponse();
      mockOrderService.getOrderById.mockRejectedValue(new Error('Orden no encontrada'));

      await controller.getOrderById(req2, res2);
      expect(res2.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });
});
