import { z } from 'zod';

// Add to cart
export const addToCartSchema = z.object({
  variantId: z.string().uuid('ID de variante inválido'),
  quantity: z.number().int().min(1, 'Cantidad mínima: 1'),
});

export type AddToCartDTO = z.infer<typeof addToCartSchema>;

// Update cart item
export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Cantidad no puede ser negativa'),
});

export type UpdateCartItemDTO = z.infer<typeof updateCartItemSchema>;

// Cart response
export interface CartResponse {
  id: string;
  items: CartItemResponse[];
  subtotal: number;
  itemCount: number;
  sessionId?: string; // For anonymous carts
}

export interface CartItemResponse {
  id: string;
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}
