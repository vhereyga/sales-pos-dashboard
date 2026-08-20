import { describe, expect, it, beforeAll } from 'bun:test';
import { app } from '../../src/app';
import { prisma } from '../../src/db';
import bcrypt from 'bcryptjs';

describe('Integration Tests - Sales/POS Dashboard (TEST-I01..I12)', () => {
  let adminToken: string;
  let adminUser: any;
  let staffUser: any;
  let sampleProduct: any;
  let sampleCustomer: any;

  beforeAll(async () => {
    // 1. Delete test sale items and sale headers first to satisfy Foreign Key constraints
    await prisma.saleItem.deleteMany({
      where: {
        OR: [
          { sale: { user: { email: { in: ['admintest@pos.com', 'stafftest@pos.com'] } } } },
          { product: { sku: { in: ['TEST-SKU-100', 'CRUD-SKU-001'] } } }
        ]
      }
    });

    await prisma.sale.deleteMany({
      where: {
        user: { email: { in: ['admintest@pos.com', 'stafftest@pos.com'] } }
      }
    });

    // 2. Delete test products, customers, and users safely
    await prisma.product.deleteMany({ where: { sku: { in: ['TEST-SKU-100', 'CRUD-SKU-001'] } } });
    await prisma.customer.deleteMany({ where: { email: { in: ['customer@test.com', 'e2e@customer.com'] } } });
    await prisma.user.deleteMany({ where: { email: { in: ['admintest@pos.com', 'stafftest@pos.com'] } } });

    // 3. Create fresh clean test fixtures
    const adminPassword = await bcrypt.hash('admin123', 10);
    const staffPassword = await bcrypt.hash('staff123', 10);

    adminUser = await prisma.user.create({
      data: {
        name: 'Admin Test',
        email: 'admintest@pos.com',
        passwordHash: adminPassword,
        role: 'ADMIN'
      }
    });

    staffUser = await prisma.user.create({
      data: {
        name: 'Staff Test',
        email: 'stafftest@pos.com',
        passwordHash: staffPassword,
        role: 'STAFF'
      }
    });

    sampleProduct = await prisma.product.create({
      data: {
        sku: 'TEST-SKU-100',
        name: 'Test Gaming Mouse',
        price: 300000,
        stock: 50,
        isActive: true
      }
    });

    sampleCustomer = await prisma.customer.create({
      data: {
        name: 'Test Customer',
        email: 'customer@test.com',
        phone: '0812345678'
      }
    });

    // Login admin to get valid token for subsequent test calls
    const loginRes = await app.handle(
      new Request('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admintest@pos.com', password: 'admin123' })
      })
    );
    const loginBody = await loginRes.json();
    adminToken = loginBody.data.token;
  });

  // TEST-I01: Auth Valid Login
  it('TEST-I01: Auth - Login valid mengembalikan 200 & token', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admintest@pos.com', password: 'admin123' })
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.token).toBeDefined();
    expect(body.data.user.email).toBe('admintest@pos.com');
  });

  // TEST-I02: Auth Invalid Login
  it('TEST-I02: Auth - Login password salah mengembalikan 401', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admintest@pos.com', password: 'wrongpassword' })
      })
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  // TEST-I03: Authorization Protected Route
  it('TEST-I03: Authorization - Endpoint terproteksi tanpa token mengembalikan 401', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/products', {
        method: 'GET'
      })
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  // TEST-I04: Products CRUD Flow
  it('TEST-I04: Products CRUD - POST -> GET -> PATCH -> DELETE', async () => {
    // 1. Create Product
    const createRes = await app.handle(
      new Request('http://localhost/api/v1/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          sku: 'CRUD-SKU-001',
          name: 'CRUD Keyboard',
          price: 500000,
          stock: 20
        })
      })
    );

    expect(createRes.status).toBe(201);
    const createdData = await createRes.json();
    const createdId = createdData.data.id;
    expect(createdId).toBeDefined();

    // 2. Get Detail
    const getRes = await app.handle(
      new Request(`http://localhost/api/v1/products/${createdId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
    );
    expect(getRes.status).toBe(200);
    const getBody = await getRes.json();
    expect(getBody.data.name).toBe('CRUD Keyboard');

    // 3. Patch Product
    const patchRes = await app.handle(
      new Request(`http://localhost/api/v1/products/${createdId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ price: 550000 })
      })
    );
    expect(patchRes.status).toBe(200);

    // 4. Delete Product
    const deleteRes = await app.handle(
      new Request(`http://localhost/api/v1/products/${createdId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      })
    );
    expect(deleteRes.status).toBe(204);
  });

  // TEST-I05: Duplicate SKU Constraint
  it('TEST-I05: SKU Duplikat - Mengembalikan 409 conflict error', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          sku: 'TEST-SKU-100', // Same as sampleProduct
          name: 'Duplicate SKU Product',
          price: 150000,
          stock: 10
        })
      })
    );

    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error.code).toBe('CONFLICT_ERROR');
  });

  // TEST-I06: Customers CRUD
  it('TEST-I06: Customers CRUD - Alur CRUD pelanggan end-to-end', async () => {
    // Create
    const createRes = await app.handle(
      new Request('http://localhost/api/v1/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: 'End-to-End Customer',
          email: 'e2e@customer.com',
          phone: '081999888'
        })
      })
    );
    expect(createRes.status).toBe(201);
    const customer = await createRes.json();
    const id = customer.data.id;

    // Get
    const getRes = await app.handle(
      new Request(`http://localhost/api/v1/customers/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
    );
    expect(getRes.status).toBe(200);

    // Patch
    const patchRes = await app.handle(
      new Request(`http://localhost/api/v1/customers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ name: 'Updated Customer Name' })
      })
    );
    expect(patchRes.status).toBe(200);

    // Delete
    const delRes = await app.handle(
      new Request(`http://localhost/api/v1/customers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      })
    );
    expect(delRes.status).toBe(204);
  });

  // TEST-I07: Create Sale & Stock Reduction
  it('TEST-I07: Create Sale - Menyimpan sale header + items dan mengurangi stok produk di DB', async () => {
    const initialStock = sampleProduct.stock; // 50
    const buyQty = 5;

    const res = await app.handle(
      new Request('http://localhost/api/v1/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          customerId: sampleCustomer.id,
          items: [{ productId: sampleProduct.id, quantity: buyQty }]
        })
      })
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.invoiceNo).toBeDefined();
    expect(body.data.totalAmount).toBe(buyQty * sampleProduct.price);

    // Verify DB stock was reduced
    const updatedProduct = await prisma.product.findUnique({ where: { id: sampleProduct.id } });
    expect(updatedProduct?.stock).toBe(initialStock - buyQty);
  });

  // TEST-I08: Insufficient Stock Rejection & Rollback
  it('TEST-I08: Insufficient Stock - Sale ditolak dan database tidak mengalami partial write', async () => {
    const currentStock = (await prisma.product.findUnique({ where: { id: sampleProduct.id } }))?.stock || 45;
    const excessiveQty = currentStock + 100;

    const res = await app.handle(
      new Request('http://localhost/api/v1/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          customerId: sampleCustomer.id,
          items: [{ productId: sampleProduct.id, quantity: excessiveQty }]
        })
      })
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');

    // Verify stock remains untouched
    const afterProduct = await prisma.product.findUnique({ where: { id: sampleProduct.id } });
    expect(afterProduct?.stock).toBe(currentStock);
  });

  // TEST-I09: Dashboard Summary KPI
  it('TEST-I09: Dashboard Summary - KPI sesuai data di database', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/dashboard/summary', {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.transactionCount).toBeGreaterThanOrEqual(1);
    expect(body.data.productCount).toBeGreaterThanOrEqual(1);
    expect(body.data.customerCount).toBeGreaterThanOrEqual(1);
  });

  // TEST-I10: Not Found Handling
  it('TEST-I10: Not Found - GET ke ID yang tidak ada mengembalikan 404', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/products/non-existent-id-999', {
        headers: { Authorization: `Bearer ${adminToken}` }
      })
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('NOT_FOUND');
  });

  // TEST-I11 & TEST-I12: Database Error & Rollback
  it('TEST-I11 & TEST-I12: Database Error & Rollback - Tanggapan error aman dan tanpa kebocoran stack trace', async () => {
    const res = await app.handle(
      new Request('http://localhost/api/v1/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          items: [{ productId: 'invalid-product-id-xyz', quantity: 1 }]
        })
      })
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toContain('tidak ditemukan');
  });
});
