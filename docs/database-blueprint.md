# Blueprint Basis Data PostgreSQL (Database Blueprint)

Dokumentasi rancangan skema tabel, tipe kolom, indeks, unique constraint, dan integritas relasional (foreign key) untuk sistem **LMS Multi Segmen Maxy Academy**.

**Database Engine**: PostgreSQL 18  
**Skema Default**: `public`  
**Karakter Set & Collation**: UTF-8

---

## 1. Diagram Hubungan Entitas (ERD)

```text
+-----------------------+              +-----------------------+
|        users          |              |         roles         |
+-----------------------+              +-----------------------+
| id (PK, bigserial)    |              | id (PK, bigserial)    |
| name (varchar 255)    |              | name (varchar, unique)|
| email (varchar, uniq) |              | display_name (varchar)|
| password (varchar)    |              | description (text)    |
| phone (varchar 30)    |              | timestamps            |
| avatar_url (varchar)  |              +-----------------------+
| is_active (boolean)   |                          ▲
| email_verified_at (ts)|                          │
| timestamps            |                          │
+-----------------------+                          │
           ▲                                       │
           │                                       │
           ▼                                       ▼
+-----------------------+              +-----------------------+
|       role_user       |              |    permission_role    |
+-----------------------+              +-----------------------+
| id (PK, bigserial)    |              | id (PK, bigserial)    |
| user_id (FK -> users) |              | role_id (FK -> roles) |
| role_id (FK -> roles) |              | permission_id (FK ->) |
| timestamps            |              | timestamps            |
| UNIQUE(user, role)    |              | UNIQUE(role, permissn)|
+-----------------------+              +-----------------------+
                                                   ▲
                                                   │
                                                   ▼
                                       +-----------------------+
                                       |      permissions      |
                                       +-----------------------+
                                       | id (PK, bigserial)    |
                                       | name (varchar, unique)|
                                       | display_name (varchar)|
                                       | group (varchar 50)    |
                                       | description (text)    |
                                       | timestamps            |
                                       +-----------------------+

+--------------------------------+     +-----------------------+
|     personal_access_tokens     |     |       sessions        |
+--------------------------------+     +-----------------------+
| id (PK, bigserial)             |     | id (PK, varchar 255)  |
| tokenable_type (varchar)       |     | user_id (FK, nullable)|
| tokenable_id (bigint)          |     | ip_address (varchar)  |
| name (varchar)                 |     | user_agent (text)     |
| token (varchar 64, unique)     |     | payload (longtext)    |
| abilities (text)               |     | last_activity (int)   |
| last_used_at (timestamp)       |     +-----------------------+
| expires_at (timestamp)         |
| timestamps                     |
+--------------------------------+
```

---

## 2. Definisi Skema Tabel

### 2.1. Tabel `users`
Menyimpan kredensial dan metadata akun setiap pengguna.

