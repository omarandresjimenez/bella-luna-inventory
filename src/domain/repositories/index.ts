import { Product, Category, Supplier, InventoryMovement, Order, User } from '../entities';

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findByCategory(categoryId: string): Promise<Product[]>;
  findLowStock(): Promise<Product[]>;
  create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
}

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  create(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category>;
  update(id: string, data: Partial<Category>): Promise<Category>;
  delete(id: string): Promise<void>;
}

export interface ISupplierRepository {
  findAll(): Promise<Supplier[]>;
  findById(id: string): Promise<Supplier | null>;
  create(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier>;
  update(id: string, data: Partial<Supplier>): Promise<Supplier>;
  delete(id: string): Promise<void>;
}

export interface IInventoryMovementRepository {
  findAll(): Promise<InventoryMovement[]>;
  findByProduct(productId: string): Promise<InventoryMovement[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<InventoryMovement[]>;
  create(data: Omit<InventoryMovement, 'id' | 'createdAt'>): Promise<InventoryMovement>;
}

export interface IOrderRepository {
  findAll(): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  findBySupplier(supplierId: string): Promise<Order[]>;
  create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  update(id: string, data: Partial<Order>): Promise<Order>;
  delete(id: string): Promise<void>;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
