import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Construction,
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  Calendar,
  MessageSquare,
  Trophy,
  CreditCard,
  History,
  FolderKanban,
  Layers,
  Tag,
  Compass,
  Wallet,
  Award,
  Gift,
  DollarSign,
  Users,
  Briefcase,
} from 'lucide-react';

// Map for per-route blueprint details
const ROUTE_DETAILS: Record<
  string,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    role: string;
    features: string[];
    sprint: string;
  }
> = {
  '/admin/courses': {
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    role: 'Admin',
    features: [
      'Buat & sunting kurikulum sistem (modul, submodul, materi)',
      'Upload video pembelajaran dan materi teks',
      'Atur visibilitas kursus (draft / published)',
      'Kelola kategori dan tag konten',
    ],
    sprint: 'Sprint 3 — Manajemen Konten',
  },
  '/admin/exam-reviews': {
    icon: ClipboardCheck,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    role: 'Admin',
    features: [
      'Antrean soal ujian yang diajukan Mentor',
      'Review detail soal: tipe, bobot, kunci jawaban',
      'Setujui / minta revisi dengan catatan',
      'Publikasikan bank soal ke modul',
    ],
    sprint: 'Sprint 4 — Bank Soal & Ujian',
  },
  '/admin/certifications': {
    icon: Award,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    role: 'Admin',
    features: [
      'Daftar pengajuan sertifikasi dari karyawan',
      'Verifikasi kelengkapan dokumen & jam pelatihan',
      'Terbitkan sertifikat digital bertanda tangan',
      'Riwayat sertifikasi seluruh karyawan',
    ],
    sprint: 'Sprint 5 — Sertifikasi Korporat',
  },
  '/admin/gamification-vouchers': {
    icon: Gift,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    role: 'Admin',
    features: [
      'Atur aturan perolehan XP dan threshold naik level',
      'Kelola badge: buat, sunting, distribusi otomatis',
      'Buat kode voucher diskon dengan masa berlaku',
      'Monitor leaderboard global sistem',
    ],
    sprint: 'Sprint 6 — Gamifikasi & Voucher',
  },
  '/admin/revenue-reports': {
    icon: DollarSign,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    role: 'Admin',
    features: [
      'Rekap penjualan paket per Lembaga Bimbingan',
      'Kalkulasi otomatis bagi hasil / revenue share',
      'Ekspor laporan keuangan CSV / PDF',
      'Grafik tren pemasukan bulanan',
    ],
    sprint: 'Sprint 7 — Laporan & Keuangan',
  },
  '/mentor/courses': {
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    role: 'Mentor',
    features: [
      'Buat modul dan submodul kurikulum',
      'Upload video & materi teks pembelajaran',
      'Ajukan bank soal ujian ke Admin untuk ditinjau',
      'Atur jadwal sesi kelas reguler & webinar',
    ],
    sprint: 'Sprint 3 — Pembuatan Konten Mentor',
  },
  '/mentor/evaluations': {
    icon: ClipboardCheck,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    role: 'Mentor',
    features: [
      'Antrean tugas & submisi yang menunggu penilaian',
      'Input nilai dan catatan umpan balik tertulis',
      'Lihat riwayat penilaian per peserta',
      'Rekap nilai kelas dan distribusi skor',
    ],
    sprint: 'Sprint 4 — Penilaian & Evaluasi',
  },
  '/mentor/students': {
    icon: Users,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    role: 'Mentor',
    features: [
      'Daftar siswa & karyawan yang didampingi',
      'Pantau progres belajar per individu',
      'Lihat riwayat sesi dan kehadiran',
      'Kirim catatan motivasi atau pengingat',
    ],
    sprint: 'Sprint 4 — Manajemen Peserta',
  },
  '/mentor/schedules': {
    icon: Calendar,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    role: 'Mentor',
    features: [
      'Buat jadwal sesi bimbingan reguler',
      'Atur jadwal pelatihan korporat & webinar',
      'Integrasi Google Meet / Zoom link',
      'Kirim reminder otomatis ke peserta',
    ],
    sprint: 'Sprint 5 — Penjadwalan',
  },
  '/mentor/discussions': {
    icon: MessageSquare,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    role: 'Mentor',
    features: [
      'Buka thread diskusi per modul',
      'Balas pertanyaan siswa & karyawan',
      'Moderasi forum: pin, sembunyikan, hapus',
      'Review dan balas ulasan kursus',
    ],
    sprint: 'Sprint 6 — Forum & Diskusi',
  },
  '/siswa/courses': {
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    role: 'Siswa',
    features: [
      'Akses semua modul dan materi kursus terdaftar',
      'Tonton video pembelajaran dan unduh materi',
      'Tandai progres submodul yang selesai',
      'Catatan dan highlight materi pribadi',
    ],
    sprint: 'Sprint 3 — Konsumsi Konten',
  },
  '/siswa/assignments': {
    icon: ClipboardCheck,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    role: 'Siswa',
    features: [
      'Lihat dan kumpulkan tugas praktikum',
      'Kerjakan ujian online dengan timer',
      'Lihat hasil penilaian dan umpan balik Mentor',
      'Ajukan banding nilai jika ada keberatan',
    ],
    sprint: 'Sprint 4 — Tugas & Ujian',
  },
  '/siswa/schedules': {
    icon: Calendar,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    role: 'Siswa',
    features: [
      'Jadwal sesi bimbingan live dengan Mentor',
      'Tombol join langsung via Google Meet / Zoom',
      'Pengingat jadwal via notifikasi',
      'Kalender akademik program',
    ],
    sprint: 'Sprint 5 — Penjadwalan Siswa',
  },
  '/siswa/gamification': {
    icon: Trophy,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    role: 'Siswa',
    features: [
      'Papan peringkat XP seluruh siswa',
      'Koleksi badge yang diraih',
      'Riwayat perolehan XP per aktivitas',
      'Tukar poin XP dengan voucher diskon',
    ],
    sprint: 'Sprint 6 — Gamifikasi',
  },
  '/siswa/payments': {
    icon: CreditCard,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    role: 'Siswa',
    features: [
      'Riwayat transaksi pembayaran kelas',
      'Alur pembayaran paket baru (Midtrans)',
      'Upload bukti transfer manual',
      'Unduh kwitansi / invoice PDF',
    ],
    sprint: 'Sprint 7 — Pembayaran',
  },
  '/karyawan/trainings': {
    icon: Briefcase,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    role: 'Karyawan',
    features: [
      'Jalur pelatihan wajib yang ditetapkan perusahaan',
      'Daftar & ikuti webinar upskilling',
      'Progres modul dan jam pelatihan tercatat',
      'Sertifikat keikutsertaan otomatis',
    ],
    sprint: 'Sprint 3 — Pelatihan Korporat',
  },
  '/karyawan/evaluations': {
    icon: ClipboardCheck,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    role: 'Karyawan',
    features: [
      'Kumpulkan tugas evaluasi kompetensi',
      'Lihat umpan balik tertulis dari Mentor',
      'Rekap skor evaluasi per periode',
      'Riwayat penilaian oleh Mentor',
    ],
    sprint: 'Sprint 4 — Evaluasi Karyawan',
  },
  '/karyawan/certifications': {
    icon: Award,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    role: 'Karyawan',
    features: [
      'Ajukan sertifikasi kompetensi ke Admin',
      'Upload dokumen pendukung pengajuan',
      'Pantau status pengajuan (pending / approved)',
      'Unduh sertifikat yang telah diterbitkan Admin',
    ],
    sprint: 'Sprint 5 — Sertifikasi Karyawan',
  },
  '/karyawan/history': {
    icon: History,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    role: 'Karyawan',
    features: [
      'Rekap total jam pelatihan yang diselesaikan',
      'Timeline capaian kompetensi per periode',
      'Unduh laporan perkembangan pribadi',
      'Grafik tren progres kompetensi',
    ],
    sprint: 'Sprint 7 — Riwayat & Laporan',
  },
  '/lembaga/modules': {
    icon: FolderKanban,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    role: 'Lembaga Bimbingan',
    features: [
      'Buat kurikulum mandiri modul lembaga',
      'Sunting dan atur urutan submodul',
      'Upload materi eksklusif lembaga',
      'Atur visibilitas: hanya siswa kohort',
    ],
    sprint: 'Sprint 3 — Modul Lembaga',
  },
  '/lembaga/students': {
    icon: Users,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    role: 'Lembaga Bimbingan',
    features: [
      'Daftarkan siswa baru ke program lembaga',
      'Kelola roster siswa aktif per kohort',
      'Pantau progres belajar seluruh siswa',
      'Nonaktifkan / pindahkan siswa antar kohort',
    ],
    sprint: 'Sprint 4 — Manajemen Siswa Lembaga',
  },
  '/lembaga/resources': {
    icon: Layers,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    role: 'Lembaga Bimbingan',
    features: [
      'Buat jadwal sesi bimbingan tatap muka / online',
      'Upload berkas materi pendukung (PDF, PPT)',
      'Bagikan resource ke siswa kohort',
      'Kelola library materi lembaga',
    ],
    sprint: 'Sprint 5 — Sesi & Resources',
  },
  '/lembaga/pricing-vouchers': {
    icon: Tag,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    role: 'Lembaga Bimbingan',
    features: [
      'Atur tarif paket bimbingan (bulanan/tahunan)',
      'Buat kode voucher diskon khusus lembaga',
      'Atur masa berlaku dan kuota voucher',
      'Monitor penggunaan voucher oleh siswa',
    ],
    sprint: 'Sprint 6 — Harga & Voucher',
  },
  '/lembaga/explore': {
    icon: Compass,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    role: 'Lembaga Bimbingan',
    features: [
      'Jelajahi katalog kurikulum standar sistem',
      'Preview modul yang tersedia untuk adopsi',
      'Ajukan adopsi modul sistem ke kurikulum lembaga',
      'Bandingkan kurikulum lembaga vs sistem',
    ],
    sprint: 'Sprint 3 — Eksplorasi Katalog',
  },
  '/lembaga/revenue': {
    icon: Wallet,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    role: 'Lembaga Bimbingan',
    features: [
      'Rekap pemasukan penjualan paket lembaga',
      'Laporan enrollment siswa per kohort',
      'Ekspor laporan keuangan CSV',
      'Grafik tren pemasukan bulanan / tahunan',
    ],
    sprint: 'Sprint 7 — Laporan Keuangan',
  },
};

