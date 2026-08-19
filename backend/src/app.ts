import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { healthRoutes } from './routes/health';
import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';
import { customerRoutes } from './routes/customers';
import { saleRoutes } from './routes/sales';
import { dashboardRoutes } from './routes/dashboard';
import { formatErrorResponse } from './utils/errors';

export const createApp = () => {
  return new Elysia()
    .use(
      cors({
        origin: true,
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
      })
    )
    .use(
      openapi({
        documentation: {
          info: {
            title: 'Sales / POS Dashboard API',
            version: '1.0.0',
            description: 'REST API documentation for Sales & POS Management System'
          }
        }
      })
    )
    .onError(({ error, set }) => {
      const formatted = formatErrorResponse(error);
      set.status = formatted.status;
      return formatted.body;
    })
    .use(healthRoutes)
    .group('/api/v1', (app) =>
      app
        .use(authRoutes)
        .use(productRoutes)
        .use(customerRoutes)
        .use(saleRoutes)
        .use(dashboardRoutes)
    );
};

export const app = createApp();
