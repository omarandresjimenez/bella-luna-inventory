import { z } from 'zod';

// Create Product
export const createProductSchema = z.object({
  sku: z.string().min(3, 'SKU debe tener al menos 3 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  brand: z.string().optional(),
  slug: z.string().min(2, 'El slug debe tener al menos 2 caracteres'),
  baseCost: z.number().positive('El costo debe ser positivo'),
  basePrice: z.number().positive('El precio debe ser positivo'),
  discountPercent: z.number().min(0).max(100).default(0),
  trackStock: z.boolean().default(true),
  stock: z.number().int().min(0).default(0),  // Stock for products without variants
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryIds: z.array(z.string()).min(1, 'Debe tener al menos una categoría'),
  attributeIds: z.array(z.string()).optional(),
  attributes: z.array(z.object({
    attributeId: z.string(),
    value: z.string().optional(),
  })).optional(),
});

export type CreateProductDTO = z.infer<typeof createProductSchema>;

// Update Product
export const updateProductSchema = createProductSchema.partial();

export type UpdateProductDTO = z.infer<typeof updateProductSchema>;

// Create Variant
export const createVariantSchema = z.object({
  attributeValueIds: z.array(z.string()).min(1, 'Debe tener al menos un valor de atributo'),
  variantSku: z.string().optional(),
  cost: z.number().positive().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CreateVariantDTO = z.infer<typeof createVariantSchema>;

// Product Filter
export const productFilterSchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'popular']).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('24'),
  search: z.string().optional(),
});

export type ProductFilterDTO = z.infer<typeof productFilterSchema>;
