import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/common/Alert';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Mohon masukkan alamat email dan kata sandi.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const redirectUrl = await login({ email, password });
      // Determine role prefix from redirectUrl (e.g. 'admin', 'mentor', 'siswa', etc.)
      const rolePrefix = redirectUrl.split('/')[1];
      const isMatchingRoleSubpage = from && from.startsWith(`/${rolePrefix}`) && !from.endsWith('/dashboard');
      const target = isMatchingRoleSubpage ? from : redirectUrl;

      navigate(target, { replace: true });
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        'Gagal masuk. Periksa kembali email dan kata sandi Anda.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo accounts for rapid pair evaluation across all 5 roles (Maxy Academy Spec)
  const demoAccounts = [
    {
      role: 'admin',
      email: 'admin@maxy.test',
      label: 'Administrator',
      description: 'Kendali penuh: pengguna, ujian, sertifikasi, gamifikasi & pemasukan',
      icon: '⚙️',
      bg: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
    },
    {
      role: 'mentor',
      email: 'mentor@maxy.test',
      label: 'Mentor',
      description: 'Kurikulum, penilaian & feedback, sesi, webinar & pengajuan ujian',
      icon: '🎓',
      bg: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
    },
    {
      role: 'siswa',
      email: 'siswa@maxy.test',
      label: 'Siswa',
      description: 'Kelas & materi, tugas & ujian, XP gamifikasi & pembayaran',
      icon: '📚',
      bg: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200',
    },
    {
      role: 'karyawan',
      email: 'karyawan@maxy.test',
      label: 'Karyawan',
      description: 'Pelatihan & webinar, evaluasi & umpan balik, sertifikasi',
      icon: '💼',
      bg: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200',
    },
    {
      role: 'lembaga_bimbingan',
      email: 'lembaga@maxy.test',
      label: 'Lembaga Bimbingan',
      description: 'Modul mandiri, kelola siswa, harga & voucher, pantau pemasukan',
      icon: '🏛️',
      bg: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200',
    },
  ];

  const handleSelectDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('MaxySecure2026!');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-blue-500/25 mb-3">
            M
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Maxy Academy LMS</h1>
          <p className="text-sm text-slate-400 mt-1">Sistem LMS Multi Segmen Berbasis Web</p>
        </div>

        {/* Login Card */}
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Masuk ke Portal</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gunakan akun terdaftar Anda untuk mengakses sistem pembelajaran.
            </p>
          </div>

          {errorMessage && (
            <Alert type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@maxy.test"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition"
            >
              {isLoading ? (
                <span>Memproses autentikasi...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Akun</span>
                </>
              )}
            </button>
          </form>

          {/* Role Quick-Fill Demo Section */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Uji Coba 5 Peran (Quick Fill):
              </span>
              <span className="text-[10px] text-blue-600 font-medium">Klik untuk isi form</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleSelectDemo(item.email)}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-medium border transition ${item.bg}`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold">{item.label}</div>
                      <div className="text-[10px] opacity-75 leading-tight mt-0.5">{item.description}</div>
                    </div>
                    <span className="text-[10px] opacity-60 font-mono shrink-0">{item.email}</span>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-center">
              Password default untuk akun uji: <code className="text-slate-600 font-mono">MaxySecure2026!</code>
            </p>
          </div>
        </div>

        {/* Security & RBAC Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-400 flex items-center justify-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Terproteksi Laravel Sanctum First-Party & Least Privilege RBAC</span>
          </p>
        </div>
      </div>
    </div>
  );
};
