import { Elysia } from 'elysia';

export const healthRoutes = new Elysia()
  .get('/health', () => ({
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  }));
