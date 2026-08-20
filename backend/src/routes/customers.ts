import { Elysia } from 'elysia';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { CustomerService } from '../services/customer.service';

export const customerRoutes = new Elysia({ prefix: '/customers' })
  .use(authMiddleware)
  .get('/', async ({ query }: any) => {
    const result = await CustomerService.getAll(query || {});
    return {
      data: result.data,
      meta: result.meta
    };
  })
  .post('/', async ({ body, set }: any) => {
    const customer = await CustomerService.create(body || {});
    set.status = 201;
    return { data: customer };
  })
  .get('/:id', async ({ params: { id } }: any) => {
    const customer = await CustomerService.getById(id);
    return { data: customer };
  })
  .patch('/:id', async ({ params: { id }, body }: any) => {
    const customer = await CustomerService.update(id, body || {});
    return { data: customer };
  })
  .delete('/:id', async ({ params: { id }, user, set }: any) => {
    requireAdmin(user?.role);
    await CustomerService.delete(id);
    set.status = 204;
    return;
  });
