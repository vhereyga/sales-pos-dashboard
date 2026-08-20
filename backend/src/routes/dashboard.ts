import { Elysia } from 'elysia';
import { authMiddleware } from '../middleware/auth';
import { DashboardService } from '../services/dashboard.service';

export const dashboardRoutes = new Elysia({ prefix: '/dashboard' })
  .use(authMiddleware)
  .get('/summary', async () => {
    const summary = await DashboardService.getSummary();
    return { data: summary };
  })
  .get('/recent-sales', async ({ query }: any) => {
    const limit = query?.limit ? Number(query.limit) : 5;
    const recent = await DashboardService.getRecentSales(limit);
    return { data: recent };
  })
  .get('/sales-trend', async () => {
    const trend = await DashboardService.getSalesTrend();
    return { data: trend };
  });
