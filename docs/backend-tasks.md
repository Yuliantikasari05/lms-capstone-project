# Prompt & Daftar Pekerjaan Backend — LMS Multi Segmen Maxy Academy

Dokumen ini berisi prompt kerja untuk asisten AI saat mengerjakan backend, serta daftar pekerjaan backend yang diturunkan dari catatan fitur per role (Admin, Mentor, Siswa, Karyawan, Lembaga Bimbingan).

**Keputusan tim yang sudah ditetapkan:**
- Pembayaran memakai **simulasi** terlebih dahulu. Integrasi Midtrans dikerjakan belakangan.
- Mentor **tidak boleh membuat kursus baru**, tetapi **boleh menambah modul** dan mengisi materi pada kursus yang ditugaskan kepadanya.

---

## 1. Prompt Backend

Salin prompt berikut ke awal sesi AI setiap kali mengerjakan backend.

```text
Kamu adalah asisten backend engineer untuk proyek capstone "LMS Multi Segmen Maxy Academy"
(repo: lms-capstone-project). Saya bertanggung jawab atas folder backend/.

KONTEKS TEKNIS
- Laravel 12 (PHP 8.2), PostgreSQL, Laravel Sanctum (SPA cookie + Bearer token fallback).
- Endpoint di routes/api.php dengan prefix /api/v1. Controller ada di app/Http/Controllers/Api/V1/
  (subfolder Admin/, Course/, Assessment/). Frontend React+Vite (frontend/, port 5173).
- RBAC custom: tabel roles, permissions, role_user, permission_role. Role: admin, mentor, siswa,
  karyawan, lembaga_bimbingan. Permission "grup:aksi" diseed di database/seeders/RbacSeeder.php.
  Admin otomatis lolos semua permission. Middleware: role:<nama>, permission:<nama>.
  Cek kepemilikan kursus memakai trait Concerns/ChecksCourseOwnership.
- Format respons: { "success": bool, "message": "...", "data": ... }. Pesan dalam Bahasa Indonesia.
- Model yang ada: User, Role, Permission, Course, CourseModule, Lesson, Enrollment, LessonProgress,
  Assignment, Submission, Exam (draft→pending_review→approved/rejected), ExamQuestion, ExamAttempt,
  Certification, MentorSchedule.

ATURAN BISNIS (WAJIB DIIKUTI)
1. Kursus dibuat oleh ADMIN (serta Lembaga untuk kursus/modul miliknya sendiri) dan Admin
   menugaskan mentor ke kursus. Mentor TIDAK bisa membuat kursus baru, tetapi BOLEH menambah,
   mengubah, dan menghapus modul serta materi, tugas, ujian, sesi, dan diskusi pada kursus yang
   ditugaskan kepadanya. Mentor juga bisa melihat preview kurikulum.
2. Siswa & Karyawan: kelas/pelatihan/webinar memuat materi, video, link meet, tugas, dan ujian dalam
   SATU alur. Riwayat belajar tidak dipisah menjadi menu sendiri; materi yang sudah dilewati tetap
   bisa dibuka dari kursusnya.
3. Menyelesaikan materi, tugas, dan ujian memberi XP (gamifikasi). Leaderboard dihitung dari XP asli.
4. Pembayaran menyatu dengan alur pendaftaran kelas/pelatihan/webinar (termasuk materi berbayar
   milik Lembaga). Voucher diskon dapat diterapkan saat checkout.
   PEMBAYARAN SAAT INI ADALAH SIMULASI: buat order dengan status pending, lalu endpoint
   "bayar (simulasi)" mengubahnya menjadi paid/failed. Desain dibuat lewat satu service
   (mis. PaymentGateway interface + SimulatedPaymentGateway) agar nanti bisa diganti Midtrans
   tanpa mengubah alur order/enrollment.
5. Sertifikasi karyawan diajukan BERDASARKAN pelatihan/webinar yang sudah diikuti/diselesaikan.
   Status: pending → verified → issued / rejected, diubah oleh Admin. Sertifikat berstatus "issued"
   bisa diunduh (PDF bernomor unik).
6. Lembaga: modul miliknya memuat sesi belajar, materi/resources, dan diskusi dalam satu kesatuan.
   Harga paket diatur di menu Jelajah; menu Voucher khusus mengelola voucher. Lembaga memantau
   profil & progres siswanya serta laporan pendapatan.
7. Semua role: ganti foto profil (upload), 2FA (TOTP), dan UI tidak menampilkan info teknis
   (PostgreSQL/Sanctum).

ATURAN KERJA
1. Ikuti gaya kode yang sudah ada (validasi, Resource, nama route "api.v1.<grup>.<aksi>").
2. Setiap endpoint wajib memakai middleware permission dan cek kepemilikan data (least privilege).
   Permission baru ditambahkan ke RbacSeeder dan dipetakan ke role.
3. Jangan memakai kode legacy yang merujuk kolom slug/status, Role::ADMIN, User::STATUS_*,
   isActive(), atau last_login_at.
4. Perubahan skema dibuat lewat migration BARU.
5. Hapus data dummy/hardcoded di controller; semua data dashboard & notifikasi berasal dari database.
6. Setiap fitur disertai Feature test (sukses, 403 untuk role lain, 422 untuk validasi).
7. Perbarui docs/api-contract.md & docs/database-blueprint.md setiap menambah endpoint/tabel.
8. Sebelum menulis kode, jelaskan rencana: tabel/migration, endpoint, permission, dan file yang diubah.
```

