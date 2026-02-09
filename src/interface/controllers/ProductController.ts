import { Request, Response, NextFunction } from 'express';
import { IProductRepository } from '../../domain/repositories';
import { ProductRepository } from '../../infrastructure/repositories/ProductRepository';
import { createProductSchema, updateProductSchema, AppError } from '../../shared';

export class ProductController {
  private repository: IProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await this.repository.findAll();
      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const product = await this.repository.findById(id);

      if (!product) {
        throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createProductSchema.parse(req.body);
      const product = await this.repository.create(validatedData);

      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const validatedData = updateProductSchema.parse(req.body);

      const existingProduct = await this.repository.findById(id);
      if (!existingProduct) {
        throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }

      const product = await this.repository.update(id, validatedData);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const existingProduct = await this.repository.findById(id);
      if (!existingProduct) {
        throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }

      await this.repository.delete(id);

      res.json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getLowStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await this.repository.findLowStock();
      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };
}
