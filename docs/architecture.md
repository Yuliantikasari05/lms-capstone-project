# Arsitektur Sistem — LMS Multi Segmen Maxy Academy

Dokumen ini menjelaskan arsitektur tingkat tinggi dan detail teknis untuk sistem **LMS Multi Segmen Berbasis Web di Maxy Academy (`lms-capstone-project`)**.

---

## 1. Prinsip Desain Arsitektur

Arsitektur aplikasi dibangun di atas 5 prinsip rekayasa perangkat lunak utama:

1. **Decoupled Architecture (Frontend & Backend Terpisah)**:
   Frontend SPA (React + TypeScript) dan Backend API (Laravel 12) beroperasi secara independen. Frontend tidak memiliki izin maupun kemampuan untuk berkomunikasi langsung ke basis data PostgreSQL; seluruh manipulasi data diwajibkan melewati REST API.
2. **Role-Based Access Control (RBAC) dengan Least Privilege**:
   Setiap pengguna hanya diberikan hak akses minimum yang diperlukan untuk menyelesaikan perannya. Validasi hak akses ditegakkan secara mutlak pada lapisan backend middleware dan policy, bukan sekadar manipulasi tampilan antarmuka (UI).
3. **Stateless API dengan Dual Authentication Support (Laravel Sanctum)**:
   Mendukung autentikasi berbasis first-party SPA Cookie/Session melalui CSRF protection dan Bearer Token untuk fleksibilitas klien mobile/eksternal.
4. **Clean Code & Standard Laravel/React Idioms**:
   Menghindari dependensi pihak ketiga yang tidak perlu. Menggunakan Form Request untuk validasi, API Resource untuk format respons JSON konsisten, dan React Context API + Custom Hooks untuk manajemen state di sisi frontend.
5. **Database Isolation & Integrity**:
   Menggunakan PostgreSQL dengan relasi foreign key berindeks, tipe data ketat, dan database pengujian yang terpisah dari database pengembangan (`lms_capstone_test`).

---

## 2. Diagram Arsitektur Komponen

```text
+-----------------------------------------------------------------------------------+
|                              PENGGUNA / BROWSER                                   |
|   (Admin / Mentor / Siswa / Karyawan / Lembaga Bimbingan)                         |
+-----------------------------------------------------------------------------------+
                                        │
                                        ▼
+-----------------------------------------------------------------------------------+
|                           FRONTEND SPA (Port 5173)                                |
|   React 19 + TypeScript + Vite + Tailwind CSS                                    |
|                                                                                   |
|   ├── Router & Guards      : ProtectedRoute, RoleRoute                            |
|   ├── State Management     : AuthContext (User, Permissions, Tokens)              |
|   ├── Layouts & Components : AppLayout, Sidebar, Navbar, StatCard, DataTable      |
|   ├── View Pages           : 5 Role Dashboards, Admin Users CRUD, Profile         |
|   └── API Client           : Axios (withCredentials, CSRF Cookie, Bearer Fallback)|
+-----------------------------------------------------------------------------------+
                                        │
                     REST API Request   │  (JSON / HTTPS / Port 8000)
                     CORS & CSRF Check  ▼
+-----------------------------------------------------------------------------------+
|                           BACKEND API (Laravel 12)                                |
|                                                                                   |
|   ├── Routing Layer        : routes/api.php (Prefix /api/v1)                      |
|   ├── Security Middleware  : statefulApi, CheckRole, CheckPermission              |
|   ├── Controllers          : HealthController, AuthController, DashboardController|
|   │                          Admin\UserController, Admin\RoleController           |
|   ├── Validation & Auth    : Form Requests (LoginRequest, StoreUserRequest, etc.) |
|   │                          UserPolicy, Gate Authorization                       |
|   ├── Serialization        : UserResource, RoleResource                           |
|   └── Data Access Layer    : Eloquent ORM (User, Role, Permission Models)         |
+-----------------------------------------------------------------------------------+
                                        │
                              PDO Connection (Port 5433)
                                        ▼
+-----------------------------------------------------------------------------------+
|                        BASIS DATA RELASIONAL (PostgreSQL 18)                      |
|                                                                                   |
|   ├── users                : Identitas akun, hash password, status akun           |
|   ├── roles                : 5 Peran sistem (admin, mentor, siswa, dll.)          |
|   ├── permissions          : Granular permissions matrix                          |
|   ├── role_user (Pivot)    : Pemetaan relasi many-to-many pengguna-peran          |
|   ├── permission_role (Pvt): Pemetaan relasi many-to-many peran-izin              |
|   ├── personal_access_token: Token otentikasi Laravel Sanctum                     |
|   └── sessions & cache     : Manajemen sesi dan cache performa database           |
+-----------------------------------------------------------------------------------+
```

---

## 3. Komponen Frontend

Frontend disusun dalam arsitektur komponen modular berbasis fitur:

- `components/common/`: Komponen UI atomik dan molekular (StatCard, RoleBadge, StatusBadge, Alert, Modal, LoadingSpinner).
- `components/guards/`: Komponen pembatas rute tingkat tinggi (`ProtectedRoute` untuk memastikan pengguna sudah login, `RoleRoute` untuk memastikan kecukupan peran).
- `components/layout/`: Navigasi utama yang responsif (`Sidebar` yang beradaptasi dengan peran pengguna, `Navbar` dengan indikator status database dan role).
- `context/`: `AuthContext` bertindak sebagai single source of truth untuk informasi pengguna, daftar permission, status login, dan token.
- `services/`: Lapisan abstraksi jaringan yang mengisolasi panggilan API dari komponen UI. Menggunakan `apiClient` Axios dengan interceptor penanganan sesi kedaluwarsa otomatis.
- `pages/`: Halaman dashboard yang terpisah secara tegas untuk masing-masing dari kelima peran.

---

## 4. Komponen Backend

Backend mengikuti arsitektur layered MVC yang bersih:

1. **HTTP Routing**: Seluruh endpoint dikelompokkan dengan prefix `/api/v1`.
2. **Middleware**:
   - `statefulApi`: Memvalidasi cookie sesi Sanctum untuk domain SPA yang terdaftar.
   - `CheckRole`: Memverifikasi apakah peran pengguna cocok dengan salah satu peran yang diizinkan untuk rute tersebut.
   - `CheckPermission`: Memverifikasi izin granular pengguna.
3. **Controllers**: Berfokus murni pada orkestrasi request dan response. Logika validasi didelegasikan ke Form Requests, sedangkan logika otorisasi didelegasikan ke Policies.
4. **Form Requests**: Memvalidasi integritas data, tipe, format email unik, dan kriteria kata sandi sebelum masuk ke controller.
5. **API Resources**: Menjamin kontrak data output stabil dan tidak mengekspos atribut sensitif seperti password hash atau internal database fields.
6. **Exception Handling**: Dikonfigurasi secara terpusat di `bootstrap/app.php` untuk selalu mengembalikan respons JSON terstruktur pada kode status 401, 403, 404, 422, dan 500.

---

## 5. Keamanan Sistem

- **Penyimpanan Kredensial**: Menggunakan algoritma hash `bcrypt` standar industri dengan rounds yang aman.
- **Perlindungan CSRF**: Sanctum mengamankan panggilan mutasi sesi dengan CSRF cookie (`/sanctum/csrf-cookie`).
- **Pencegahan Self-Deletion**: Administrator dilarang secara sistemik untuk menghapus akunnya sendiri guna mencegah terkuncinya akses manajemen.
- **Inactivity Deactivation**: Pengguna dengan status `is_active = false` secara instan ditolak saat login maupun saat mengakses endpoint terproteksi.