---

## 2. Daftar Pekerjaan Backend

Kolom **Status** diisi tim: `Belum`, `Dikerjakan`, `Selesai`.

### A. Fitur Lintas Role

| # | Fitur | Pekerjaan backend | Status |
|---|---|---|---|
| A1 | Ganti foto profil | `POST /auth/avatar` (upload gambar, validasi tipe/ukuran, simpan di disk `public`), perbarui `avatar_url` | Belum |
| A2 | 2FA | Kolom `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`. Endpoint aktifkan, konfirmasi, nonaktifkan, dan verifikasi kode saat login (login 2 langkah) | Belum |
| A3 | Sembunyikan info hak akses | `permissions` tetap dikirim untuk guard frontend; tampilan dihapus di frontend | Belum |
| A4 | Informasi yang ditampilkan belum sesuai | Ganti semua data dummy di `DashboardController` dan `NotificationController` dengan query asli | Belum |
| A5 | Notifikasi asli | Tabel `notifications` Laravel, endpoint list + mark as read, dipicu event nilai, review ujian, sertifikat, pembayaran | Belum |
| A6 | Stabilisasi | Hapus/perbaiki kode legacy (lihat Lampiran), tambah permission & cek kepemilikan pada `/schedules` dan `/certifications`, rate limit login, hapus kredensial dari `phpunit.xml` | Dikerjakan (tinggal hapus `migrasi-lama/` & uji di PostgreSQL) |

### B. Admin

| # | Catatan fitur | Pekerjaan backend | Status |
|---|---|---|---|
| B1 | Bisa menyimpan data pengguna | Sudah berfungsi; sesuaikan field jika form berubah | Belum |
| B2 | Manajemen Kursus, form disesuaikan requirement | Admin membuat kursus + **assign mentor**. Tambah field: harga, kategori, tipe (kelas/pelatihan/webinar). Pembuatan kursus dibatasi untuk admin & lembaga | Belum |
| B3 | Tinjau ujian menjadi menu sendiri | Endpoint `/exam-reviews` sudah ada, dirapikan | Belum |
| B4 | Sertifikasi: ubah status + download | `PATCH /certifications/{id}/status` (pending/verified/issued/rejected), `GET /certifications/{id}/download` (PDF, mis. `barryvdh/laravel-dompdf`), nomor sertifikat unik | Belum |
| B5 | Voucher berjalan, XP belum | Tabel `vouchers`, `voucher_redemptions` (bila voucher masih di frontend saja) dan aturan XP (`xp_rules`) yang diatur admin | Belum |
| B6 | Export belum bisa, update status belum jelas | Perbaiki `GET /admin/users/export`; endpoint `PATCH /admin/users/{id}/status` untuk aktif/nonaktif | Belum |
| B7 | Laporan pendapatan mitra | Ringkasan pemasukan dari tabel `payments` asli, per lembaga | Belum |

### C. Mentor

| # | Catatan fitur | Pekerjaan backend | Status |
|---|---|---|---|
| C1 | Tidak ada fitur menambah kursus baru | `POST /manage/courses` hanya untuk admin & lembaga. Mentor **tetap boleh** CRUD modul & materi pada kursus yang ditugaskan; form materi disesuaikan | Belum |
| C2 | Kategori penilaian siswa & karyawan | Kolom kategori/audience pada `assignments` dan `exams` (siswa/karyawan; tugas/kuis/ujian/evaluasi) | Belum |
| C3 | Master tugas / bank soal | Tabel `question_banks`, `question_bank_items`; ujian dapat mengambil soal dari bank | Belum |
| C4 | Profil & progres detail siswa/karyawan | `GET /teach/students`, `GET /teach/students/{id}`: progres per kursus, nilai, kehadiran | Belum |
| C5 | Kategori kelas & pencarian | Filter `category`, `search`, `audience` pada daftar kursus mentor | Belum |
| C6 | Diskusi belum tersimpan di database | Tabel `discussion_threads`, `discussion_messages` per kursus/modul dengan status; CRUD + balas | Belum |
| C7 | Preview materi/kurikulum | `GET /teach/courses/{id}/preview` (read-only) | Belum |
| C8 | Jadwal bimbingan | Kaitkan `mentor_schedules` ke `course_id`, hapus `rand()` pada `attendees_count` | Belum |

### D. Siswa

