import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authApi } from '../../../services/authApi';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('authApi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Admin Authentication', () => {
    it('should login admin with credentials', async () => {
      const credentials = {
        email: 'admin@example.com',
        password: 'admin123',
      };

      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
          },
          token: 'admin-jwt-token',
        },
      };

      server.use(
        http.post('http://localhost:3000/api/auth/admin/login', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(credentials);
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await authApi.login(credentials);

      expect(result.data.data.user.email).toBe('admin@example.com');
      expect(result.data.data.token).toBe('admin-jwt-token');
    });

    it('should register a new admin user', async () => {
      const registerData = {
        email: 'newadmin@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'Admin',
        phone: '1234567890',
        role: 'MANAGER',
      };

      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '2',
            email: 'newadmin@example.com',
            firstName: 'New',
            lastName: 'Admin',
            role: 'MANAGER',
          },
          token: 'new-admin-token',
        },
      };

      server.use(
        http.post('http://localhost:3000/api/auth/register', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(registerData);
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await authApi.register(registerData);

      expect(result.data.data.user.role).toBe('MANAGER');
      expect(result.data.data.token).toBe('new-admin-token');
    });

    it('should logout admin', async () => {
      server.use(
        http.post('http://localhost:3000/api/auth/logout', () => {
          return HttpResponse.json({
            success: true,
            data: { message: 'Logged out successfully' },
          });
        })
      );

      const result = await authApi.logout();

      expect(result.data.success).toBe(true);
    });

    it('should get current admin user', async () => {
      localStorage.setItem('token', 'admin-token');

      const mockUser = {
        success: true,
        data: {
          id: '1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
        },
      };

      server.use(
        http.get('http://localhost:3000/api/auth/me', () => {
          return HttpResponse.json(mockUser);
        })
      );

      const result = await authApi.getMe();

      expect(result.data.data.role).toBe('ADMIN');
      expect(result.data.data.email).toBe('admin@example.com');
    });
  });

  describe('Customer Authentication', () => {
    it('should login customer with credentials', async () => {
      const credentials = {
        email: 'customer@example.com',
        password: 'customer123',
      };

      const mockResponse = {
        success: true,
        data: {
          customer: {
            id: 'cust-1',
            email: 'customer@example.com',
            firstName: 'John',
            lastName: 'Doe',
            phone: '1234567890',
          },
          token: 'customer-jwt-token',
          refreshToken: 'customer-refresh-token',
        },
      };

      server.use(
        http.post('http://localhost:3000/api/auth/login', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(credentials);
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await authApi.customerLogin(credentials);

      expect(result.data.data.customer.email).toBe('customer@example.com');
      expect(result.data.data.token).toBe('customer-jwt-token');
      expect(result.data.data.refreshToken).toBe('customer-refresh-token');
    });

    it('should register a new customer', async () => {
      const registerData = {
        email: 'newcustomer@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '0987654321',
        birthDate: '1990-01-01',
      };

      const mockResponse = {
        success: true,
        data: {
          customer: {
            id: 'cust-2',
            email: 'newcustomer@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '0987654321',
            birthDate: '1990-01-01',
          },
          token: 'new-customer-token',
        },
      };

      server.use(
        http.post('http://localhost:3000/api/auth/register', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(registerData);
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await authApi.customerRegister(registerData);

      expect(result.data.data.customer.firstName).toBe('Jane');
      expect(result.data.data.token).toBe('new-customer-token');
    });

    it('should logout customer', async () => {
      server.use(
        http.post('http://localhost:3000/api/auth/logout', () => {
          return HttpResponse.json({
            success: true,
            data: { message: 'Logged out successfully' },
          });
        })
      );

      const result = await authApi.customerLogout();

      expect(result.data.success).toBe(true);
    });

    it('should get current customer', async () => {
      localStorage.setItem('customerToken', 'customer-token');

      const mockCustomer = {
        success: true,
        data: {
          id: 'cust-1',
          email: 'customer@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
          isVerified: true,
        },
      };

      server.use(
        http.get('http://localhost:3000/api/auth/me', () => {
          return HttpResponse.json(mockCustomer);
        })
      );

      const result = await authApi.getCustomerMe();

      expect(result.data.data.isVerified).toBe(true);
      expect(result.data.data.phone).toBe('1234567890');
    });
  });

  describe('Email Verification', () => {
    it('should verify email with token', async () => {
      const token = 'verification-token-123';

      const mockResponse = {
        success: true,
        data: {
          success: true,
          message: 'Email verified successfully',
          token: 'verified-customer-token',
        },
      };

      server.use(
        http.post('http://localhost:3000/api/auth/verify-email-token', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({ token });
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await authApi.verifyEmailWithToken(token);

      expect(result.data.data.success).toBe(true);
      expect(result.data.data.token).toBe('verified-customer-token');
    });

    it('should verify email with code', async () => {
      const email = 'customer@example.com';
      const code = '123456';

      const mockResponse = {
        success: true,
        data: {
          success: true,
          message: 'Email verified successfully',
          token: 'verified-token',
        },
      };

      server.use(
        http.post('http://localhost:3000/api/auth/verify-email', async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({ email, code });
          return HttpResponse.json(mockResponse);
        })
      );

      const result = await authApi.verifyEmail(email, code);

      expect(result.data.data.message).toBe('Email verified successfully');
    });

    it('should handle invalid verification code', async () => {
      server.use(
        http.post('http://localhost:3000/api/auth/verify-email', () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Invalid verification code',
            },
            { status: 400 }
          );
        })
      );

      await expect(authApi.verifyEmail('test@example.com', '000000')).rejects.toThrow();
    });

    it('should handle expired verification token', async () => {
      server.use(
        http.post('http://localhost:3000/api/auth/verify-email-token', () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Verification token has expired',
            },
            { status: 400 }
          );
        })
      );

      await expect(authApi.verifyEmailWithToken('expired-token')).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid login credentials', async () => {
      server.use(
        http.post('http://localhost:3000/api/auth/login', () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Invalid email or password',
            },
            { status: 401 }
          );
        })
      );

      await expect(
        authApi.customerLogin({ email: 'wrong@example.com', password: 'wrong' })
      ).rejects.toThrow();
    });

    it('should handle duplicate email registration', async () => {
      server.use(
        http.post('http://localhost:3000/api/auth/register', () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Email already registered',
            },
            { status: 409 }
          );
        })
      );

      await expect(
        authApi.customerRegister({
          email: 'existing@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          phone: '1234567890',
        })
      ).rejects.toThrow();
    });

    it('should handle unauthorized access', async () => {
      server.use(
        http.get('http://localhost:3000/api/auth/me', () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Unauthorized',
            },
            { status: 401 }
          );
        })
      );

      await expect(authApi.getMe()).rejects.toThrow();
    });
  });
});
