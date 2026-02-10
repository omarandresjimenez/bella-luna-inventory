import { Response } from 'express';
import { CartService } from '../../application/services/CartService';
import { addToCartSchema, updateCartItemSchema } from '../../application/dtos/cart.dto';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response';

export class CartController {
  constructor(private cartService: CartService) {}

  // Get cart
  async getCart(req: AuthRequest, res: Response) {
    try {
      const sessionId = req.headers['x-session-id'] as string | undefined;
      const customerId = req.user?.userId;

      const cart = await this.cartService.getCart(sessionId, customerId);

      // Return session ID for anonymous carts
      if (!customerId && sessionId) {
        res.setHeader('X-Session-Id', sessionId);
      }

      sendSuccess(res, cart);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener carrito', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Add item to cart
  async addItem(req: AuthRequest, res: Response) {
    try {
      const data = addToCartSchema.parse(req.body);
      const sessionId = req.headers['x-session-id'] as string | undefined;
      const customerId = req.user?.userId;

      const cart = await this.cartService.addItem(data, sessionId, customerId);
      sendSuccess(res, cart);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al agregar item', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Update item quantity
  async updateItem(req: AuthRequest, res: Response) {
    try {
      const itemId = req.params.id as string;
      const data = updateCartItemSchema.parse(req.body);
      const sessionId = req.headers['x-session-id'] as string | undefined;
      const customerId = req.user?.userId;

      const cart = await this.cartService.updateItem(itemId, data, sessionId, customerId);
      sendSuccess(res, cart);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Item no encontrado') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al actualizar item', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Remove item from cart
  async removeItem(req: AuthRequest, res: Response) {
    try {
      const itemId = req.params.id as string;
      const sessionId = req.headers['x-session-id'] as string | undefined;
      const customerId = req.user?.userId;

      const cart = await this.cartService.removeItem(itemId, sessionId, customerId);
      sendSuccess(res, cart);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Item no encontrado') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al eliminar item', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Clear cart
  async clearCart(req: AuthRequest, res: Response) {
    try {
      const sessionId = req.headers['x-session-id'] as string | undefined;
      const customerId = req.user?.userId;

      await this.cartService.clearCart(sessionId, customerId);
      sendSuccess(res, { message: 'Carrito vaciado' });
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al vaciar carrito', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
