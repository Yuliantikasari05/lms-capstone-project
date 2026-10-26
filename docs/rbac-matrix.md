# Matriks Hak Akses (RBAC Matrix) & Least Privilege

Dokumen ini mendefinisikan matriks wewenang operasional untuk 5 peran pengguna dalam sistem **LMS Multi Segmen Maxy Academy**.

---

## 1. Definisi 5 Peran (Roles)

| Kode Peran | Nama Peran | Deskripsi Segmen Pengguna |
|---|---|---|
| `admin` | **Administrator** | Staf pengelola dan pengembang platform dengan wewenang tertinggi untuk mengatur identitas, hak akses, modul, dan kesehatan sistem. |
| `mentor` | **Mentor** | Tenaga pengajar dan praktisi industri yang mendampingi siswa, mengelola kelas bimbingan, serta mengevaluasi penugasan. |
| `siswa` | **Siswa** | Peserta didik program intensif atau reguler yang mengakses materi pembelajaran, mengerjakan tugas, dan memantau kemajuan belajar. |
| `karyawan` | **Karyawan** | Peserta pelatihan korporat internal perusahaan yang menempuh kurikulum upskilling/reskilling dan sertifikasi kepatuhan. |
| `lembaga_bimbingan` | **Lembaga Bimbingan**| Institusi mitra atau koordinator bimbingan belajar yang memantau performa agregat, kehadiran, dan kelulusan siswa kohort naungannya. |

---

## 2. Matriks Izin (Permissions Matrix)

Keterangan:
- `✓`: Diberikan izin (Granted)
- `-`: Ditolak / Tidak memiliki izin (Forbidden)

Sumber kebenaran matriks ini adalah `backend/database/seeders/RbacSeeder.php`. Admin otomatis lolos semua permission. Seeder menolak (error) jika sebuah role dipetakan ke permission yang belum didefinisikan.

