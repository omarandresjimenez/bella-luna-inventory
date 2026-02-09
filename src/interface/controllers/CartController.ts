import { Request, Response } from 'express';
import { CartService } from '../../application/services/CartService';
import { addToCartSchema, updateCartItemSchema } from '../../application/dtos/cart.dto';
import { AuthRequest } from '../middleware/auth.middleware';

const cartService = new CartService();

export class CartController {
  // Get cart
  async getCart(req: AuthRequest, res: Response) {
    try {
      const sessionId = req.headers['x-session-id'] as string | undefined;
      const customerId = req.user?.userId;

      const cart = await cartService.getCart(sessionId, customerId);

      // Return session ID for anonymous carts
      if (!customerId && sessionId) {
        res.setHeader('X-Session-Id', sessionId);
      }

      return res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error al obtener carrito',
        },
      });
    }
  }

  // Add item to cart
  async addItem(req: AuthRequest, res: Response) {
    try {
      const data = addToCartSchema.parse(req.body);
      const sessionId = req.headers['x-session-id'] as string | undefined;
      const customerId = req.user?.userId;

      const cart = await cartService.addItem(data, sessionId, customerId);

      return res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Error al agregar item',
        },
      });
    }
  }

  // Update item quantity
  async updateItem(req: AuthRequest, res: Response) {
    try {
      const itemId = req.params.id as string;
      const data = updateCartItemSchema.parse(req.body);
      const sessionId = req.headers['x-session-id'] as string | undefined;
      const customerId = req.user?.userId;

      const cart = await cartService.updateItem(itemId, data, sessionId, customerId);

      return res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error: any) {
      if (error.message === 'Item no encontrado') {
        return res.status(404).json({
          success: false,
          error: {
            message: error.message,
          },
        });
      }

      return res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Error al actualizar item',
        },
      });
    }
  }

  // Remove item from cart
  async removeItem(req: AuthRequest, res: Response) {
    try {
      const itemId = req.params.id as string;
      const sessionId = req.headers['x-session-id'] as string | undefined;
      const customerId = req.user?.userId;

      const cart = await cartService.removeItem(itemId, sessionId, customerId);

      return res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error: any) {
      if (error.message === 'Item no encontrado') {
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
          message: error.message || 'Error al eliminar item',
        },
      });
    }
  }

  // Clear cart
  async clearCart(req: AuthRequest, res: Response) {
    try {
      const sessionId = req.headers['x-session-id'] as string | undefined;
      const customerId = req.user?.userId;

      await cartService.clearCart(sessionId, customerId);

      return res.status(200).json({
        success: true,
        message: 'Carrito vaciado',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error al vaciar carrito',
        },
      });
    }
  }
}
