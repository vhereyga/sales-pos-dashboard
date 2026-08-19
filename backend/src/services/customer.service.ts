import { prisma } from '../db';
import { parsePaginationParams, buildPaginatedResult } from '../utils/pagination';
import { NotFoundError, ConflictError, ValidationError, ErrorDetail } from '../utils/errors';

export interface CustomerInput {
  name: string;
  email?: string | null;
  phone?: string | null;
}

export function validateCustomerInput(input: Partial<CustomerInput>): CustomerInput {
  const details: ErrorDetail[] = [];

  if (!input.name || input.name.trim() === '') {
    details.push({ field: 'name', message: 'Nama pelanggan tidak boleh kosong' });
  }

  let email: string | null = null;
  if (input.email && input.email.trim() !== '') {
    const trimmedEmail = input.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      details.push({ field: 'email', message: 'Format email pelanggan tidak valid' });
    } else {
      email = trimmedEmail;
    }
  }

  if (details.length > 0) {
    throw new ValidationError('Validasi pelanggan gagal', details);
  }

  return {
    name: input.name!.trim(),
    email,
    phone: input.phone ? input.phone.trim() : null
  };
}

export class CustomerService {
  static async getAll(query: { page?: string | number; limit?: string | number; search?: string }) {
    const pagination = parsePaginationParams(query);
    const where: any = {};

    if (query.search && query.search.trim() !== '') {
      const q = query.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    return buildPaginatedResult(data, total, pagination);
  }

  static async getById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id }
    });
    if (!customer) {
      throw new NotFoundError('Pelanggan tidak ditemukan');
    }
    return customer;
  }

  static async create(input: Partial<CustomerInput>) {
    const validated = validateCustomerInput(input);

    if (validated.email) {
      const existing = await prisma.customer.findUnique({
        where: { email: validated.email }
      });
      if (existing) {
        throw new ConflictError(`Email "${validated.email}" sudah digunakan pelanggan lain`);
      }
    }

    return prisma.customer.create({
      data: validated
    });
  }

  static async update(id: string, input: Partial<CustomerInput>) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Pelanggan tidak ditemukan');
    }

    const merged = {
      name: input.name ?? existing.name,
      email: input.email !== undefined ? input.email : existing.email,
      phone: input.phone !== undefined ? input.phone : existing.phone
    };

    const validated = validateCustomerInput(merged);

    if (validated.email && validated.email !== existing.email) {
      const emailCheck = await prisma.customer.findUnique({ where: { email: validated.email } });
      if (emailCheck) {
        throw new ConflictError(`Email "${validated.email}" sudah digunakan pelanggan lain`);
      }
    }

    return prisma.customer.update({
      where: { id },
      data: validated
    });
  }

  static async delete(id: string) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Pelanggan tidak ditemukan');
    }

    return prisma.customer.delete({
      where: { id }
    });
  }
}
