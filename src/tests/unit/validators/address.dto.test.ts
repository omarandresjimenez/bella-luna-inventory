import { describe, it, expect } from '@jest/globals';
import {
  createAddressSchema,
  updateAddressSchema,
} from '../../../application/dtos/address.dto';

describe('Address DTOs', () => {
  describe('createAddressSchema', () => {
    const validAddressData = {
      street: '123 Main Street',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90001',
      country: 'United States',
      recipientName: 'John Doe',
      phone: '1234567890',
      isDefault: false,
    };

    it('should validate correct address data', () => {
      const result = createAddressSchema.safeParse(validAddressData);
      expect(result.success).toBe(true);
    });

    it('should reject empty street address', () => {
      const invalidData = { ...validAddressData, street: '' };
      const result = createAddressSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty city', () => {
      const invalidData = { ...validAddressData, city: '' };
      const result = createAddressSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty state', () => {
      const invalidData = { ...validAddressData, state: '' };
      const result = createAddressSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid postal code format', () => {
      const invalidData = { ...validAddressData, postalCode: '123' };
      const result = createAddressSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate valid postal code formats', () => {
      const postalCodes = ['90001', '90001-1234', 'SW1A 1AA'];
      postalCodes.forEach((postalCode) => {
        const result = createAddressSchema.safeParse({
          ...validAddressData,
          postalCode,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject empty country', () => {
      const invalidData = { ...validAddressData, country: '' };
      const result = createAddressSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty recipient name', () => {
      const invalidData = { ...validAddressData, recipientName: '' };
      const result = createAddressSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid phone number', () => {
      const invalidData = { ...validAddressData, phone: '123' };
      const result = createAddressSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow valid phone number formats', () => {
      const phones = ['1234567890', '+1-123-456-7890', '(123) 456-7890'];
      phones.forEach((phone) => {
        const result = createAddressSchema.safeParse({
          ...validAddressData,
          phone,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should allow optional apartment/suite number', () => {
      const dataWithApartment = {
        ...validAddressData,
        apt: 'Apt 5B',
      };
      const result = createAddressSchema.safeParse(dataWithApartment);
      expect(result.success).toBe(true);
    });

    it('should allow setting as default address', () => {
      const dataAsDefault = { ...validAddressData, isDefault: true };
      const result = createAddressSchema.safeParse(dataAsDefault);
      expect(result.success).toBe(true);
    });

    it('should require all mandatory fields', () => {
      const incompleteData = {
        street: '123 Main Street',
        city: 'Los Angeles',
      };
      const result = createAddressSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateAddressSchema', () => {
    it('should allow partial address update', () => {
      const partialUpdate = {
        street: '456 Oak Avenue',
        city: 'New York',
      };
      const result = updateAddressSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should allow updating only city', () => {
      const result = updateAddressSchema.safeParse({ city: 'Chicago' });
      expect(result.success).toBe(true);
    });

    it('should allow updating only postal code', () => {
      const result = updateAddressSchema.safeParse({ postalCode: '60601' });
      expect(result.success).toBe(true);
    });

    it('should allow updating phone number', () => {
      const result = updateAddressSchema.safeParse({ phone: '9876543210' });
      expect(result.success).toBe(true);
    });

    it('should allow changing default status', () => {
      const result = updateAddressSchema.safeParse({ isDefault: true });
      expect(result.success).toBe(true);
    });

    it('should validate postal code when updated', () => {
      const invalidUpdate = { postalCode: '123' };
      const result = updateAddressSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it('should validate phone number when updated', () => {
      const invalidUpdate = { phone: '12' };
      const result = updateAddressSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it('should allow empty update', () => {
      const result = updateAddressSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should allow updating recipient name', () => {
      const result = updateAddressSchema.safeParse({
        recipientName: 'Jane Doe',
      });
      expect(result.success).toBe(true);
    });

    it('should allow full address update with all fields', () => {
      const fullUpdate = {
        street: '789 Pine Street',
        apt: 'Suite 100',
        city: 'Boston',
        state: 'MA',
        postalCode: '02101',
        country: 'United States',
        recipientName: 'Jane Doe',
        phone: '6171234567',
        isDefault: true,
      };
      const result = updateAddressSchema.safeParse(fullUpdate);
      expect(result.success).toBe(true);
    });
  });
});
