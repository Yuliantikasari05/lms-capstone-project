# LMS Multi Segmen Berbasis Web — Maxy Academy (`lms-capstone-project`)

> Fondasi full-stack Learning Management System (LMS) modern, decoupled, dan production-ready yang dibangun dengan arsitektur **React + TypeScript + Vite + Tailwind CSS** di sisi frontend, **Laravel 12 + PostgreSQL + Laravel Sanctum** di sisi backend, serta penegakan **Role-Based Access Control (RBAC)** dengan prinsip **Least Privilege** untuk 5 segmen pengguna.

---

## 📌 Ikhtisar Proyek

Sistem ini dirancang khusus untuk memenuhi kebutuhan ekosistem edukasi multi segmen di Maxy Academy yang melayani 5 kelompok pengguna yang berbeda:
1. **Administrator**: Pengendali penuh sistem, otorisasi, dan manajemen pengguna.
2. **Mentor**: Tenaga ahli pengajar dan fasilitator yang mengampu kelas dan mengevaluasi tugas.
3. **Siswa**: Peserta didik intensif/reguler yang mengikuti silabus, mengerjakan tugas, dan melihat perkembangan belajar.
4. **Karyawan**: Peserta program upskilling/reskilling korporat dengan jalur kepatuhan industri.
5. **Lembaga Bimbingan**: Mitra institusional yang memonitor performa dan presensi kohort binaannya.

---

## 🏗️ Struktur Proyek

```text
lms-capstone-project/
├── frontend/                       # Aplikasi SPA React + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/            # Komponen reusable (Sidebar, Navbar, Badge, StatCard, Modal, Alert)
│   │   ├── context/               # AuthContext & State Manajemen Sesi Sanctum
│   │   ├── pages/                 # Halaman Login, Profile, Admin Users, dan 5 Dashboard Peran
│   │   ├── services/              # Axios HTTP client, Auth, Dashboard, User, & Health Services
│   │   └── types/                 # TypeScript Contract Interfaces
│   ├── .env.example               # Template environment frontend
│   └── package.json
│
├── backend/                        # Aplikasi API Laravel 12
│   ├── app/
│   │   ├── Http/Controllers/Api/  # REST API Controllers (Health, Auth, Dashboard, Admin Users/Roles)
│   │   ├── Http/Middleware/       # CheckRole & CheckPermission (RBAC Enforcement)
│   │   ├── Http/Requests/         # Form Requests (Validation rules)
│   │   ├── Http/Resources/        # API Resources (JSON Transformation)
│   │   ├── Models/                # User, Role, Permission Eloquent Models
│   │   └── Policies/              # UserPolicy (Least privilege authorization)
│   ├── database/
│   │   ├── migrations/            # Migrasi PostgreSQL (users, roles, permissions, pivots, tokens)
│   │   └── seeders/               # RbacSeeder (5 peran & izin) & UserSeeder (akun bawaan)
│   ├── routes/
│   │   └── api.php                # REST API prefix /api/v1
│   ├── tests/
│   │   └── Feature/               # Automated Feature Tests (Auth, Health, RBAC, Admin CRUD)
│   ├── .env.example               # Template environment backend
│   └── phpunit.xml                # Konfigurasi database testing terisolasi (lms_capstone_test)
│
├── docs/                           # Dokumentasi Teknis Lengkap
│   ├── architecture.md            # Arsitektur sistem dan diagram komponen
│   ├── api-contract.md            # Spesifikasi OpenAPI/REST API Contract
│   ├── rbac-matrix.md             # Matriks otorisasi hak akses 5 role
│   ├── database-blueprint.md      # Skema tabel, foreign key, dan relasi PostgreSQL
│   ├── frontend-integration.md    # Panduan komunikasi React dan Laravel Sanctum
│   └── implementation-roadmap.md  # Roadmap fitur 4 bulan ke depan
│
├── .gitignore                      # Git ignore rules untuk Node dan PHP/Laravel
└── README.md                       # Panduan utama instalasi dan penggunaan
```

---

## ⚙️ Prasyarat Sistem

- **PHP**: `^8.2` (dengan ekstensi `pdo_pgsql`, `pgsql`, `openssl`, `mbstring`, `curl`)
- **Composer**: `^2.x`
- **Node.js**: `^18.x` atau `^20.x` / `^22.x`
- **npm**: `^9.x` atau `^10.x`
- **PostgreSQL**: `^14.x`, `^15.x`, `^16.x`, atau `^18.x`

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

### 1. Kloning Repository
```bash
git clone <url-repository> lms-capstone-project
cd lms-capstone-project
```

---

### 2. Konfigurasi & Menjalankan Backend (Laravel 12)

