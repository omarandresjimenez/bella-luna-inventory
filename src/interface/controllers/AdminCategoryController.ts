import { Response } from 'express';
import { CategoryAdminService } from '../../application/services/CategoryAdminService';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response';
import { z } from 'zod';

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido').regex(/^[a-z0-9-]+$/, 'Slug debe contener solo letras minúsculas, números y guiones'),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional()
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional()
});

export class AdminCategoryController {
  constructor(private categoryService: CategoryAdminService) {}

  // Get all categories
  async getAllCategories(req: AuthRequest, res: Response) {
    try {
      const categories = await this.categoryService.getAllCategories();
      sendSuccess(res, categories);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener categorías', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get category by ID
  async getCategoryById(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const category = await this.categoryService.getCategoryById(id);
      
      if (!category) {
        sendError(res, ErrorCode.NOT_FOUND, 'Categoría no encontrada', HttpStatus.NOT_FOUND);
        return;
      }
      
      sendSuccess(res, category);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener categoría', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Create category
  async createCategory(req: AuthRequest, res: Response) {
    try {
      const data = createCategorySchema.parse(req.body);
      const category = await this.categoryService.createCategory(data);
      sendSuccess(res, category, HttpStatus.CREATED);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, ErrorCode.VALIDATION_ERROR, error.errors[0].message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al crear categoría', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Update category
  async updateCategory(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const data = updateCategorySchema.parse(req.body);
      const category = await this.categoryService.updateCategory(id, data);
      sendSuccess(res, category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, ErrorCode.VALIDATION_ERROR, error.errors[0].message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof Error) {
        if (error.message === 'Categoría no encontrada') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al actualizar categoría', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Delete category
  async deleteCategory(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      await this.categoryService.deleteCategory(id);
      sendSuccess(res, { message: 'Categoría eliminada correctamente' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Categoría no encontrada') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al eliminar categoría', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Update category image
  async updateCategoryImage(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { imageUrl } = req.body;
      
      if (imageUrl === undefined) {
        sendError(res, ErrorCode.BAD_REQUEST, 'imageUrl es requerido', HttpStatus.BAD_REQUEST);
        return;
      }
      
      const category = await this.categoryService.updateCategoryImage(id, imageUrl);
      sendSuccess(res, category);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Categoría no encontrada') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al actualizar imagen', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Delete category image
  async deleteCategoryImage(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const category = await this.categoryService.updateCategoryImage(id, null);
      sendSuccess(res, category);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Categoría no encontrada') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al eliminar imagen', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
