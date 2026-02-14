import { Response } from 'express';
import { CustomerAdminService, CreateCustomerDTO, UpdateCustomerDTO } from '../../application/services/CustomerAdminService.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response.js';
import { z } from 'zod';

// Validation schemas
const createCustomerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 caracteres'),
  birthDate: z.string().datetime().optional(),
  isVerified: z.boolean().optional(),
});

const updateCustomerSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  birthDate: z.string().datetime().optional(),
  isVerified: z.boolean().optional(),
});

const customerFiltersSchema = z.object({
  search: z.string().optional(),
  isVerified: z
    .string()
    .transform((val) => {
      if (!val) return undefined;
      return val === 'true' || val === '1';
    })
    .optional(),
  hasOrders: z
    .string()
    .transform((val) => {
      if (!val) return undefined;
      return val === 'true' || val === '1';
    })
    .optional(),
  page: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .optional(),
  limit: z
    .string()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .optional(),
});

export class AdminCustomerController {
  constructor(private customerService: CustomerAdminService) {}

  // Get all customers
  async getAllCustomers(req: AuthRequest, res: Response) {
    try {
      const filters = customerFiltersSchema.parse(req.query);
      const customers = await this.customerService.getAllCustomers(filters);
      sendSuccess(res, customers);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, ErrorCode.VALIDATION_ERROR, error.errors[0].message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener clientes', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get customer by ID
  async getCustomerById(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const customer = await this.customerService.getCustomerById(id);

      if (!customer) {
        sendError(res, ErrorCode.NOT_FOUND, 'Cliente no encontrado', HttpStatus.NOT_FOUND);
        return;
      }

      sendSuccess(res, customer);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener cliente', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Create customer
  async createCustomer(req: AuthRequest, res: Response) {
    try {
      const data = createCustomerSchema.parse(req.body);
      
      // Convert birthDate string to Date if provided
      const customerData: CreateCustomerDTO = {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      };

      const customer = await this.customerService.createCustomer(customerData);
      sendSuccess(res, customer, HttpStatus.CREATED);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, ErrorCode.VALIDATION_ERROR, error.errors[0].message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al crear cliente', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Update customer
  async updateCustomer(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const data = updateCustomerSchema.parse(req.body);

      // Convert birthDate string to Date if provided
      const customerData: UpdateCustomerDTO = {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      };

      const customer = await this.customerService.updateCustomer(id, customerData);
      sendSuccess(res, customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, ErrorCode.VALIDATION_ERROR, error.errors[0].message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof Error) {
        if (error.message === 'Cliente no encontrado') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al actualizar cliente', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Delete customer
  async deleteCustomer(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      await this.customerService.deleteCustomer(id);
      sendSuccess(res, { message: 'Cliente eliminado correctamente' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Cliente no encontrado') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al eliminar cliente', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Toggle verification status
  async toggleVerificationStatus(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const customer = await this.customerService.toggleVerificationStatus(id);
      sendSuccess(res, customer);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Cliente no encontrado') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al cambiar estado de verificación', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get customers stats
  async getCustomersStats(req: AuthRequest, res: Response) {
    try {
      const stats = await this.customerService.getCustomersStats();
      sendSuccess(res, stats);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener estadísticas de clientes', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get recent customers
  async getRecentCustomers(req: AuthRequest, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const customers = await this.customerService.getRecentCustomers(limit);
      sendSuccess(res, customers);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener clientes recientes', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
