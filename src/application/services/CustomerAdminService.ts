import { PrismaClient, Customer } from '@prisma/client';
import bcrypt from 'bcryptjs';

export interface CreateCustomerDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate?: Date;
  isVerified?: boolean;
}

export interface UpdateCustomerDTO {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: Date;
  isVerified?: boolean;
}

export interface CustomerFilters {
  search?: string;
  isVerified?: boolean;
  hasOrders?: boolean;
}

export interface CustomerWithStats extends Omit<Customer, 'password'> {
  orderCount: number;
  totalSpent: number;
  addressesCount: number;
}

export class CustomerAdminService {
  constructor(private prisma: PrismaClient) {}

  // Get all customers with optional filtering
  async getAllCustomers(filters?: CustomerFilters): Promise<CustomerWithStats[]> {
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.isVerified !== undefined) {
      where.isVerified = filters.isVerified;
    }

    const customers = await this.prisma.customer.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      include: {
        _count: {
          select: { orders: true, addresses: true }
        },
        orders: {
          select: { total: true }
        }
      }
    });

    // Remove passwords and calculate stats
    return customers.map(({ password, orders, _count, ...customer }) => ({
      ...customer,
      orderCount: _count.orders,
      addressesCount: _count.addresses,
      totalSpent: orders.reduce((sum, order) => sum + Number(order.total), 0)
    }));
  }

  // Get customer by ID with full details
  async getCustomerById(id: string): Promise<Omit<Customer, 'password'> & { 
    orderCount: number; 
    addressesCount: number;
    totalSpent: number;
    addresses: any[];
    recentOrders: any[];
  } | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
          }
        },
        _count: {
          select: { orders: true, addresses: true }
        }
      }
    });

    if (!customer) return null;

    const { password, orders, _count, ...customerData } = customer;
    return {
      ...customerData,
      orderCount: _count.orders,
      addressesCount: _count.addresses,
      totalSpent: orders.reduce((sum, order) => sum + Number(order.total), 0),
      addresses: customer.addresses,
      recentOrders: orders
    };
  }

  // Get customer by email
  async getCustomerByEmail(email: string): Promise<Omit<Customer, 'password'> | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) return null;

    const { password, ...customerWithoutPassword } = customer;
    return customerWithoutPassword;
  }

  // Create new customer
  async createCustomer(data: CreateCustomerDTO): Promise<Omit<Customer, 'password'>> {
    // Check for duplicate email
    const existing = await this.prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error('Ya existe un cliente con ese email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const customer = await this.prisma.customer.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        birthDate: data.birthDate,
        isVerified: data.isVerified ?? true, // Admin-created customers are verified by default
      },
    });

    const { password, ...customerWithoutPassword } = customer;
    return customerWithoutPassword;
  }

  // Update customer
  async updateCustomer(id: string, data: UpdateCustomerDTO): Promise<Omit<Customer, 'password'>> {
    const existing = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Cliente no encontrado');
    }

    // Check for duplicate email if changing email
    if (data.email && data.email !== existing.email) {
      const duplicate = await this.prisma.customer.findUnique({
        where: { email: data.email },
      });
      if (duplicate) {
        throw new Error('Ya existe un cliente con ese email');
      }
    }

    // Prepare update data
    const updateData: any = { ...data };

    // Hash password if provided
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    const customer = await this.prisma.customer.update({
      where: { id },
      data: updateData,
    });

    const { password, ...customerWithoutPassword } = customer;
    return customerWithoutPassword;
  }

  // Delete customer
  async deleteCustomer(id: string): Promise<void> {
    const existing = await this.prisma.customer.findUnique({
      where: { id },
      include: { orders: true }
    });

    if (!existing) {
      throw new Error('Cliente no encontrado');
    }

    // Check if customer has orders
    if (existing.orders.length > 0) {
      throw new Error('No se puede eliminar un cliente con pedidos asociados');
    }

    await this.prisma.customer.delete({
      where: { id },
    });
  }

  // Toggle customer verification status
  async toggleVerificationStatus(id: string): Promise<Omit<Customer, 'password'>> {
    const existing = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Cliente no encontrado');
    }

    const customer = await this.prisma.customer.update({
      where: { id },
      data: { isVerified: !existing.isVerified },
    });

    const { password, ...customerWithoutPassword } = customer;
    return customerWithoutPassword;
  }

  // Get customer statistics
  async getCustomersStats(): Promise<{
    total: number;
    verified: number;
    unverified: number;
    withOrders: number;
    totalRevenue: number;
  }> {
    const [
      total,
      verified,
      unverified,
      withOrders,
      revenue
    ] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { isVerified: true } }),
      this.prisma.customer.count({ where: { isVerified: false } }),
      this.prisma.customer.count({
        where: { orders: { some: {} } }
      }),
      this.prisma.customerOrder.aggregate({
        _sum: { total: true }
      })
    ]);

    return {
      total,
      verified,
      unverified,
      withOrders,
      totalRevenue: Number(revenue._sum.total) || 0
    };
  }

  // Get recent customers
  async getRecentCustomers(limit: number = 10): Promise<Omit<Customer, 'password'>[]> {
    const customers = await this.prisma.customer.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return customers.map(({ password, ...customer }) => customer);
  }
}
