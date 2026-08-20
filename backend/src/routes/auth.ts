import { Elysia } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { AuthService } from '../services/auth.service';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'sales-pos-dashboard-secret-key-2026'
    })
  )
  .post('/login', async ({ body, jwt, set }: any) => {
    const { email, username, password } = body || {};
    const identifier = email || username;

    const user = await AuthService.login(identifier, password);
    const token = await jwt.sign({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    set.status = 200;
    return {
      data: {
        token,
        user
      }
    };
  });
