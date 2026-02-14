import { describe, it, expect, beforeEach } from '@jest/globals';
import { AuthController } from '../../../interface/controllers/AuthController';
import { createMockRequest, createMockResponse } from '../../test-utils';

// Mock dependencies
jest.mock('../../../application/services/AuthService');
jest.mock('../../../application/services/CartService');

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: any;
  let mockCartService: any;

  beforeEach(() => {
    mockAuthService = {
      registerCustomer: jest.fn(),
      loginCustomer: jest.fn(),
      loginAdmin: jest.fn(),
    };

    mockCartService = {
      mergeCarts: jest.fn(),
    };

    authController = new AuthController(mockAuthService, mockCartService);
    jest.clearAllMocks();
  });

  describe('registerCustomer', () => {
    it('should register customer with valid data', async () => {
      const req = createMockRequest({
        body: {
          email: 'newuser@example.com',
          password: 'SecurePass123',
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
        },
      });
      const res = createMockResponse();

      mockAuthService.registerCustomer.mockResolvedValue({
        token: 'jwt_token',
        refreshToken: 'refresh_token',
        requiresVerification: true,
        customer: {
          id: 'cust-1',
          email: 'newuser@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isVerified: false,
        },
      });

      await authController.registerCustomer(req as any, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      expect(mockAuthService.registerCustomer).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'newuser@example.com',
          firstName: 'John',
          lastName: 'Doe',
        })
      );
    });

    it('should return 400 on validation error', async () => {
      const req = createMockRequest({
        body: {
          email: 'invalid-email',
          password: 'short',
          firstName: 'John',
          lastName: 'Doe',
          phone: '123',
        },
      });
      const res = createMockResponse();

      await authController.registerCustomer(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if email already registered', async () => {
      const req = createMockRequest({
        body: {
          email: 'existing@example.com',
          password: 'SecurePass123',
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
        },
      });
      const res = createMockResponse();

      mockAuthService.registerCustomer.mockRejectedValue(
        new Error('El email ya está registrado')
      );

      await authController.registerCustomer(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 500 on service error', async () => {
      const req = createMockRequest({
        body: {
          email: 'newuser@example.com',
          password: 'SecurePass123',
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
        },
      });
      const res = createMockResponse();

      mockAuthService.registerCustomer.mockRejectedValue(
        new Error('Database error')
      );

      await authController.registerCustomer(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('loginCustomer', () => {
    it('should login customer with valid credentials', async () => {
      const req = createMockRequest({
        body: {
          email: 'customer@example.com',
          password: 'SecurePass123',
        },
      });
      const res = createMockResponse();

      mockAuthService.loginCustomer.mockResolvedValue({
        token: 'jwt_token',
        refreshToken: 'refresh_token',
        customer: {
          id: 'cust-1',
          email: 'customer@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isVerified: true,
        },
        requiresVerification: false,
      });

      await authController.loginCustomer(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      expect(mockAuthService.loginCustomer).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'customer@example.com',
          password: 'SecurePass123',
        })
      );
    });

    it('should return 401 on invalid credentials', async () => {
      const req = createMockRequest({
        body: {
          email: 'customer@example.com',
          password: 'WrongPassword',
        },
      });
      const res = createMockResponse();

      mockAuthService.loginCustomer.mockRejectedValue(
        new Error('Email o contraseña incorrectos')
      );

      await authController.loginCustomer(req as any, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 if customer not found', async () => {
      const req = createMockRequest({
        body: {
          email: 'nonexistent@example.com',
          password: 'SomePassword',
        },
      });
      const res = createMockResponse();

      mockAuthService.loginCustomer.mockRejectedValue(
        new Error('Email o contraseña incorrectos')
      );

      await authController.loginCustomer(req as any, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should merge carts if sessionId provided', async () => {
      const sessionId = 'session-123';
      const req = createMockRequest({
        headers: { 'x-session-id': sessionId },
        body: {
          email: 'customer@example.com',
          password: 'SecurePass123',
        },
      });
      const res = createMockResponse();

      mockAuthService.loginCustomer.mockResolvedValue({
        token: 'jwt_token',
        refreshToken: 'refresh_token',
        customer: {
          id: 'cust-1',
          email: 'customer@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isVerified: true,
        },
        requiresVerification: false,
      });

      mockCartService.mergeCarts.mockResolvedValue({
        id: 'cart-1',
        items: [],
      });

      await authController.loginCustomer(req as any, res);

      expect(mockCartService.mergeCarts).toHaveBeenCalledWith(sessionId, 'cust-1');
    });

    it('should handle unverified account', async () => {
      const req = createMockRequest({
        body: {
          email: 'unverified@example.com',
          password: 'SecurePass123',
        },
      });
      const res = createMockResponse();

      mockAuthService.loginCustomer.mockResolvedValue({
        token: 'jwt_token',
        refreshToken: 'refresh_token',
        requiresVerification: true,
        customer: {
          id: 'cust-1',
          email: 'unverified@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isVerified: false,
        },
      });

      await authController.loginCustomer(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requiresVerification: true,
        })
      );
    });
  });

  describe('loginAdmin', () => {
    it('should login admin with valid credentials', async () => {
      const req = createMockRequest({
        body: {
          email: 'admin@example.com',
          password: 'AdminPass123',
        },
      });
      const res = createMockResponse();

      mockAuthService.loginAdmin.mockResolvedValue({
        token: 'jwt_admin_token',
        refreshToken: 'refresh_admin_token',
        user: {
          id: 'admin-1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
        },
      });

      await authController.loginAdmin(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockAuthService.loginAdmin).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'admin@example.com',
          password: 'AdminPass123',
        })
      );
    });

    it('should return 401 on invalid admin credentials', async () => {
      const req = createMockRequest({
        body: {
          email: 'admin@example.com',
          password: 'WrongPassword',
        },
      });
      const res = createMockResponse();

      mockAuthService.loginAdmin.mockRejectedValue(
        new Error('Email o contraseña incorrectos')
      );

      await authController.loginAdmin(req as any, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 401 if admin not found', async () => {
      const req = createMockRequest({
        body: {
          email: 'nonexistent@example.com',
          password: 'SomePassword',
        },
      });
      const res = createMockResponse();

      mockAuthService.loginAdmin.mockRejectedValue(
        new Error('Usuario no encontrado')
      );

      await authController.loginAdmin(req as any, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      const req = createMockRequest({});
      const res = createMockResponse();

      await authController.logout(req as any, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Logout successful',
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should handle service errors gracefully', async () => {
      const req = createMockRequest({
        body: {
          email: 'customer@example.com',
          password: 'SecurePass123',
        },
      });
      const res = createMockResponse();

      mockAuthService.loginCustomer.mockRejectedValue(
        new Error('Unexpected service error')
      );

      await authController.loginCustomer(req as any, res);

      expect(res.status).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle non-Error objects', async () => {
      const req = createMockRequest({
        body: {
          email: 'customer@example.com',
          password: 'SecurePass123',
        },
      });
      const res = createMockResponse();

      mockAuthService.loginCustomer.mockRejectedValue({
        status: 500,
        message: 'Unknown error',
      });

      await authController.loginCustomer(req as any, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Request validation', () => {
    it('should validate email format', async () => {
      const req = createMockRequest({
        body: {
          email: 'not-an-email',
          password: 'SecurePass123',
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
        },
      });
      const res = createMockResponse();

      await authController.registerCustomer(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should validate password strength', async () => {
      const req = createMockRequest({
        body: {
          email: 'user@example.com',
          password: 'weak',
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
        },
      });
      const res = createMockResponse();

      await authController.registerCustomer(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should require all mandatory fields', async () => {
      const req = createMockRequest({
        body: {
          email: 'user@example.com',
          password: 'SecurePass123',
          // Missing firstName, lastName, phone
        },
      });
      const res = createMockResponse();

      await authController.registerCustomer(req as any, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
