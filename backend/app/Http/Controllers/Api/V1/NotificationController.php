<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get system notifications tailored for the authenticated user and their active role.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing('roles');
        $role = $user->roles->first()?->name ?? 'siswa';

        $notifications = match ($role) {
            'admin' => [
                [
                    'id' => 'notif-1',
                    'title' => 'Pengajuan Ujian Baru dari Mentor',
                    'message' => 'Mentor Budi Santoso mengajukan paket bank soal "Ujian Akhir Full-Stack React & Laravel" untuk ditinjau.',
                    'type' => 'exam_review',
                    'read' => false,
                    'created_at' => '10 menit yang lalu',
                ],
                [
                    'id' => 'notif-2',
                    'title' => 'Pengajuan Sertifikasi Karyawan',
                    'message' => 'Ahmad Fauzi (Tech Corp) telah menyelesaikan 32 jam pelatihan dan mengajukan penerbitan sertifikat kompetensi.',
                    'type' => 'certification',
                    'read' => false,
                    'created_at' => '1 jam yang lalu',
                ],
                [
                    'id' => 'notif-3',
                    'title' => 'Pemasukan Mitra Bimbel Masuk',
                    'message' => 'Transaksi paket bimbingan baru dari Bimbel Prestasi Gemilang senilai Rp 12.500.000 berhasil dicatat.',
                    'type' => 'revenue',
                    'read' => true,
                    'created_at' => '3 jam yang lalu',
                ],
            ],
            'mentor' => [
                [
                    'id' => 'notif-1',
                    'title' => 'Tugas Praktikum Siswa Dikumpulkan',
                    'message' => 'Siti Rahmawati baru saja mengunggah tugas "Implementasi API Sanctum & RBAC".',
                    'type' => 'submission',
                    'read' => false,
                    'created_at' => '15 menit yang lalu',
                ],
                [
                    'id' => 'notif-2',
                    'title' => 'Evaluasi Karyawan Membutuhkan Review',
                    'message' => 'Ahmad Fauzi telah menyelesaikan studi kasus "Audit Kepatuhan ISO 27001".',
                    'type' => 'evaluation',
                    'read' => false,
                    'created_at' => '2 jam yang lalu',
                ],
                [
                    'id' => 'notif-3',
                    'title' => 'Pengingat Sesi Live Mentoring',
                    'message' => 'Sesi live "Mentoring Portofolio Capstone" dijadwalkan besok pukul 19:30 WIB.',
                    'type' => 'schedule',
                    'read' => true,
                    'created_at' => '5 jam yang lalu',
                ],
            ],
            'siswa' => [
                [
                    'id' => 'notif-1',
                    'title' => 'Nilai & Feedback Tugas Telah Terbit',
                    'message' => 'Mentor Budi Santoso memberikan nilai 92/100 dan umpan balik pada tugas "Desain Basis Data PostgreSQL".',
                    'type' => 'grade',
                    'read' => false,
                    'created_at' => '30 menit yang lalu',
                ],
                [
                    'id' => 'notif-2',
                    'title' => 'Peringkat Gamifikasi Naik!',
                    'message' => 'Selamat! Anda memperoleh +150 XP dari penyelesaian modul dan naik ke Peringkat 2 Leaderboard.',
                    'type' => 'gamification',
                    'read' => false,
                    'created_at' => '2 jam yang lalu',
                ],
                [
                    'id' => 'notif-3',
                    'title' => 'Jadwal Live Bimbingan Besok',
                    'message' => 'Kelas live "Review Portofolio Komponen React" akan dimulai pukul 19:30 WIB.',
                    'type' => 'schedule',
                    'read' => true,
                    'created_at' => '6 jam yang lalu',
                ],
            ],
            'karyawan' => [
                [
                    'id' => 'notif-1',
                    'title' => 'Sertifikat Kompetensi Telah Diterbitkan',
                    'message' => 'Admin telah memvalidasi pengajuan sertifikasi Anda untuk pelatihan "Keamanan Informasi 2026".',
                    'type' => 'certification',
                    'read' => false,
                    'created_at' => '45 menit yang lalu',
                ],
                [
                    'id' => 'notif-2',
                    'title' => 'Evaluasi Pelatihan Dinilai',
                    'message' => 'Mentor Budi telah memeriksa tugas evaluasi modul Agile & Code Standards (Skor: 94).',
                    'type' => 'grade',
                    'read' => false,
                    'created_at' => '3 jam yang lalu',
                ],
                [
                    'id' => 'notif-3',
                    'title' => 'Webinar Wajib Mendatang',
                    'message' => 'Webinar Kepatuhan DevSecOps diselenggarakan Kamis ini pukul 14:00 WIB.',
                    'type' => 'schedule',
                    'read' => true,
                    'created_at' => '1 hari yang lalu',
                ],
            ],
            'lembaga_bimbingan' => [
                [
                    'id' => 'notif-1',
                    'title' => 'Siswa Baru Berhasil Didaftarkan',
                    'message' => '5 siswa kohort baru berhasil ditambahkan ke "Kelas Intensif Persiapan Karir Batch A".',
                    'type' => 'student',
                    'read' => false,
                    'created_at' => '20 menit yang lalu',
                ],
                [
                    'id' => 'notif-2',
                    'title' => 'Pemasukan Penjualan Paket',
                    'message' => 'Pemasukan paket bimbingan bertambah Rp 4.500.000 dengan voucher diskon aktif.',
                    'type' => 'revenue',
                    'read' => false,
                    'created_at' => '4 jam yang lalu',
                ],
                [
                    'id' => 'notif-3',
                    'title' => 'Laporan Progres Kohort Mingguan Siap',
                    'message' => 'Rekapitulasi presensi (94.2%) dan nilai kohort siap dianalisis pada dashboard lembaga.',
                    'type' => 'report',
                    'read' => true,
                    'created_at' => '1 hari yang lalu',
                ],
            ],
            default => [],
        };

        return response()->json([
            'success' => true,
            'message' => 'Daftar notifikasi berhasil dimuat.',
            'data' => [
                'role' => $role,
                'unread_count' => count(array_filter($notifications, fn ($n) => ! $n['read'])),
                'notifications' => $notifications,
            ],
        ]);
    }
}
