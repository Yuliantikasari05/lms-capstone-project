# Roadmap Implementasi 4 Bulan — LMS Multi Segmen Maxy Academy

Dokumen ini memetakan tahapan rilis sistem, membedakan secara tegas antara **fitur yang sudah dibuat**, **fitur yang sudah diuji secara otomatis**, dan **fitur yang masih berupa rancangan ke depan**.

---

## 1. Status Fitur Fondasi Saat Ini (Bulan ke-0 / Milestone 1)

### A. Fitur yang Sudah Selesai Dibuat (Completed)
- [x] Struktur proyek decoupled monorepo (`frontend/`, `backend/`, `docs/`, `README.md`).
- [x] Basis data relasional PostgreSQL dengan engine versi 18.
- [x] Skema RBAC lengkap: tabel `users`, `roles`, `permissions`, `role_user`, `permission_role`.
- [x] Seeder 5 peran: Administrator, Mentor, Siswa, Karyawan, Lembaga Bimbingan.
- [x] Seeder akun bawaan untuk pengujian masing-masing peran (kata sandi aman via env).
- [x] Autentikasi Laravel Sanctum first-party SPA session/cookie + Bearer token fallback.
- [x] REST API v1 (`/api/v1/health`, `/api/v1/auth/*`, `/api/v1/dashboard/stats`, `/api/v1/admin/users/*`, `/api/v1/admin/roles`).
- [x] Penegakan Least Privilege di backend via `CheckRole` dan `CheckPermission` middleware serta `UserPolicy`.
- [x] Proteksi keamanan: blokir hapus diri sendiri (self-deletion block) dan pencegahan akses user nonaktif.
- [x] Frontend React + TypeScript + Vite + Tailwind CSS dengan desain portal edukasi profesional.
- [x] 5 Dashboard peran terisolasi: Admin, Mentor, Siswa, Karyawan, Lembaga Bimbingan.
- [x] Halaman Manajemen Pengguna Admin lengkap: pencarian, filter role/status, pagination, modal tambah, modal edit, dan dialog hapus.
- [x] Halaman Profil Pengguna: pembaruan informasi kontak, ganti kata sandi, dan inspeksi hak akses RBAC.
- [x] Quick-Fill Demo Bar pada halaman login untuk pengujian instan kelima peran.

### B. Fitur yang Sudah Diuji Secara Nyata (Verified & Tested)
- [x] **Build Frontend**: Kompilasi TypeScript dan bundler Vite berhasil bebas error (`0 errors, built in 1.39s`).
- [x] **Migrasi & Seeding**: Eksekusi `php artisan migrate:fresh --seed` terverifikasi di PostgreSQL 18.
- [x] **Automated Feature Tests**: 15 unit/feature test suite lolos pada database pengujian terpisah `lms_capstone_test` (`15 passed, 57 assertions`).
- [x] **End-to-End Live HTTP Integration**: 15 skenario HTTP nyata berhasil dieksekusi terhadap live server `127.0.0.1:8000` (termasuk verifikasi status 403 Forbidden ketika non-admin mencoba mengakses endpoint pengguna).

---

## 2. Rencana Pengembangan Fitur 4 Bulan ke Depan

```text
+-----------------------+-----------------------+-----------------------+-----------------------+
|        BULAN 1        |        BULAN 2        |        BULAN 3        |        BULAN 4        |
|  Manajemen Kurikulum  |    Tugas, Kuis, &     |    Pembayaran &       |  Analitik Lanjutan,   |
|   & Pembelajaran      |      Penilaian        |     Sertifikasi       | Gamifikasi & Hardening|
+-----------------------+-----------------------+-----------------------+-----------------------+
```

### Bulan ke-1: Manajemen Kurikulum & Pembelajaran Terstruktur (Sprint 1 & 2)
*Status: Rancangan (Planned)*
- [ ] **Modul Kursus & Silabus**:
  - Model `courses`, `chapters`, `lessons`, dan `attachments`.
  - Rich text editor untuk pembuatan materi ajar oleh Mentor.
  - Video player streaming embed (YouTube/Vimeo/Cloudflare Stream).
- [ ] **Enrollment & Batch Management**:
  - Alokasi siswa ke dalam batch/cohort tertentu.
  - Tracking status progres per pelajaran (selesai / belum selesai).
  - Pembatasan silabus prasyarat (prerequisite locking).

### Bulan ke-2: Evaluasi, Tugas, & Interaksi Kelas (Sprint 3 & 4)
*Status: Rancangan (Planned)*
- [ ] **Pengumpulan Tugas & Praktikum**:
  - Unggah file submission tugas siswa (PDF, ZIP, link GitHub).
  - Antarmuka review bagi Mentor dengan form penilaian skor & catatan perbaikan.
- [ ] **Kuis & Bank Soal**:
  - Pembuat kuis pilihan ganda dan esai dengan batasan waktu.
  - Koreksi kuis otomatis untuk tipe pilihan ganda.
- [ ] **Jadwal Live Mentoring**:
  - Penjadwalan sesi sinkronus mentoring.
  - Integrasi tautan telekonferensi (Google Meet / Zoom API) yang di-generate per batch.

### Bulan ke-3: Transaksi, Pembayaran, & Sertifikat Digital (Sprint 5 & 6)
*Status: Rancangan (Planned)*
- [ ] **Gateway Pembayaran Midtrans**:
  - Integrasi Snap API / Core API untuk pembayaran kursus publik siswa.
  - Webhook listener penanganan status transaksi (pending, settlement, expire).
  - Invoice otomatis dan riwayat transaksi.
- [ ] **Sertifikat Digital Otomatis**:
  - Penanda kelulusan ketika seluruh modul dan tugas mencapai ambang batas (passing grade).
  - Generator PDF sertifikat dengan nomor seri unik dan QR code verifikasi online.
- [ ] **Portal Khusus Mitra Lembaga & Korporat**:
  - Ekspor laporan rekapitulasi presensi dan nilai kohort ke format Excel/CSV.
  - Jalur sertifikasi kepatuhan tahunan karyawan.

### Bulan ke-4: Gamifikasi, Keamanan Lanjutan, & Pengujian Beban (Sprint 7 & 8)
*Status: Rancangan (Planned)*
- [ ] **Gamifikasi & Engagement**:
  - Sistem poin, lencana (badges), dan papan peringkat mingguan (leaderboard).
- [ ] **Keamanan Lanjutan**:
  - Otentikasi dua faktor (2FA) via Google Authenticator (TOTP).
  - Rate limiting API berbasis IP dan audit log menyeluruh.
- [ ] **Performance & Load Testing**:
  - Optimasi query PostgreSQL dengan database indexing dan Redis caching.
  - Pengujian beban konkurensi 1.000+ pengguna aktif simultan.
  - Persiapan deployment CI/CD pipeline ke lingkungan staging dan production.
