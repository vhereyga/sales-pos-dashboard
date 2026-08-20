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

## 🚀 Prasyarat Sistem

1. **Bun**: Installed on your development machine (`bun --version`).
2. **PostgreSQL**: PostgreSQL server running on `localhost:5432`.
   - Database Name: `sales_dashboard`

---

## 🔑 Credential Demo

| Peran (Role) | Email | Password | Izin Akses |
|---|---|---|---|
| **ADMIN** | `admin@pos.com` | `admin123` | Akses penuh (CRUD Produk, Pelanggan, Sales, Hapus Data) |
| **STAFF** | `staff@pos.com` | `staff123` | Akses operator (Lihat Katalog, Buat Transaksi POS) |

---

## ⚙️ Langkah Inisialisasi & Setup Project

### 1. Backend Setup & Database Migration

```bash
# Pindah ke direktori backend
cd backend

# Instalasi dependencies (opsional jika sudah ada node_modules)
bun install

# Konfigurasi File Environment (.env)
# Salin dari .env.example atau buat file .env:
# DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/sales_dashboard"
# JWT_SECRET="sales-pos-dashboard-secret-key-2026"
# PORT=3000

# Push Schema Prisma ke PostgreSQL Development
bun run prisma db push

# Menjalankan Database Seed (Memasukkan data demo awal)
bun run seed
```

### 2. Frontend Setup

```bash
# Pindah ke direktori frontend
cd ../frontend

# Konfigurasi File Environment (.env)
# VITE_API_URL=http://localhost:3000/api/v1

# Instalasi dependencies (opsional)
bun install
```

---

## 💻 Cara Menjalankan Aplikasi

Buka dua terminal dari root project:

### Terminal 1: Backend Server
```bash
cd backend
bun dev
```
Backend REST API aktif pada `http://localhost:3000`
Dokumentasi OpenAPI UI tersedia di `http://localhost:3000/openapi`

### Terminal 2: Frontend Client
```bash
cd frontend
bun dev
```
Buka browser ke `http://localhost:5173`

---

## 🧪 Pengujian (Unit Testing & Integration Testing)

Seluruh test suite dikembangkan secara independen tanpa ketergantungan manual.

### 1. Menjalankan Backend Unit Tests (TEST-U01 .. TEST-U08)
```bash
cd backend
bun test tests/unit
```
Menguji:
- `TEST-U01`: Validasi produk (harga negatif, stok negatif, SKU kosong ditolak).
- `TEST-U02`: Validasi sale item (quantity <= 0 ditolak).
- `TEST-U03`: Kalkulasi subtotal (`quantity * unitPrice`).
- `TEST-U04`: Kalkulasi grand total (penjumlahan subtotal).
- `TEST-U05`: Business rule stok (`requestedQty > currentStock` melempar error).
- `TEST-U06`: Pagination default page/limit & batas maksimum 100.
- `TEST-U07`: Error mapping ke format JSON konsisten.
- `TEST-U08`: Password hash & verify helper.

### 2. Menjalankan Backend Integration Tests (TEST-I01 .. TEST-I12)
```bash
cd backend
bun test tests/integration
```
Menguji:
- `TEST-I01`: Auth login valid -> status 200 & JWT token returned.
- `TEST-I02`: Auth login invalid -> status 401.
- `TEST-I03`: Endpoint terproteksi tanpa auth header -> status 401.
- `TEST-I04`: Alur CRUD Produk (POST -> GET -> PATCH -> DELETE).
- `TEST-I05`: SKU duplikat constraint -> status 409 Conflict Error.
- `TEST-I06`: Alur CRUD Pelanggan end-to-end.
- `TEST-I07`: Pembuatan Sale menyimpan header + items & memotong stok di database secara atomik.
- `TEST-I08`: Penolakan transaksi saat stok tidak mencukupi & rollback transaksi database.
- `TEST-I09`: Dashboard summary KPI sesuai data di database fixture.
- `TEST-I10`: Not found handler -> status 404.
- `TEST-I11 & TEST-I12`: Database error handling aman tanpa membocorkan stack trace sensitif & rollback transaksi.

---

## 📑 Spesifikasi REST API & Contoh Respons

### Endpoint Minimum
- `POST /api/v1/auth/login` (Public) - Login user
- `GET /health` (Public) - Health check API
- `GET /api/v1/products` (Auth) - Daftar produk dengan pagination & search
- `POST /api/v1/products` (Auth/Admin) - Tambah produk
- `GET /api/v1/products/:id` (Auth) - Detail produk
- `PATCH /api/v1/products/:id` (Auth/Admin) - Update produk
- `DELETE /api/v1/products/:id` (Auth/Admin) - Soft delete / hapus produk
- `GET /api/v1/customers` (Auth) - Daftar pelanggan
- `POST /api/v1/customers` (Auth) - Tambah pelanggan
- `GET /api/v1/customers/:id` (Auth) - Detail pelanggan
- `PATCH /api/v1/customers/:id` (Auth) - Update pelanggan
- `DELETE /api/v1/customers/:id` (Auth/Admin) - Hapus pelanggan
- `GET /api/v1/sales` (Auth) - Daftar transaksi penjualan
- `POST /api/v1/sales` (Auth) - Buat transaksi baru (hitung server + potong stok atomik)
- `GET /api/v1/sales/:id` (Auth) - Detail transaksi & struk
- `DELETE /api/v1/sales/:id` (Auth/Admin) - Hapus/void transaksi
- `GET /api/v1/dashboard/summary` (Auth) - KPI total omset, transaksi, produk, & pelanggan
- `GET /api/v1/dashboard/recent-sales` (Auth) - Transaksi penjualan terbaru
- `GET /api/v1/dashboard/sales-trend` (Auth) - Data grafik tren penjualan harian

### Contoh Respons Sukses (`POST /api/v1/sales`)
```json
{
  "data": {
    "id": "cmszk1abc0001p7cs",
    "invoiceNo": "INV-20260819-4819",
    "customerId": "cust_123",
    "userId": "user_456",
    "totalAmount": 1250000,
    "createdAt": "2026-08-19T10:30:00.000Z",
    "items": [
      {
        "id": "item_1",
        "productId": "prod_789",
        "quantity": 1,
        "unitPrice": 750000,
        "subtotal": 750000,
        "product": {
          "sku": "SKU-001",
          "name": "Keyboard Mechanical RGB"
        }
      }
    ]
  }
}
```

### Contoh Respons Error (`400 Bad Request`)
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
