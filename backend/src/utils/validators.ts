import { ValidationError, ErrorDetail } from './errors';

export interface ProductInput {
  sku: string;
  name: string;
  price: number;
  stock: number;
  isActive?: boolean;
}

export interface SaleItemInput {
  productId: string;
  quantity: number;
}

export function validateProductInput(input: Partial<ProductInput>): ProductInput {
  const details: ErrorDetail[] = [];

  if (!input.sku || input.sku.trim() === '') {
    details.push({ field: 'sku', message: 'SKU tidak boleh kosong' });
  }

  if (!input.name || input.name.trim() === '') {
    details.push({ field: 'name', message: 'Nama produk tidak boleh kosong' });
  }

  if (input.price === undefined || input.price === null || isNaN(input.price) || input.price < 0) {
    details.push({ field: 'price', message: 'Harga produk tidak boleh negatif' });
  }

  if (input.stock === undefined || input.stock === null || isNaN(input.stock) || input.stock < 0) {
    details.push({ field: 'stock', message: 'Stok produk tidak boleh negatif' });
  }

  if (details.length > 0) {
    throw new ValidationError('Validasi produk gagal', details);
  }

  return {
    sku: input.sku!.trim(),
    name: input.name!.trim(),
    price: Number(input.price),
    stock: Math.floor(Number(input.stock)),
    isActive: input.isActive !== undefined ? Boolean(input.isActive) : true
  };
}

export function validateSaleItemInput(item: any): SaleItemInput {
  const details: ErrorDetail[] = [];

  if (!item.productId || typeof item.productId !== 'string' || item.productId.trim() === '') {
    details.push({ field: 'productId', message: 'Product ID wajib diisi' });
  }

  const qty = Number(item.quantity);
  if (isNaN(qty) || qty <= 0) {
    details.push({ field: 'quantity', message: 'Kuantitas item harus minimal 1' });
  }

  if (details.length > 0) {
    throw new ValidationError('Validasi sale item gagal', details);
  }

  return {
    productId: item.productId.trim(),
    quantity: Math.floor(qty)
  };
}

export function calculateSubtotal(quantity: number, unitPrice: number): number {
  if (quantity <= 0) {
    throw new ValidationError('Kuantitas item harus minimal 1');
  }
  if (unitPrice < 0) {
    throw new ValidationError('Harga produk tidak boleh negatif');
  }
  return Number((quantity * unitPrice).toFixed(2));
}

export function calculateGrandTotal(items: { subtotal: number }[]): number {
  const total = items.reduce((acc, curr) => acc + curr.subtotal, 0);
  return Number(total.toFixed(2));
}

export function checkStockAvailability(requestedQty: number, currentStock: number, productName?: string) {
  if (requestedQty > currentStock) {
    const name = productName ? ` "${productName}"` : '';
    throw new ValidationError(`Stok produk${name} tidak mencukupi. Stok tersedia: ${currentStock}, diminta: ${requestedQty}`);
  }
}
