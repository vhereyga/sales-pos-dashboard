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

## 🚀 Tutorial / Panduan Menjalankan Projek secara Lokal

Berikut adalah tutorial langkah-demi-langkah (*step-by-step*) lengkap untuk mengunduh, mengonfigurasi, dan menjalankan aplikasi **Sales / POS Dashboard** di komputer lokal Anda.

---

### Langkah 1: Prasyarat Sistem (Prerequisites)

Sebelum memulai, pastikan perangkat lokal Anda telah ter-install dependensi berikut:

1. **[Bun Runtime](https://bun.sh/)** (v1.3+ direkomendasikan)
   - Digunakan sebagai *runtime* backend, *package manager*, dan *test runner*.
   - Cek versi: `bun -v`
2. **[Node.js](https://nodejs.org/) & npm** (opsional / alternatif frontend)
   - Digunakan jika ingin menjalankan frontend dengan Node/npm alih-alih Bun.
   - Cek versi: `node -v`
3. **[PostgreSQL Database Server](https://www.postgresql.org/)**
   - Server database PostgreSQL lokal yang aktif di port default `5432`.
4. **Git**
   - Untuk mengklon repositori proyek.

---

### Langkah 2: Clone Repositori

Buka terminal / command prompt dan jalankan:

```bash
git clone https://github.com/vhereyga/sales-pos-dashboard.git
cd sales-pos-dashboard
```

---

### Langkah 3: Setup Backend & Environment Variables

#### 3.1. Install Dependensi Backend
Masuk ke folder `backend/` dan install dependensi package:

```bash
cd backend
bun install
```

#### 3.2. Buat File Environment (`backend/.env`)
Salin file `.env.example` menjadi `.env`:

```bash
# Pada Linux / macOS / Git Bash:
cp .env.example .env

# Pada Windows PowerShell / CMD:
copy .env.example .env
```

Buka file `backend/.env` dan sesuaikan kredensial database PostgreSQL Anda:

```env
DATABASE_URL="postgresql://postgres:PASSWORD_POSTGRES_ANDA@localhost:5432/sales_dashboard"
DATABASE_URL_TEST="postgresql://postgres:PASSWORD_POSTGRES_ANDA@localhost:5432/sales_dashboard_test"
JWT_SECRET="sales-pos-dashboard-secret-key-2026"
PORT=3000
```

> ⚠️ **Penting:** Ubah `PASSWORD_POSTGRES_ANDA` sesuai dengan kata sandi (*password*) user `postgres` di PC lokal Anda.

---

### Langkah 4: Setup Database PostgreSQL & Prisma

#### 4.1. Buat Database Kosong
Pastikan server PostgreSQL Anda sudah berjalan, lalu buat database bernama `sales_dashboard` via CLI (`psql`) atau GUI (pgAdmin / DBeaver):

```sql
CREATE DATABASE sales_dashboard;
```

#### 4.2. Synchronize Schema & Seeding Data Demo
Di dalam direktori `backend/`, jalankan perintah migrasi skema dan pengisian data awal demo:

```bash
# 1. Sinkronisasi skema Prisma ke PostgreSQL (membuat tabel otomatis)
bun run prisma db push

# 2. Generate Prisma Client
bunx prisma generate

# 3. Jalankan Seeding Data Demo (Akun Admin/Staff, Katalog Produk, Pelanggan, Histori Penjualan)
bun run seed
```

*(Catatan: Anda juga bisa mengimpor file `sales_dashboard.sql` yang ada di root project jika memilih import manual SQL).*

---

### Langkah 5: Setup Frontend Web Client

Buka terminal baru atau pindah ke folder `frontend/`:

```bash
cd ../frontend
bun install
```

Salin file `.env.example` menjadi `.env`:

```bash
# Pada Linux / macOS / Git Bash:
cp .env.example .env

# Pada Windows PowerShell / CMD:
copy .env.example .env
```

Isi file `frontend/.env` (default):
```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

### Langkah 6: Menjalankan Aplikasi secara Lokal

Jalankan server backend dan web frontend secara paralel menggunakan **dua terminal terpisah**:

#### Terminal 1 → Backend REST API Server
```bash
cd backend
bun dev
```
- 🌐 **API REST Server**: `http://localhost:3000`
- 📚 **Dokumentasi OpenAPI UI (Swagger)**: `http://localhost:3000/openapi`

#### Terminal 2 → Frontend Web POS Client
```bash
cd frontend
bun dev
```
- 🖥️ **Aplikasi Web POS Kasir**: `http://localhost:5173`

---

### Langkah 7: Akses & Kredensial Login Demo

Buka peramban (browser) Anda ke alamat **`http://localhost:5173`**. Masuk menggunakan salah satu akun demo berikut (atau tekan tombol *Quick Fill* pada halaman login):

| Peran (Role) | Email | Password | Hak Akses & Fitur |
|---|---|---|---|
| 👑 **ADMIN** | `admin@pos.com` | `admin123` | Akses Penuh: CRUD Katalog Produk, CRUD Pelanggan, Dashboard Tren Penjualan, Void/Soft Delete Transaksi |
| 🧑‍💼 **STAFF** | `staff@pos.com` | `staff123` | Akses Operator: Lihat Katalog Produk, Pembuatan Transaksi Kasir POS, Cetak Struk Belanja |

---

### Langkah 8: Menjalankan Testing Automasi (Opsional)

Untuk memverifikasi bahwa backend berjalan 100% tanpa error, Anda dapat menjalankan seluruh pengujian otomatis dari folder `backend/`:

```bash
cd backend

# Menjalankan seluruh Unit & Integration Test Suite (29 Pass)
bun test
```

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

## Automated Testing & Results

Proyek ini dilengkapi dengan pengujian otomatis lengkap menggunakan **Bun Test** (Total **29 Test Cases - 100% PASS**):

### 1. Perintah Menjalankan Pengujian

```bash
cd backend

# 1. Menjalankan Unit Tests (18 Pass)
bun test tests/unit

# 2. Menjalankan Integration Tests (11 Pass)
bun test tests/integration

# 3. Menjalankan Seluruh Test Suite (29 Pass)
bun test
```

### 2. Hasil Eksekusi Unit Testing (18 Pass, 0 Fail)

```text
bun test v1.3.14 (0d9b296a)

tests/unit/unit.test.ts:
✓ Unit Tests - Sales/POS Dashboard (TEST-U01..U08) > TEST-U01: Validasi produk > harus menolak produk jika harga negatif
✓ Unit Tests - Sales/POS Dashboard (TEST-U01..U08) > TEST-U01: Validasi produk > harus menolak produk jika stok negatif
✓ Unit Tests - Sales/POS Dashboard (TEST-U01..U08) > TEST-U01: Validasi produk > harus menolak produk jika SKU kosong
✓ Unit Tests - Sales/POS Dashboard (TEST-U01..U08) > TEST-U01: Validasi produk > harus me-return objek tervalidasi jika data benar
✓ Unit Tests - Sales/POS Dashboard (TEST-U01..U08) > TEST-U02: Validasi sale item > harus menolak item jika quantity <= 0
✓ Unit Tests - Sales/POS Dashboard (TEST-U01..U08) > TEST-U02: Validasi sale item > harus menerima item jika quantity >= 1
✓ Unit Tests - Sales/POS Dashboard (TEST-U01..U08) > TEST-U03: Kalkulasi subtotal > harus menghitung subtotal = quantity * unitPrice secara tepat
✓ Unit Tests - Sales/POS Dashboard (TEST-U01..U08) > TEST-U03: Kalkulasi subtotal > harus menangani desimal harga dengan tepat
✓ Unit Tests - Sales/POS Dashboard (TEST-U01..U08) > TEST-U04: Kalkulasi grand total > harus menjumlahkan seluruh subtotal item
✓ Unit Tests - Sales/POS Dashboard (TEST-U01..U08) > TEST-U05: Business rule stok > harus melempar error jika requested quantity > current stock
✓ Unit Tests - Sales/POS Dashboard (TEST-U01..U08) > TEST-U05: Business rule stok > tidak melempar error jika stok mencukupi
✓ Unit Tests - Sales/POS Dashboard (TEST-U01..U08) > TEST-U06: Utility pagination > harus menggunakan default page=1 dan limit=10 jika parameter tidak diberikan
✓ Unit Tests - Sales/POS Dashboard (TEST-U01..U08) > TEST-U06: Utility pagination > harus membatasi limit maksimal 100
✓ Unit Tests - Sales/POS Dashboard (TEST-U01..U08) > TEST-U06: Utility pagination > harus menyusun paginated result metadata dengan benar
✓ Unit Tests - Sales/POS Dashboard (TEST-U01..U08) > TEST-U07: Error mapping > harus memetakan AppError ke format respons JSON standar
✓ Unit Tests - Sales/POS Dashboard (TEST-U01..U08) > TEST-U07: Error mapping > harus memetakan ValidationError dengan details
✓ Unit Tests - Sales/POS Dashboard (TEST-U01..U08) > TEST-U08: Auth helper > harus me-hash dan memverifikasi password dengan benar
✓ Unit Tests - Sales/POS Dashboard (TEST-U01..U08) > TEST-U08: Auth helper > harus menolak password kurang dari 6 karakter saat hashing

 18 pass
 0 fail
 36 expect() calls
Ran 18 tests across 1 file.
```

### 3. Hasil Eksekusi Integration Testing (11 Pass, 0 Fail)

```text
bun test v1.3.14 (0d9b296a)

tests/integration/integration.test.ts:
✓ Integration Tests - Sales/POS Dashboard (TEST-I01..I12) > TEST-I01: Auth - Login valid mengembalikan 200 & token
✓ Integration Tests - Sales/POS Dashboard (TEST-I01..I12) > TEST-I02: Auth - Login password salah mengembalikan 401
✓ Integration Tests - Sales/POS Dashboard (TEST-I01..I12) > TEST-I03: Authorization - Endpoint terproteksi tanpa token mengembalikan 401
✓ Integration Tests - Sales/POS Dashboard (TEST-I01..I12) > TEST-I04: Products CRUD - POST -> GET -> PATCH -> DELETE
✓ Integration Tests - Sales/POS Dashboard (TEST-I01..I12) > TEST-I05: SKU Duplikat - Mengembalikan 409 conflict error
✓ Integration Tests - Sales/POS Dashboard (TEST-I01..I12) > TEST-I06: Customers CRUD - Alur CRUD pelanggan end-to-end
✓ Integration Tests - Sales/POS Dashboard (TEST-I01..I12) > TEST-I07: Create Sale - Menyimpan sale header + items dan mengurangi stok produk di DB
✓ Integration Tests - Sales/POS Dashboard (TEST-I01..I12) > TEST-I08: Insufficient Stock - Sale ditolak dan database tidak mengalami partial write
✓ Integration Tests - Sales/POS Dashboard (TEST-I01..I12) > TEST-I09: Dashboard Summary - KPI sesuai data di database
✓ Integration Tests - Sales/POS Dashboard (TEST-I01..I12) > TEST-I10: Not Found - GET ke ID yang tidak ada mengembalikan 404
✓ Integration Tests - Sales/POS Dashboard (TEST-I01..I12) > TEST-I11 & TEST-I12: Database Error & Rollback - Tanggapan error aman dan tanpa kebocoran stack trace

 11 pass
 0 fail
 35 expect() calls
Ran 11 tests across 1 file.
```

### 4. Ringkasan Total Test Suite
- **Total Test Cases**: `29 Tests`
- **Unit Test Cases**: `18 Tests (100% Pass)`
- **Integration Test Cases**: `11 Tests (100% Pass)`
- **Pass Rate**: `100% (29 Pass, 0 Fail)`
