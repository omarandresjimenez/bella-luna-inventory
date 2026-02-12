import { Response } from 'express';
import { FavoriteService } from '../../application/services/FavoriteService.js';
import { addFavoriteSchema } from '../../application/dtos/favorite.dto.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response.js';

export class FavoriteController {
  constructor(private favoriteService: FavoriteService) {}

  // Get all favorites for authenticated customer
  async getFavorites(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user?.userId;

      if (!customerId) {
        return sendError(res, ErrorCode.UNAUTHORIZED, 'Se requiere autenticaciÃ³n', HttpStatus.UNAUTHORIZED);
      }

      const favorites = await this.favoriteService.getFavorites(customerId);
      sendSuccess(res, favorites);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener favoritos', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Add product to favorites
  async addFavorite(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user?.userId;

      if (!customerId) {
        return sendError(res, ErrorCode.UNAUTHORIZED, 'Se requiere autenticaciÃ³n', HttpStatus.UNAUTHORIZED);
      }

      const data = addFavoriteSchema.parse(req.body);
      const favorites = await this.favoriteService.addFavorite(customerId, data.productId);
      sendSuccess(res, favorites, HttpStatus.CREATED);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Producto no encontrado') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al agregar a favoritos', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Remove product from favorites
  async removeFavorite(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user?.userId;

      if (!customerId) {
        return sendError(res, ErrorCode.UNAUTHORIZED, 'Se requiere autenticaciÃ³n', HttpStatus.UNAUTHORIZED);
      }

      const productId = req.params.productId as string;
      const favorites = await this.favoriteService.removeFavorite(customerId, productId);
      sendSuccess(res, favorites);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Producto no estÃ¡ en favoritos') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al eliminar de favoritos', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Check if product is favorited
  async isFavorite(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user?.userId;

      if (!customerId) {
        return sendError(res, ErrorCode.UNAUTHORIZED, 'Se requiere autenticaciÃ³n', HttpStatus.UNAUTHORIZED);
      }

      const productId = req.params.productId as string;
      const isFav = await this.favoriteService.isFavorite(customerId, productId);
      sendSuccess(res, { isFavorite: isFav });
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al verificar favorito', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get favorite product IDs (for batch checking)
  async getFavoriteProductIds(req: AuthRequest, res: Response) {
    try {
      const customerId = req.user?.userId;

      if (!customerId) {
        return sendError(res, ErrorCode.UNAUTHORIZED, 'Se requiere autenticaciÃ³n', HttpStatus.UNAUTHORIZED);
      }

      const productIds = await this.favoriteService.getFavoriteProductIds(customerId);
      sendSuccess(res, { productIds });
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener IDs de favoritos', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}

