import { z } from 'zod';

export const createProductSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  unitCost: z.number().positive('Unit cost must be positive'),
  salePrice: z.number().positive('Sale price must be positive'),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  minStock: z.number().int().min(0).default(0),
  maxStock: z.number().int().min(0).default(1000),
  location: z.string().optional(),
  barcode: z.string().optional(),
  isActive: z.boolean().default(true),
  categoryId: z.string().uuid('Valid category ID is required'),
  supplierId: z.string().uuid().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;
export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type CreateSupplierDTO = z.infer<typeof createSupplierSchema>;
