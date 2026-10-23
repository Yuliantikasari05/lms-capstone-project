import React, { useState } from 'react';
import { UserCircle, Shield, KeyRound, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { RoleBadge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Edit State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      await authService.updateProfile({ name, phone });
      await refreshUser();
      setProfileSuccess('Data profil berhasil diperbarui.');
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    try {
      await authService.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setPasswordSuccess('Kata sandi berhasil diperbarui.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Gagal memperbarui kata sandi.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profil & Pengaturan Akun</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola informasi personal, tinjau izin akses RBAC Anda, dan perbarui kata sandi keamanan.
        </p>
      </div>

      {/* User Info Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <img
          src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
          alt={user?.name}
          className="w-20 h-20 rounded-full bg-slate-100 border-2 border-blue-500/20"
        />
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <RoleBadge role={user?.primary_role || 'siswa'} />
          </div>
          <p className="text-xs text-slate-500 font-mono flex items-center">
            <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            {user?.email}
          </p>
          <p className="text-xs text-slate-500 font-mono flex items-center">
            <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            {user?.phone || 'Nomor telepon belum diatur'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form: Ubah Informasi Personal */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center space-x-2 mb-4">
            <UserCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">Informasi Personal</h3>
          </div>

          {profileSuccess && (
            <Alert type="success" message={profileSuccess} onClose={() => setProfileSuccess(null)} />
          )}
          {profileError && (
            <Alert type="error" message={profileError} onClose={() => setProfileError(null)} />
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alamat Email (Tetap)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-mono cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Email terikat dengan identitas registrasi institusi.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full mt-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {isUpdatingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>

        {/* Form: Ubah Kata Sandi */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center space-x-2 mb-4">
            <KeyRound className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">Ubah Kata Sandi</h3>
          </div>

          {passwordSuccess && (
            <Alert type="success" message={passwordSuccess} onClose={() => setPasswordSuccess(null)} />
          )}
          {passwordError && (
            <Alert type="error" message={passwordError} onClose={() => setPasswordError(null)} />
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Saat Ini</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Baru (Min. 8 karakter)</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full mt-2 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {isUpdatingPassword ? 'Memperbarui...' : 'Perbarui Kata Sandi'}
            </button>
          </form>
        </div>
      </div>

      {/* RBAC Permissions Inspector */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center space-x-2 mb-3">
          <Shield className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-800">Hak Akses & Izin Aktif (RBAC Matrix)</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Daftar izin operasional yang secara sah dialokasikan untuk peran{' '}
          <span className="font-semibold text-slate-700 font-mono">[{user?.primary_role}]</span> Anda:
        </p>

        <div className="flex flex-wrap gap-2">
          {user?.permissions?.map((perm) => (
            <span
              key={perm}
              className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-mono bg-purple-50 text-purple-700 border border-purple-200"
            >
              <CheckCircle2 className="w-3 h-3 mr-1 text-purple-500" />
              {perm}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
