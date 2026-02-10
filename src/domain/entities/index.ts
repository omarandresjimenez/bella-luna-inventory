// ============================================
// DOMAIN ENTITIES
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  isActive: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unitCost: number;
  salePrice: number;
  quantity: number;
  minStock: number;
  maxStock: number;
  location?: string;
  barcode?: string;
  isActive: boolean;
  categoryId: string;
  supplierId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryMovement {
  id: string;
  type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  description?: string;
  reference?: string;
  productId: string;
  userId: string;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE';
  totalAmount: number;
  notes?: string;
  supplierId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  orderId: string;
  productId: string;
}
