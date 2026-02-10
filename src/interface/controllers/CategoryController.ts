import { Request, Response, NextFunction } from 'express';
import { ICategoryRepository } from '../../domain/repositories';
import { CategoryRepository } from '../../infrastructure/repositories/CategoryRepository';
import { createCategorySchema, AppError } from '../../shared';
import { supabase, STORAGE_BUCKET } from '../../config/supabase';
import { v4 as uuidv4 } from 'uuid';

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

      const slug = validatedData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const category = await this.repository.create({
        ...validatedData,
        slug,
      });

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

  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const existingCategory = await this.repository.findById(id);
      if (!existingCategory) {
        throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }

      if (!req.file) {
        throw new AppError('No image file provided', 400, 'NO_IMAGE_FILE');
      }

      // Delete old image if exists
      if (existingCategory.imageUrl) {
        try {
          const oldPath = existingCategory.imageUrl.split('/').pop();
          if (oldPath) {
            await supabase.storage.from(STORAGE_BUCKET).remove([`categories/${existingCategory.slug}-${oldPath}`]);
          }
        } catch (e) {
          // Ignore error if old image doesn't exist
        }
      }

      // Upload new image
      const uniqueId = uuidv4();
      const fileExt = req.file.originalname.split('.').pop() || 'jpg';
      const storagePath = `categories/${existingCategory.slug}-${uniqueId}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (error) {
        throw new AppError('Failed to upload image', 500, 'UPLOAD_ERROR');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

      // Update category with image URL
      const updatedCategory = await this.repository.update(id, { imageUrl: publicUrl });

      res.json({
        success: true,
        data: { imageUrl: publicUrl, category: updatedCategory },
        message: 'Image uploaded successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deleteImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const existingCategory = await this.repository.findById(id);
      if (!existingCategory) {
        throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }

      if (!existingCategory.imageUrl) {
        throw new AppError('Category has no image', 400, 'NO_IMAGE');
      }

      // Delete image from storage
      try {
        const oldPath = existingCategory.imageUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from(STORAGE_BUCKET).remove([`categories/${existingCategory.slug}-${oldPath}`]);
        }
      } catch (e) {
        // Ignore error if image doesn't exist in storage
      }

      // Update category to remove image URL
      await this.repository.update(id, { imageUrl: undefined });

      res.json({
        success: true,
        message: 'Image deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
