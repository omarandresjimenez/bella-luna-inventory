import { Request, Response } from 'express';
import { CategoryService } from '../../application/services/CategoryService';

const categoryService = new CategoryService();

export class PublicCategoryController {
  // Get category tree
  async getCategories(req: Request, res: Response) {
    try {
      const categories = await categoryService.getCategoryTree();

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error al obtener categorías',
        },
      });
    }
  }

  // Get featured categories
  async getFeaturedCategories(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      const categories = await categoryService.getFeaturedCategories(limit);

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: {
          message: error.message || 'Error al obtener categorías destacadas',
        },
      });
    }
  }

  // Get category by slug
  async getCategoryBySlug(req: Request, res: Response) {
    try {
      const slug = req.params.slug as string;
      const category = await categoryService.getCategoryBySlug(slug);

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      if (error.message === 'Categoría no encontrada') {
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
          message: error.message || 'Error al obtener categoría',
        },
      });
    }
  }
}
