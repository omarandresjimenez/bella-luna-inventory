import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  validatePasswordMatch,
} from '../../../utils/validation';

describe('validation', () => {
  describe('validateEmail', () => {
    it('should return null for valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull();
      expect(validateEmail('user.name@domain.co')).toBeNull();
      expect(validateEmail('user+tag@example.com')).toBeNull();
    });

    it('should return error for empty email', () => {
      expect(validateEmail('')).toBe('Por favor ingresa tu correo electrónico');
      expect(validateEmail('   ')).toBe('Por favor ingresa tu correo electrónico');
    });

    it('should return error for null/undefined', () => {
      expect(validateEmail(null as any)).toBe('Por favor ingresa tu correo electrónico');
      expect(validateEmail(undefined as any)).toBe('Por favor ingresa tu correo electrónico');
    });

    it('should return error for invalid email format', () => {
      expect(validateEmail('invalid')).toBe('El correo electrónico no es válido');
      expect(validateEmail('test@')).toBe('El correo electrónico no es válido');
      expect(validateEmail('@example.com')).toBe('El correo electrónico no es válido');
      expect(validateEmail('test@example')).toBe('El correo electrónico no es válido');
      expect(validateEmail('test.example.com')).toBe('El correo electrónico no es válido');
    });
  });

  describe('validatePassword', () => {
    it('should return null for valid password', () => {
      const validPassword = 'Password123!';
      expect(validatePassword(validPassword)).toBeNull();
    });

    it('should return error for empty password', () => {
      expect(validatePassword('')).toBe('La contraseña es obligatoria');
      expect(validatePassword('   ')).toBe('La contraseña es obligatoria');
    });

    it('should return error for short password', () => {
      expect(validatePassword('Short1!')).toBe('La contraseña debe tener al menos 8 caracteres');
      expect(validatePassword('Pass1!')).toBe('La contraseña debe tener al menos 8 caracteres');
    });

    it('should return error for password without uppercase', () => {
      const result = validatePassword('password123!');
      expect(result).toContain('una mayúscula');
    });

    it('should return error for password without lowercase', () => {
      const result = validatePassword('PASSWORD123!');
      expect(result).toContain('una minúscula');
    });

    it('should return error for password without number', () => {
      const result = validatePassword('Password!@#');
      expect(result).toContain('un número');
    });

    it('should return error for password without special character', () => {
      const result = validatePassword('Password123');
      expect(result).toContain('un carácter especial');
    });

    it('should return error for multiple missing requirements', () => {
      const result = validatePassword('password');
      expect(result).toContain('una mayúscula');
      expect(result).toContain('un número');
      expect(result).toContain('un carácter especial');
    });
  });

  describe('validateName', () => {
    it('should return null for valid name', () => {
      expect(validateName('John', 'nombre')).toBeNull();
      expect(validateName('María José', 'nombre')).toBeNull();
      expect(validateName('O\'Connor', 'apellido')).toBeNull();
    });

    it('should return error for empty name', () => {
      expect(validateName('', 'nombre')).toBe('El nombre es obligatorio');
      expect(validateName('   ', 'apellido')).toBe('El apellido es obligatorio');
    });

    it('should return error for short name', () => {
      expect(validateName('A', 'nombre')).toBe('El nombre debe tener al menos 2 caracteres');
    });

    it('should return error for long name', () => {
      const longName = 'A'.repeat(51);
      expect(validateName(longName, 'nombre')).toBe('El nombre no debe exceder 50 caracteres');
    });

    it('should return error for invalid characters', () => {
      expect(validateName('John123', 'nombre')).toBe('El nombre contiene caracteres inválidos');
      expect(validateName('John@Doe', 'nombre')).toBe('El nombre contiene caracteres inválidos');
    });

    it('should accept accented characters', () => {
      expect(validateName('José', 'nombre')).toBeNull();
      expect(validateName('María', 'nombre')).toBeNull();
      expect(validateName('Niño', 'nombre')).toBeNull();
    });

    it('should accept ñ and ü characters', () => {
      expect(validateName('Señor', 'nombre')).toBeNull();
      expect(validateName('García', 'apellido')).toBeNull();
    });
  });

  describe('validatePhone', () => {
    it('should return null for valid phone', () => {
      expect(validatePhone('1234567890')).toBeNull();
      expect(validatePhone('123-456-7890')).toBeNull();
      expect(validatePhone('(123) 456-7890')).toBeNull();
      expect(validatePhone('+1 123 456 7890')).toBeNull();
    });

    it('should return error for empty phone', () => {
      expect(validatePhone('')).toBe('El teléfono es obligatorio');
      expect(validatePhone('   ')).toBe('El teléfono es obligatorio');
    });

    it('should return error for short phone', () => {
      expect(validatePhone('123456789')).toBe('El teléfono debe tener al menos 10 dígitos');
      expect(validatePhone('123-45-678')).toBe('El teléfono debe tener al menos 10 dígitos');
    });

    it('should return error for long phone', () => {
      expect(validatePhone('1234567890123456')).toBe('El teléfono no debe exceder 15 dígitos');
    });

    it('should strip non-numeric characters before validation', () => {
      expect(validatePhone('+1 (123) 456-7890')).toBeNull();
      expect(validatePhone('123.456.7890')).toBeNull();
    });
  });

  describe('validatePasswordMatch', () => {
    it('should return null when passwords match', () => {
      expect(validatePasswordMatch('Password123!', 'Password123!')).toBeNull();
    });

    it('should return error when passwords do not match', () => {
      expect(validatePasswordMatch('Password123!', 'Password123')).toBe('Las contraseñas no coinciden');
      expect(validatePasswordMatch('Password123!', 'DifferentPassword!')).toBe('Las contraseñas no coinciden');
    });

    it('should return error for empty confirmation', () => {
      expect(validatePasswordMatch('Password123!', '')).toBe('Por favor confirma tu contraseña');
      expect(validatePasswordMatch('Password123!', '   ')).toBe('Por favor confirma tu contraseña');
    });

    it('should be case sensitive', () => {
      expect(validatePasswordMatch('Password123!', 'password123!')).toBe('Las contraseñas no coinciden');
    });
  });
});