1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```

2. Pasang dependensi PHP:
   ```bash
   composer install
   ```

3. Siapkan file `.env`:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. Sesuaikan konfigurasi PostgreSQL pada file `.env`:
   ```ini
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432       # Atau 5433 sesuai instalasi lokal Anda
   DB_DATABASE=lms_capstone
   DB_USERNAME=postgres
   DB_PASSWORD=rahasia_anda

   # Konfigurasi Sanctum & CORS
   FRONTEND_URL=http://localhost:5173
   SANCTUM_STATEFUL_DOMAINS="localhost:5173,127.0.0.1:5173"
   CORS_ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
   SESSION_DOMAIN=localhost
   ```

5. Buat database PostgreSQL di server Anda:
   ```sql
   CREATE DATABASE lms_capstone;
   CREATE DATABASE lms_capstone_test; -- Khusus database pengujian
   ```

6. Jalankan migrasi dan seeder:
   ```bash
   php artisan migrate --seed
   ```

7. Jalankan server backend:
   ```bash
   php artisan serve --port=8000
   ```
   API Backend siap diakses pada: `http://127.0.0.1:8000/api/v1`

---

### 3. Konfigurasi & Menjalankan Frontend (React + Vite)

1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd frontend
   ```

2. Pasang dependensi Node.js:
   ```bash
   npm install
   ```

3. Pastikan konfigurasi `.env` sesuai dengan port backend:
   ```ini
   VITE_API_BASE_URL=http://localhost:8000
   VITE_API_PREFIX=/api/v1
   VITE_APP_NAME="Maxy LMS - LMS Multi Segmen"
   ```

4. Jalankan server pengembangan Vite:
   ```bash
   npm run dev
   ```
   Aplikasi frontend dapat dibuka pada peramban melalui: `http://localhost:5173`

5. (Opsional) Uji build produksi frontend:
   ```bash
   npm run build
   ```

---

## 🔑 Akun Bawaan untuk Pengujian (Seeder)

Seluruh akun berikut telah di-generate oleh seeder dengan kata sandi default: `MaxySecure2026!`

| Peran (Role) | Email | Akses & Wewenang Utama | Target Redirect |
|---|---|---|---|
| **Administrator** | `admin@maxy.test` | Akses penuh, kelola pengguna (CRUD), audit sistem | `/admin/dashboard` |
| **Mentor** | `mentor@maxy.test` | Monitoring kelas ampu, tinjau tugas siswa | `/mentor/dashboard` |
| **Siswa** | `siswa@maxy.test` | Akses silabus kursus, progres belajar, kuis | `/siswa/dashboard` |
| **Karyawan** | `karyawan@maxy.test` | Jalur upskilling korporat, sertifikasi kepatuhan | `/karyawan/dashboard` |
| **Lembaga Bimbingan** | `lembaga@maxy.test` | Presensi kohort kelompok, rekap nilai institusi | `/lembaga/dashboard` |

> 💡 **Fitur Demo:** Pada halaman login frontend (`/login`), tersedia **Tombol Quick-Fill Demo** untuk 5 role di atas sehingga penguji dapat berganti peran secara instan dengan 1 klik.

---

## 🧪 Menjalankan Pengujian Otomatis (Automated Tests)

Backend dilengkapi dengan pengujian fitur otomatis (Feature Tests) menggunakan database testing terisolasi (`lms_capstone_test`):

```bash
cd backend
php artisan test
```

Pengujian mencakup:
- `HealthCheckTest`: Verifikasi status koneksi PostgreSQL dan latency driver.
- `AuthTest`: Pengujian login kredensial valid/tidak valid, akun nonaktif, profil `/auth/me`, dan pencabutan token logout.
- `RbacAuthorizationTest`: Penegakan least privilege, pencegahan akses silang non-admin, dan statistik dashboard per role.
- `AdminUserManagementTest`: Pembuatan user baru, pembaruan user, dan proteksi hapus diri sendiri (self-deletion block).

---

## 📚 Dokumentasi Lanjutan

Silakan baca dokumen arsitektur dan spesifikasi teknis di dalam folder `docs/`:
- [Arsitektur Sistem (`docs/architecture.md`)](file:///docs/architecture.md)
- [Kontrak REST API (`docs/api-contract.md`)](file:///docs/api-contract.md)
- [Matriks RBAC & Hak Akses (`docs/rbac-matrix.md`)](file:///docs/rbac-matrix.md)
- [Blueprint Basis Data PostgreSQL (`docs/database-blueprint.md`)](file:///docs/database-blueprint.md)
- [Integrasi Frontend & Backend (`docs/frontend-integration.md`)](file:///docs/frontend-integration.md)
- [Roadmap Implementasi 4 Bulan (`docs/implementation-roadmap.md`)](file:///docs/implementation-roadmap.md)
