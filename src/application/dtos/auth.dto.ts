import { z } from 'zod';

// Customer Registration
export const registerCustomerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string().min(10, 'Teléfono inválido'),
  birthDate: z.string().datetime().optional(),
});

export type RegisterCustomerDTO = z.infer<typeof registerCustomerSchema>;

// Customer Login
export const loginCustomerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginCustomerDTO = z.infer<typeof loginCustomerSchema>;

// Admin Login
export const loginAdminSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginAdminDTO = z.infer<typeof loginAdminSchema>;

// Token response
export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
  };
}

// Customer Token response
export interface CustomerAuthResponse {
  token: string;
  refreshToken?: string;
  customer: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}
