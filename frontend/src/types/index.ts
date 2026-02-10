export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  children?: Category[];
  imageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  brand?: string;
  slug: string;
  baseCost: number;
  basePrice: number;
  discountPercent: number;
  trackStock: boolean;
  isActive: boolean;
  isFeatured: boolean;
  categories: { category: Category }[];
  variants: ProductVariant[];
  images: ProductImage[];
  attributes: ProductAttribute[];
  finalPrice: number;
}

export interface VariantAttributeValueItem {
  id: string;
  value: string;
  displayValue?: string;
  colorHex?: string;
  attribute: {
    id: string;
    name: string;
    displayName: string;
    type: string;
  };
}

export interface ProductVariant {
  id: string;
  productId: string;
  variantSku?: string;
  cost?: number;
  price?: number;
  stock: number;
  isActive: boolean;
  attributeValues: {
    attributeValue: VariantAttributeValueItem;
  }[];
  images: ProductImage[];
}

export interface ProductImage {
  id: string;
  originalPath: string;
  thumbnailUrl: string;
  smallUrl: string;
  mediumUrl: string;
  largeUrl: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ProductAttribute {
  attribute: {
    id: string;
    name: string;
    displayName: string;
    type: string;
  };
}

export interface Attribute {
  id: string;
  name: string;
  displayName: string;
  type: 'TEXT' | 'COLOR_HEX' | 'NUMBER';
  sortOrder: number;
  values: AttributeValue[];
}

export interface AttributeValue {
  id: string;
  value: string;
  displayValue?: string;
  colorHex?: string;
  sortOrder: number;
}

export interface Cart {
  id: string;
  sessionId?: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface CartItem {
  id: string;
  variantId: string;
  variant: ProductVariant & { product: Product };
  quantity: number;
  unitPrice: number;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CASH_ON_DELIVERY' | 'STORE_PAYMENT';
export type PaymentStatus = 'PENDING' | 'PAID';
export type DeliveryType = 'HOME_DELIVERY' | 'STORE_PICKUP';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  shippingAddress: Address;
  deliveryType: DeliveryType;
  deliveryFee: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discount: number;
  total: number;
  customerNotes?: string;
  adminNotes?: string;
  createdAt: string;
  deliveredAt?: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant: ProductVariant;
}

export interface StoreSettings {
  id: string;
  deliveryFee: number;
  freeDeliveryThreshold?: number;
  storeName: string;
  storeEmail?: string;
  storePhone?: string;
  storeAddress?: string;
  whatsappNumber?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
