<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use InvalidArgumentException;

class RbacSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Define All Initial Permissions according to LMS Maxy Academy specification
        $permissionsData = [
            // Dashboard
            ['name' => 'dashboard:admin', 'display_name' => 'Lihat Dashboard Admin', 'group' => 'dashboard', 'description' => 'Akses statistik sistem, analitik, dan monitoring level sistem.'],
            ['name' => 'dashboard:mentor', 'display_name' => 'Lihat Dashboard Mentor', 'group' => 'dashboard', 'description' => 'Akses ringkasan kelas, tugas, jadwal, dan progres peserta binaan.'],
            ['name' => 'dashboard:siswa', 'display_name' => 'Lihat Dashboard Siswa', 'group' => 'dashboard', 'description' => 'Akses ringkasan kursus terdaftar, jadwal bimbingan, deadline, dan XP.'],
            ['name' => 'dashboard:karyawan', 'display_name' => 'Lihat Dashboard Karyawan', 'group' => 'dashboard', 'description' => 'Akses pelatihan, webinar, evaluasi, dan status sertifikasi kompetensi.'],
            ['name' => 'dashboard:lembaga', 'display_name' => 'Lihat Dashboard Lembaga', 'group' => 'dashboard', 'description' => 'Akses ringkasan modul mandiri, enrollment, keuangan, dan progres siswa lembaga.'],

            // Users Management (Admin)
            ['name' => 'users:view', 'display_name' => 'Lihat Pengguna', 'group' => 'users', 'description' => 'Melihat daftar dan profil detail seluruh pengguna.'],
            ['name' => 'users:create', 'display_name' => 'Tambah Pengguna', 'group' => 'users', 'description' => 'Membuat akun pengguna baru lintas peran.'],
            ['name' => 'users:edit', 'display_name' => 'Ubah Pengguna', 'group' => 'users', 'description' => 'Memperbarui data pengguna, status aktif, dan penetapan role.'],
            ['name' => 'users:delete', 'display_name' => 'Hapus Pengguna', 'group' => 'users', 'description' => 'Menonaktifkan atau menghapus akun pengguna.'],
            ['name' => 'users:export', 'display_name' => 'Ekspor Daftar Pengguna', 'group' => 'users', 'description' => 'Mengekspor daftar pengguna ke format CSV/Excel.'],

            // Roles & Permissions (Admin)
            ['name' => 'roles:view', 'display_name' => 'Lihat Peran & Izin', 'group' => 'roles', 'description' => 'Melihat konfigurasi role dan izin hak akses.'],
            ['name' => 'roles:manage', 'display_name' => 'Kelola Peran & Izin', 'group' => 'roles', 'description' => 'Mengubah alokasi izin dan permission pada peran.'],

            // Courses & Curriculum (Admin & Mentor)
            ['name' => 'courses:view', 'display_name' => 'Lihat Katalog Kursus', 'group' => 'courses', 'description' => 'Melihat katalog kursus dan silabus pembelajaran.'],
            ['name' => 'courses:manage', 'display_name' => 'Kelola Kurikulum & Materi', 'group' => 'courses', 'description' => 'Membuat dan menyunting kurikulum, modul, materi teks, video, dan sesi.'],
            ['name' => 'courses:enrolled', 'display_name' => 'Akses Kursus Terdaftar', 'group' => 'courses', 'description' => 'Mengikuti pembelajaran dan mengakses modul kursus yang diambil.'],

            // Exam Review Workflow (Admin & Mentor)
            ['name' => 'exams:review', 'display_name' => 'Tinjau Pengajuan Ujian', 'group' => 'exams', 'description' => 'Meninjau pengajuan soal ujian dari Mentor dan mengelola persetujuan kualitas.'],
            ['name' => 'exams:create', 'display_name' => 'Buat Soal Ujian', 'group' => 'exams', 'description' => 'Membuat instrumen dan bank soal ujian untuk siswa/karyawan.'],
            ['name' => 'exams:submit_review', 'display_name' => 'Ajukan Ujian ke Admin', 'group' => 'exams', 'description' => 'Mengajukan paket soal ujian ke Admin untuk proses peninjauan mutu.'],
            ['name' => 'exams:take', 'display_name' => 'Mengerjakan Ujian', 'group' => 'exams', 'description' => 'Mengerjakan ujian evaluasi akademik dalam batas waktu yang ditentukan.'],

            // Assignments, Evaluations & Feedback
            ['name' => 'assignments:create', 'display_name' => 'Buat Tugas & Evaluasi', 'group' => 'assessments', 'description' => 'Membuat tugas praktikum atau evaluasi kompetensi.'],
            ['name' => 'assignments:review', 'display_name' => 'Evaluasi Tugas & Feedback', 'group' => 'assessments', 'description' => 'Memeriksa pengerjaan tugas, memberikan penilaian angka, dan catatan feedback.'],
            ['name' => 'assignments:submit', 'display_name' => 'Kumpul Tugas Siswa', 'group' => 'assessments', 'description' => 'Mengunggah tugas dan submisi praktikum siswa.'],
            ['name' => 'evaluations:submit', 'display_name' => 'Kumpul Evaluasi Karyawan', 'group' => 'assessments', 'description' => 'Mengerjakan dan mengumpulkan evaluasi kompetensi karyawan.'],
            ['name' => 'grades:view_own', 'display_name' => 'Lihat Nilai & Hasil Belajar', 'group' => 'assessments', 'description' => 'Melihat riwayat nilai, umpan balik mentor, dan rapor belajar.'],

            // Gamification, Leaderboard & Vouchers
            ['name' => 'gamification:manage', 'display_name' => 'Kelola Gamifikasi Sistem', 'group' => 'gamification', 'description' => 'Mengatur poin XP, level siswa, badge, dan aturan gamifikasi.'],
            ['name' => 'gamification:view_xp', 'display_name' => 'Lihat Poin XP Pribadi', 'group' => 'gamification', 'description' => 'Melihat akumulasi poin XP dan riwayat pencapaian badge.'],
            ['name' => 'leaderboard:view', 'display_name' => 'Lihat Papan Peringkat', 'group' => 'gamification', 'description' => 'Melihat peringkat leaderboard siswa.'],
            ['name' => 'vouchers:manage', 'display_name' => 'Kelola Voucher & Kupon', 'group' => 'vouchers', 'description' => 'Membuat dan mengelola kupon diskon dan voucher program.'],
            ['name' => 'pricing:manage', 'display_name' => 'Atur Harga Paket', 'group' => 'vouchers', 'description' => 'Mengatur harga jual paket bimbingan dan diskon promo.'],

            // Certifications (Admin & Karyawan)
            ['name' => 'certifications:manage', 'display_name' => 'Kelola & Terbitkan Sertifikat', 'group' => 'certifications', 'description' => 'Memverifikasi pengajuan dan menerbitkan sertifikat kompetensi karyawan.'],
            ['name' => 'certifications:apply', 'display_name' => 'Ajukan Sertifikasi', 'group' => 'certifications', 'description' => 'Mengajukan sertifikasi setelah menyelesaikan pelatihan atau webinar.'],
            ['name' => 'certifications:view_own', 'display_name' => 'Lihat Sertifikat Pribadi', 'group' => 'certifications', 'description' => 'Melihat dan mengunduh sertifikat kompetensi yang telah diterbitkan.'],

            // Schedules, Live Sessions & Webinars
            ['name' => 'schedules:manage', 'display_name' => 'Kelola Jadwal Bimbingan', 'group' => 'schedules', 'description' => 'Mengatur jadwal sesi bimbingan, kelas reguler, pelatihan, dan webinar.'],
            ['name' => 'sessions:attend', 'display_name' => 'Ikuti Sesi Bimbingan', 'group' => 'schedules', 'description' => 'Mengikuti sesi bimbingan online terjadwal.'],
            ['name' => 'webinars:manage', 'display_name' => 'Kelola Webinar Pelatihan', 'group' => 'schedules', 'description' => 'Membuat dan menyelenggarakan sesi webinar pengembangan kompetensi.'],
            ['name' => 'webinars:attend', 'display_name' => 'Ikuti Sesi Webinar', 'group' => 'schedules', 'description' => 'Menghadiri webinar dan mengakses rekaman materi.'],

            // Discussions & Reviews
            ['name' => 'discussions:manage', 'display_name' => 'Kelola Forum Diskusi', 'group' => 'discussions', 'description' => 'Memandu diskusi dan membalas pertanyaan peserta.'],
            ['name' => 'reviews:view', 'display_name' => 'Lihat Ulasan Peserta', 'group' => 'discussions', 'description' => 'Melihat ulasan dan rating peserta terkait materi/kegiatan belajar.'],

            // Students & Cohort Mentoring
            ['name' => 'students:view_assigned', 'display_name' => 'Lihat Siswa Diampu', 'group' => 'students', 'description' => 'Melihat profil dan perkembangan belajar siswa yang dibimbing.'],
            ['name' => 'employees:view_assigned', 'display_name' => 'Lihat Karyawan Diampu', 'group' => 'students', 'description' => 'Melihat daftar dan progres karyawan peserta pelatihan.'],

            // Lembaga Bimbingan Independent Management
            ['name' => 'institution:manage_modules', 'display_name' => 'Kelola Modul Mandiri Lembaga', 'group' => 'institution', 'description' => 'Membuat, mengubah, dan menghapus kurikulum modul milik lembaga.'],
            ['name' => 'institution:manage_students', 'display_name' => 'Kelola & Daftarkan Siswa Lembaga', 'group' => 'institution', 'description' => 'Mendaftarkan siswa dan memantau perkembangan belajar siswa lembaga.'],
            ['name' => 'institution:manage_sessions', 'display_name' => 'Kelola Sesi Lembaga', 'group' => 'institution', 'description' => 'Mengatur sesi belajar dan kelas bimbingan lembaga.'],
            ['name' => 'institution:manage_resources', 'display_name' => 'Kelola Resources Lembaga', 'group' => 'institution', 'description' => 'Mengunggah dan mengelola berkas materi dan resources pendukung lembaga.'],
            ['name' => 'institution:manage_discussions', 'display_name' => 'Kelola Diskusi Lembaga', 'group' => 'institution', 'description' => 'Mengelola forum diskusi internal program lembaga.'],
            ['name' => 'institution:explore_programs', 'display_name' => 'Jelajah Modul Sistem', 'group' => 'institution', 'description' => 'Menjelajahi kurikulum dan modul yang tersedia dalam sistem LMS.'],

            // Reports & Revenue Analytics
            ['name' => 'reports:view', 'display_name' => 'Lihat Laporan Sistem', 'group' => 'reports', 'description' => 'Melihat log analitik aktivitas pengguna dan ringkasan level sistem.'],
            ['name' => 'reports:cohort', 'display_name' => 'Pantau Laporan Kohort', 'group' => 'reports', 'description' => 'Memantau perkembangan kohort dan presensi siswa lembaga.'],
            ['name' => 'reports:view_own', 'display_name' => 'Lihat Riwayat & Laporan Belajar', 'group' => 'reports', 'description' => 'Melihat riwayat pembelajaran dan akumulasi jam pelatihan.'],
            ['name' => 'revenue:view_partner', 'display_name' => 'Pantau Pemasukan Kemitraan', 'group' => 'reports', 'description' => 'Melihat dashboard pemasukan penjualan terkait kerja sama Lembaga Bimbingan.'],
            ['name' => 'revenue:view_own', 'display_name' => 'Pantau Pemasukan Penjualan Paket', 'group' => 'reports', 'description' => 'Melihat jumlah enrollment dan pemasukan penjualan paket bimbingan lembaga.'],

            // Common General Features
            ['name' => 'payments:make', 'display_name' => 'Akses Alur Pembayaran', 'group' => 'common', 'description' => 'Menjalankan alur transaksi pembayaran kelas atau webinar.'],
            ['name' => 'notifications:view', 'display_name' => 'Lihat Notifikasi Sistem', 'group' => 'common', 'description' => 'Melihat dan mengelola notifikasi sistem.'],
            ['name' => 'profile:manage', 'display_name' => 'Kelola Profil & Keamanan', 'group' => 'common', 'description' => 'Memperbarui profil, nomor kontak, dan kata sandi akun.'],
        ];

        $permissionModels = [];
        foreach ($permissionsData as $p) {
            $permissionModels[$p['name']] = Permission::updateOrCreate(
                ['name' => $p['name']],
                [
                    'display_name' => $p['display_name'],
                    'group' => $p['group'],
                    'description' => $p['description'],
                ]
            );
        }

        // 2. Define 5 Core Roles strictly adhering to Maxy Academy business specs
        $rolesData = [
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Administrator dan pengelola sistem secara keseluruhan: pengguna, hak akses, konten, review ujian, gamifikasi, voucher, sertifikat, dan analitik pemasukan mitra.',
                'permissions' => array_keys($permissionModels),
            ],
            [
                'name' => 'mentor',
                'display_name' => 'Mentor',
                'description' => 'Pengelola kegiatan belajar dan pendamping peserta: kurikulum, modul, materi/video, sesi, kelas, pelatihan/webinar, forum diskusi, ulasan, evaluasi/tugas, penilaian & feedback, serta pengajuan soal ujian.',
                'permissions' => [
                    'dashboard:mentor',
                    'courses:view',
                    'courses:manage',
                    'schedules:manage',
                    'webinars:manage',
                    'discussions:manage',
                    'reviews:view',
                    'students:view_assigned',
                    'employees:view_assigned',
                    'assignments:create',
                    'assignments:review',
                    'exams:create',
                    'exams:submit_review',
                    'notifications:view',
                    'profile:manage',
                ],
            ],
            [
                'name' => 'siswa',
                'display_name' => 'Siswa',
                'description' => 'Peserta pembelajaran akademik: akses materi pembelajaran, sesi bimbingan online, pembayaran kelas, tugas & ujian, penilaian & feedback mentor, laporan hasil belajar, papan peringkat (leaderboard), dan XP gamifikasi.',
                'permissions' => [
                    'dashboard:siswa',
                    'courses:enrolled',
                    'sessions:attend',
                    'payments:make',
                    'assignments:submit',
                    'exams:take',
                    'grades:view_own',
                    'leaderboard:view',
                    'gamification:view_xp',
                    'notifications:view',
                    'profile:manage',
                ],
            ],
            [
                'name' => 'karyawan',
                'display_name' => 'Karyawan',
                'description' => 'Peserta pelatihan dan webinar untuk pengembangan kompetensi: akses materi pelatihan & webinar, pembayaran bila berlaku, evaluasi kompetensi, penilaian & feedback mentor, laporan riwayat belajar, dan pengajuan sertifikasi.',
                'permissions' => [
                    'dashboard:karyawan',
                    'courses:enrolled',
                    'webinars:attend',
                    'payments:make',
                    'evaluations:submit',
                    'grades:view_own',
                    'reports:view_own',
                    'certifications:apply',
                    'certifications:view_own',
                    'notifications:view',
                    'profile:manage',
                ],
            ],
            [
                'name' => 'lembaga_bimbingan',
                'display_name' => 'Lembaga Bimbingan',
                'description' => 'Mitra eksternal mandiri: kelola modul/kurikulum sendiri (CRUD), sesi & resources, forum diskusi, daftarkan & kelola siswa lembaga, eksplor program sistem, harga paket & voucher diskon, pantau enrollment & pemasukan.',
                'permissions' => [
                    'dashboard:lembaga',
                    'institution:manage_modules',
                    'institution:manage_students',
                    'institution:manage_sessions',
                    'institution:manage_resources',
                    'institution:manage_discussions',
                    'institution:explore_programs',
                    'pricing:manage',
                    'vouchers:manage',
                    'revenue:view_own',
                    'reports:cohort',
                    'notifications:view',
                    'profile:manage',
                ],
            ],
        ];

        foreach ($rolesData as $r) {
            $role = Role::updateOrCreate(
                ['name' => $r['name']],
                [
                    'display_name' => $r['display_name'],
                    'description' => $r['description'],
                ]
            );

            $permIds = [];
            foreach ($r['permissions'] as $permName) {
                // Fail loudly so a role is never mapped to an undefined permission
                if (! isset($permissionModels[$permName])) {
                    throw new InvalidArgumentException("Permission '{$permName}' untuk role '{$r['name']}' belum didefinisikan.");
                }
                $permIds[] = $permissionModels[$permName]->id;
            }
            $role->permissions()->sync($permIds);
        }
    }
}

