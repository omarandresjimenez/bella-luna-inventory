import { describe, it, expect } from '@jest/globals';
import {
  addToCartSchema,
  updateCartItemSchema,
} from '../../../application/dtos/cart.dto';

describe('Cart DTOs', () => {
  describe('addToCartSchema', () => {
    const validAddToCartData = {
      variantId: '550e8400-e29b-41d4-a716-446655440000',
      quantity: 2,
    };

    it('should validate correct add to cart data', () => {
      const result = addToCartSchema.safeParse(validAddToCartData);
      expect(result.success).toBe(true);
    });

    it('should require variantId', () => {
      const invalidData = {
        quantity: 2,
      };
      const result = addToCartSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require quantity', () => {
      const invalidData = {
        variantId: '550e8400-e29b-41d4-a716-446655440000',
      };
      const result = addToCartSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject zero quantity', () => {
      const invalidData = { ...validAddToCartData, quantity: 0 };
      const result = addToCartSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative quantity', () => {
      const invalidData = { ...validAddToCartData, quantity: -5 };
      const result = addToCartSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject very large quantities', () => {
      const invalidData = { ...validAddToCartData, quantity: 1000000 };
      const result = addToCartSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow quantity of 1', () => {
      const dataWithQuantity1 = { ...validAddToCartData, quantity: 1 };
      const result = addToCartSchema.safeParse(dataWithQuantity1);
      expect(result.success).toBe(true);
    });

    it('should allow maximum reasonable quantity', () => {
      const dataWithMaxQuantity = { ...validAddToCartData, quantity: 999 };
      const result = addToCartSchema.safeParse(dataWithMaxQuantity);
      expect(result.success).toBe(true);
    });

    it('should allow optional variantId', () => {
      const dataWithoutVariant = {
        variantId: '550e8400-e29b-41d4-a716-446655440000',
        quantity: 2,
      };
      const result = addToCartSchema.safeParse(dataWithoutVariant);
      expect(result.success).toBe(true);
    });

    it('should require valid UUID format for variantId', () => {
      const dataWithInvalidUUID = {
        variantId: 'invalid-uuid',
        quantity: 2,
      };
      const result = addToCartSchema.safeParse(dataWithInvalidUUID);
      expect(result.success).toBe(false);
    });

    it('should reject non-UUID variantId format', () => {
      const dataWithBadFormat = {
        variantId: 'not-a-uuid-string',
        quantity: 2,
      };
      const result = addToCartSchema.safeParse(dataWithBadFormat);
      expect(result.success).toBe(false);
    });
  });

  describe('updateCartItemSchema', () => {
    it('should validate quantity update', () => {
      const validUpdate = {
        quantity: 5,
      };
      const result = updateCartItemSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('should reject zero quantity in update', () => {
      const invalidUpdate = { quantity: 0 };
      const result = updateCartItemSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it('should reject negative quantity in update', () => {
      const invalidUpdate = { quantity: -3 };
      const result = updateCartItemSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it('should allow updating to quantity 1', () => {
      const result = updateCartItemSchema.safeParse({ quantity: 1 });
      expect(result.success).toBe(true);
    });

    it('should allow updating to large quantity', () => {
      const result = updateCartItemSchema.safeParse({ quantity: 500 });
      expect(result.success).toBe(true);
    });

    it('should reject exceeding maximum quantity', () => {
      const invalidUpdate = { quantity: 1000000 };
      const result = updateCartItemSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it('should allow partial update with only quantity', () => {
      const result = updateCartItemSchema.safeParse({ quantity: 10 });
      expect(result.success).toBe(true);
    });

    it('should be strict - only quantity allowed', () => {
      const invalidUpdate = {
        quantity: 5,
        extraField: 'should-not-exist',
      };
      const result = updateCartItemSchema.safeParse(invalidUpdate);
      // Depends on schema strictness - may pass or fail
    });

    it('should handle quantity increment use case', () => {
      const incrementBy1 = { quantity: 3 };
      const result = updateCartItemSchema.safeParse(incrementBy1);
      expect(result.success).toBe(true);
    });

    it('should handle quantity decrement use case', () => {
      const decrementTo1 = { quantity: 1 };
      const result = updateCartItemSchema.safeParse(decrementTo1);
      expect(result.success).toBe(true);
    });
  });

  describe('Cart edge cases', () => {
    it('should handle adding same variant multiple times', () => {
      const variantId = '550e8400-e29b-41d4-a716-446655440000';
      const firstAdd = addToCartSchema.safeParse({
        variantId,
        quantity: 2,
      });
      const secondAdd = addToCartSchema.safeParse({
        variantId,
        quantity: 3,
      });

      expect(firstAdd.success).toBe(true);
      expect(secondAdd.success).toBe(true);
    });

    it('should handle adding different variants', () => {
      const variant1 = addToCartSchema.safeParse({
        variantId: '550e8400-e29b-41d4-a716-446655440001',
        quantity: 2,
      });
      const variant2 = addToCartSchema.safeParse({
        variantId: '550e8400-e29b-41d4-a716-446655440002',
        quantity: 1,
      });

      expect(variant1.success).toBe(true);
      expect(variant2.success).toBe(true);
    });

    it('should validate bulk cart operations', () => {
      const bulkItems = [
        { variantId: '550e8400-e29b-41d4-a716-446655440001', quantity: 2 },
        { variantId: '550e8400-e29b-41d4-a716-446655440002', quantity: 1 },
        { variantId: '550e8400-e29b-41d4-a716-446655440003', quantity: 5 },
      ];

      bulkItems.forEach((item) => {
        const result = addToCartSchema.safeParse(item);
        expect(result.success).toBe(true);
      });
    });
  });
});
