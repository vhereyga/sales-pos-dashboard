export interface ErrorDetail {
  field?: string;
  message: string;
}

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: ErrorDetail[];

  constructor(message: string, statusCode = 400, code = 'BAD_REQUEST', details?: ErrorDetail[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Request tidak valid', details?: ErrorDetail[]) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Belum terautentikasi') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Tidak memiliki izin') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource tidak ditemukan') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Konflik data atau SKU duplikat') {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export function formatErrorResponse(error: any) {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details && error.details.length > 0 ? { details: error.details } : {})
        }
      }
    };
  }

  // Handle Prisma unique constraint errors (P2002)
  if (error?.code === 'P2002') {
    const fields = error.meta?.target ? (Array.isArray(error.meta.target) ? error.meta.target.join(', ') : error.meta.target) : 'field';
    return {
      status: 409,
      body: {
        error: {
          code: 'CONFLICT_ERROR',
          message: `Nilai ${fields} sudah digunakan`,
          details: [{ field: String(fields), message: `${fields} harus unik` }]
        }
      }
    };
  }

  // Generic internal server error
  return {
    status: error?.status || 500,
    body: {
      error: {
        code: error?.code || 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Terjadi kesalahan pada server'
      }
    }
  };
}
