import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export class ApiResponseBuilder {
  static success<T>(data: T, meta?: ApiResponse<T>['meta']): ApiResponse<T> {
    const response: ApiResponse<T> = {
      success: true,
      data,
    };
    if (meta) {
      response.meta = meta;
    }
    return response;
  }

  static error(code: string, message: string, details?: unknown): ApiResponse {
    const error: { code: string; message: string; details?: unknown } = {
      code,
      message,
    };
    if (details !== undefined) {
      error.details = details;
    }
    return {
      success: false,
      error,
    };
  }

  static paginated<T>(
    data: T,
    page: number,
    limit: number,
    total: number
  ): ApiResponse<T> {
    return {
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: ApiResponse<T>['meta']
): void {
  res.status(statusCode).json(ApiResponseBuilder.success(data, meta));
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: unknown
): void {
  res.status(statusCode).json(ApiResponseBuilder.error(code, message, details));
}

export function sendPaginated<T>(
  res: Response,
  data: T,
  page: number,
  limit: number,
  total: number,
  statusCode: number = 200
): void {
  res.status(statusCode).json(ApiResponseBuilder.paginated(data, page, limit, total));
}

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ErrorCode = {
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;
