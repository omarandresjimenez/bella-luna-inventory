import { Response } from 'express';
import { UserAdminService, CreateUserDTO, UpdateUserDTO } from '../../application/services/UserAdminService.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { sendSuccess, sendError, HttpStatus, ErrorCode } from '../../shared/utils/api-response.js';
import { z } from 'zod';
import { Role } from '@prisma/client';

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  role: z.enum([Role.ADMIN, Role.MANAGER, Role.EMPLOYEE]),
  isActive: z.boolean().optional(),
});

const updateUserSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  role: z.enum([Role.ADMIN, Role.MANAGER, Role.EMPLOYEE]).optional(),
  isActive: z.boolean().optional(),
});

const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.enum([Role.ADMIN, Role.MANAGER, Role.EMPLOYEE]).optional(),
  isActive: z.boolean().optional(),
});

export class AdminUserController {
  constructor(private userService: UserAdminService) {}

  // Get all users
  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const filters = userFiltersSchema.parse(req.query);
      const users = await this.userService.getAllUsers(filters);
      sendSuccess(res, users);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, ErrorCode.VALIDATION_ERROR, error.errors[0].message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener usuarios', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get user by ID
  async getUserById(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const user = await this.userService.getUserById(id);

      if (!user) {
        sendError(res, ErrorCode.NOT_FOUND, 'Usuario no encontrado', HttpStatus.NOT_FOUND);
        return;
      }

      sendSuccess(res, user);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener usuario', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Create user
  async createUser(req: AuthRequest, res: Response) {
    try {
      const data = createUserSchema.parse(req.body);
      const user = await this.userService.createUser(data as CreateUserDTO);
      sendSuccess(res, user, HttpStatus.CREATED);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, ErrorCode.VALIDATION_ERROR, error.errors[0].message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof Error) {
        sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al crear usuario', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Update user
  async updateUser(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const data = updateUserSchema.parse(req.body);

      // Prevent user from removing their own admin status or deactivating themselves
      if (req.user?.userId === id) {
        if (data.role && data.role !== Role.ADMIN) {
          sendError(res, ErrorCode.FORBIDDEN, 'No puedes cambiar tu propio rol de administrador', HttpStatus.FORBIDDEN);
          return;
        }
        if (data.isActive === false) {
          sendError(res, ErrorCode.FORBIDDEN, 'No puedes desactivar tu propia cuenta', HttpStatus.FORBIDDEN);
          return;
        }
      }

      const user = await this.userService.updateUser(id, data as UpdateUserDTO);
      sendSuccess(res, user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, ErrorCode.VALIDATION_ERROR, error.errors[0].message, HttpStatus.BAD_REQUEST);
      } else if (error instanceof Error) {
        if (error.message === 'Usuario no encontrado') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al actualizar usuario', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Delete user
  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;

      // Prevent user from deleting themselves
      if (req.user?.userId === id) {
        sendError(res, ErrorCode.FORBIDDEN, 'No puedes eliminar tu propia cuenta', HttpStatus.FORBIDDEN);
        return;
      }

      await this.userService.deleteUser(id);
      sendSuccess(res, { message: 'Usuario eliminado correctamente' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Usuario no encontrado') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al eliminar usuario', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Toggle user status
  async toggleUserStatus(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;

      // Prevent user from deactivating themselves
      if (req.user?.userId === id) {
        sendError(res, ErrorCode.FORBIDDEN, 'No puedes cambiar el estado de tu propia cuenta', HttpStatus.FORBIDDEN);
        return;
      }

      const user = await this.userService.toggleUserStatus(id);
      sendSuccess(res, user);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Usuario no encontrado') {
          sendError(res, ErrorCode.NOT_FOUND, error.message, HttpStatus.NOT_FOUND);
        } else {
          sendError(res, ErrorCode.BAD_REQUEST, error.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al cambiar estado del usuario', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  // Get users stats
  async getUsersStats(req: AuthRequest, res: Response) {
    try {
      const stats = await this.userService.getUsersStats();
      sendSuccess(res, stats);
    } catch (error) {
      if (error instanceof Error) {
        sendError(res, ErrorCode.INTERNAL_ERROR, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        sendError(res, ErrorCode.INTERNAL_ERROR, 'Error al obtener estadísticas de usuarios', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
