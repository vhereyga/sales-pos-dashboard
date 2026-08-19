import { Elysia } from 'elysia';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { SaleService } from '../services/sale.service';

export const saleRoutes = new Elysia({ prefix: '/sales' })
  .use(authMiddleware)
  .get('/', async ({ query }) => {
    const result = await SaleService.getAll(query as any);
    return {
      data: result.data,
      meta: result.meta
    };
  })
  .post('/', async ({ body, user, set }) => {
    const sale = await SaleService.createSale(user.id, body as any);
    set.status = 201;
    return { data: sale };
  })
  .get('/:id', async ({ params: { id } }) => {
    const sale = await SaleService.getById(id);
    return { data: sale };
  })
  .delete('/:id', async ({ params: { id }, user, set }) => {
    requireAdmin(user.role);
    await SaleService.delete(id);
    set.status = 204;
    return;
  });
