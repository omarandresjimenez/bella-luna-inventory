import { describe, it, expect } from '@jest/globals';
import {
  registerCustomerSchema,
  loginCustomerSchema,
  loginAdminSchema,
} from '../../../application/dtos/auth.dto';

describe('Auth DTOs', () => {
  describe('registerCustomerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'newcustomer@example.com',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
      };

      const result = registerCustomerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
      };

      const result = registerCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('Email');
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'customer@example.com',
        password: 'short',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
      };

      const result = registerCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('contraseña');
    });

    it('should reject short first name', () => {
      const invalidData = {
        email: 'customer@example.com',
        password: 'SecurePass123',
        firstName: 'J',
        lastName: 'Doe',
        phone: '1234567890',
      };

      const result = registerCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short phone number', () => {
      const invalidData = {
        email: 'customer@example.com',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '123',
      };

      const result = registerCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('Teléfono');
    });

    it('should allow optional birthDate', () => {
      const validData = {
        email: 'customer@example.com',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        birthDate: '2000-01-15T00:00:00Z',
      };

      const result = registerCustomerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const incompleteData = {
        email: 'customer@example.com',
        password: 'SecurePass123',
      };

      const result = registerCustomerSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginCustomerSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'customer@example.com',
        password: 'SecurePass123',
      };

      const result = loginCustomerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'SecurePass123',
      };

      const result = loginCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidData = {
        email: 'customer@example.com',
        password: '',
      };

      const result = loginCustomerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require both email and password', () => {
      const incompleteData = {
        email: 'customer@example.com',
      };

      const result = loginCustomerSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });

    it('should allow any password length >= 1', () => {
      const validData = {
        email: 'customer@example.com',
        password: 'a',
      };

      const result = loginCustomerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('loginAdminSchema', () => {
    it('should validate correct admin login data', () => {
      const validData = {
        email: 'admin@example.com',
        password: 'AdminPass123',
      };

      const result = loginAdminSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should have same validation rules as customer login', () => {
      const testCases = [
        { email: 'not-email', password: 'pass', shouldPass: false },
        { email: 'admin@example.com', password: '', shouldPass: false },
        { email: 'admin@example.com', password: 'pass', shouldPass: true },
      ];

      testCases.forEach(({ email, password, shouldPass }) => {
        const result = loginAdminSchema.safeParse({ email, password });
        expect(result.success).toBe(shouldPass);
      });
    });
  });
});
