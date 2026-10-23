# Kontrak REST API (API Contract v1)

Dokumentasi spesifikasi endpoint, parameter request, format data respons JSON, dan status code untuk API **LMS Multi Segmen Maxy Academy**.

**Base URL**: `http://localhost:8000/api/v1`  
**Format Pertukaran Data**: `application/json`  
**Otentikasi**: Laravel Sanctum Cookie Session / Bearer Token

---

## 1. Format Respons Standar

### Respons Berhasil (Success)
```json
{
  "success": true,
  "message": "Pesan deskriptif keberhasilan operasi.",
  "data": { ... }
}
```

### Respons Gagal / Validasi (Error)
```json
{
  "success": false,
  "message": "Pesan deskriptif kesalahan.",
  "errors": {
    "field_name": [
      "Pesan validasi spesifik untuk field."
    ]
  }
}
```

---

## 2. Daftar Endpoint

| No | Metode | Endpoint | Autentikasi | Hak Akses | Deskripsi |
|---|---|---|---|---|---|
| 1 | `GET` | `/health` | Publik | Semua | Cek status kesehatan sistem & koneksi database |
| 2 | `POST` | `/auth/login` | Publik | Semua | Otentikasi pengguna & pembuatan sesi/token |
| 3 | `POST` | `/auth/logout` | Wajib | Semua | Mengakhiri sesi & mencabut token akses |
| 4 | `GET` | `/auth/me` | Wajib | Semua | Mengambil profil pengguna yang sedang login |
| 5 | `PUT` | `/auth/profile` | Wajib | Semua | Memperbarui nama dan nomor telepon pribadi |
| 6 | `PUT` | `/auth/password` | Wajib | Semua | Mengubah kata sandi pengguna |
| 7 | `GET` | `/dashboard/stats` | Wajib | Semua | Mengambil metrik statistik sesuai peran pengguna |
| 8 | `GET` | `/admin/roles` | Wajib | `admin` | Mengambil daftar master peran & jumlah pengguna |
| 9 | `GET` | `/admin/users` | Wajib | `admin` | Mengambil daftar pengguna dengan filter & pagination |
| 10 | `POST` | `/admin/users` | Wajib | `admin` | Mendaftarkan akun pengguna baru |
| 11 | `GET` | `/admin/users/{id}` | Wajib | `admin` | Mengambil data detail satu pengguna |
| 12 | `PUT` | `/admin/users/{id}` | Wajib | `admin` | Memperbarui data pengguna, peran, atau status |
| 13 | `DELETE`| `/admin/users/{id}` | Wajib | `admin` | Menghapus pengguna (dengan proteksi akun diri) |

---

## 3. Rincian Endpoint

### 3.1. Health Check
- **URL**: `GET /health`
- **Respons (200 OK)**:
```json
{
  "success": true,
  "message": "LMS API Service is healthy",
  "data": {
    "service": "LMS Multi Segmen Berbasis Web - Maxy Academy",
    "version": "1.0.0",
    "environment": "local",
    "timestamp": "2026-10-17T18:25:00+07:00",
    "database": {
      "driver": "pgsql",
      "status": "healthy",
      "latency_ms": 2.45
    }
  }
}
```

---

### 3.2. Login Pengguna
- **URL**: `POST /auth/login`
- **Headers**: `Content-Type: application/json`, `Accept: application/json`
- **Request Body**:
```json
{
  "email": "admin@maxy.test",
  "password": "MaxySecure2026!"
}
```
- **Respons Berhasil (200 OK)**:
```json
{
  "success": true,
  "message": "Berhasil masuk ke dalam sistem.",
  "data": {
    "user": {
      "id": 1,
      "name": "Administrator Maxy",
      "email": "admin@maxy.test",
      "phone": "081200000001",
      "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      "is_active": true,
      "primary_role": "admin",
      "roles": [
        { "id": 1, "name": "admin", "display_name": "Administrator" }
      ],
      "permissions": ["dashboard:admin", "users:view", "users:create", "..."]
    },
    "token": "1|sanctum_plain_text_token_string",
    "token_type": "Bearer",
    "primary_role": "admin",
    "redirect_url": "/admin/dashboard"
  }
}
```
- **Respons Gagal Validasi (422 Unprocessable Content)**:
```json
{
  "success": false,
  "message": "Data yang dikirim tidak valid.",
  "errors": {
    "email": ["Kredensial yang diberikan tidak cocok dengan data kami."]
  }
}
```
- **Respons Akun Nonaktif (403 Forbidden)**:
```json
{
  "success": false,
  "message": "Akun Anda dinonaktifkan oleh administrator. Silakan hubungi admin."
}
```

