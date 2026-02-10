import { Response } from 'express';
import { OrderService } from '../../application/services/OrderService';
import { createOrderSchema, orderFilterSchema } from '../../application/dtos/order.dto';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response';

export class OrderController {
  constructor(private orderService: OrderService) {}

  // Create order (checkout)
  async createOrder(req: AuthRequest, res: Response) {
    try {
      const data = createOrderSchema.parse(req.body);
      const customerId = req.user!.userId;
      const sessionId = req.headers['x-session-id'] as string | undefined;

      const order = await this.orderService.createOrder(data, customerId, sessionId);
      sendSuccess(res, order, HttpStatus.CREATED);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al crear orden', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get customer's orders
  async getMyOrders(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user!.userId;
      const filters = orderFilterSchema.parse(req.query);

      const result = await this.orderService.getCustomerOrders(customerId, filters);
      sendSuccess(res, result);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener órdenes', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get order by ID
  async getOrderById(req: AuthRequest, res: Response) {
    try {
      const orderId = req.params.id as string;
      const customerId = req.user!.userId;

      const order = await this.orderService.getOrderById(orderId, customerId);
      sendSuccess(res, order);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Orden no encontrada') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener orden', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Cancel order
  async cancelOrder(req: AuthRequest, res: Response) {
    try {
      const orderId = req.params.id as string;
      const customerId = req.user!.userId;

      const order = await this.orderService.cancelOrder(orderId, customerId);
      sendSuccess(res, order);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Orden no encontrada' || error.message === 'No se puede cancelar esta orden') {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        } else {
          sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al cancelar orden', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
