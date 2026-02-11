import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// Verify JWT token (required)
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token no proporcionado',
        },
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token inválido o expirado',
      },
    });
  }
};

// Optional JWT token (does not fail if no token)
export const optionalAuthMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwt.secret) as {
        userId: string;
        role: string;
      };
      req.user = decoded;
    }
    // Continue regardless of token presence
    next();
  } catch (error) {
    // Log error but continue (token might be invalid but that's ok for optional auth)

    next();
  }
};

// Check if user is admin
export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'No autorizado',
      },
    });
  }

  if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Acceso denegado',
      },
    });
  }

  next();
};

export { AuthRequest };
