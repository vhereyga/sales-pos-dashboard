import { Elysia } from 'elysia';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { ProductService } from '../services/product.service';

export const productRoutes = new Elysia({ prefix: '/products' })
  .use(authMiddleware)
  .get('/', async ({ query }: any) => {
    const result = await ProductService.getAll(query || {});
    return {
      data: result.data,
      meta: result.meta
    };
  })
  .post('/', async ({ body, user, set }: any) => {
    requireAdmin(user?.role);
    const product = await ProductService.create(body || {});
    set.status = 201;
    return { data: product };
  })
  .get('/:id', async ({ params: { id } }: any) => {
    const product = await ProductService.getById(id);
    return { data: product };
  })
  .patch('/:id', async ({ params: { id }, body, user }: any) => {
    requireAdmin(user?.role);
    const product = await ProductService.update(id, body || {});
    return { data: product };
  })
  .delete('/:id', async ({ params: { id }, user, set }: any) => {
    requireAdmin(user?.role);
    await ProductService.delete(id);
    set.status = 204;
    return;
  });
