import React, { useState } from 'react';
import { Gift, Trophy, Plus, CheckCircle, Tag, Flame, ShieldAlert, Award, Trash2 } from 'lucide-react';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';

interface VoucherItem {
  id: string;
  code: string;
  discount_percent: number;
  quota: number;
  used_count: number;
  valid_until: string;
  is_active: boolean;
  target_audience: string;
}

interface BadgeItem {
  id: string;
  name: string;
  icon: string;
  required_xp: number;
  category: string;
  description: string;
}

const INITIAL_VOUCHERS: VoucherItem[] = [
  {
    id: 'V-101',
    code: 'MAXYSCHOLAR50',
    discount_percent: 50,
    quota: 100,
    used_count: 64,
    valid_until: '2026-12-31',
    is_active: true,
    target_audience: 'Siswa Berprestasi (Top 10)',
  },
  {
    id: 'V-102',
    code: 'CORPORATEGROW25',
    discount_percent: 25,
    quota: 50,
    used_count: 18,
    valid_until: '2026-11-30',
    is_active: true,
    target_audience: 'Karyawan Upskilling',
  },
  {
    id: 'V-103',
    code: 'LEMBAGAPARTNER30',
    discount_percent: 30,
    quota: 200,
    used_count: 142,
    valid_until: '2026-10-31',
    is_active: false,
    target_audience: 'Mitra Lembaga Bimbingan',
  },
];

const INITIAL_BADGES: BadgeItem[] = [
  {
    id: 'B-1',
    name: 'First Code Pioneer',
    icon: '🚀',
    required_xp: 100,
    category: 'Siswa / Akademik',
    description: 'Menyelesaikan modul pembelajaran pertama dengan skor sempurna.',
  },
  {
    id: 'B-2',
    name: 'Bug Hunter Pro',
    icon: '🎯',
    required_xp: 500,
    category: 'Siswa / Akademik',
    description: 'Mengumpulkan 5 tugas praktikum dan lulus ujian tanpa remedial.',
  },
  {
    id: 'B-3',
    name: 'Enterprise Architect',
    icon: '🏛️',
    required_xp: 1200,
    category: 'Karyawan / Korporat',
    description: 'Menyelesaikan 40 jam pelatihan dan mendapatkan sertifikasi resmi.',
  },
  {
    id: 'B-4',
    name: 'Master Mentor',
    icon: '👑',
    required_xp: 2000,
    category: 'Mentor',
    description: 'Membimbing lebih dari 50 siswa dengan rating evaluasi di atas 4.8.',
  },
];

