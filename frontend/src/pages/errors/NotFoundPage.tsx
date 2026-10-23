import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const NotFoundPage: React.FC = () => {
  const { role } = useAuth();
  const homePath = role ? `/${role}/dashboard` : '/login';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 mb-4 shadow-xs">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-slate-800 mt-2">Halaman Tidak Ditemukan</h2>
      <p className="text-xs text-slate-500 max-w-sm mt-1">
        Tautan yang Anda tuju mungkin salah, telah dipindahkan, atau tidak tersedia di lingkungan saat ini.
      </p>

      <Link
        to={homePath}
        className="mt-6 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
      >
        <Home className="w-4 h-4" />
        <span>Kembali ke Halaman Utama</span>
      </Link>
    </div>
  );
};

export const ForbiddenPage: React.FC = () => {
  const { role } = useAuth();
  const homePath = role ? `/${role}/dashboard` : '/login';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mb-4 shadow-xs">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">403</h1>
      <h2 className="text-lg font-bold text-slate-800 mt-2">Akses Ditolak (Least Privilege)</h2>
      <p className="text-xs text-slate-500 max-w-sm mt-1">
        Peran pengguna Anda tidak memiliki wewenang atau hak akses yang memadai untuk melihat sumber daya ini.
      </p>

      <Link
        to={homePath}
        className="mt-6 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
      >
        <Home className="w-4 h-4" />
        <span>Kembali ke Dashboard Saya</span>
      </Link>
    </div>
  );
};