| Kategori | Nama Izin (`permission`) | Keterangan | Admin | Mentor | Siswa | Karyawan | Lembaga |
|---|---|---|:---:|:---:|:---:|:---:|:---:|
| **Dashboard** | `dashboard:admin` | Lihat Dashboard Admin | ✓ | - | - | - | - |
|  | `dashboard:mentor` | Lihat Dashboard Mentor | ✓ | ✓ | - | - | - |
|  | `dashboard:siswa` | Lihat Dashboard Siswa | ✓ | - | ✓ | - | - |
|  | `dashboard:karyawan` | Lihat Dashboard Karyawan | ✓ | - | - | ✓ | - |
|  | `dashboard:lembaga` | Lihat Dashboard Lembaga | ✓ | - | - | - | ✓ |
| **Manajemen Pengguna** | `users:view` | Lihat Pengguna | ✓ | - | - | - | - |
|  | `users:create` | Tambah Pengguna | ✓ | - | - | - | - |
|  | `users:edit` | Ubah Pengguna | ✓ | - | - | - | - |
|  | `users:delete` | Hapus Pengguna | ✓ | - | - | - | - |
|  | `users:export` | Ekspor Daftar Pengguna | ✓ | - | - | - | - |
| **Peran & Izin** | `roles:view` | Lihat Peran & Izin | ✓ | - | - | - | - |
|  | `roles:manage` | Kelola Peran & Izin | ✓ | - | - | - | - |
| **Kursus & Kurikulum** | `courses:view` | Lihat Katalog Kursus | ✓ | ✓ | - | - | - |
|  | `courses:manage` | Kelola Kurikulum & Materi | ✓ | ✓ | - | - | - |
|  | `courses:enrolled` | Akses Kursus Terdaftar | ✓ | - | ✓ | ✓ | - |
| **Ujian** | `exams:review` | Tinjau Pengajuan Ujian | ✓ | - | - | - | - |
|  | `exams:create` | Buat Soal Ujian | ✓ | ✓ | - | - | - |
|  | `exams:submit_review` | Ajukan Ujian ke Admin | ✓ | ✓ | - | - | - |
|  | `exams:take` | Mengerjakan Ujian | ✓ | - | ✓ | - | - |
| **Tugas & Evaluasi** | `assignments:create` | Buat Tugas & Evaluasi | ✓ | ✓ | - | - | - |
|  | `assignments:review` | Evaluasi Tugas & Feedback | ✓ | ✓ | - | - | - |
|  | `assignments:submit` | Kumpul Tugas Siswa | ✓ | - | ✓ | - | - |
|  | `evaluations:submit` | Kumpul Evaluasi Karyawan | ✓ | - | - | ✓ | - |
|  | `grades:view_own` | Lihat Nilai & Hasil Belajar | ✓ | - | ✓ | ✓ | - |
| **Gamifikasi** | `gamification:manage` | Kelola Gamifikasi Sistem | ✓ | - | - | - | - |
|  | `gamification:view_xp` | Lihat Poin XP Pribadi | ✓ | - | ✓ | - | - |
|  | `leaderboard:view` | Lihat Papan Peringkat | ✓ | - | ✓ | - | - |
| **Voucher & Harga** | `vouchers:manage` | Kelola Voucher & Kupon | ✓ | - | - | - | ✓ |
|  | `pricing:manage` | Atur Harga Paket | ✓ | - | - | - | ✓ |
| **Sertifikasi** | `certifications:manage` | Kelola & Terbitkan Sertifikat | ✓ | - | - | - | - |
|  | `certifications:apply` | Ajukan Sertifikasi | ✓ | - | - | ✓ | - |
|  | `certifications:view_own` | Lihat Sertifikat Pribadi | ✓ | - | - | ✓ | - |
| **Jadwal & Webinar** | `schedules:manage` | Kelola Jadwal Bimbingan | ✓ | ✓ | - | - | - |
|  | `sessions:attend` | Ikuti Sesi Bimbingan | ✓ | - | ✓ | - | - |
|  | `webinars:manage` | Kelola Webinar Pelatihan | ✓ | ✓ | - | - | - |
|  | `webinars:attend` | Ikuti Sesi Webinar | ✓ | - | - | ✓ | - |
| **Diskusi & Ulasan** | `discussions:manage` | Kelola Forum Diskusi | ✓ | ✓ | - | - | - |
|  | `reviews:view` | Lihat Ulasan Peserta | ✓ | ✓ | - | - | - |
| **Siswa & Peserta** | `students:view_assigned` | Lihat Siswa Diampu | ✓ | ✓ | - | - | - |
|  | `employees:view_assigned` | Lihat Karyawan Diampu | ✓ | ✓ | - | - | - |
| **Lembaga** | `institution:manage_modules` | Kelola Modul Mandiri Lembaga | ✓ | - | - | - | ✓ |
|  | `institution:manage_students` | Kelola & Daftarkan Siswa Lembaga | ✓ | - | - | - | ✓ |
|  | `institution:manage_sessions` | Kelola Sesi Lembaga | ✓ | - | - | - | ✓ |
|  | `institution:manage_resources` | Kelola Resources Lembaga | ✓ | - | - | - | ✓ |
|  | `institution:manage_discussions` | Kelola Diskusi Lembaga | ✓ | - | - | - | ✓ |
|  | `institution:explore_programs` | Jelajah Modul Sistem | ✓ | - | - | - | ✓ |
| **Laporan & Pendapatan** | `reports:view` | Lihat Laporan Sistem | ✓ | - | - | - | - |
|  | `reports:cohort` | Pantau Laporan Kohort | ✓ | - | - | - | ✓ |
|  | `reports:view_own` | Lihat Riwayat & Laporan Belajar | ✓ | - | - | ✓ | - |
|  | `revenue:view_partner` | Pantau Pemasukan Kemitraan | ✓ | - | - | - | - |
|  | `revenue:view_own` | Pantau Pemasukan Penjualan Paket | ✓ | - | - | - | ✓ |
| **Umum** | `payments:make` | Akses Alur Pembayaran | ✓ | - | ✓ | ✓ | - |
|  | `notifications:view` | Lihat Notifikasi Sistem | ✓ | ✓ | ✓ | ✓ | ✓ |
|  | `profile:manage` | Kelola Profil & Keamanan | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 3. Penerapan Prinsip Least Privilege

1. **Penegakan Berlapis (Multi-Tier Enforcement)**:
   - **Tingkat Rute API**: Rute fitur dibungkus middleware `permission:<nama>`; beberapa izin alternatif dipisah `|` (mis. `permission:schedules:manage|sessions:attend|webinars:attend` = cukup salah satu). Rute administratif dibungkus middleware `role:admin`. Upaya akses oleh role lain secara otomatis diblokir dengan respons HTTP `403 Forbidden`.
   - **Tingkat Controller & Model Policy**: `UserController` memanggil `UserPolicy` untuk memastikan pengguna tidak dapat menghapus akunnya sendiri (`self-deletion protection`).
   - **Kepemilikan Data**: Mentor hanya dapat mengelola kursus yang ia ampu (trait `ChecksCourseOwnership`) dan jadwal yang ia buat (`mentor_id`). Karyawan hanya melihat pengajuan sertifikasinya sendiri; pemegang `certifications:manage` melihat semua.
   - **Tingkat Antarmuka (UI Navigation)**: Navigasi sidebar hanya merender menu yang sesuai dengan peran aktif pengguna untuk menyederhanakan pengalaman pengguna (UX).
   - **Tingkat Rute SPA**: React Router melindungi rute dengan `RoleRoute` yang melakukan verifikasi sebelum komponen dashboard dimuat.

2. **Pemisahan Data Multi Segmen**:
   - Seorang `Siswa` tidak dapat melihat data presensi internal karyawan mitra korporat.
   - Seorang `Mentor` hanya memiliki hak membaca dan menilai data siswa yang berada dalam batch ampuannya.
   - `Lembaga Bimbingan` hanya dapat melihat metrik kohort yang terikat dengan kode institusinya dan tidak memiliki hak melihat detail finansial atau akun pengguna lembaga lain.
