import React, { useEffect, useState } from 'react';
import {
  Clock,
  Calendar,
  Trophy,
  CreditCard,
  CheckCircle2,
  BookOpen,
  Star,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import type { DashboardData } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { CardSkeleton, LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';

export const SiswaDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'leaderboard' | 'payments'>('tasks');

  useEffect(() => {
    dashboardService
      .getDashboardStats()
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || 'Gagal memuat dashboard siswa.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <LoadingSpinner message="Mengambil data pembelajaran, nilai, dan XP gamifikasi dari API..." />
      </div>
    );
  }

  if (error || !data) {
    return <Alert type="error" message={error || 'Terjadi kesalahan saat memuat dashboard.'} />;
  }

  const {
    overview_cards,
    enrolled_courses,
    academic_tasks_exams,
    upcoming_schedules,
    leaderboard,
    payment_history,
  } = data.dashboard;

  return (
    <div className="space-y-8">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-800">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 mb-2">
            Portal Pembelajaran Akademik Siswa
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Semangat Belajar, {data.user.name}!</h1>
          <p className="text-sm text-emerald-200 mt-1 max-w-xl leading-relaxed">
            Akses kelas & materi kapan saja, kerjakan tugas & ujian, lihat nilai dan umpan balik dari Mentor, pantau perjalanan XP gamifikasi, dan bayar kelas langsung dari portal.
          </p>
        </div>
        <div className="shrink-0">
          <div className="bg-emerald-800/60 border border-emerald-700 rounded-xl p-4 text-center">
            <Zap className="w-8 h-8 text-amber-400 mx-auto mb-1" />
            <p className="text-2xl font-extrabold text-white">1.450 XP</p>
            <p className="text-[11px] text-emerald-300">Level 4 • Fullstack Hero</p>
          </div>
        </div>
      </div>

      <FeatureStatusBanner
        title="Portal Pembelajaran Akademik Terintegrasi"
        category="production"
        roleScope="Role: Siswa — Kelas, Tugas, Ujian, XP, Leaderboard & Pembayaran"
        description="Permission aktif: courses:enrolled, sessions:attend, assignments:submit, exams:take, grades:view_own, gamification:view_xp, leaderboard:view, payments:make. Penilaian & umpan balik diberikan oleh Mentor."
      />

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {overview_cards?.map((card, idx) => (
          <StatCard key={idx} card={card} />
        ))}
      </div>

      {/* Section 3.3: Kelas Terdaftar & Akses Materi */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-800">Kelas yang Sedang Dipelajari</h3>
            <p className="text-xs text-slate-500">Progres modul & pelajaran berikutnya dalam kurikulum Anda</p>
          </div>
          <BookOpen className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="space-y-4">
          {enrolled_courses?.map((c: any) => (
            <div
              key={c.id}
              className="p-5 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors bg-slate-50/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Mentor: <span className="font-semibold text-slate-700">{c.mentor}</span></p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pelajaran Berikutnya:{' '}
                    <span className="font-semibold text-emerald-700">{c.next_lesson}</span>
                  </p>
                </div>
                <div className="sm:text-right shrink-0">
                  <span className="text-sm font-bold text-emerald-600 font-mono">{c.progress}%</span>
                  <p className="text-[11px] text-slate-400">
                    {c.completed_modules}/{c.total_modules} Modul
                  </p>
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    {c.payment_status}
                  </span>
                </div>
              </div>

              <div className="mt-3.5 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${c.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3.3: Jadwal Sesi Live & Deadline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-800">Jadwal & Agenda</h3>
          </div>

          <div className="space-y-3.5">
            {upcoming_schedules?.map((item: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <p className="text-xs font-bold text-slate-900">{item.title}</p>
                <div className="flex items-center text-xs text-emerald-700 font-medium mt-1.5">
                  {item.type === 'Deadline Tugas' ? (
                    <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  )}
                  <span className={item.type === 'Deadline Tugas' ? 'text-rose-600' : ''}>{item.time}</span>
                </div>
                {item.mentor && (
                  <p className="text-[11px] text-slate-500 mt-1">Mentor: {item.mentor}</p>
                )}
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md hover:bg-blue-100 transition"
                  >
                    Buka Link Sesi
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 3.3: Tab View — Tugas/Ujian, Leaderboard, Pembayaran */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-slate-200 px-6 pt-4 flex space-x-1">
            {[
              { id: 'tasks', label: 'Tugas & Ujian', icon: CheckCircle2 },
              { id: 'leaderboard', label: 'Leaderboard XP', icon: Trophy },
              { id: 'payments', label: 'Riwayat Pembayaran', icon: CreditCard },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition ${
                    activeTab === tab.id
                      ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-5">
            {/* Tugas & Ujian — Nilai & Umpan Balik Mentor */}
            {activeTab === 'tasks' && (
              <div className="divide-y divide-slate-100">
                {academic_tasks_exams?.map((t: any, idx: number) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              t.type === 'Ujian Akademik'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {t.type}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 mt-1">{t.title}</p>
                        <p className="text-[11px] text-slate-500">Mentor: {t.mentor}</p>
                      </div>
                      <div className="sm:text-right shrink-0">
                        <span
                          className={`text-sm font-bold font-mono ${
                            t.status === 'Dinilai & Diberi Umpan Balik' ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {t.grade}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">{t.status}</p>
                      </div>
                    </div>
                    {t.feedback && t.status === 'Dinilai & Diberi Umpan Balik' && (
                      <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <div className="flex items-center space-x-1 mb-1">
                          <Star className="w-3 h-3 text-emerald-600" />
                          <span className="text-[10px] font-bold text-emerald-800">Umpan Balik Mentor</span>
                        </div>
                        <p className="text-[11px] text-emerald-900 leading-relaxed">{t.feedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Leaderboard XP */}
            {activeTab === 'leaderboard' && (
              <div>
                <p className="text-xs text-slate-500 mb-4">Peringkat akademik berbasis XP gamifikasi Maxy Academy</p>
                <div className="space-y-2.5">
                  {leaderboard?.map((entry: any) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center justify-between p-3 rounded-xl border transition ${
                        entry.name.includes('Anda')
                          ? 'bg-emerald-50 border-emerald-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`text-sm font-extrabold w-8 text-center ${
                            entry.rank === 1
                              ? 'text-amber-500'
                              : entry.rank === 2
                              ? 'text-slate-500'
                              : entry.rank === 3
                              ? 'text-orange-500'
                              : 'text-slate-400'
                          }`}
                        >
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                        </span>
                        <div>
                          <p className={`text-xs font-bold ${entry.name.includes('Anda') ? 'text-emerald-800' : 'text-slate-800'}`}>
                            {entry.name}
                          </p>
                          <p className="text-[10px] text-slate-500">{entry.badge}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold font-mono text-slate-700 flex items-center">
                        <Zap className="w-3 h-3 mr-1 text-amber-500" />
                        {entry.xp.toLocaleString()} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Riwayat Pembayaran */}
            {activeTab === 'payments' && (
              <div>
                <p className="text-xs text-slate-500 mb-4">Riwayat transaksi pembayaran kelas dan program belajar</p>
                <div className="divide-y divide-slate-100">
                  {payment_history?.map((inv: any) => (
                    <div key={inv.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{inv.class_name}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">{inv.id} • {inv.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900 font-mono">{inv.amount}</p>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                  <span className="font-semibold">Alur Pembayaran:</span> Kelas & webinar berbayar dibuka via portal pembayaran terintegrasi (permission: payments:make).
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
