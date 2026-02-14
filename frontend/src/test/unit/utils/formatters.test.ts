import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatCurrency,
  formatQuantity,
  formatCompact,
} from '../../../utils/formatters';

describe('formatters', () => {
  describe('formatPrice', () => {
    it('should format a number with thousand separators', () => {
      expect(formatPrice(1234)).toBe('1,234');
      expect(formatPrice(1000000)).toBe('1,000,000');
      expect(formatPrice(1234567)).toBe('1,234,567');
    });

    it('should handle string numbers', () => {
      expect(formatPrice('1234')).toBe('1,234');
      expect(formatPrice('1000000')).toBe('1,000,000');
    });

    it('should format with decimal places', () => {
      expect(formatPrice(1234.56, 2)).toBe('1,234.56');
      expect(formatPrice(1000000.99, 2)).toBe('1,000,000.99');
    });

    it('should handle zero', () => {
      expect(formatPrice(0)).toBe('0');
      expect(formatPrice('0')).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(formatPrice(-1234)).toBe('-1,234');
      expect(formatPrice(-1234.56, 2)).toBe('-1,234.56');
    });

    it('should return "0" for invalid input', () => {
      expect(formatPrice(NaN)).toBe('0');
      expect(formatPrice('invalid')).toBe('0');
      expect(formatPrice('')).toBe('0');
    });

    it('should round decimals correctly', () => {
      expect(formatPrice(1234.567, 2)).toBe('1,234.57');
      expect(formatPrice(1234.564, 2)).toBe('1,234.56');
    });
  });

  describe('formatCurrency', () => {
    it('should format number with $ prefix', () => {
      expect(formatCurrency(1234)).toBe('$1,234');
      expect(formatCurrency(1000000)).toBe('$1,000,000');
    });

    it('should format with decimal places', () => {
      expect(formatCurrency(1234.56, 2)).toBe('$1,234.56');
      expect(formatCurrency(1000000.99, 2)).toBe('$1,000,000.99');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-1234)).toBe('-$1,234');
    });

    it('should handle string numbers', () => {
      expect(formatCurrency('1234')).toBe('$1,234');
    });

    it('should return "$0" for invalid input', () => {
      expect(formatCurrency(NaN)).toBe('$0');
      expect(formatCurrency('invalid')).toBe('$0');
    });
  });

  describe('formatQuantity', () => {
    it('should format number with thousand separators', () => {
      expect(formatQuantity(1000)).toBe('1,000');
      expect(formatQuantity(1000000)).toBe('1,000,000');
    });

    it('should handle string numbers', () => {
      expect(formatQuantity('1000')).toBe('1,000');
      expect(formatQuantity('1000000')).toBe('1,000,000');
    });

    it('should handle zero', () => {
      expect(formatQuantity(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(formatQuantity(-1000)).toBe('-1,000');
    });

    it('should return "0" for invalid input', () => {
      expect(formatQuantity(NaN)).toBe('0');
      expect(formatQuantity('invalid')).toBe('0');
      expect(formatQuantity('')).toBe('0');
    });

    it('should truncate decimals', () => {
      expect(formatQuantity(1000.99)).toBe('1,001');
      expect(formatQuantity('1000.99')).toBe('1,001');
    });
  });

  describe('formatCompact', () => {
    it('should format thousands with K suffix', () => {
      expect(formatCompact(1234)).toBe('1.2K');
      expect(formatCompact(1500)).toBe('1.5K');
      expect(formatCompact(999)).toBe('999');
    });

    it('should format millions with M suffix', () => {
      expect(formatCompact(1000000)).toBe('1M');
      expect(formatCompact(1500000)).toBe('1.5M');
    });

    it('should format billions with B suffix', () => {
      expect(formatCompact(1000000000)).toBe('1B');
      expect(formatCompact(2500000000)).toBe('2.5B');
    });

    it('should handle string numbers', () => {
      expect(formatCompact('1234')).toBe('1.2K');
      expect(formatCompact('1000000')).toBe('1M');
    });

    it('should handle zero', () => {
      expect(formatCompact(0)).toBe('0');
    });

    it('should return "0" for invalid input', () => {
      expect(formatCompact(NaN)).toBe('0');
      expect(formatCompact('invalid')).toBe('0');
    });
  });
});
