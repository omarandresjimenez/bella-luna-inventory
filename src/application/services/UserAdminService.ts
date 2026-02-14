import { PrismaClient, User, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive?: boolean;
}

export interface UpdateUserDTO {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: Role;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class UserAdminService {
  constructor(private prisma: PrismaClient) {}

  // Get all users with optional filtering and pagination
  async getAllUsers(filters?: UserFilters): Promise<PaginatedResponse<Omit<User, 'password'>>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
      }),
      this.prisma.user.count({ where }),
    ]);

    // Remove passwords from response
    const data = users.map(({ password, ...user }) => user);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get user by ID
  async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Create new user
  async createUser(data: CreateUserDTO): Promise<Omit<User, 'password'>> {
    // Check for duplicate email
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error('Ya existe un usuario con ese email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isActive: data.isActive ?? true,
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Update user
  async updateUser(id: string, data: UpdateUserDTO): Promise<Omit<User, 'password'>> {
    const existing = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Usuario no encontrado');
    }

    // Check for duplicate email if changing email
    if (data.email && data.email !== existing.email) {
      const duplicate = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (duplicate) {
        throw new Error('Ya existe un usuario con ese email');
      }
    }

    // Prepare update data
    const updateData: any = { ...data };

    // Hash password if provided
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    const existing = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Usuario no encontrado');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  // Toggle user active status
  async toggleUserStatus(id: string): Promise<Omit<User, 'password'>> {
    const existing = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Usuario no encontrado');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Get users count by role
  async getUsersStats(): Promise<{ role: Role; count: number }[]> {
    const stats = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    return stats.map((stat) => ({
      role: stat.role,
      count: stat._count.role,
    }));
  }
}
