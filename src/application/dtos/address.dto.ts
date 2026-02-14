import { z } from 'zod';

// Create Address DTO
export const createAddressSchema = z.object({
  street: z.string().min(5, 'La calle debe tener al menos 5 caracteres'),
  city: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres'),
  state: z.string().min(2, 'El estado debe tener al menos 2 caracteres'),
  postalCode: z.string().regex(/^[\w\s\-]{4,}$/, 'Código postal inválido'),
  country: z.string().min(2, 'El país debe tener al menos 2 caracteres'),
  recipientName: z.string().min(2, 'El nombre del destinatario debe tener al menos 2 caracteres'),
  phone: z.string().regex(/^[\d\-\+\(\)\s]{10,}$/, 'Teléfono inválido'),
  apt: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
});

export type CreateAddressDTO = z.infer<typeof createAddressSchema>;

// Update Address DTO
export const updateAddressSchema = z.object({
  street: z.string().min(5, 'La calle debe tener al menos 5 caracteres').optional(),
  city: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres').optional(),
  state: z.string().min(2, 'El estado debe tener al menos 2 caracteres').optional(),
  postalCode: z.string().regex(/^[\w\s\-]{4,}$/, 'Código postal inválido').optional(),
  country: z.string().min(2, 'El país debe tener al menos 2 caracteres').optional(),
  recipientName: z.string().min(2, 'El nombre del destinatario debe tener al menos 2 caracteres').optional(),
  phone: z.string().regex(/^[\d\-\+\(\)\s]{10,}$/, 'Teléfono inválido').optional(),
  apt: z.string().optional(),
  isDefault: z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Al menos un campo debe ser proporcionado para actualizar' }
);

export type UpdateAddressDTO = z.infer<typeof updateAddressSchema>;
