import { Request, Response, NextFunction } from 'express';
import { ICategoryRepository } from '../../domain/repositories';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';
import { createCategorySchema, AppError } from '../../shared';

export class CategoryController {
  private repository: ICategoryRepository;

  constructor() {
    this.repository = new CategoryRepository();
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.repository.findAll();
      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const category = await this.repository.findById(id);

      if (!category) {
        throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createCategorySchema.parse(req.body);

      const existingCategory = await this.repository.findByName(validatedData.name);
      if (existingCategory) {
        throw new AppError('Category already exists', 409, 'CATEGORY_EXISTS');
      }

      const category = await this.repository.create(validatedData);

      res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const validatedData = createCategorySchema.partial().parse(req.body);

      const existingCategory = await this.repository.findById(id);
      if (!existingCategory) {
        throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }

      const category = await this.repository.update(id, validatedData);

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const existingCategory = await this.repository.findById(id);
      if (!existingCategory) {
        throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }

      await this.repository.delete(id);

      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
