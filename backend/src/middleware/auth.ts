import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';

export const authMiddleware = new Elysia({ name: 'auth-middleware' })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'sales-pos-dashboard-secret-key-2026'
    })
  )
  .derive({ as: 'scoped' }, async ({ jwt, headers }) => {
    const authHeader = headers['authorization'] || headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token autentikasi tidak ditemukan');
    }

    const token = authHeader.substring(7);
    const payload = (await jwt.verify(token)) as any;

    if (!payload || !payload.sub) {
      throw new UnauthorizedError('Token autentikasi tidak valid atau kadaluarsa');
    }

    return {
      user: {
        id: String(payload.sub),
        name: String(payload.name),
        email: String(payload.email),
        role: String(payload.role)
      }
    };
  });

export function requireAdmin(userRole?: string) {
  if (userRole !== 'ADMIN') {
    throw new ForbiddenError('Akses hanya untuk Admin');
  }
}
