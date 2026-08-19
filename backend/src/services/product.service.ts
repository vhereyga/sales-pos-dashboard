import { prisma } from '../db';
import { validateProductInput, ProductInput } from '../utils/validators';
import { parsePaginationParams, buildPaginatedResult } from '../utils/pagination';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';

export class ProductService {
  static async getAll(query: { page?: string | number; limit?: string | number; search?: string; isActive?: string }) {
    const pagination = parsePaginationParams(query);
    const where: any = {};

    if (query.search && query.search.trim() !== '') {
      const q = query.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } }
      ];
    }

    if (query.isActive !== undefined && query.isActive !== '') {
      where.isActive = query.isActive === 'true';
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return buildPaginatedResult(data, total, pagination);
  }

  static async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id }
    });
    if (!product) {
      throw new NotFoundError('Produk tidak ditemukan');
    }
    return product;
  }

  static async create(input: Partial<ProductInput>) {
    const validated = validateProductInput(input);

    const existingSku = await prisma.product.findUnique({
      where: { sku: validated.sku }
    });
    if (existingSku) {
      throw new ConflictError(`SKU "${validated.sku}" sudah digunakan produk lain`);
    }

    return prisma.product.create({
      data: validated
    });
  }

  static async update(id: string, input: Partial<ProductInput>) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Produk tidak ditemukan');
    }

    const merged = {
      sku: input.sku ?? existing.sku,
      name: input.name ?? existing.name,
      price: input.price ?? existing.price,
      stock: input.stock ?? existing.stock,
      isActive: input.isActive ?? existing.isActive
    };

    const validated = validateProductInput(merged);

    if (validated.sku !== existing.sku) {
      const skuCheck = await prisma.product.findUnique({ where: { sku: validated.sku } });
      if (skuCheck) {
        throw new ConflictError(`SKU "${validated.sku}" sudah digunakan produk lain`);
      }
    }

    return prisma.product.update({
      where: { id },
      data: validated
    });
  }

  static async delete(id: string) {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { _count: { select: { saleItems: true } } }
    });

    if (!existing) {
      throw new NotFoundError('Produk tidak ditemukan');
    }

    // If referenced in transactions, soft-delete by setting isActive = false
    if (existing._count.saleItems > 0) {
      return prisma.product.update({
        where: { id },
        data: { isActive: false }
      });
    }

    return prisma.product.delete({
      where: { id }
    });
  }
}
