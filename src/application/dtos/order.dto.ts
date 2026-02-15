import { z } from 'zod';

// Enums
const DeliveryTypeEnum = z.enum(['HOME_DELIVERY', 'STORE_PICKUP']);
const PaymentMethodEnum = z.enum(['CASH_ON_DELIVERY', 'STORE_PAYMENT']);

// Create Order (Checkout)
export const createOrderSchema = z.object({
  deliveryType: DeliveryTypeEnum,
  addressId: z.string().uuid().nullable().optional(), // Required if HOME_DELIVERY
  paymentMethod: PaymentMethodEnum,
  customerNotes: z.string().max(500).optional(),
}).refine(
  (data) => {
    // addressId is required only for HOME_DELIVERY
    if (data.deliveryType === 'HOME_DELIVERY' && !data.addressId) {
      return false;
    }
    return true;
  },
  {
    message: 'Address is required for home delivery',
    path: ['addressId'],
  }
);

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;

// Update Order Status (Admin)
export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ]),
  adminNotes: z.string().optional(),
});

export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>;

// Order response
export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  deliveryType: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  items: OrderItemResponse[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  customerNotes?: string;
  paymentStatus: string;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  createdAt: Date;
}

export interface OrderItemResponse {
  id: string;
  productName: string;
  variantName: string;
  productSku: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: {
    id: string;
    productId: string;
  };
}

// Order filter (Admin)
export const orderFilterSchema = z.object({
  status: z.string().optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('20'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type OrderFilterDTO = z.infer<typeof orderFilterSchema>;
