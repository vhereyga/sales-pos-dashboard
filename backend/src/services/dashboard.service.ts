import { prisma } from '../db';

export class DashboardService {
  static async getSummary() {
    const [salesAggregate, transactionCount, productCount, customerCount] = await Promise.all([
      prisma.sale.aggregate({
        _sum: { totalAmount: true }
      }),
      prisma.sale.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.customer.count()
    ]);

    return {
      totalSales: salesAggregate._sum.totalAmount || 0,
      transactionCount,
      productCount,
      customerCount
    };
  }

  static async getRecentSales(limit = 5) {
    return prisma.sale.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        user: { select: { id: true, name: true } },
        _count: { select: { items: true } }
      }
    });
  }

  static async getSalesTrend() {
    // Retrieve sales grouped by date for the last 30 days
    const sales = await prisma.sale.findMany({
      select: {
        createdAt: true,
        totalAmount: true
      },
      orderBy: { createdAt: 'asc' }
    });

    const trendMap = new Map<string, { date: string; totalSales: number; count: number }>();

    for (const sale of sales) {
      const dateStr = sale.createdAt.toISOString().slice(0, 10);
      const existing = trendMap.get(dateStr) || { date: dateStr, totalSales: 0, count: 0 };
      existing.totalSales = Number((existing.totalSales + sale.totalAmount).toFixed(2));
      existing.count += 1;
      trendMap.set(dateStr, existing);
    }

    return Array.from(trendMap.values());
  }
}
