import { prisma } from '../db';
import { validateSaleItemInput, calculateSubtotal, calculateGrandTotal, checkStockAvailability } from '../utils/validators';
import { parsePaginationParams, buildPaginatedResult } from '../utils/pagination';
import { NotFoundError, ValidationError } from '../utils/errors';

export interface CreateSaleInput {
  customerId?: string | null;
  items: Array<{ productId: string; quantity: number }>;
}

export class SaleService {
  static generateInvoiceNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `INV-${dateStr}-${rand}`;
  }

  static async createSale(userId: string, input: CreateSaleInput) {
    if (!input || !Array.isArray(input.items) || input.items.length === 0) {
      throw new ValidationError('Transaksi harus memiliki minimal 1 item produk');
    }

    // Validate each item structure
    const validatedItems = input.items.map(item => validateSaleItemInput(item));

    // Execute atomic transaction
    return prisma.$transaction(async (tx) => {
      // 1. Verify customer if provided
      if (input.customerId) {
        const customer = await tx.customer.findUnique({ where: { id: input.customerId } });
        if (!customer) {
          throw new NotFoundError('Pelanggan tidak ditemukan');
        }
      }

      // 2. Fetch all required products and check stock
      const productIds = validatedItems.map(item => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } }
      });

      const productMap = new Map(products.map(p => [p.id, p]));
      const preparedSaleItems: Array<{
        productId: string;
        quantity: number;
        unitPrice: number;
        subtotal: number;
      }> = [];

      for (const item of validatedItems) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new NotFoundError(`Produk dengan ID "${item.productId}" tidak ditemukan`);
        }

        if (!product.isActive) {
          throw new ValidationError(`Produk "${product.name}" sedang tidak aktif`);
        }

        // Check stock availability
        checkStockAvailability(item.quantity, product.stock, product.name);

        const subtotal = calculateSubtotal(item.quantity, product.price);
        preparedSaleItems.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal
        });
      }

      // 3. Calculate grand total on server
      const grandTotal = calculateGrandTotal(preparedSaleItems);
      const invoiceNo = SaleService.generateInvoiceNumber();

      // 4. Create Sale Record
      const sale = await tx.sale.create({
        data: {
          invoiceNo,
          customerId: input.customerId || null,
          userId,
          totalAmount: grandTotal,
          items: {
            create: preparedSaleItems
          }
        },
        include: {
          items: {
            include: { product: true }
          },
          customer: true,
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      });

      // 5. Atomically decrement stock for each item
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity }
          }
        });
      }

      return sale;
    });
  }

  static async getAll(query: { page?: string | number; limit?: string | number; search?: string; customerId?: string }) {
    const pagination = parsePaginationParams(query);
    const where: any = {};

    if (query.search && query.search.trim() !== '') {
      const q = query.search.trim();
      where.OR = [
        { invoiceNo: { contains: q, mode: 'insensitive' } },
        { customer: { name: { contains: q, mode: 'insensitive' } } }
      ];
    }

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    const [data, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          user: { select: { id: true, name: true, role: true } },
          _count: { select: { items: true } }
        }
      }),
      prisma.sale.count({ where })
    ]);

    return buildPaginatedResult(data, total, pagination);
  }

  static async getById(id: string) {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        user: { select: { id: true, name: true, email: true, role: true } },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!sale) {
      throw new NotFoundError('Transaksi penjualan tidak ditemukan');
    }

    return sale;
  }

  static async delete(id: string) {
    const existing = await prisma.sale.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Transaksi tidak ditemukan');
    }

    return prisma.sale.delete({
      where: { id }
    });
  }
}
