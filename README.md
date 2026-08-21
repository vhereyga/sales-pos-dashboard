# Sales / Point of Sale (POS) Dashboard

A full-stack web application for sales and Point of Sale (POS) management built strictly according to the **Software Requirements Specification (SRS v1.0)**.

The application features REST API backend service, interactive POS checkout terminal, data management (CRUD products & customers), sales trend charts, authentication & authorization, and unit & integration testing.

---

## 🛠️ Stack Utama

- **Backend Runtime**: Bun v1.3+
- **Web Framework**: Elysia.js v1.4+
- **Database**: PostgreSQL
- **ORM**: Prisma ORM v5.22
- **Frontend Framework**: React v18 + TypeScript (Vite)
- **Styling**: Vanilla CSS (Modern Dark-Mode / Glassmorphism Design System)
- **Charts**: Recharts
- **Testing**: Bun Test (Unit Tests & Integration Tests)

---

## 📖 PANDUAN LENGKAP SETUP & RUN DARI `GIT CLONE` (FOR REVIEWER)

Panduan ini disusun secara berurutan tanpa langkah tersembunyi agar penguji/mentor dapat menjalankan proyek ini dari kondisi *clean checkout*.

### 1. Clone Repositori
```bash
git clone https://github.com/USERNAME/sales-pos-dashboard.git
cd sales-pos-dashboard
```

### 2. Prasyarat Sistem
- **Bun** runtime terinstal (`bun --version`).
- **PostgreSQL** server berjalan aktif pada `localhost:5432`.
- Buat database PostgreSQL bernama `sales_dashboard` (misal via pgAdmin atau psql: `CREATE DATABASE sales_dashboard;`).

---

### 3. Setup & Menjalankan Backend API

Buka terminal di folder root project:

```bash
# 1. Masuk ke direktori backend
cd backend

# 2. Buat file .env (Salin dari .env.example)
# Sesuaikan PASSWORD postgres Anda di file .env:
# DATABASE_URL="postgresql://postgres:PASSWORD_POSTGRES_ANDA@localhost:5432/sales_dashboard"
# JWT_SECRET="sales-pos-dashboard-secret-key-2026"
# PORT=3000

# 3. Instalasi dependency backend
bun install

# 4. Sinkronisasi schema Prisma ke database PostgreSQL
bun run prisma db push

# 5. Jalankan seed data demo awal (User, Produk, Pelanggan, & Histori Transaksi)
bun run seed

# 6. Jalankan Backend Server
bun dev
```

- Backend REST API aktif di: **`http://localhost:3000`**
- Dokumentasi OpenAPI UI Interaktif aktif di: **`http://localhost:3000/openapi`**

---

### 4. Setup & Menjalankan Frontend Web

Buka **terminal baru** (Terminal 2) dari root project:

```bash
# 1. Masuk ke direktori frontend
cd frontend

# 2. Instalasi dependency frontend
bun install

# 3. Jalankan Frontend Server
bun dev
```

- Aplikasi web frontend aktif di: **`http://localhost:5173`**

---

### 5. Login & Pengujian Akses Demo

Buka browser Anda ke **`http://localhost:5173`** dan gunakan kredensial demo berikut (atau klik tombol *Quick Fill* pada halaman login):

| Peran (Role) | Email | Password | Hak Akses |
|---|---|---|---|
| **ADMIN** | `admin@pos.com` | `admin123` | Akses penuh (CRUD Produk, Pelanggan, Sales, Soft Delete) |
| **STAFF** | `staff@pos.com` | `staff123` | Akses operator (Lihat Katalog, Buat Transaksi POS) |

---

### 6. Menjalankan Automated Test Suite

Untuk memverifikasi unit test dan integration test:

```bash
cd backend

# Menjalankan Unit Tests (18 Pass)
bun test tests/unit

# Menjalankan Integration Tests (11 Pass)
bun test tests/integration

# Menjalankan Seluruh Test Suite (29 Pass)
bun test
```

---

## 📑 DOKUMENTASI LENGKAP REST API

Selain dokumentasi OpenAPI UI di `http://localhost:3000/openapi`, berikut adalah rincian API:

### Header Autentikasi
Untuk endpoint yang membutuhkan autentikasi (`Auth`), sertakan token JWT pada HTTP Header:
```http
Authorization: Bearer <TOKEN_JWT_HASIL_LOGIN>
Content-Type: application/json
```

