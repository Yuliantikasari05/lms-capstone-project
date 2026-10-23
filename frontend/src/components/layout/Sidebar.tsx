import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle, 
  BookOpen, 
  Briefcase, 
  Building2, 
  LogOut, 
  ChevronRight,
  ClipboardCheck,
  Award,
  Gift,
  DollarSign,
  Calendar,
  MessageSquare,
  Trophy,
  CreditCard,
  History,
  FolderKanban,
  Layers,
  Tag,
  Compass,
  Wallet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/Badge';

export const Sidebar: React.FC = () => {
  const { user, role, logout } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'Dashboard Admin', icon: LayoutDashboard },
          { to: '/admin/users', label: 'Manajemen Pengguna', icon: Users },
          { to: '/admin/courses', label: 'Kurikulum & Konten', icon: BookOpen },
          { to: '/admin/exam-reviews', label: 'Tinjauan Soal Ujian', icon: ClipboardCheck },
          { to: '/admin/certifications', label: 'Sertifikasi Karyawan', icon: Award },
          { to: '/admin/gamification-vouchers', label: 'Gamifikasi & Voucher', icon: Gift },
          { to: '/admin/revenue-reports', label: 'Pemasukan Mitra Lembaga', icon: DollarSign },
          { to: '/profile', label: 'Profil Akun', icon: UserCircle },
        ];
      case 'mentor':
        return [
          { to: '/mentor/dashboard', label: 'Dashboard Mentor', icon: LayoutDashboard },
          { to: '/mentor/courses', label: 'Kurikulum & Materi', icon: BookOpen },
          { to: '/mentor/evaluations', label: 'Penilaian & Feedback', icon: ClipboardCheck },
          { to: '/mentor/students', label: 'Peserta Binaan', icon: Users },
          { to: '/mentor/schedules', label: 'Jadwal Pembelajaran', icon: Calendar },
          { to: '/mentor/discussions', label: 'Forum Diskusi & Ulasan', icon: MessageSquare },
          { to: '/profile', label: 'Profil Akun', icon: UserCircle },
        ];
      case 'siswa':
        return [
          { to: '/siswa/dashboard', label: 'Dashboard Siswa', icon: LayoutDashboard },
          { to: '/siswa/courses', label: 'Kelas & Materi Saya', icon: BookOpen },
          { to: '/siswa/assignments', label: 'Tugas & Ujian', icon: ClipboardCheck },
          { to: '/siswa/schedules', label: 'Jadwal Bimbingan Live', icon: Calendar },
          { to: '/siswa/gamification', label: 'Papan Peringkat & XP', icon: Trophy },
          { to: '/siswa/payments', label: 'Pembayaran Kelas', icon: CreditCard },
          { to: '/profile', label: 'Profil Akun', icon: UserCircle },
        ];
      case 'karyawan':
        return [
          { to: '/karyawan/dashboard', label: 'Dashboard Karyawan', icon: LayoutDashboard },
          { to: '/karyawan/trainings', label: 'Pelatihan & Webinar', icon: Briefcase },
          { to: '/karyawan/evaluations', label: 'Evaluasi & Tugas', icon: ClipboardCheck },
          { to: '/karyawan/certifications', label: 'Pengajuan Sertifikasi', icon: Award },
          { to: '/karyawan/history', label: 'Riwayat Pembelajaran', icon: History },
          { to: '/profile', label: 'Profil Akun', icon: UserCircle },
        ];
      case 'lembaga_bimbingan':
        return [
          { to: '/lembaga/dashboard', label: 'Dashboard Lembaga', icon: LayoutDashboard },
          { to: '/lembaga/modules', label: 'Modul Mandiri Lembaga', icon: FolderKanban },
          { to: '/lembaga/students', label: 'Kelola & Daftarkan Siswa', icon: Users },
          { to: '/lembaga/resources', label: 'Sesi & Resources', icon: Layers },
          { to: '/lembaga/pricing-vouchers', label: 'Harga Paket & Voucher', icon: Tag },
          { to: '/lembaga/explore', label: 'Jelajah Modul Sistem', icon: Compass },
          { to: '/lembaga/revenue', label: 'Laporan & Pemasukan', icon: Wallet },
          { to: '/profile', label: 'Profil Akun', icon: UserCircle },
        ];
      default:
        return [{ to: '/profile', label: 'Profil Akun', icon: UserCircle }];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
            M
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Maxy Academy</h1>
            <p className="text-xs text-blue-400 font-medium tracking-wide uppercase">LMS Multi Segmen</p>
          </div>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div className="px-5 py-3 mx-4 my-4 rounded-lg bg-slate-800/60 border border-slate-700/60">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Akses Portal
        </div>
        <div className="flex items-center justify-between">
          <RoleBadge role={role || 'siswa'} size="sm" />
          <span className="text-[11px] text-slate-400 font-mono">RBAC Active</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Menu Sesuai Role
        </div>
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center space-x-2.5 truncate">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
              <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom User Card & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80">
        <div className="flex items-center space-x-3 mb-3 px-1">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}`}
            alt={user?.name}
            className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors border border-rose-500/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar Akun</span>
        </button>
      </div>
    </aside>
  );
};
