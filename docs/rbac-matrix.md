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

| Kategori | Nama Izin (`permission`) | Admin | Mentor | Siswa | Karyawan | Lembaga |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Dashboard** | `dashboard:admin` | ✓ | - | - | - | - |
| | `dashboard:mentor` | ✓ | ✓ | - | - | - |
| | `dashboard:siswa` | ✓ | - | ✓ | - | - |
| | `dashboard:karyawan` | ✓ | - | - | ✓ | - |
| | `dashboard:lembaga` | ✓ | - | - | - | ✓ |
| **Manajemen Pengguna** | `users:view` | ✓ | - | - | - | - |
| | `users:create` | ✓ | - | - | - | - |
| | `users:edit` | ✓ | - | - | - | - |
| | `users:delete` | ✓ | - | - | - | - |
| **Peran & Otorisasi** | `roles:view` | ✓ | - | - | - | - |
| | `roles:manage` | ✓ | - | - | - | - |
| **Kursus & Kurikulum** | `courses:view` | ✓ | ✓ | - | - | - |
| | `courses:manage` | ✓ | ✓ | - | - | - |
| | `courses:enrolled` | ✓ | - | ✓ | - | - |
| **Tugas & Evaluasi** | `assignments:review` | ✓ | ✓ | - | - | - |
| | `assignments:submit` | ✓ | - | ✓ | - | - |
| | `grades:view_own` | ✓ | - | ✓ | - | - |
| **Siswa & Kohort** | `students:view_assigned` | ✓ | ✓ | - | - | - |
| | `students:view_cohort` | ✓ | - | - | - | ✓ |
| | `reports:cohort` | ✓ | - | - | - | ✓ |
| **Pelatihan Korporat** | `training:view` | ✓ | - | - | ✓ | - |
| | `certifications:view_own` | ✓ | - | - | ✓ | - |
| **Profil Pribadi** | `auth:profile` | ✓ | ✓ | ✓ | ✓ | ✓ |
| | `auth:password` | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Sistem & Audit** | `system:settings` | ✓ | - | - | - | - |
| | `reports:view` | ✓ | - | - | - | - |

---

## 3. Penerapan Prinsip Least Privilege

1. **Penegakan Berlapis (Multi-Tier Enforcement)**:
   - **Tingkat Rute API**: Rute administratif dibungkus middleware `role:admin`. Upaya akses oleh role lain secara otomatis diblokir dengan respons HTTP `403 Forbidden`.
   - **Tingkat Controller & Model Policy**: `UserController` memanggil `UserPolicy` untuk memastikan pengguna tidak dapat menghapus akunnya sendiri (`self-deletion protection`).
   - **Tingkat Antarmuka (UI Navigation)**: Navigasi sidebar hanya merender menu yang sesuai dengan peran aktif pengguna untuk menyederhanakan pengalaman pengguna (UX).
   - **Tingkat Rute SPA**: React Router melindungi rute dengan `RoleRoute` yang melakukan verifikasi sebelum komponen dashboard dimuat.

2. **Pemisahan Data Multi Segmen**:
   - Seorang `Siswa` tidak dapat melihat data presensi internal karyawan mitra korporat.
   - Seorang `Mentor` hanya memiliki hak membaca dan menilai data siswa yang berada dalam batch ampuannya.
   - `Lembaga Bimbingan` hanya dapat melihat metrik kohort yang terikat dengan kode institusinya dan tidak memiliki hak melihat detail finansial atau akun pengguna lembaga lain.
