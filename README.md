# Sales / Point of Sale (POS) Dashboard

Sistem manajemen penjualan dan kasir Point of Sale (POS) berbasis full-stack web yang dibangun sesuai dengan **Software Requirements Specification (SRS v1.0)**. Sistem ini menyediakan layanan REST API backend, terminal kasir POS interaktif, manajemen data master (katalog produk & pelanggan), grafik tren omset harian, autentikasi & otorisasi berbasis peran (Role-Based Access Control), serta pengujian otomatis (*unit & integration testing*).

## Tech Stack

- **Backend:** Bun + Elysia.js v1.4+
- **Frontend:** React v18 + TypeScript (menggunakan Vite)
- **Database:** PostgreSQL
- **ORM:** Prisma ORM v5.22
- **Styling:** Vanilla CSS (Modern Dark-Mode & Glassmorphism Design System)
- **Charts:** Recharts
- **Testing:** Bun Test (Unit Testing & Integration Testing)

---

## Prerequisites

Untuk menjalankan proyek ini di lingkungan lokal Anda, pastikan telah ter-install:

- [Bun](https://bun.sh/) (sebagai *runtime* & *package manager* backend & test runner, v1.3+)
- [Node.js](https://nodejs.org/) / npm / Bun (untuk frontend)
- [PostgreSQL](https://www.postgresql.org/) (server database lokal running di port 5432)
- Git

---

## Installation / Setup

### 1. Clone Repositori
```bash
git clone https://github.com/USERNAME/sales-pos-dashboard.git
cd sales-pos-dashboard
```

### 2. Setup Backend
```bash
cd backend
bun install
```

### 3. Setup Frontend
```bash
cd ../frontend
bun install
```

---

## Environment Variables

Proyek ini menggunakan *environment variables* untuk mengamankan kredensial database dan rahasia JWT.

### Backend Environment (`backend/.env`)
Buat file `.env` di dalam direktori `backend/`:
```env
DATABASE_URL="postgresql://postgres:PASSWORD_POSTGRES_ANDA@localhost:5432/sales_dashboard"
JWT_SECRET="sales-pos-dashboard-secret-key-2026"
PORT=3000
```

### Frontend Environment (`frontend/.env`)
Buat file `.env` di dalam direktori `frontend/` (opsional):
```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## PostgreSQL & Prisma Setup

1. Pastikan layanan PostgreSQL lokal di PC Anda telah berjalan.
2. Buat satu database kosong untuk proyek ini bernama `sales_dashboard` (misalnya via pgAdmin atau `psql` command: `CREATE DATABASE sales_dashboard;`).
3. Sesuaikan `DATABASE_URL` pada file `backend/.env` dengan kata sandi PostgreSQL Anda.
4. Jalankan perintah sinkronisasi schema dan pengisian data awal (*seeding*) di dalam direktori `backend/`:

```bash
cd backend

# Sinkronisasi schema Prisma ke PostgreSQL (pembuatan tabel otomatis)
bun run prisma db push

# Generate Prisma Client
bunx prisma generate

# Jalankan Seeding Data Demo (User Admin/Staff, Katalog Produk, Pelanggan, Histori Penjualan)
bun run seed
```

---

## Running the Application

Jalankan aplikasi dengan menggunakan dua terminal terpisah dari root project:

### Terminal 1 → Backend API Server
```bash
cd backend
bun dev
```
- API REST Server berjalan pada: `http://localhost:3000`
- Dokumentasi OpenAPI UI Interaktif berjalan pada: `http://localhost:3000/openapi`

### Terminal 2 → Frontend Web Client
```bash
cd frontend
bun dev
```
- Aplikasi Web POS berjalan pada: `http://localhost:5173`

---

## Kredensial Demo

Buka browser ke `http://localhost:5173` dan masuk menggunakan akun berikut (tersedia juga tombol *Quick Fill* pada halaman login):

| Peran (Role) | Email | Password | Hak Akses |
|---|---|---|---|
| **ADMIN** | `admin@pos.com` | `admin123` | Akses penuh (CRUD Produk, Pelanggan, Sales, Soft Delete) |
| **STAFF** | `staff@pos.com` | `staff123` | Akses operator (Lihat Katalog, Buat Transaksi POS Kasir) |

---

## Project Structure

```text
sales-pos-dashboard/
├── backend/
│   ├── prisma/             # Schema & Seed Script (schema.prisma, seed.ts)
│   ├── src/
│   │   ├── middleware/     # Middleware Auth JWT & Otorisasi Role
│   │   ├── routes/         # Endpoint API (auth, products, customers, sales, dashboard)
│   │   ├── services/       # Logic Bisnis (Auth, Product, Customer, Sale, Dashboard)
│   │   ├── utils/          # Utility Helpers (validators, pagination, errors, auth)
│   │   ├── app.ts          # Setup Utama Elysia.js & Middleware Error
│   │   └── index.ts        # Entry point Server Backend
│   ├── tests/
│   │   ├── unit/           # Unit Test (unit.test.ts)
│   │   └── integration/    # Integration Test (integration.test.ts)
│   ├── .env                # Environment Variables Backend
│   └── package.json        # Dependensi & Scripts Backend
├── frontend/
│   ├── src/
│   │   ├── components/     # UI Components (Navbar, Sidebar, StatCard, InvoiceModal)
│   │   ├── context/        # Context API (AuthContext.tsx)
│   │   ├── pages/          # Halaman Web (LoginPage, DashboardPage, ProductsPage, POS)
│   │   ├── services/       # Client API Service (api.ts)
│   │   └── types/          # TypeScript Type Definitions
│   └── package.json        # Dependensi & Scripts Frontend
├── PRESENTASI_PROJECT.txt   # Cheat Sheet Presentasi Proyek
└── README.md
```

---

## API Documentation & Endpoints

Selain dokumentasi interaktif OpenAPI UI di `http://localhost:3000/openapi`, berikut daftar spesifikasi endpoint REST API:

### Authentication Header
Sertakan token JWT pada setiap permintaan API yang membutuhkan autentikasi:
```http
Authorization: Bearer <TOKEN_JWT_HASIL_LOGIN>
Content-Type: application/json
```

### Endpoints Table

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Public | Login pengguna & mendapatkan token JWT |
| `GET` | `/health` | Public | Pengecekan status server |
| `GET` | `/api/v1/products` | Auth | Ambil katalog produk (Support query: `page`, `limit`, `search`, `isActive`) |
| `POST` | `/api/v1/products` | Auth/Admin | Tambah produk baru |
| `GET` | `/api/v1/products/:id` | Auth | Detail rincian produk |
| `PATCH` | `/api/v1/products/:id` | Auth/Admin | Perbarui data produk (harga, stok, nama) |
| `DELETE` | `/api/v1/products/:id` | Auth/Admin | Soft delete / nonaktifkan produk |
| `GET` | `/api/v1/customers` | Auth | Daftar pelanggan (Support query: `page`, `limit`, `search`) |
| `POST` | `/api/v1/customers` | Auth | Tambah data pelanggan |
| `GET` | `/api/v1/customers/:id` | Auth | Detail pelanggan |
| `PATCH` | `/api/v1/customers/:id` | Auth | Perbarui data pelanggan |
| `DELETE` | `/api/v1/customers/:id` | Auth/Admin | Hapus pelanggan |
| `GET` | `/api/v1/sales` | Auth | Daftar histori transaksi penjualan |
| `POST` | `/api/v1/sales` | Auth | Buat transaksi POS baru (Kalkulasi server & potong stok atomik) |
| `GET` | `/api/v1/sales/:id` | Auth | Detail transaksi & cetak struk belanja |
| `DELETE` | `/api/v1/sales/:id` | Auth/Admin | Hapus/void transaksi penjualan |
| `GET` | `/api/v1/dashboard/summary` | Auth | Ambil KPI omset, total transaksi, produk, & pelanggan |
| `GET` | `/api/v1/dashboard/recent-sales` | Auth | Ambil transaksi terbaru (Limit 5) |
| `GET` | `/api/v1/dashboard/sales-trend` | Auth | Data grafik tren omset harian |

---

## Error Handling

Aplikasi ini menggunakan format respons HTTP JSON yang terstandarisasi untuk menangani berbagai skenario error secara aman tanpa membocorkan detail internal server.

### Standard Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Pesan deskripsi error yang ramah pengguna",
    "details": [
      {
        "field": "nama_field",
        "message": "Detail kegagalan validasi"
      }
    ]
  }
}
```

### HTTP Status Codes:
- `200 OK` / `201 Created` / `204 No Content`: Permintaan berhasil diproses.
- `400 Bad Request` (`VALIDATION_ERROR`): Data input tidak valid (misal: stok produk tidak cukup, harga negatif, quantity <= 0).
- `401 Unauthorized` (`UNAUTHORIZED`): Token JWT tidak ada, tidak valid, atau kadaluarsa.
- `403 Forbidden` (`FORBIDDEN`): Pengguna tidak memiliki hak akses role yang sesuai (misal: Staff mencoba menghapus produk).
- `404 Not Found` (`NOT_FOUND`): Resource ID yang diminta tidak ditemukan di database.
- `409 Conflict` (`CONFLICT_ERROR`): Terjadi duplikasi data unik (misal: SKU produk sudah digunakan).
- `500 Internal Server Error` (`INTERNAL_SERVER_ERROR`): Kegagalan sistem server.

---

## Troubleshooting

### 1. Database Connection Error (Prisma / PostgreSQL)
Jika saat `bun run prisma db push` atau `bun dev` muncul error koneksi:
- Pastikan server *PostgreSQL* lokal sudah aktif (Port 5432).
- Buka file `backend/.env` dan pastikan kredensial `DATABASE_URL` (username, password, port, dan nama database `sales_dashboard`) sudah sesuai.
- Jalankan pengecekan skema dengan: `bunx prisma validate` di folder `backend/`.

### 2. API Connection Error pada Frontend
- Pastikan terminal backend (`bun dev` di folder `backend`) tetap berjalan.
- Periksa konsol browser (F12 -> Network). Jika API URL berbeda, sesuaikan `VITE_API_URL` pada file `frontend/.env`.

### 3. Error Foreign Key Constraint Saat Testing
- Pengujian integrasi sudah dikonfigurasi untuk menghapus data berelasi secara berurutan. Jalankan pengujian langsung dengan: `bun test` di direktori `backend/`.

---

## Automated Testing

Proyek ini dilengkapi dengan pengujian otomatis lengkap menggunakan **Bun Test** (Total **29 Test Cases - 100% PASS**):

### Menjalankan Pengujian

```bash
cd backend

# 1. Menjalankan Unit Tests (18 Pass)
bun test tests/unit

# 2. Menjalankan Integration Tests (11 Pass)
bun test tests/integration

# 3. Menjalankan Seluruh Test Suite (29 Pass)
bun test
```

### Cakupan Test Cases:
- **Unit Testing (18 Tests)**: Validasi input produk, validasi sale item, kalkulasi subtotal/grand total, aturan stok, pagination metadata, error mapping, dan hashing password.
- **Integration Testing (11 Tests)**: Alur API -> Prisma -> PostgreSQL (Login auth, proteksi 401, CRUD produk, SKU duplikat 409, CRUD pelanggan, transaksi POS atomik + pemotongan stok, rollback transaksi saat stok kurang, 404 handler, dan sanitasi error DB).
