import { Elysia } from 'elysia';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { ProductService } from '../services/product.service';

export const productRoutes = new Elysia({ prefix: '/products' })
  .use(authMiddleware)
  .get('/', async ({ query }) => {
    const result = await ProductService.getAll(query as any);
    return {
      data: result.data,
      meta: result.meta
    };
  })
  .post('/', async ({ body, user, set }) => {
    requireAdmin(user.role);
    const product = await ProductService.create(body as any);
    set.status = 201;
    return { data: product };
  })
  .get('/:id', async ({ params: { id } }) => {
    const product = await ProductService.getById(id);
    return { data: product };
  })
  .patch('/:id', async ({ params: { id }, body, user }) => {
    requireAdmin(user.role);
    const product = await ProductService.update(id, body as any);
    return { data: product };
  })
  .delete('/:id', async ({ params: { id }, user, set }) => {
    requireAdmin(user.role);
    await ProductService.delete(id);
    set.status = 204;
    return;
  });
