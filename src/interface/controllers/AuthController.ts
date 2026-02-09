import { Request, Response } from 'express';
import { AuthService } from '../../application/services/AuthService';
import {
  registerCustomerSchema,
  loginCustomerSchema,
  loginAdminSchema,
} from '../../application/dtos/auth.dto';

const authService = new AuthService();

export class AuthController {
  // Customer Registration
  async registerCustomer(req: Request, res: Response) {
    try {
      const data = registerCustomerSchema.parse(req.body);
      const result = await authService.registerCustomer(data);

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message || 'Error al registrar usuario',
        },
      });
    }
  }

  // Customer Login
  async loginCustomer(req: Request, res: Response) {
    try {
      const data = loginCustomerSchema.parse(req.body);
      const result = await authService.loginCustomer(data);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: {
          message: error.message || 'Error al iniciar sesión',
        },
      });
    }
  }

  // Admin Login
  async loginAdmin(req: Request, res: Response) {
    try {
      const data = loginAdminSchema.parse(req.body);
      const result = await authService.loginAdmin(data);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: {
          message: error.message || 'Error al iniciar sesión',
        },
      });
    }
  }

  // Refresh Token
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Refresh token requerido',
          },
        });
      }

      const result = await authService.refreshToken(refreshToken);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: {
          message: error.message || 'Token inválido',
        },
      });
    }
  }
}
