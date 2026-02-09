import { Request, Response } from 'express';
import { OrderService } from '../../application/services/OrderService';
import { orderFilterSchema } from '../../application/dtos/order.dto';

const orderService = new OrderService();

export class AdminOrderController {
  // Get all orders (admin)
  async getAllOrders(req: Request, res: Response) {
    try {
      const filters = orderFilterSchema.parse(req.query);
      const result = await orderService.getAllOrders(filters);

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

  // Get order by ID (admin)
  async getOrderById(req: Request, res: Response) {
    try {
      const orderId = req.params.id as string;
      const order = await orderService.getOrderById(orderId);

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

  // Update order status
  async updateOrderStatus(req: Request, res: Response) {
    try {
      const orderId = req.params.id as string;
      const { status, adminNotes } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Estado requerido',
          },
        });
      }

      const order = await orderService.updateOrderStatus(orderId, status, adminNotes);

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Error al actualizar estado',
        },
      });
    }
  }

  // Cancel order (admin)
  async cancelOrder(req: Request, res: Response) {
    try {
      const orderId = req.params.id as string;

      const order = await orderService.cancelOrder(orderId);

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
