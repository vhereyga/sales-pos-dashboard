import { describe, expect, it } from 'bun:test';
import {
  validateProductInput,
  validateSaleItemInput,
  calculateSubtotal,
  calculateGrandTotal,
  checkStockAvailability
} from '../../src/utils/validators';
import { parsePaginationParams, buildPaginatedResult } from '../../src/utils/pagination';
import { ValidationError, formatErrorResponse, NotFoundError } from '../../src/utils/errors';
import { hashPassword, verifyPassword } from '../../src/utils/auth';

describe('Unit Tests - Sales/POS Dashboard (TEST-U01..U08)', () => {
  // TEST-U01: Product validation
  describe('TEST-U01: Validasi produk', () => {
    it('harus menolak produk jika harga negatif', () => {
      expect(() => {
        validateProductInput({ sku: 'SKU-TEST', name: 'Test Product', price: -5000, stock: 10 });
      }).toThrow(ValidationError);
    });

    it('harus menolak produk jika stok negatif', () => {
      expect(() => {
        validateProductInput({ sku: 'SKU-TEST', name: 'Test Product', price: 5000, stock: -2 });
      }).toThrow(ValidationError);
    });

    it('harus menolak produk jika SKU kosong', () => {
      expect(() => {
        validateProductInput({ sku: '   ', name: 'Test Product', price: 5000, stock: 10 });
      }).toThrow(ValidationError);
    });

    it('harus me-return objek tervalidasi jika data benar', () => {
      const result = validateProductInput({ sku: 'SKU-001 ', name: ' Mechanical Keyboard ', price: 500000, stock: 15 });
      expect(result.sku).toBe('SKU-001');
      expect(result.name).toBe('Mechanical Keyboard');
      expect(result.price).toBe(500000);
      expect(result.stock).toBe(15);
      expect(result.isActive).toBe(true);
    });
  });

  // TEST-U02: Validasi sale item
  describe('TEST-U02: Validasi sale item', () => {
    it('harus menolak item jika quantity <= 0', () => {
      expect(() => {
        validateSaleItemInput({ productId: 'prod_123', quantity: 0 });
      }).toThrow(ValidationError);

      expect(() => {
        validateSaleItemInput({ productId: 'prod_123', quantity: -5 });
      }).toThrow(ValidationError);
    });

    it('harus menerima item jika quantity >= 1', () => {
      const result = validateSaleItemInput({ productId: 'prod_123', quantity: 3 });
      expect(result.productId).toBe('prod_123');
      expect(result.quantity).toBe(3);
    });
  });

  // TEST-U03: Kalkulasi subtotal
  describe('TEST-U03: Kalkulasi subtotal', () => {
    it('harus menghitung subtotal = quantity * unitPrice secara tepat', () => {
      const subtotal = calculateSubtotal(3, 150000);
      expect(subtotal).toBe(450000);
    });

    it('harus menangani desimal harga dengan tepat', () => {
      const subtotal = calculateSubtotal(2, 99.99);
      expect(subtotal).toBe(199.98);
    });
  });

  // TEST-U04: Kalkulasi grand total
  describe('TEST-U04: Kalkulasi grand total', () => {
    it('harus menjumlahkan seluruh subtotal item', () => {
      const items = [{ subtotal: 100000 }, { subtotal: 250000 }, { subtotal: 50000 }];
      const grandTotal = calculateGrandTotal(items);
      expect(grandTotal).toBe(400000);
    });
  });

  // TEST-U05: Business rule stok
  describe('TEST-U05: Business rule stok', () => {
    it('harus melempar error jika requested quantity > current stock', () => {
      expect(() => {
        checkStockAvailability(10, 5, 'Keyboard');
      }).toThrow(ValidationError);
    });

    it('tidak melempar error jika stok mencukupi', () => {
      expect(() => {
        checkStockAvailability(3, 5, 'Keyboard');
      }).not.toThrow();
    });
  });

  // TEST-U06: Utility pagination
  describe('TEST-U06: Utility pagination', () => {
    it('harus menggunakan default page=1 dan limit=10 jika parameter tidak diberikan', () => {
      const params = parsePaginationParams({});
      expect(params.page).toBe(1);
      expect(params.limit).toBe(10);
      expect(params.skip).toBe(0);
    });

    it('harus membatasi limit maksimal 100', () => {
      const params = parsePaginationParams({ page: 2, limit: 500 });
      expect(params.page).toBe(2);
      expect(params.limit).toBe(100);
      expect(params.skip).toBe(100);
    });

    it('harus menyusun paginated result metadata dengan benar', () => {
      const items = [1, 2, 3];
      const result = buildPaginatedResult(items, 25, { page: 1, limit: 10, skip: 0 });
      expect(result.data).toHaveLength(3);
      expect(result.meta.total).toBe(25);
      expect(result.meta.totalPages).toBe(3);
    });
  });

  // TEST-U07: Error mapping
  describe('TEST-U07: Error mapping', () => {
    it('harus memetakan AppError ke format respons JSON standar', () => {
      const err = new NotFoundError('Barang hilang');
      const res = formatErrorResponse(err);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(res.body.error.message).toBe('Barang hilang');
    });

    it('harus memetakan ValidationError dengan details', () => {
      const err = new ValidationError('Payload invalid', [{ field: 'price', message: 'Min 0' }]);
      const res = formatErrorResponse(err);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toEqual([{ field: 'price', message: 'Min 0' }]);
    });
  });

  // TEST-U08: Auth helper
  describe('TEST-U08: Auth helper', () => {
    it('harus me-hash dan memverifikasi password dengan benar', async () => {
      const plain = 'secret123';
      const hash = await hashPassword(plain);

      expect(hash).not.toBe(plain);
      const isMatch = await verifyPassword(plain, hash);
      expect(isMatch).toBe(true);

      const isWrong = await verifyPassword('wrongpassword', hash);
      expect(isWrong).toBe(false);
    });

    it('harus menolak password kurang dari 6 karakter saat hashing', async () => {
      expect(hashPassword('123')).rejects.toThrow();
    });
  });
});