| # | Catatan fitur | Pekerjaan backend | Status |
|---|---|---|---|
| D1 | Pencarian & filter | Parameter `search`, `category`, `level`, `price` di `/learn/catalog` | Belum |
| D2 | Rating & ulasan | Tabel `course_reviews` (rating 1–5, komentar, satu ulasan per siswa per kursus) | Belum |
| D3 | Kalender belajar | `GET /learn/calendar`: gabungan jadwal sesi, deadline tugas, ujian | Belum |
| D4 | XP saat materi selesai | Tabel `xp_transactions`; XP saat lesson selesai, tugas dinilai, ujian lulus. `GET /learn/xp`, `GET /leaderboard` | Belum |
| D5 | Hasil evaluasi & feedback detail | `GET /learn/submissions/{id}`, `GET /learn/exam-attempts/{id}` | Belum |
| D6 | Pembayaran menyatu dengan materi | Tabel `orders`, `payments`. Alur: enroll kursus berbayar → order `pending` → `POST /payments/{order}/simulate` (paid/failed) → enrollment aktif. Kursus gratis langsung enroll | Belum |
| D7 | Laporan belajar siswa | `GET /learn/report`: progres, nilai, XP, kehadiran (+ ekspor PDF opsional) | Belum |

### E. Karyawan

| # | Catatan fitur | Pekerjaan backend | Status |
|---|---|---|---|
| E1 | Akses video, meet, tugas, materi | Beri karyawan akses kursus `audience=karyawan` (permission yang benar-benar ada di seeder); pakai ulang `LearnController` | Belum |
| E2 | Webinar | Pendaftaran webinar (`schedule_registrations`) dan presensi | Belum |
| E3 | Pembayaran pelatihan/webinar | Pakai ulang `orders`/`payments` simulasi (D6), plus opsi "dibiayai perusahaan" | Belum |
| E4 | Sertifikasi berdasarkan pelatihan yang diikuti | Tambah `course_id`/`enrollment_id` pada `certifications`; hanya bisa diajukan jika enrollment `completed`; jam pelatihan dihitung otomatis | Belum |
| E5 | Menu riwayat dihapus | Tidak perlu endpoint baru; riwayat diambil dari daftar pelatihan | Belum |
| E6 | Laporan belajar karyawan | `GET /learn/report` (sama dengan D7) | Belum |

### F. Lembaga Bimbingan

| # | Catatan fitur | Pekerjaan backend | Status |
|---|---|---|---|
| F1 | Modul = sesi + materi + diskusi | Lembaga sebagai pemilik kursus (`courses.owner_id` / `institution_id`); CRUD modul, materi, sesi, diskusi dengan cek kepemilikan | Belum |
| F2 | Resources digabung ke modul | Tipe materi `file` (upload PDF/dokumen) pada `lessons` | Belum |
| F3 | Profil & progres siswa lembaga | Relasi `institution_students`, daftarkan siswa, `GET /institution/students/{id}` | Belum |
| F4 | Harga paket di Jelajah, Voucher terpisah | Kolom `price` pada kursus/paket; CRUD voucher milik lembaga (`vouchers.owner_id`) | Belum |
| F5 | Laporan pendapatan | `GET /institution/revenue` dari tabel `payments` | Belum |
| F6 | Pengaturan | Profil lembaga (nama, logo, kontak) + 2FA (A2) | Belum |

---

## 3. Urutan Pengerjaan

1. **Fondasi:** A6, B2 + C1 (alur kursus admin → mentor), E1
2. **Inti pembelajaran:** C6, D4, D5, C2–C4
3. **Transaksi (simulasi):** D6/E3, B5/F4, B7/F5
4. **Sertifikasi & laporan:** B4, E4, D7/E6, F3
5. **Akun:** A1, A2, A5
6. **Nanti:** ganti `SimulatedPaymentGateway` dengan Midtrans (Snap + webhook)

## 4. Di Luar Lingkup Backend (dikerjakan frontend)

- Menghilangkan info PostgreSQL/Sanctum di UI
- Perubahan layout sidebar sesuai desain
- Penggabungan, pemisahan, dan penggantian nama menu

---

## Lampiran: Kode Legacy yang Perlu Dibersihkan (A6)

File berikut merujuk skema lama (`slug`, `status`, `Role::ADMIN`, `User::STATUS_*`, `isActive()`, `last_login_at`) yang tidak ada lagi:

- `app/Http/Controllers/Api/V1/Auth/AuthController.php`
- `app/Http/Controllers/Api/V1/UserController.php`, `RoleController.php`, `AdminSummaryController.php`
- `app/Http/Requests/LoginRequest.php`, `StoreUserRequest.php`, `UpdateUserRequest.php` (versi di root `Requests/`)
- `app/Http/Middleware/EnsureAccountIsActive.php`, `EnsureHasPermission.php`
- `app/Console/Commands/CreateAdminCommand.php` (perbaiki agar memakai `name` & `is_active`)
- `database/seeders/AdminSeeder.php`, `RolePermissionSeeder.php`
- `tests/Feature/RbacTest.php`
- Folder `migrasi-lama/`

Celah lain: permission `training:view` dipetakan ke karyawan tetapi tidak didefinisikan di `RbacSeeder`.
