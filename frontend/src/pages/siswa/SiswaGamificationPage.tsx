import React, { useState } from 'react';
import { Trophy, Flame, Gift, Star, Award, CheckCircle2, Lock, Tag } from 'lucide-react';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';

interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  badge: string;
  is_current_user?: boolean;
}

const LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: 'Budi Pratama (Anda)', xp: 1450, badge: '🥇 Juara 1', is_current_user: true },
  { rank: 2, name: 'Ahmad Fauzi (Tech Corp)', xp: 1320, badge: '🥈 Juara 2' },
  { rank: 3, name: 'Dewi Anggraini', xp: 1180, badge: '🥉 Juara 3' },
  { rank: 4, name: 'Siti Rahmawati', xp: 950, badge: 'Top 5' },
  { rank: 5, name: 'Rizky Ramadhan', xp: 820, badge: 'Top 5' },
];

const AVAILABLE_VOUCHERS = [
  {
    code: 'MAXYDISC30',
    discount: '30% Diskon Kelas Spesialisasi',
    required_xp: 500,
    description: 'Dapat digunakan untuk kursus tingkat lanjutan apa pun.',
  },
  {
    code: 'PRODEV50',
    discount: '50% Diskon Ujian Sertifikasi',
    required_xp: 1000,
    description: 'Potongan biaya ujian sertifikasi kompetensi resmi.',
  },
];

export const SiswaGamificationPage: React.FC = () => {
  const [currentXp, setCurrentXp] = useState(1450);
  const [redeemedCodes, setRedeemedCodes] = useState<string[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleClaimVoucher = (code: string, cost: number) => {
    if (currentXp < cost) {
      setAlert({ type: 'error', message: 'Poin XP Anda tidak mencukupi untuk menukar voucher ini.' });
      return;
    }

    setCurrentXp((prev) => prev - cost);
    setRedeemedCodes((prev) => [...prev, code]);
    setAlert({
      type: 'success',
      message: `Selamat! Anda berhasil menukarkan ${cost} XP dengan Voucher ${code}! Simpan kodenya untuk checkout kelas.`,
    });
  };

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Papan Peringkat (Leaderboard), Badge & Penukaran XP"
        category="production"
        description="Pantau akumulasi poin pengalaman (XP) dari materi, tugas, dan kuis yang diselesaikan. Buka pencapaian badge dan tukarkan poin dengan voucher diskon kelas!"
        roleScope="Siswa (gamification:view, vouchers:claim)"
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-tr from-amber-500 to-yellow-500 p-6 rounded-2xl text-white shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Total Poin XP Anda</span>
            <h2 className="text-3xl font-extrabold mt-1">{currentXp} XP</h2>
            <p className="text-xs text-yellow-100 mt-1">Level 4: Full-Stack Apprentice</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl">
            🏆
          </div>
        </div>

        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-6 rounded-2xl text-white shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Peringkat Global</span>
            <h2 className="text-3xl font-extrabold mt-1">Peringkat #1</h2>
            <p className="text-xs text-blue-100 mt-1">Teratas di antara seluruh siswa</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl">
            🥇
          </div>
        </div>

        <div className="bg-gradient-to-tr from-rose-500 to-orange-500 p-6 rounded-2xl text-white shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Streak Belajar Aktif</span>
            <h2 className="text-3xl font-extrabold mt-1">8 Hari</h2>
            <p className="text-xs text-orange-100 mt-1">+150 XP bonus telah diklaim</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl">
            🔥
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center">
            <Trophy className="w-4 h-4 mr-2 text-amber-500" />
            Papan Peringkat Belajar (Top 5 Siswa)
          </h3>

          <div className="space-y-2">
            {LEADERBOARD.map((item) => (
              <div
                key={item.rank}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  item.is_current_user
                    ? 'bg-amber-50/70 border-amber-300 font-bold text-amber-950'
                    : 'bg-white border-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 text-center text-sm font-bold text-slate-500">
                    #{item.rank}
                  </span>
                  <div>
                    <span className="text-xs font-semibold">{item.name}</span>
                    <span className="text-[10px] text-slate-400 block">{item.badge}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-blue-600">{item.xp} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voucher Redemption Shop */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center">
            <Gift className="w-4 h-4 mr-2 text-blue-600" />
            Tukar XP dengan Voucher Diskon
          </h3>
          <p className="text-xs text-slate-500">
            Klaim voucher dan gunakan kodenya pada halaman Pembayaran Kelas.
          </p>

          <div className="space-y-3">
            {AVAILABLE_VOUCHERS.map((v) => {
              const isClaimed = redeemedCodes.includes(v.code);
              const canAfford = currentXp >= v.required_xp;

              return (
                <div
                  key={v.code}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{v.discount}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{v.description}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-600 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 shrink-0">
                      {v.required_xp} XP
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <span className="text-[11px] font-mono text-slate-500">Kode: {v.code}</span>
                    {isClaimed ? (
                      <span className="px-3 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Telah Diklaim
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaimVoucher(v.code, v.required_xp)}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                          canAfford
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'Tukar Sekarang' : 'XP Belum Cukup'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
