import { Request, Response } from 'express';
import { OrderService } from '../../application/services/OrderService';
import { createOrderSchema, orderFilterSchema } from '../../application/dtos/order.dto';
import { AuthRequest } from '../middleware/auth.middleware';

const orderService = new OrderService();

export class OrderController {
  // Create order (checkout)
  async createOrder(req: AuthRequest, res: Response) {
    try {
      const data = createOrderSchema.parse(req.body);
      const customerId = req.user!.userId;
      const sessionId = req.headers['x-session-id'] as string | undefined;

      const order = await orderService.createOrder(data, customerId, sessionId);

      return res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Error al crear orden',
        },
      });
    }
  }

  // Get customer's orders
  async getMyOrders(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user!.userId;
      const filters = orderFilterSchema.parse(req.query);

      const result = await orderService.getCustomerOrders(customerId, filters);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error al obtener órdenes',
        },
      });
    }
  }

  // Get order by ID
  async getOrderById(req: AuthRequest, res: Response) {
    try {
      const orderId = req.params.id as string;
      const customerId = req.user!.userId;

      const order = await orderService.getOrderById(orderId, customerId);

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      if (error.message === 'Orden no encontrada') {
        return res.status(404).json({
          success: false,
          error: {
            message: error.message,
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error al obtener orden',
        },
      });
    }
  }

  // Cancel order
  async cancelOrder(req: AuthRequest, res: Response) {
    try {
      const orderId = req.params.id as string;
      const customerId = req.user!.userId;

      const order = await orderService.cancelOrder(orderId, customerId);

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      if (error.message === 'Orden no encontrada' || error.message === 'No se puede cancelar esta orden') {
        return res.status(400).json({
          success: false,
          error: {
            message: error.message,
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error al cancelar orden',
        },
      });
    }
  }
}