interface ComingSoonPageProps {
  routePath?: string;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ routePath }) => {
  const location = useLocation();
  const path = routePath || location.pathname;
  const detail = ROUTE_DETAILS[path];

  const Icon = detail?.icon || Construction;
  const colorClass = detail?.color || 'text-slate-600';
  const bgColorClass = detail?.bgColor || 'bg-slate-50';

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Top colored stripe */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

          <div className="p-8">
            <div className="flex items-start gap-5">
              <div className={`p-4 rounded-xl ${bgColorClass} shrink-0`}>
                <Icon className={`w-8 h-8 ${colorClass}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                    🚧 Blueprint / Roadmap
                  </span>
                  {detail?.role && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      Role: {detail.role}
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-slate-800 mb-1">
                  Halaman Dalam Pengembangan
                </h1>
                <p className="text-sm text-slate-500">
                  Fitur ini sedang dirancang sesuai spesifikasi LMS Maxy Academy dan akan diimplementasikan pada sprint berikutnya.
                </p>
              </div>
            </div>

            {/* Sprint badge */}
            {detail?.sprint && (
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span>Target: <span className="font-semibold text-blue-600">{detail.sprint}</span></span>
              </div>
            )}
          </div>
        </div>

        {/* Features Blueprint */}
        {detail?.features && detail.features.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-blue-500 inline-block" />
              Fitur yang Direncanakan
            </h2>
            <ul className="space-y-3">
              {detail.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-500 shrink-0">
                    {i + 1}
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Route info + back button */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
            {path}
          </div>
          <Link
            to=".."
            relative="path"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali
          </Link>
        </div>
      </div>
    </div>
  );
};