| Kolom | Tipe Data | Modifiers | Deskripsi |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identifier unik pengguna |
| `name` | `VARCHAR(255)` | `NOT NULL` | Nama lengkap pengguna |
| `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | Alamat email unik untuk login |
| `email_verified_at` | `TIMESTAMP` | `NULLABLE` | Tanggal verifikasi email |
| `password` | `VARCHAR(255)` | `NOT NULL` | Kata sandi ber-hash bcrypt |
| `phone` | `VARCHAR(30)` | `NULLABLE` | Nomor kontak / WhatsApp |
| `avatar_url` | `VARCHAR(500)` | `NULLABLE` | Tautan avatar profil |
| `is_active` | `BOOLEAN` | `NOT NULL, DEFAULT TRUE` | Status aktifasi akun pengguna |
| `remember_token` | `VARCHAR(100)`| `NULLABLE` | Token remember-me web guard |
| `created_at` | `TIMESTAMP` | `NULLABLE` | Waktu pendaftaran akun |
| `updated_at` | `TIMESTAMP` | `NULLABLE` | Waktu pembaruan akun terakhir |

---

### 2.2. Tabel `roles`
Menyimpan daftar peran otorisasi dalam sistem LMS Multi Segmen.

| Kolom | Tipe Data | Modifiers | Deskripsi |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identifier unik peran |
| `name` | `VARCHAR(255)` | `NOT NULL, UNIQUE, INDEX` | Kode teknis peran (`admin`, `mentor`, `siswa`, dll.) |
| `display_name` | `VARCHAR(255)` | `NOT NULL` | Label antarmuka pengguna (`Administrator`, `Mentor`) |
| `description` | `TEXT` | `NULLABLE` | Penjelasan wewenang peran |
| `created_at` | `TIMESTAMP` | `NULLABLE` | Waktu pencatatan |
| `updated_at` | `TIMESTAMP` | `NULLABLE` | Waktu pembaruan |

---

### 2.3. Tabel `permissions`
Menyimpan izin operasional terkecil (granular privileges).

| Kolom | Tipe Data | Modifiers | Deskripsi |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identifier unik izin |
| `name` | `VARCHAR(255)` | `NOT NULL, UNIQUE, INDEX` | Kode izin unik (`users:view`, `dashboard:mentor`) |
| `display_name` | `VARCHAR(255)` | `NOT NULL` | Label izin dalam bahasa Indonesia |
| `group` | `VARCHAR(50)` | `NOT NULL, INDEX` | Modul pengelompokan (`users`, `dashboard`, `courses`) |
| `description` | `TEXT` | `NULLABLE` | Deskripsi fungsional izin |
| `created_at` | `TIMESTAMP` | `NULLABLE` | Waktu pencatatan |
| `updated_at` | `TIMESTAMP` | `NULLABLE` | Waktu pembaruan |

---

### 2.4. Tabel Pivot `role_user`
Menghubungkan pengguna dengan peran yang disandangnya (Many-to-Many).

| Kolom | Tipe Data | Modifiers | Relasi / Konstrain |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identifier unik |
| `user_id` | `BIGINT` | `NOT NULL` | `FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE` |
| `role_id` | `BIGINT` | `NOT NULL` | `FOREIGN KEY REFERENCES roles(id) ON DELETE CASCADE` |
| `created_at` | `TIMESTAMP` | `NULLABLE` | Waktu penugasan |
| `updated_at` | `TIMESTAMP` | `NULLABLE` | Waktu pembaruan |

- **Unique Constraint**: `UNIQUE (user_id, role_id)` — mencegah duplikasi penugasan peran pada satu pengguna yang sama.

---

### 2.5. Tabel Pivot `permission_role`
Menghubungkan peran dengan hak akses operasional (Many-to-Many).

| Kolom | Tipe Data | Modifiers | Relasi / Konstrain |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identifier unik |
| `role_id` | `BIGINT` | `NOT NULL` | `FOREIGN KEY REFERENCES roles(id) ON DELETE CASCADE` |
| `permission_id`| `BIGINT` | `NOT NULL` | `FOREIGN KEY REFERENCES permissions(id) ON DELETE CASCADE` |
| `created_at` | `TIMESTAMP` | `NULLABLE` | Waktu alokasi izin |
| `updated_at` | `TIMESTAMP` | `NULLABLE` | Waktu pembaruan |

- **Unique Constraint**: `UNIQUE (role_id, permission_id)` — memastikan satu izin hanya didaftarkan satu kali per peran.

---

### 2.6. Tabel `mentor_schedules`
Jadwal sesi bimbingan live dan webinar yang dibuat mentor.

| Kolom | Tipe Data | Modifiers | Deskripsi |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identifier unik jadwal |
| `mentor_id` | `BIGINT` | `NULLABLE` | `FOREIGN KEY REFERENCES users(id) ON DELETE SET NULL`; pemilik jadwal untuk cek kepemilikan |
| `mentor_name` | `VARCHAR(255)` | `NOT NULL` | Nama mentor saat jadwal dibuat |
| `title` | `VARCHAR(255)` | `NOT NULL` | Judul sesi |
| `course_name` | `VARCHAR(255)` | `NULLABLE` | Nama kursus terkait (akan diganti `course_id` pada C8) |
| `session_type` | `VARCHAR(255)` | `NOT NULL, DEFAULT 'reguler'` | `reguler` / `webinar` / `korporat` |
| `scheduled_date` | `DATE` | `NOT NULL` | Tanggal sesi |
| `start_time` | `VARCHAR(255)` | `NOT NULL, DEFAULT '19:30'` | Jam mulai (`HH:MM`) |
| `duration_minutes` | `INTEGER` | `NOT NULL, DEFAULT 90` | Durasi sesi |
| `meeting_url` | `VARCHAR(255)` | `NOT NULL` | Tautan meeting |
| `notes` | `TEXT` | `NULLABLE` | Catatan untuk peserta |
| `attendees_count` | `INTEGER` | `NOT NULL, DEFAULT 0` | Jumlah peserta hadir |
| `is_finished` | `BOOLEAN` | `NOT NULL, DEFAULT FALSE` | Status sesi selesai |
| `created_at` / `updated_at` | `TIMESTAMP` | `NULLABLE` | Waktu pencatatan & pembaruan |

---

### 2.7. Tabel `certifications`
Pengajuan sertifikasi kompetensi karyawan dan sertifikat yang diterbitkan.

| Kolom | Tipe Data | Modifiers | Deskripsi |
|---|---|---|---|
| `id` | `BIGSERIAL` | `PRIMARY KEY` | Identifier unik pengajuan |
| `user_id` | `BIGINT` | `NOT NULL` | `FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE`; karyawan pengaju |
| `employee_name` | `VARCHAR(255)` | `NOT NULL` | Nama karyawan saat mengajukan |
| `email` | `VARCHAR(255)` | `NOT NULL` | Email karyawan saat mengajukan |
| `company` | `VARCHAR(255)` | `NULLABLE` | Nama perusahaan (opsional) |
| `track` | `VARCHAR(255)` | `NOT NULL` | Bidang kompetensi yang diajukan |
| `training_hours` | `INTEGER` | `NOT NULL, DEFAULT 40` | Jam pelatihan |
| `portfolio_url` | `VARCHAR(255)` | `NOT NULL` | Tautan portofolio |
| `status` | `VARCHAR` (enum) | `NOT NULL, DEFAULT 'pending'` | `pending` → `verified` → `issued` / `rejected` |
| `certificate_number` | `VARCHAR(255)` | `NULLABLE, UNIQUE` | Nomor sertifikat saat diterbitkan |
| `issued_at` | `TIMESTAMP` | `NULLABLE` | Waktu terbit |
| `admin_notes` | `TEXT` | `NULLABLE` | Catatan admin (wajib saat menolak) |
| `created_at` / `updated_at` | `TIMESTAMP` | `NULLABLE` | Waktu pencatatan & pembaruan |

- Migration `2026_10_25_000001_remove_dummy_defaults_from_schedules_and_certifications` menghapus default contoh (`'Budi Mentor'`, `'Tech Corp Nusantara'`, dll.) agar semua nilai berasal dari input nyata.

---

## 3. Strategi Pengindeksan & Integritas Relasional

1. **Foreign Key Cascade Deletion**:
   - Jika satu akun pengguna dihapus dari tabel `users`, relasi di tabel `role_user` dan seluruh token di `personal_access_tokens` otomatis dibersihkan oleh basis data PostgreSQL untuk mencegah orphaned records.
2. **B-Tree Indexing**:
   - Kolom `email` pada `users` diindeks otomatis melalui constraint `UNIQUE`.
   - Kolom `name` pada `roles` dan `permissions` memiliki indeks B-Tree untuk mempercepat pencarian role check (`hasRole`, `hasPermission`) dalam rentang waktu < 1 ms.
   - Kolom `phone` mendukung pencarian wildcard `LIKE` dalam query manajemen admin.
