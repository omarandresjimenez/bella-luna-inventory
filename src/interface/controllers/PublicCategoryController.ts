import { Request, Response } from 'express';
import { CategoryService } from '../../application/services/CategoryService.js';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response.js';

export class PublicCategoryController {
  constructor(private categoryService: CategoryService) {}

  // Get category tree
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await this.categoryService.getCategoryTree();
      sendSuccess(res, categories);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener categorÃ­as', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get featured categories
  async getFeaturedCategories(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      const categories = await this.categoryService.getFeaturedCategories(limit);
      sendSuccess(res, categories);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener categorÃ­as destacadas', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get category by slug
  async getCategoryBySlug(req: Request, res: Response) {
    try {
      const slug = req.params.slug as string;
      const category = await this.categoryService.getCategoryBySlug(slug);
      sendSuccess(res, category);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'CategorÃ­a no encontrada') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener categorÃ­a', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}