export const AdminGamificationVouchersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vouchers' | 'badges' | 'rules'>('vouchers');
  const [vouchers, setVouchers] = useState<VoucherItem[]>(INITIAL_VOUCHERS);
  const [badges, setBadges] = useState<BadgeItem[]>(INITIAL_BADGES);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Voucher Modal
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    code: '',
    discount_percent: 20,
    quota: 50,
    valid_until: '2026-12-31',
    target_audience: 'Semua Pengguna',
  });

  const handleToggleVoucher = (id: string) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, is_active: !v.is_active } : v))
    );
    setAlert({ type: 'success', message: 'Status keaktifan voucher berhasil diperbarui!' });
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucher.code.trim()) return;

    const voucher: VoucherItem = {
      id: `V-${Date.now()}`,
      code: newVoucher.code.toUpperCase().trim(),
      discount_percent: Number(newVoucher.discount_percent),
      quota: Number(newVoucher.quota),
      used_count: 0,
      valid_until: newVoucher.valid_until,
      is_active: true,
      target_audience: newVoucher.target_audience,
    };

    setVouchers((prev) => [voucher, ...prev]);
    setShowVoucherModal(false);
    setNewVoucher({
      code: '',
      discount_percent: 20,
      quota: 50,
      valid_until: '2026-12-31',
      target_audience: 'Semua Pengguna',
    });
    setAlert({ type: 'success', message: `Kode voucher ${voucher.code} berhasil dibuat dan aktif!` });
  };

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Pusat Gamifikasi, Papan Peringkat & Voucher Diskon"
        category="production"
        description="Kelola sistem insentif belajar: tetapkan poin XP modul/kuis, aturan pencapaian badge, distribusi kupon voucher diskon, dan audit leaderboard multi-segmen."
        roleScope="Administrator (gamification:manage, vouchers:create, vouchers:manage)"
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('vouchers')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'vouchers'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Kelola Voucher & Diskon ({vouchers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'badges'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Katalog Badge & Penghargaan ({badges.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'rules'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Aturan Perolehan XP & Streak</span>
        </button>
      </div>

      {/* Tab: VOUCHERS */}
      {activeTab === 'vouchers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              Voucher dapat ditukarkan oleh Siswa menggunakan XP atau digunakan untuk promo kemitraan Lembaga & Korporat.
            </p>
            <button
              onClick={() => setShowVoucherModal(true)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center shadow-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Buat Voucher Baru
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Kode Voucher</th>
                  <th className="py-3 px-4">Diskon</th>
                  <th className="py-3 px-4">Penggunaan / Kuota</th>
                  <th className="py-3 px-4">Sasaran Target</th>
                  <th className="py-3 px-4">Masa Berlaku</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {v.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {v.discount_percent}% OFF
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-800">{v.used_count}</span>
                        <span className="text-slate-400">/ {v.quota}</span>
                      </div>
                      <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (v.used_count / v.quota) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{v.target_audience}</td>
                    <td className="py-3 px-4 text-slate-500">{v.valid_until}</td>
                    <td className="py-3 px-4">
                      {v.is_active ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          Non-Aktif
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleVoucher(v.id)}
                        className={`px-3 py-1 rounded-md text-xs font-semibold border ${
                          v.is_active
                            ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {v.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: BADGES */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {badges.map((b) => (
            <div
              key={b.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start space-x-4"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shrink-0">
                {b.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800">{b.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Syarat: {b.required_xp} XP
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide block mt-0.5">
                  Kategori: {b.category}
                </span>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: RULES */}
      {activeTab === 'rules' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center">
            <Flame className="w-4 h-4 mr-2 text-amber-500" />
            Konfigurasi Perolehan Poin Pengalaman (XP) Global
          </h3>
          <p className="text-xs text-slate-500">
            Nilai XP di bawah ini dihitung otomatis oleh sistem setiap kali pengguna menyelesaikan aktivitas pembelajaran.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 block">Selesai 1 Materi / Video</span>
              <span className="text-2xl font-bold text-blue-600 mt-1 block">+20 XP</span>
              <span className="text-[11px] text-slate-400">Dicatat saat tombol "Tandai Selesai" diklik</span>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 block">Kuis & Ujian (Skor 100)</span>
              <span className="text-2xl font-bold text-emerald-600 mt-1 block">+100 XP</span>
              <span className="text-[11px] text-slate-400">Skor 80-99 mendapatkan +75 XP</span>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 block">Streak Belajar 7 Hari Berturut</span>
              <span className="text-2xl font-bold text-amber-600 mt-1 block">+150 XP Bonus</span>
              <span className="text-[11px] text-slate-400">Mendorong retensi belajar konsisten</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create Voucher */}
      {showVoucherModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowVoucherModal(false)}
          title="Buat Kode Voucher Baru"
        >
          <form onSubmit={handleCreateVoucher} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Kode Voucher (Huruf Besar & Angka)</label>
              <input
                type="text"
                required
                value={newVoucher.code}
                onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value })}
                placeholder="CONTOH: MAXYSALE30"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg uppercase font-mono font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Besar Diskon (%)</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  required
                  value={newVoucher.discount_percent}
                  onChange={(e) => setNewVoucher({ ...newVoucher, discount_percent: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kuota Penggunaan</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newVoucher.quota}
                  onChange={(e) => setNewVoucher({ ...newVoucher, quota: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Sasaran Audiens</label>
              <select
                value={newVoucher.target_audience}
                onChange={(e) => setNewVoucher({ ...newVoucher, target_audience: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Semua Pengguna">Semua Pengguna</option>
                <option value="Siswa Berprestasi (Top 10)">Siswa Berprestasi (Top 10)</option>
                <option value="Karyawan Upskilling">Karyawan Upskilling</option>
                <option value="Mitra Lembaga Bimbingan">Mitra Lembaga Bimbingan</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Masa Berlaku Hingga</label>
              <input
                type="date"
                required
                value={newVoucher.valid_until}
                onChange={(e) => setNewVoucher({ ...newVoucher, valid_until: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowVoucherModal(false)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
              >
                Simpan & Terbitkan Voucher
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
