import { z } from 'zod';

// Schema for adding a favorite
export const addFavoriteSchema = z.object({
  productId: z.string().uuid('ID de producto inválido'),
});

// Schema for removing a favorite (productId in params)
export const removeFavoriteSchema = z.object({
  productId: z.string().uuid('ID de producto inválido'),
});

export type AddFavoriteDTO = z.infer<typeof addFavoriteSchema>;
export type RemoveFavoriteDTO = z.infer<typeof removeFavoriteSchema>;

// Response types
export interface FavoriteItemResponse {
  id: string;
  productId: string;
  sku: string;
  name: string;
  slug: string;
  brand: string | null;
  basePrice: number;
  discountPercent: number;
  finalPrice: number;
  imageUrl?: string;
  createdAt: string;
}

export interface FavoriteResponse {
  items: FavoriteItemResponse[];
  total: number;
}
