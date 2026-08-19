import { Elysia } from 'elysia';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { CustomerService } from '../services/customer.service';

export const customerRoutes = new Elysia({ prefix: '/customers' })
  .use(authMiddleware)
  .get('/', async ({ query }) => {
    const result = await CustomerService.getAll(query as any);
    return {
      data: result.data,
      meta: result.meta
    };
  })
  .post('/', async ({ body, set }) => {
    const customer = await CustomerService.create(body as any);
    set.status = 201;
    return { data: customer };
  })
  .get('/:id', async ({ params: { id } }) => {
    const customer = await CustomerService.getById(id);
    return { data: customer };
  })
  .patch('/:id', async ({ params: { id }, body }) => {
    const customer = await CustomerService.update(id, body as any);
    return { data: customer };
  })
  .delete('/:id', async ({ params: { id }, user, set }) => {
    requireAdmin(user.role);
    await CustomerService.delete(id);
    set.status = 204;
    return;
  });
