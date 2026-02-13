import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { config } from '../../config/index.js';
import { RegisterCustomerDTO, LoginCustomerDTO, LoginAdminDTO, AuthResponse, CustomerAuthResponse } from '../dtos/auth.dto.js';
import { emailTemplates, sendEmail } from '../../config/sendgrid.js';
import { EmailVerificationService } from './EmailVerificationService.js';

export class AuthService {
  private emailVerificationService: EmailVerificationService;

  constructor(private prisma: PrismaClient) {
    this.emailVerificationService = new EmailVerificationService(prisma);
  }

  // Customer Registration
  async registerCustomer(data: RegisterCustomerDTO): Promise<CustomerAuthResponse & { requiresVerification: boolean }> {
    // Check if email already exists
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (existingCustomer) {
      throw new Error('El email ya está registrado');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create customer (not verified yet)
    const customer = await this.prisma.customer.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        isVerified: false,
      },
    });

    // Generate tokens (but account needs verification)
    const token = this.generateToken(customer.id, 'customer');
    const refreshToken = this.generateRefreshToken(customer.id, 'customer');

    // Send verification link
    await this.emailVerificationService.createVerificationLink(
      customer.id,
      customer.email,
      customer.firstName,
      config.frontendUrl
    );

    return {
      token,
      refreshToken,
      requiresVerification: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        isVerified: false,
      },
    };
  }

  // Customer Login
  async loginCustomer(data: LoginCustomerDTO): Promise<CustomerAuthResponse & { requiresVerification: boolean }> {
    const customer = await this.prisma.customer.findUnique({
      where: { email: data.email },
    });

    if (!customer) {
      throw new Error('Email o contraseña incorrectos');
    }

    const isValidPassword = await bcrypt.compare(data.password, customer.password);

    if (!isValidPassword) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Check if account is verified
    if (!customer.isVerified) {
      // Check if there's a valid verification link
      const hasValidToken = await this.emailVerificationService.hasValidToken(customer.id);
      
      if (!hasValidToken) {
        // Resend verification link if expired
        await this.emailVerificationService.createVerificationLink(
          customer.id,
          customer.email,
          customer.firstName,
          config.frontendUrl
        );
      }

      const token = this.generateToken(customer.id, 'customer');
      const refreshToken = this.generateRefreshToken(customer.id, 'customer');

      return {
        token,
        refreshToken,
        requiresVerification: true,
        customer: {
          id: customer.id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          isVerified: false,
        },
      };
    }

    const token = this.generateToken(customer.id, 'customer');
    const refreshToken = this.generateRefreshToken(customer.id, 'customer');

    return {
      token,
      refreshToken,
      requiresVerification: false,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        isVerified: true,
      },
    };
  }

  // Admin Login
  async loginAdmin(data: LoginAdminDTO): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Email o contraseña incorrectos');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);

    if (!isValidPassword) {
      throw new Error('Email o contraseña incorrectos');
    }

    if (!user.isActive) {
      throw new Error('Usuario desactivado');
    }

    const token = this.generateToken(user.id, user.role);
    const refreshToken = this.generateRefreshToken(user.id, user.role);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  // Verify email with code
  async verifyEmail(email: string, code: string): Promise<{ 
    success: boolean; 
    message: string;
    token?: string;
    refreshToken?: string;
    customer?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      isVerified: boolean;
    }
  }> {
    const result = await this.emailVerificationService.verifyEmail(email, code);
    
    if (result.success && result.customer) {
      // Generate new tokens for verified customer
      const token = this.generateToken(result.customer.id, 'customer');
      const refreshToken = this.generateRefreshToken(result.customer.id, 'customer');

      return {
        ...result,
        token,
        refreshToken,
        customer: {
          ...result.customer,
          isVerified: true,
        }
      };
    }

    return result;
  }

  // Resend verification link
  async resendVerificationLink(email: string): Promise<{ success: boolean; message: string }> {
    return await this.emailVerificationService.resendVerificationLink(email, config.frontendUrl);
  }

  // Verify email with token (magic link)
  async verifyEmailWithToken(token: string): Promise<{ 
    success: boolean; 
    message: string;
    token?: string;
    refreshToken?: string;
    customer?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      isVerified: boolean;
    }
  }> {
    const result = await this.emailVerificationService.verifyEmailWithToken(token);
    
    if (result.success && result.customer) {
      // Generate new tokens for verified customer
      const accessToken = this.generateToken(result.customer.id, 'customer');
      const refreshToken = this.generateRefreshToken(result.customer.id, 'customer');

      return {
        ...result,
        token: accessToken,
        refreshToken,
        customer: {
          ...result.customer,
          isVerified: true,
        }
      };
    }

    return result;
  }

  // Verify token
  verifyToken(token: string): { userId: string; role: string } {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        userId: string;
        role: string;
      };
      return decoded;
    } catch {
      throw new Error('Token inválido o expirado');
    }
  }

  // Generate JWT Token
  private generateToken(userId: string, role: string): string {
    return jwt.sign(
      { userId, role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] }
    );
  }

  // Generate Refresh Token
  private generateRefreshToken(userId: string, role: string): string {
    return jwt.sign(
      { userId, role, type: 'refresh' },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] }
    );
  }

  // Get current user
  async getMe(token: string) {
    try {
      const decoded = this.verifyToken(token);
      
      if (decoded.role === 'customer') {
        const customer = await this.prisma.customer.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            birthDate: true,
            isVerified: true,
          },
        });
        
        if (!customer) {
          throw new Error('Usuario no encontrado');
        }
        
        return { ...customer, role: 'customer' };
      } else {
        const user = await this.prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        });
        
        if (!user) {
          throw new Error('Usuario no encontrado');
        }
        
        return user;
      }
    } catch {
      throw new Error('Token inválido o expirado');
    }
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as {
        userId: string;
        role: string;
        type: string;
      };

      if (decoded.type !== 'refresh') {
        throw new Error('Token inválido');
      }

      const token = this.generateToken(decoded.userId, decoded.role);
      return { token };
    } catch {
      throw new Error('Token de refresco inválido');
    }
  }
}
