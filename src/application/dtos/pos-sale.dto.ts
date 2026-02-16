import { z } from 'zod';

// Create POS Sale DTOs
export const createPOSSaleItemSchema = z.object({
  variantId: z.string().uuid().optional().nullable(),
  productName: z.string().min(1),
  variantName: z.string(),
  productSku: z.string().min(1),
  imageUrl: z.string().url().optional().nullable(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().positive(),
});

export const createPOSSaleSchema = z.object({
  items: z.array(createPOSSaleItemSchema).min(1),
  notes: z.string().max(500).optional().nullable(),
  paymentType: z.enum(['CASH', 'CARD', 'CHECK']).default('CASH'),
});

export type CreatePOSSaleDTO = z.infer<typeof createPOSSaleSchema>;
export type CreatePOSSaleItemDTO = z.infer<typeof createPOSSaleItemSchema>;

// POS Sale Response DTOs
export interface POSSaleItemResponse {
  id: string;
  productName: string;
  variantName: string;
  productSku: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface POSSaleResponse {
  id: string;
  saleNumber: string;
  staffId: string;
  subtotal: number;
  total: number;
  notes?: string | null;
  status: string; // COMPLETED | VOIDED
  paymentType: string;
  paymentStatus: string;
  items: POSSaleItemResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface POSSaleListResponse {
  sales: POSSaleResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter DTO
export const posSaleFilterSchema = z.object({
  status: z.enum(['COMPLETED', 'VOIDED']).optional(),
  paymentType: z.enum(['CASH', 'CARD', 'CHECK']).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type POSSaleFilterDTO = z.infer<typeof posSaleFilterSchema>;