### 📌 Daftar Endpoint API

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | Authenticate user & hasilkan JWT token |
| `GET` | `/health` | Public | Pengecekan status kesehatan server API |
| `GET` | `/api/v1/products` | Auth | Ambil daftar produk (Support query: `page`, `limit`, `search`, `isActive`) |
| `POST` | `/api/v1/products` | Auth/Admin | Tambah produk baru ke katalog |
| `GET` | `/api/v1/products/:id` | Auth | Ambil rincian detail produk berdasarkan ID |
| `PATCH` | `/api/v1/products/:id` | Auth/Admin | Perbarui data produk (harga, stok, nama, status) |
| `DELETE` | `/api/v1/products/:id` | Auth/Admin | Soft delete / hapus produk |
| `GET` | `/api/v1/customers` | Auth | Ambil daftar pelanggan (Support query: `page`, `limit`, `search`) |
| `POST` | `/api/v1/customers` | Auth | Tambah master pelanggan baru |
| `GET` | `/api/v1/customers/:id` | Auth | Detail pelanggan berdasarkan ID |
| `PATCH` | `/api/v1/customers/:id` | Auth | Perbarui data pelanggan |
| `DELETE` | `/api/v1/customers/:id` | Auth/Admin | Hapus data pelanggan |
| `GET` | `/api/v1/sales` | Auth | Ambil daftar transaksi penjualan (Support query: `page`, `limit`, `search`) |
| `POST` | `/api/v1/sales` | Auth | Buat transaksi kasir POS baru (Hitung total server & potong stok atomik) |
| `GET` | `/api/v1/sales/:id` | Auth | Detail transaksi penjualan & struk belanja |
| `DELETE` | `/api/v1/sales/:id` | Auth/Admin | Void / hapus transaksi penjualan |
| `GET` | `/api/v1/dashboard/summary` | Auth | Ambil KPI omset, jumlah transaksi, produk, & pelanggan |
| `GET` | `/api/v1/dashboard/recent-sales` | Auth | Ambil daftar transaksi terbaru (Limit 5) |
| `GET` | `/api/v1/dashboard/sales-trend` | Auth | Ambil data agregasi grafik tren penjualan harian |

---

### 📝 Contoh Request & Response Format

#### 1. Login User (`POST /api/v1/auth/login`)
**Request Body**:
```json
{
  "email": "admin@pos.com",
  "password": "admin123"
}
```
**Response Sukses (200 OK)**:
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cmszk1abc0001",
      "name": "Admin Utama",
      "email": "admin@pos.com",
      "role": "ADMIN"
    }
  }
}
```

#### 2. Buat Transaksi POS (`POST /api/v1/sales`)
**Request Body**:
```json
{
  "customerId": "cust_123",
  "items": [
    { "productId": "prod_001", "quantity": 2 },
    { "productId": "prod_002", "quantity": 1 }
  ]
}
```
**Response Sukses (201 Created)**:
```json
{
  "data": {
    "id": "sale_xyz789",
    "invoiceNo": "INV-20260820-1001",
    "customerId": "cust_123",
    "userId": "user_admin",
    "totalAmount": 1750000,
    "createdAt": "2026-08-20T21:30:00.000Z",
    "items": [
      {
        "id": "item_1",
        "productId": "prod_001",
        "quantity": 2,
        "unitPrice": 750000,
        "subtotal": 1500000,
        "product": {
          "sku": "SKU-001",
          "name": "Keyboard Mechanical RGB"
        }
      },
      {
        "id": "item_2",
        "productId": "prod_002",
        "quantity": 1,
        "unitPrice": 250000,
        "subtotal": 250000,
        "product": {
          "sku": "SKU-002",
          "name": "Mouse Wireless Silent Click"
        }
      }
    ]
  }
}
```

#### 3. Contoh Respons Error Validasi Stok (`400 Bad Request`)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Stok produk \"Keyboard Mechanical RGB\" tidak mencukupi. Stok tersedia: 2, diminta: 5",
    "details": [
      {
        "field": "quantity",
        "message": "Kuantitas melampaui stok"
      }
    ]
  }
}
```

---

## 📐 Arsitektur & Keputusan Desain

1. **Client-Server Separation**: Frontend React + TypeScript sepenuhnya decoupled dari Backend Elysia.js REST API.
2. **Server-side Calculation**: Subtotal item dan grand total transaksi dihitung murni oleh backend server, tidak pernah mempercayai angka dari client.
3. **Database Transaction Atomicity**: Pembuatan header sale, item sale, dan pengurangan stok produk dijalankan dalam satu blok `prisma.$transaction` untuk menjamin keandalan ACID (tidak ada partial write).
4. **Soft Delete Policy**: Produk yang telah terikat dengan transaksi histori tidak akan dihapus keras dari database, melainkan dinonaktifkan (`isActive = false`) untuk menjaga referential integrity.
