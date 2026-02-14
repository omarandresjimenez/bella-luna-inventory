import { describe, it, expect, beforeEach } from '@jest/globals';
import { AuthService } from '../../../application/services/AuthService';
import { prismaMock } from '../../setup';
import * as bcrypt from 'bcryptjs';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('../../../config/sendgrid.js', () => ({
  emailTemplates: {},
  sendEmail: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService(prismaMock);
    jest.clearAllMocks();
  });

  describe('registerCustomer', () => {
    const registrationData = {
      email: 'newuser@example.com',
      password: 'SecurePass123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
    };

    it('should successfully register a new customer', async () => {
      const hashedPassword = 'hashed_password';
      jest.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);
      
      prismaMock.customer.findUnique.mockResolvedValue(null);
      prismaMock.customer.create.mockResolvedValue({
        id: 'cust-1',
        email: registrationData.email,
        password: hashedPassword,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        phone: registrationData.phone,
        birthDate: null,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.registerCustomer(registrationData);

      expect(result.requiresVerification).toBe(true);
      expect(result.customer.isVerified).toBe(false);
      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(prismaMock.customer.create).toHaveBeenCalled();
    });

    it('should hash password before storing', async () => {
      const hashedPassword = 'hashed_secure_password';
      jest.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);
      
      prismaMock.customer.findUnique.mockResolvedValue(null);
      prismaMock.customer.create.mockResolvedValue({
        id: 'cust-1',
        email: registrationData.email,
        password: hashedPassword,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        phone: registrationData.phone,
        birthDate: null,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await authService.registerCustomer(registrationData);

      expect(bcrypt.hash).toHaveBeenCalledWith(registrationData.password, 12);
    });

    it('should reject duplicate email registration', async () => {
      prismaMock.customer.findUnique.mockResolvedValue({
        id: 'existing-cust',
        email: registrationData.email,
        password: 'hash',
        firstName: 'Existing',
        lastName: 'User',
        phone: '1234567890',
        birthDate: null,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(authService.registerCustomer(registrationData)).rejects.toThrow(
        'El email ya está registrado'
      );
      expect(prismaMock.customer.create).not.toHaveBeenCalled();
    });

    it('should allow optional birthDate', async () => {
      const dataWithBirthDate = {
        ...registrationData,
        birthDate: '2000-01-15T00:00:00Z',
      };

      jest.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      prismaMock.customer.findUnique.mockResolvedValue(null);
      prismaMock.customer.create.mockResolvedValue({
        id: 'cust-1',
        email: dataWithBirthDate.email,
        password: 'hashed',
        firstName: dataWithBirthDate.firstName,
        lastName: dataWithBirthDate.lastName,
        phone: dataWithBirthDate.phone,
        birthDate: new Date(dataWithBirthDate.birthDate),
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.registerCustomer(dataWithBirthDate);

      expect(result.customer).toBeDefined();
      expect(prismaMock.customer.create).toHaveBeenCalled();
    });

    it('should create account with isVerified = false initially', async () => {
      jest.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      prismaMock.customer.findUnique.mockResolvedValue(null);
      prismaMock.customer.create.mockResolvedValue({
        id: 'cust-1',
        email: registrationData.email,
        password: 'hashed',
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        phone: registrationData.phone,
        birthDate: null,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.registerCustomer(registrationData);

      expect(result.customer.isVerified).toBe(false);
      expect(prismaMock.customer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isVerified: false,
          }),
        })
      );
    });
  });

  describe('loginCustomer', () => {
    const loginData = {
      email: 'customer@example.com',
      password: 'SecurePass123',
    };

    const customerRecord = {
      id: 'cust-1',
      email: loginData.email,
      password: 'hashed_password',
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
      birthDate: null,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully login verified customer', async () => {
      prismaMock.customer.findUnique.mockResolvedValue(customerRecord);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await authService.loginCustomer(loginData);

      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.customer.isVerified).toBe(true);
    });

    it('should reject non-existent customer', async () => {
      prismaMock.customer.findUnique.mockResolvedValue(null);

      await expect(authService.loginCustomer(loginData)).rejects.toThrow(
        'Email o contraseña incorrectos'
      );
    });

    it('should reject incorrect password', async () => {
      prismaMock.customer.findUnique.mockResolvedValue(customerRecord);
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(authService.loginCustomer(loginData)).rejects.toThrow(
        'Email o contraseña incorrectos'
      );
    });

    it('should compare password with bcrypt', async () => {
      prismaMock.customer.findUnique.mockResolvedValue(customerRecord);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await authService.loginCustomer(loginData);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginData.password,
        customerRecord.password
      );
    });

    it('should handle unverified account', async () => {
      const unverifiedCustomer = { ...customerRecord, isVerified: false };
      prismaMock.customer.findUnique.mockResolvedValue(unverifiedCustomer);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await authService.loginCustomer(loginData);

      expect(result.requiresVerification).toBe(true);
    });
  });

  describe('loginAdmin', () => {
    const adminLoginData = {
      email: 'admin@example.com',
      password: 'AdminPass123',
    };

    const adminRecord = {
      id: 'admin-1',
      email: adminLoginData.email,
      password: 'hashed_admin_password',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully login valid admin', async () => {
      prismaMock.user.findUnique.mockResolvedValue(adminRecord as never);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await authService.loginAdmin(adminLoginData);

      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should reject non-existent admin', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(authService.loginAdmin(adminLoginData)).rejects.toThrow();
    });

    it('should reject incorrect admin password', async () => {
      prismaMock.user.findUnique.mockResolvedValue(adminRecord as never);
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(authService.loginAdmin(adminLoginData)).rejects.toThrow();
    });
  });

  describe('Token generation', () => {
    it('should generate valid JWT token', async () => {
      const loginData = {
        email: 'customer@example.com',
        password: 'SecurePass123',
      };

      prismaMock.customer.findUnique.mockResolvedValue({
        id: 'cust-1',
        email: loginData.email,
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        birthDate: null,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await authService.loginCustomer(loginData);

      expect(result.token).toBeTruthy();
      expect(typeof result.token).toBe('string');
      expect(result.token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    it('should generate refresh token', async () => {
      const loginData = {
        email: 'customer@example.com',
        password: 'SecurePass123',
      };

      prismaMock.customer.findUnique.mockResolvedValue({
        id: 'cust-1',
        email: loginData.email,
        password: 'hashed',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        birthDate: null,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await authService.loginCustomer(loginData);

      expect(result.refreshToken).toBeTruthy();
      expect(typeof result.refreshToken).toBe('string');
    });
  });

  describe('Password hashing', () => {
    it('should use bcrypt with salt rounds of 12', async () => {
      const registrationData = {
        email: 'newuser@example.com',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
      };

      jest.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      prismaMock.customer.findUnique.mockResolvedValue(null);
      prismaMock.customer.create.mockResolvedValue({
        id: 'cust-1',
        email: registrationData.email,
        password: 'hashed',
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        phone: registrationData.phone,
        birthDate: null,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await authService.registerCustomer(registrationData);

      expect(bcrypt.hash).toHaveBeenCalledWith(registrationData.password, 12);
    });

    it('should never store plain text password', async () => {
      const registrationData = {
        email: 'newuser@example.com',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
      };

      jest.mocked(bcrypt.hash).mockResolvedValue('hashed_value' as never);
      prismaMock.customer.findUnique.mockResolvedValue(null);
      prismaMock.customer.create.mockResolvedValue({
        id: 'cust-1',
        email: registrationData.email,
        password: 'hashed_value',
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        phone: registrationData.phone,
        birthDate: null,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await authService.registerCustomer(registrationData);

      // Verify that the created customer has hashed password, not plain
      expect(prismaMock.customer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password: 'hashed_value',
          }),
        })
      );
    });
  });

  describe('Email verification', () => {
    it('should require email verification for new registrations', async () => {
      const registrationData = {
        email: 'newuser@example.com',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
      };

      jest.mocked(bcrypt.hash).mockResolvedValue('hashed' as never);
      prismaMock.customer.findUnique.mockResolvedValue(null);
      prismaMock.customer.create.mockResolvedValue({
        id: 'cust-1',
        email: registrationData.email,
        password: 'hashed',
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        phone: registrationData.phone,
        birthDate: null,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.registerCustomer(registrationData);

      expect(result.requiresVerification).toBe(true);
    });
  });
});
