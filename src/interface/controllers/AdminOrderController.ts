import { Request, Response } from 'express';
import { OrderService } from '../../application/services/OrderService';
import { orderFilterSchema } from '../../application/dtos/order.dto';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response';

export class AdminOrderController {
  constructor(private orderService: OrderService) {}

  // Get all orders (admin)
  async getAllOrders(req: Request, res: Response) {
    try {
      const filters = orderFilterSchema.parse(req.query);
      const result = await this.orderService.getAllOrders(filters);
      sendSuccess(res, result);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener órdenes', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get order by ID (admin)
  async getOrderById(req: Request, res: Response) {
    try {
      const orderId = req.params.id as string;
      const order = await this.orderService.getOrderById(orderId);
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

  // Update order status
  async updateOrderStatus(req: Request, res: Response) {
    try {
      const orderId = req.params.id as string;
      const { status, adminNotes } = req.body;

      if (!status) {
        sendError(res, ErrorCode.BAD_REQUEST, 'Estado requerido', HttpStatus.BAD_REQUEST);
        return;
      }

      const order = await this.orderService.updateOrderStatus(orderId, status, adminNotes);
      sendSuccess(res, order);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al actualizar estado', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Cancel order (admin)
  async cancelOrder(req: Request, res: Response) {
    try {
      const orderId = req.params.id as string;

      const order = await this.orderService.cancelOrder(orderId);
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