---

### 3.3. Mengambil Profil Pengguna (`/auth/me`)
- **URL**: `GET /auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Respons (200 OK)**:
```json
{
  "success": true,
  "message": "Profil pengguna berhasil dimuat.",
  "data": {
    "user": {
      "id": 1,
      "name": "Administrator Maxy",
      "email": "admin@maxy.test",
      "primary_role": "admin",
      "roles": [{ "id": 1, "name": "admin", "display_name": "Administrator" }],
      "permissions": ["dashboard:admin", "users:view", "..."]
    },
    "primary_role": "admin",
    "redirect_url": "/admin/dashboard"
  }
}
```

---

### 3.4. Statistik Dashboard Sesuai Peran
- **URL**: `GET /dashboard/stats`
- **Headers**: `Authorization: Bearer <token>`
- **Deskripsi**: Sistem mendeteksi role pengguna yang sedang login dan mengembalikan metrik yang disesuaikan secara dinamis:
  - Role `admin`: Total pengguna per role, recent users, status database.
  - Role `mentor`: Batch aktif, jumlah siswa ampu, tugas menunggu review, jadwal live mentoring.
  - Role `siswa`: Kursus terdaftar, persentase progres belajar, modul selesai, jadwal submission.
  - Role `karyawan`: Modul kepatuhan selesai, jam upskilling, sertifikasi HR internal.
  - Role `lembaga_bimbingan`: Jumlah siswa binaan kohort, persentase kehadiran, nilai rata-rata kelompok.

---

### 3.5. Manajemen Pengguna Admin (`/admin/users`)

#### A. Daftar Pengguna (List with Filter & Pagination)
- **URL**: `GET /admin/users?search=siti&role=siswa&is_active=true&page=1&per_page=10`
- **Query Parameters**:
  - `search` (opsional): Pencarian parsial case-insensitive pada nama, email, atau telepon.
  - `role` (opsional): Filter berdasarkan nama role (`admin`, `mentor`, `siswa`, `karyawan`, `lembaga_bimbingan`).
  - `is_active` (opsional): Filter status `true` atau `false`.
  - `page` (opsional): Nomor halaman (default: 1).
  - `per_page` (opsional): Jumlah item per halaman (default: 10, maks: 100).
- **Respons (200 OK)**:
```json
{
  "data": [
    {
      "id": 3,
      "name": "Siti Rahmawati",
      "email": "siswa@maxy.test",
      "phone": "081200000003",
      "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=siti",
      "is_active": true,
      "primary_role": "siswa",
      "roles": [{ "id": 3, "name": "siswa", "display_name": "Siswa" }],
      "created_at": "2026-10-17T17:50:39.000000Z"
    }
  ],
  "links": { "first": "...", "last": "...", "prev": null, "next": null },
  "meta": { "current_page": 1, "from": 1, "last_page": 1, "per_page": 10, "to": 1, "total": 1 }
}
```

#### B. Tambah Pengguna Baru
- **URL**: `POST /admin/users`
- **Request Body**:
```json
{
  "name": "Peserta Baru Capstone",
  "email": "peserta.baru@maxy.test",
  "password": "PasswordAwal123!",
  "phone": "081234567890",
  "role_id": 3,
  "is_active": true
}
```
- **Respons (201 Created)**: Mengembalikan objek data pengguna yang baru dibuat.

#### C. Ubah Data Pengguna
- **URL**: `PUT /admin/users/{id}`
- **Request Body**:
```json
{
  "name": "Peserta Baru Diperbarui",
  "email": "peserta.baru@maxy.test",
  "phone": "081234567899",
  "role_id": 3,
  "is_active": true,
  "password": "KataSandiBaruOptional123!"
}
```
- **Respons (200 OK)**: Mengembalikan data pengguna yang telah diperbarui.

#### D. Hapus Pengguna
- **URL**: `DELETE /admin/users/{id}`
- **Respons (200 OK)**:
```json
{
  "success": true,
  "message": "Pengguna berhasil dihapus."
}
```
- **Proteksi Hapus Diri Sendiri (403 Forbidden)**:
```json
{
  "success": false,
  "message": "This action is unauthorized."
}
```
