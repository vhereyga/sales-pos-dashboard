import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing tables
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // 1. Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin Utama',
      email: 'admin@pos.com',
      passwordHash: adminPassword,
      role: 'ADMIN'
    }
  });

  const staff = await prisma.user.create({
    data: {
      name: 'Kasir Staff',
      email: 'staff@pos.com',
      passwordHash: staffPassword,
      role: 'STAFF'
    }
  });

  console.log('✅ Users created: admin@pos.com, staff@pos.com');

  // 2. Products
  const productsData = [
    { sku: 'SKU-001', name: 'Keyboard Mechanical RGB', price: 750000, stock: 25, isActive: true },
    { sku: 'SKU-002', name: 'Mouse Wireless Silent Click', price: 250000, stock: 40, isActive: true },
    { sku: 'SKU-003', name: 'Monitor Gaming 27 Inch 165Hz', price: 2800000, stock: 12, isActive: true },
    { sku: 'SKU-004', name: 'Headset Gaming Surround 7.1', price: 450000, stock: 18, isActive: true },
    { sku: 'SKU-005', name: 'Ergonomic Standing Desk', price: 3500000, stock: 5, isActive: true },
    { sku: 'SKU-006', name: 'Webcam Ultra HD 4K', price: 850000, stock: 15, isActive: true },
    { sku: 'SKU-007', name: 'USB-C Cable Braided 2M', price: 75000, stock: 100, isActive: true },
    { sku: 'SKU-008', name: 'Aluminum Laptop Stand', price: 320000, stock: 30, isActive: true }
  ];

  const products = [];
  for (const p of productsData) {
    const created = await prisma.product.create({ data: p });
    products.push(created);
  }
  console.log(`✅ ${products.length} Products created`);

  // 3. Customers
  const customersData = [
    { name: 'Budi Santoso', email: 'budi@gmail.com', phone: '081234567890' },
    { name: 'Siti Rahma', email: 'siti@yahoo.com', phone: '085678901234' },
    { name: 'Agus Wijaya', email: 'agus@outlook.com', phone: '087812345678' },
    { name: 'Dewi Lestari', email: 'dewi@gmail.com', phone: '089901234567' },
    { name: 'Eko Prasetyo', email: 'eko@company.com', phone: '082134567890' }
  ];

  const customers = [];
  for (const c of customersData) {
    const created = await prisma.customer.create({ data: c });
    customers.push(created);
  }
  console.log(`✅ ${customers.length} Customers created`);

  // 4. Historical Sales
  const salesToCreate = [
    {
      invoiceNo: 'INV-20260815-1001',
      customerId: customers[0].id,
      userId: staff.id,
      daysAgo: 4,
      items: [
        { productId: products[0].id, quantity: 1, unitPrice: products[0].price, subtotal: products[0].price },
        { productId: products[1].id, quantity: 2, unitPrice: products[1].price, subtotal: products[1].price * 2 }
      ]
    },
    {
      invoiceNo: 'INV-20260816-1002',
      customerId: customers[1].id,
      userId: admin.id,
      daysAgo: 3,
      items: [
        { productId: products[2].id, quantity: 1, unitPrice: products[2].price, subtotal: products[2].price },
        { productId: products[3].id, quantity: 1, unitPrice: products[3].price, subtotal: products[3].price }
      ]
    },
    {
      invoiceNo: 'INV-20260817-1003',
      customerId: customers[2].id,
      userId: staff.id,
      daysAgo: 2,
      items: [
        { productId: products[5].id, quantity: 2, unitPrice: products[5].price, subtotal: products[5].price * 2 },
        { productId: products[7].id, quantity: 1, unitPrice: products[7].price, subtotal: products[7].price }
      ]
    },
    {
      invoiceNo: 'INV-20260818-1004',
      customerId: customers[3].id,
      userId: staff.id,
      daysAgo: 1,
      items: [
        { productId: products[4].id, quantity: 1, unitPrice: products[4].price, subtotal: products[4].price }
      ]
    }
  ];

  for (const saleData of salesToCreate) {
    const totalAmount = saleData.items.reduce((acc, curr) => acc + curr.subtotal, 0);
    const date = new Date();
    date.setDate(date.getDate() - saleData.daysAgo);

    await prisma.sale.create({
      data: {
        invoiceNo: saleData.invoiceNo,
        customerId: saleData.customerId,
        userId: saleData.userId,
        totalAmount,
        createdAt: date,
        items: {
          create: saleData.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal
          }))
        }
      }
    });
  }

  console.log(`✅ ${salesToCreate.length} Historical Sales created`);
  console.log('🚀 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
