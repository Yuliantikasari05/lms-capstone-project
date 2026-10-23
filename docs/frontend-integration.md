# Integrasi Frontend & Backend (Sanctum SPA & REST API)

Dokumen ini menjelaskan arsitektur komunikasi antara aplikasi **React SPA (Frontend)** dan **Laravel 12 (Backend)** menggunakan **Laravel Sanctum**.

---

## 1. Topologi Komunikasi Jaringan

```text
  [Browser: http://localhost:5173]               [API Server: http://localhost:8000]
                 │                                                │
                 │ 1. GET /sanctum/csrf-cookie                    │
                 ├───────────────────────────────────────────────>│ (Inisialisasi Cookie XSRF-TOKEN)
                 │<───────────────────────────────────────────────┤ Set-Cookie: XSRF-TOKEN
                 │                                                │
                 │ 2. POST /api/v1/auth/login                     │
                 │    { email, password }                         │
                 ├───────────────────────────────────────────────>│ (Validasi kredensial & Auth::login)
                 │<───────────────────────────────────────────────┤ 200 OK + user + token + Set-Cookie
                 │                                                │
                 │ 3. GET /api/v1/dashboard/stats                 │
                 │    (Cookie sesi + Bearer token fallback)       │
                 ├───────────────────────────────────────────────>│ (Middleware: role check & least priv)
                 │<───────────────────────────────────────────────┤ 200 OK + role-tailored stats
                 │                                                │
                 │ 4. POST /api/v1/auth/logout                    │
                 ├───────────────────────────────────────────────>│ (Revoke token & destroy session)
                 │<───────────────────────────────────────────────┤ 200 OK
```

---

## 2. Konfigurasi Lingkungan (Environment Variables)

### Backend (`backend/.env`)
```ini
# URL Domain Frontend yang Diizinkan Menerima Cookie Sesi
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS="localhost:5173,127.0.0.1:5173"

# Konfigurasi CORS
CORS_ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"

# Konfigurasi Sesi Cookie
SESSION_DRIVER=database
SESSION_DOMAIN=localhost
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
```

### Frontend (`frontend/.env`)
```ini
VITE_API_BASE_URL=http://localhost:8000
VITE_API_PREFIX=/api/v1
```

---

## 3. Konfigurasi Axios Client (`src/services/api.ts`)

Axios dikonfigurasi secara sentral dengan parameter berikut:

1. **`withCredentials: true`**:
   Wajib diaktifkan agar peramban mengirimkan cookie sesi Sanctum (`laravel_session`) dan cookie proteksi CSRF (`XSRF-TOKEN`) pada setiap permintaan HTTP silang origin.
2. **Inisialisasi CSRF Cookie**:
   Sebelum request mutasi pertama (login, create, update), frontend memanggil `ensureCsrfCookie()` yang memicu endpoint `/sanctum/csrf-cookie`. Laravel memberikan header `Set-Cookie: XSRF-TOKEN` yang secara otomatis dibaca oleh Axios untuk mengisi header `X-XSRF-TOKEN`.
3. **Dual Authentication Fallback**:
   Meskipun menggunakan pendekatan cookie/session, sistem menyimpan token Sanctum sebagai cadangan pada memori/storage dan menyertakannya di header `Authorization: Bearer <token>` sehingga komunikasi API tetap berhasil bahkan jika browser pengguna memiliki kebijakan cookie pihak ketiga yang sangat ketat.
4. **Penanganan Sesi Kedaluwarsa (401 Interceptor)**:
   Jika backend merespons dengan kode status `401 Unauthorized`, interceptor Axios menangkapnya, membersihkan cache lokal, dan menembakkan custom browser event `lms:session-expired` yang ditangkap oleh `AuthContext` untuk mengarahkan pengguna kembali ke halaman login tanpa reload yang mengganggu.

---

## 4. Alur Autentikasi & Pengalihan Berbasis Peran

1. Pengguna memasukkan email dan kata sandi di `LoginPage.tsx`.
2. `authService.login()` memvalidasi kredensial ke `/api/v1/auth/login`.
3. Backend mengembalikan objek user beserta kolom `primary_role` dan `redirect_url`:
   - Admin -> `/admin/dashboard`
   - Mentor -> `/mentor/dashboard`
   - Siswa -> `/siswa/dashboard`
   - Karyawan -> `/karyawan/dashboard`
   - Lembaga Bimbingan -> `/lembaga/dashboard`
4. React Router melakukan navigasi instan ke halaman dashboard yang bersangkutan.
5. Jika pengguna secara manual mencoba mengakses URL milik role lain (misal Siswa mengetik `/admin/users` di address bar), komponen `RoleRoute` di frontend langsung memblokir dan mengarahkan kembali ke dashboard pribadinya, sementara backend API memblokir request dengan status `403 Forbidden`.
