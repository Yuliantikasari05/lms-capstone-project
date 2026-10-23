import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useAuth } from '../../context/AuthContext';

// Map routes to readable page titles & subtitles
const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/admin/dashboard': {
    title: 'Dashboard Administrator',
    subtitle: 'Kendali sistem menyeluruh — pengguna, ujian, sertifikasi, gamifikasi & pemasukan mitra',
  },
  '/admin/users': {
    title: 'Manajemen Pengguna',
    subtitle: 'Kelola akun, penetapan peran RBAC, dan ekspor daftar pengguna',
  },
  '/admin/courses': {
    title: 'Kurikulum & Konten',
    subtitle: 'Kelola kurikulum, modul, dan materi kursus sistem',
  },
  '/admin/exam-reviews': {
    title: 'Tinjauan Soal Ujian',
    subtitle: 'Review dan setujui pengajuan bank soal ujian dari Mentor',
  },
  '/admin/certifications': {
    title: 'Sertifikasi Karyawan',
    subtitle: 'Verifikasi dan terbitkan sertifikat kompetensi karyawan',
  },
  '/admin/gamification-vouchers': {
    title: 'Gamifikasi & Voucher',
    subtitle: 'Kelola sistem XP, badge, leaderboard, dan kode voucher diskon',
  },
  '/admin/revenue-reports': {
    title: 'Pemasukan Mitra Lembaga',
    subtitle: 'Pantau penjualan paket dan bagi hasil kerja sama Lembaga Bimbingan',
  },
  '/mentor/dashboard': {
    title: 'Dashboard Mentor',
    subtitle: 'Kelola pembelajaran, evaluasi & umpan balik, serta pengajuan soal ujian',
  },
  '/mentor/courses': {
    title: 'Kurikulum & Materi Ajar',
    subtitle: 'Buat dan sunting modul, materi teks, video, sesi kelas & webinar',
  },
  '/mentor/evaluations': {
    title: 'Penilaian & Umpan Balik',
    subtitle: 'Berikan nilai dan catatan umpan balik atas submisi siswa dan karyawan',
  },
  '/mentor/students': {
    title: 'Peserta Binaan',
    subtitle: 'Pantau progres belajar siswa dan karyawan yang Anda damping',
  },
  '/mentor/schedules': {
    title: 'Jadwal Pembelajaran',
    subtitle: 'Atur jadwal sesi bimbingan reguler, pelatihan korporat, dan webinar',
  },
  '/mentor/discussions': {
    title: 'Forum Diskusi & Ulasan',
    subtitle: 'Pandu diskusi materi dan tinjau ulasan peserta',
  },
  '/siswa/dashboard': {
    title: 'Dashboard Siswa',
    subtitle: 'Portal pembelajaran akademik — kursus, tugas, ujian, XP & pembayaran',
  },
  '/siswa/courses': {
    title: 'Kelas & Materi Saya',
    subtitle: 'Akses modul, video, dan materi kursus yang terdaftar',
  },
  '/siswa/assignments': {
    title: 'Tugas & Ujian',
    subtitle: 'Kumpulkan tugas praktikum dan kerjakan ujian akademik',
  },
  '/siswa/schedules': {
    title: 'Jadwal Bimbingan Live',
    subtitle: 'Lihat jadwal sesi mentoring online dan deadline tugas',
  },
  '/siswa/gamification': {
    title: 'Papan Peringkat & XP',
    subtitle: 'Pantau posisi leaderboard dan akumulasi poin pengalaman (XP)',
  },
  '/siswa/payments': {
    title: 'Pembayaran Kelas',
    subtitle: 'Riwayat transaksi dan alur pembayaran program belajar',
  },
  '/karyawan/dashboard': {
    title: 'Dashboard Karyawan',
    subtitle: 'Portal pengembangan kompetensi — pelatihan, webinar, evaluasi & sertifikasi',
  },
  '/karyawan/trainings': {
    title: 'Pelatihan & Webinar',
    subtitle: 'Ikuti jalur pelatihan wajib dan webinar upskilling profesional',
  },
  '/karyawan/evaluations': {
    title: 'Evaluasi & Tugas',
    subtitle: 'Kumpulkan evaluasi kompetensi dan lihat umpan balik Mentor',
  },
  '/karyawan/certifications': {
    title: 'Pengajuan Sertifikasi',
    subtitle: 'Ajukan sertifikasi ke Admin dan unduh sertifikat yang telah diterbitkan',
  },
  '/karyawan/history': {
    title: 'Riwayat Pembelajaran',
    subtitle: 'Akumulasi jam pelatihan dan rekap capaian kompetensi',
  },
  '/lembaga/dashboard': {
    title: 'Dashboard Lembaga Bimbingan',
    subtitle: 'Manajemen mandiri: modul, siswa kohort, harga paket & pemasukan',
  },
  '/lembaga/modules': {
    title: 'Modul Mandiri Lembaga',
    subtitle: 'Buat, sunting, dan kelola kurikulum mandiri program lembaga',
  },
  '/lembaga/students': {
    title: 'Kelola & Daftarkan Siswa',
    subtitle: 'Daftarkan siswa baru dan pantau perkembangan belajar kohort',
  },
  '/lembaga/resources': {
    title: 'Sesi & Resources',
    subtitle: 'Atur sesi belajar dan kelola materi/berkas pendukung program',
  },
  '/lembaga/pricing-vouchers': {
    title: 'Harga Paket & Voucher',
    subtitle: 'Atur tarif paket bimbingan dan kelola kode diskon/voucher',
  },
  '/lembaga/explore': {
    title: 'Jelajah Modul Sistem',
    subtitle: 'Telusuri kurikulum standar yang tersedia dalam katalog LMS',
  },
  '/lembaga/revenue': {
    title: 'Laporan & Pemasukan',
    subtitle: 'Pantau enrollment siswa, pemasukan penjualan, dan rekap kohort',
  },
  '/profile': {
    title: 'Profil & Pengaturan Akun',
    subtitle: 'Perbarui data personal, keamanan kata sandi, dan hak akses RBAC aktif',
  },
};

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { role } = useAuth();

  // Nested routes such as /admin/courses/12 reuse their parent's title
  const basePath = location.pathname.replace(/\/\d+$/, '');

  const pageMeta = PAGE_TITLES[location.pathname] ?? PAGE_TITLES[basePath] ?? {
    title: 'LMS Multi Segmen',
    subtitle: 'Maxy Academy Learning Platform',
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title={pageMeta.title} subtitle={pageMeta.subtitle} />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
