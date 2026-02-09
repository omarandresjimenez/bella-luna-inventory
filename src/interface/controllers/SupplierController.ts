import { Request, Response, NextFunction } from 'express';
import { ISupplierRepository } from '../../domain/repositories';
import { SupplierRepository } from '../../infrastructure/repositories/SupplierRepository';
import { createSupplierSchema, AppError } from '../../shared';

export class SupplierController {
  private repository: ISupplierRepository;

  constructor() {
    this.repository = new SupplierRepository();
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const suppliers = await this.repository.findAll();
      res.json({
        success: true,
        data: suppliers,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const supplier = await this.repository.findById(id);

      if (!supplier) {
        throw new AppError('Supplier not found', 404, 'SUPPLIER_NOT_FOUND');
      }

      res.json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createSupplierSchema.parse(req.body);
      const supplier = await this.repository.create(validatedData);

      res.status(201).json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const validatedData = createSupplierSchema.partial().parse(req.body);

      const existingSupplier = await this.repository.findById(id);
      if (!existingSupplier) {
        throw new AppError('Supplier not found', 404, 'SUPPLIER_NOT_FOUND');
      }

      const supplier = await this.repository.update(id, validatedData);

      res.json({
        success: true,
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const existingSupplier = await this.repository.findById(id);
      if (!existingSupplier) {
        throw new AppError('Supplier not found', 404, 'SUPPLIER_NOT_FOUND');
      }

      await this.repository.delete(id);

      res.json({
        success: true,
        message: 'Supplier deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
