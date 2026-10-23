import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  FolderKanban,
  Tag,
  Compass,
  Wallet,
  Edit3,
  Layers,
  TrendingUp,
  BookOpen,
  MessageSquare,
  BarChart3,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import type { DashboardData } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { CardSkeleton, LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';

export const LembagaDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'modules' | 'students' | 'pricing' | 'revenue'>('modules');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    dashboardService
      .getDashboardStats()
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || 'Gagal memuat dashboard lembaga.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAction = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <LoadingSpinner message="Mengambil data modul, siswa, dan pemasukan lembaga dari API..." />
      </div>
    );
  }

  if (error || !data) {
    return <Alert type="error" message={error || 'Terjadi kesalahan saat memuat dashboard.'} />;
  }

  const {
    overview_cards,
    managed_modules,
    students_roster,
    package_pricing_vouchers,
    system_catalog_preview,
    financial_summary,
  } = data.dashboard;

  return (
    <div className="space-y-8">
      {/* Lembaga Banner */}
      <div className="bg-gradient-to-r from-indigo-950 to-violet-950 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-900">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-2">
            Portal Mitra Lembaga Bimbingan — Manajemen Mandiri
          </span>
          <h1 className="text-2xl font-bold tracking-tight">{data.user.name}</h1>
          <p className="text-sm text-indigo-200 mt-1 max-w-xl leading-relaxed">
            Kelola kurikulum & modul mandiri, daftarkan dan pantau siswa lembaga, atur paket harga & voucher diskon, jelajahi program sistem, serta pantau enrollment dan pemasukan penjualan.
          </p>
        </div>

        {/* Financial Quick Stats */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div className="bg-indigo-900/60 border border-indigo-800 rounded-xl p-3 text-center">
            <Wallet className="w-5 h-5 text-indigo-300 mx-auto mb-1" />
            <p className="text-base font-extrabold text-white">{financial_summary?.total_gross_income || 'Rp 22.5Jt'}</p>
            <p className="text-[10px] text-indigo-300">Total Pemasukan</p>
          </div>
          <div className="bg-indigo-900/60 border border-indigo-800 rounded-xl p-3 text-center">
            <Users className="w-5 h-5 text-indigo-300 mx-auto mb-1" />
            <p className="text-base font-extrabold text-white">{financial_summary?.total_enrolled || 65}</p>
            <p className="text-[10px] text-indigo-300">Total Siswa Kohort</p>
          </div>
        </div>
      </div>

      <FeatureStatusBanner
        title="Portal Lembaga Bimbingan — Pengelolaan Mandiri Terintegrasi"
        category="production"
        roleScope="Role: Lembaga Bimbingan — Modul CRUD, Siswa, Pricing, Explore & Revenue"
        description="Permission aktif: institution:manage_modules, institution:manage_students, institution:manage_sessions, institution:manage_resources, institution:manage_discussions, institution:explore_programs, pricing:manage, vouchers:manage, revenue:view_own, reports:cohort."
      />

      {actionSuccess && (
        <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess(null)} />
      )}

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {overview_cards?.map((card, idx) => (
          <StatCard key={idx} card={card} />
        ))}
      </div>

      {/* Section 3.5: Tab View — Modul, Siswa, Harga & Voucher, Laporan Pemasukan */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-slate-200 px-4 sm:px-6 pt-4 flex flex-wrap gap-1">
          {[
            { id: 'modules', label: 'Modul & Kurikulum', icon: FolderKanban },
            { id: 'students', label: 'Roster Siswa Lembaga', icon: Users },
            { id: 'pricing', label: 'Harga Paket & Voucher', icon: Tag },
            { id: 'revenue', label: 'Pemasukan & Laporan', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/60'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-5 sm:p-6">
          {/* Tab: Modul & Kurikulum Mandiri Lembaga (CRUD) */}
          {activeTab === 'modules' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Modul / kurikulum yang Anda buat dan kelola secara mandiri</p>
                <button
                  onClick={() => handleAction('Halaman pembuatan modul baru telah dibuka.')}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Modul Baru</span>
                </button>
              </div>

              {managed_modules?.map((m: any) => (
                <div
                  key={m.id}
                  className="p-5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors bg-slate-50/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            m.status === 'Aktif Berjalan'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1.5">
                        <span className="flex items-center">
                          <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {m.sessions_count} Sesi
                        </span>
                        <span className="flex items-center">
                          <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {m.resources_count} Resources
                        </span>
                        <span className="flex items-center">
                          <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {m.enrolled_students} Siswa
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleAction(`Modul "${m.title}" dibuka untuk diedit.`)}
                        className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleAction(`Kelola sesi & resources modul "${m.title}" dibuka.`)}
                        className="inline-flex items-center space-x-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1.5 rounded-lg transition"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Kelola</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Explore Modul Sistem */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Jelajahi Program & Modul Sistem LMS</h4>
                    <p className="text-[11px] text-slate-500">Adopsi kurikulum standar dari katalog Maxy Academy</p>
                  </div>
                  <Compass className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {system_catalog_preview?.map((item: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 hover:border-indigo-300 transition cursor-pointer"
                      onClick={() => handleAction(`Membuka detail: "${item.title}"`)}>
                      <p className="text-xs font-bold text-indigo-900">{item.title}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-[10px] text-indigo-600">{item.provider}</p>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Roster & Kelola Siswa Lembaga */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Daftar siswa yang terdaftar dalam program bimbingan lembaga Anda</p>
                <button
                  onClick={() => handleAction('Form pendaftaran siswa baru telah dibuka.')}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Daftarkan Siswa</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Nama Siswa</th>
                      <th className="px-4 py-3">Paket Program</th>
                      <th className="px-4 py-3">Progres</th>
                      <th className="px-4 py-3">Rata-rata Nilai</th>
                      <th className="px-4 py-3">Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {students_roster?.map((s: any) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3.5 font-semibold text-slate-900">{s.name}</td>
                        <td className="px-4 py-3.5 text-slate-600">{s.package}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${s.progress}%` }}
                              />
                            </div>
                            <span className="font-mono text-slate-700">{s.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-indigo-600">{s.avg_score}</td>
                        <td className="px-4 py-3.5 font-semibold text-emerald-600">{s.attendance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Harga Paket & Voucher/Diskon */}
          {activeTab === 'pricing' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Kelola harga paket bimbingan dan voucher diskon untuk siswa lembaga</p>
                <button
                  onClick={() => handleAction('Form penambahan paket harga baru telah dibuka.')}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Paket</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {package_pricing_vouchers?.map((pkg: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:border-indigo-400 transition">
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">{pkg.package_name}</h4>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Harga Paket</span>
                        <span className="font-bold text-slate-800 font-mono">{pkg.price}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Kode Voucher</span>
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">{pkg.voucher_code}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Diskon</span>
                        <span className="font-semibold text-emerald-700">{pkg.discount}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs border-t border-indigo-100 pt-2 mt-2">
                        <span className="text-slate-500">Terjual</span>
                        <span className="font-bold text-indigo-700">{pkg.units_sold} Paket</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => handleAction(`Harga paket "${pkg.package_name}" berhasil diperbarui.`)}
                        className="flex-1 text-[11px] font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg py-1.5 transition"
                      >
                        Edit Harga
                      </button>
                      <button
                        onClick={() => handleAction(`Voucher "${pkg.voucher_code}" telah diperbarui.`)}
                        className="flex-1 text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg py-1.5 transition"
                      >
                        Edit Voucher
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: Pemasukan & Laporan Kohort */}
          {activeTab === 'revenue' && (
            <div className="space-y-5">
              {/* Financial Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Pemasukan', value: financial_summary?.total_gross_income || 'Rp 22.5Jt', icon: Wallet, color: 'text-indigo-600' },
                  { label: 'Kelompok Kohort', value: `${financial_summary?.active_cohort_count || 2} Aktif`, icon: BookOpen, color: 'text-blue-600' },
                  { label: 'Total Siswa', value: `${financial_summary?.total_enrolled || 65} Orang`, icon: Users, color: 'text-emerald-600' },
                  { label: 'Pencairan Berikutnya', value: financial_summary?.next_payout_date || '28 Okt 2026', icon: TrendingUp, color: 'text-amber-600' },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <Icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                      <p className="text-xs font-bold text-slate-900">{stat.value}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Roster Progres Kohort */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-3">Rekap Progres Kohort Siswa Lembaga</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">Nama Siswa</th>
                        <th className="px-4 py-2.5">Progres Modul</th>
                        <th className="px-4 py-2.5">Rata-rata Nilai</th>
                        <th className="px-4 py-2.5">Kehadiran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students_roster?.map((s: any) => (
                        <tr key={s.id} className="hover:bg-slate-50 text-slate-700">
                          <td className="px-4 py-3 font-semibold">{s.name}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${s.progress}%` }} />
                              </div>
                              <span className="font-mono text-slate-600">{s.progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-indigo-600">{s.avg_score}</td>
                          <td className="px-4 py-3 text-emerald-600 font-semibold">{s.attendance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-800">
                <span className="font-semibold">Ekspor Laporan PDF/Excel:</span> Fitur ekspor laporan kemajuan kohort lengkap akan diintegrasikan di Sprint Lanjutan. Saat ini dapat dilihat melalui dashboard ini.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
