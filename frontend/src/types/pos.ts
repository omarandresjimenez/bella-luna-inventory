export interface POSSaleItem {
  variantId?: string;
  productName: string;
  variantName: string;
  productSku: string;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: number;
}

export interface POSSale {
  id: string;
  saleNumber: string;
  staffId: string;
  subtotal: number;
  total: number;
  notes?: string;
  status: 'COMPLETED' | 'VOIDED';
  paymentType: 'CASH' | 'CARD' | 'CHECK';
  paymentStatus: 'PENDING' | 'PAID';
  items: POSSaleItemResponse[];
  createdAt: string;
  updatedAt: string;
}

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

export interface CreatePOSSaleRequest {
  items: POSSaleItem[];
  notes?: string;
  paymentType?: 'CASH' | 'CARD' | 'CHECK';
}
