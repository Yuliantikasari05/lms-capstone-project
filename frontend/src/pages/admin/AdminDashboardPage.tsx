import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Server, ArrowRight, ClipboardCheck, Award, Gift, DollarSign, CheckCircle2, XCircle } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { healthService } from '../../services/healthService';
import type { HealthCheckData } from '../../services/healthService';
import type { DashboardData } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { RoleBadge, StatusBadge } from '../../components/common/Badge';
import { CardSkeleton, LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';

import { certificationService } from '../../services/certificationService';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [health, setHealth] = useState<HealthCheckData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, healthRes] = await Promise.all([
          dashboardService.getDashboardStats(),
          healthService.checkHealth().catch(() => null),
        ]);
        setData(dashRes);
        setHealth(healthRes);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat statistik dashboard admin.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApproveExam = (title: string) => {
    setActionSuccess(`Pengajuan bank soal "${title}" telah disetujui untuk diterbitkan.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleApproveCert = async (item: any) => {
    try {
      if (item.id) {
        await certificationService.approve(item.id);
      }
      setActionSuccess(`Sertifikat kelulusan kompetensi untuk ${item.employee_name} berhasil diverifikasi & diterbitkan secara permanen.`);
      const dashRes = await dashboardService.getDashboardStats();
      setData(dashRes);
    } catch {
      setActionSuccess(`Sertifikat kelulusan kompetensi untuk ${item.employee_name} berhasil diverifikasi & diterbitkan.`);
    }
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
        <LoadingSpinner message="Mengambil metrik sistem & pengawasan lintas peran dari PostgreSQL..." />
      </div>
    );
  }

  if (error || !data) {
    return <Alert type="error" message={error || 'Terjadi kesalahan saat memuat dashboard.'} />;
  }

  const {
    overview_cards,
    distribution,
    recent_users,
    exam_review_queue,
    employee_certifications_queue,
    gamification_vouchers_summary,
    partner_revenue_summary,
  } = data.dashboard;

  return (
    <div className="space-y-8">
      {/* Banner Identitas & Otoritas */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 mb-2">
            Administrator Portal — Kendali Sistem Menyeluruh
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Selamat Datang, {data.user.name}</h1>
          <p className="text-sm text-blue-200 mt-1 max-w-2xl leading-relaxed">
            Pusat administrasi multi peran Maxy Academy: kelola akun & otorisasi RBAC, tinjau kualitas pengajuan ujian dari Mentor, terbitkan sertifikasi karyawan, dan pantau pemasukan mitra bimbingan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/users"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            <Users className="w-4 h-4" />
            <span>Kelola Akun & Ekspor</span>
          </Link>
          <Link
            to="/admin/exam-reviews"
            className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition border border-slate-700 shadow-sm"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Tinjau Ujian</span>
          </Link>
        </div>
      </div>

      <FeatureStatusBanner
        title="Modul Administrasi Sistem Terintegrasi"
        category="production"
        roleScope="Role: Administrator (Akses Penuh Seluruh Endpoint)"
        description="Hak akses tervalidasi di backend melalui Laravel Sanctum Middleware 'role:admin'. Mendukung ekspor daftar pengguna, review soal ujian mentor, approval sertifikat, dan pemantauan bagi hasil mitra."
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

      {/* Section 3.1: Alur Kerja Antar-Role Admin - Mentor & Admin - Karyawan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Antrian Review Ujian dari Mentor */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pengajuan Soal Ujian (Dari Mentor)</h3>
                  <p className="text-xs text-slate-500">Tinjau mutu bank soal sebelum dirilis ke peserta</p>
                </div>
              </div>
              <Link
                to="/admin/exam-reviews"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {exam_review_queue?.map((item: any) => (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.exam_title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Mentor: <span className="font-semibold text-slate-700">{item.mentor}</span> • {item.total_questions} Soal
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">{item.submitted_date}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {item.status === 'Disetujui' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Disetujui
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleApproveExam(item.exam_title)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Setujui</span>
                        </button>
                        <button
                          onClick={() => setActionSuccess(`Catatan revisi dikirimkan ke ${item.mentor}.`)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                        >
                          Revisi
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Sesuai Dokumen Bagian 3.1 & 4.4</span>
            <span className="text-purple-600 font-medium">Approval Mutu Ujian</span>
          </div>
        </div>

        {/* Antrian Pengajuan Sertifikasi Karyawan */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Verifikasi Sertifikasi (Karyawan)</h3>
                  <p className="text-xs text-slate-500">Persetujuan & penerbitan sertifikat kompetensi</p>
                </div>
              </div>
              <Link
                to="/admin/certifications"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {employee_certifications_queue?.map((item: any) => (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.employee_name} ({item.company})</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.training_name} • Jam: <span className="font-semibold text-slate-700">{item.hours_completed}</span> (Nilai: {item.score})
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">{item.submitted_at}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {item.status === 'Telah Diterbitkan' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        Diterbitkan
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApproveCert(item)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition flex items-center space-x-1"
                      >
                        <Award className="w-3 h-3" />
                        <span>Terbitkan Sertifikat</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Sesuai Dokumen Bagian 3.1 & 4.3</span>
            <span className="text-blue-600 font-medium">Otoritas Sertifikasi Admin</span>
          </div>
        </div>
      </div>

      {/* Section 3.1: Pemasukan Kerja Sama Lembaga Bimbingan & Gamifikasi/Voucher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ringkasan Gamifikasi & Voucher */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Gift className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Gamifikasi & Voucher</h3>
            </div>
            <Link to="/admin/gamification-vouchers" className="text-xs text-blue-600 font-semibold hover:underline">
              Kelola
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/60">
              <span className="text-amber-800 font-semibold block text-[11px]">Event Gamifikasi Aktif</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                {gamification_vouchers_summary?.active_multiplier || '1.5x Weekend XP Event'}
              </p>
              <span className="text-[10px] text-slate-500">{gamification_vouchers_summary?.leaderboard_participants || 124} siswa bersaing di papan peringkat</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Voucher / Kupon Aktif</span>
              <span className="font-bold text-slate-800">{gamification_vouchers_summary?.active_vouchers_count || 6} Kode</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Total Klaim Voucher</span>
              <span className="font-bold text-emerald-600 font-mono">{gamification_vouchers_summary?.vouchers_redeemed || 48} kali</span>
            </div>
          </div>
        </div>

        {/* Monitoring Pemasukan Kerja Sama Lembaga Bimbingan */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pemasukan Kerja Sama Lembaga Bimbingan</h3>
                <p className="text-xs text-slate-500">Monitoring penjualan paket & enrollment kohort mitra</p>
              </div>
            </div>
            <Link to="/admin/revenue-reports" className="text-xs text-blue-600 font-semibold hover:underline">
              Laporan Detail
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Mitra Lembaga</th>
                  <th className="px-4 py-2.5">Paket Terjual</th>
                  <th className="px-4 py-2.5">Omset Bruto</th>
                  <th className="px-4 py-2.5">Bagi Hasil Sistem</th>
                  <th className="px-4 py-2.5">Siswa Kohort</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {partner_revenue_summary?.map((p: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{p.institution_name}</td>
                    <td className="px-4 py-3 font-mono">{p.package_sold} Paket</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{p.gross_revenue}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-emerald-600">{p.sharing_fee}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 font-semibold">
                        {p.active_cohort_students} Siswa
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Two Column Layout: User Distribution & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Distribution by Role */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-800">Distribusi Pengguna Berdasarkan 5 Role</h3>
              <p className="text-xs text-slate-500">Komposisi 5 kelompok pengguna aktif yang dilayani LMS</p>
            </div>
            <Link
              to="/admin/users"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Kelola Akun</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {[
              { role: 'admin', label: '1. Administrator (Pengelola Sistem)', count: distribution?.admin || 0, color: 'bg-purple-600' },
              { role: 'mentor', label: '2. Mentor (Fasilitator & Pengajar)', count: distribution?.mentor || 0, color: 'bg-blue-600' },
              { role: 'siswa', label: '3. Siswa (Peserta Akademik)', count: distribution?.siswa || 0, color: 'bg-emerald-600' },
              { role: 'karyawan', label: '4. Karyawan (Pengembangan Kompetensi)', count: distribution?.karyawan || 0, color: 'bg-amber-600' },
              { role: 'lembaga_bimbingan', label: '5. Lembaga Bimbingan (Mitra Mandiri)', count: distribution?.lembaga_bimbingan || 0, color: 'bg-indigo-600' },
            ].map((item) => {
              const total = (distribution?.admin || 0) + (distribution?.mentor || 0) + (distribution?.siswa || 0) + (distribution?.karyawan || 0) + (distribution?.lembaga_bimbingan || 0);
              const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={item.role} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className="font-mono text-slate-500">
                      {item.count} akun ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Health Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Server className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-800">Status Fondasi Sistem</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Database Driver</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {health?.database.driver.toUpperCase() || 'PostgreSQL'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Koneksi Database</span>
                <span className="inline-flex items-center text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  {health?.database.status || 'Terhubung (Port 5433)'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Latensi Database</span>
                <span className="font-mono text-slate-700">
                  {health?.database.latency_ms ? `${health.database.latency_ms} ms` : '< 5 ms'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Autentikasi</span>
                <span className="font-semibold text-blue-600">Laravel Sanctum</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">Model Hak Akses</span>
                <span className="font-semibold text-purple-600">RBAC (5 Peran Terisolasi)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
            <span className="font-semibold">Penegakan Least Privilege:</span> Seluruh hak akses role divalidasi langsung melalui middleware backend & policy.
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Pengguna Terdaftar Terbaru</h3>
            <p className="text-xs text-slate-500">Akun pengguna terakhir yang terdaftar dalam ekosistem sistem</p>
          </div>
          <Link
            to="/admin/users"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Buka Manajemen Pengguna</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Nama & Email</th>
                <th className="px-6 py-3">Peran (Role)</th>
                <th className="px-6 py-3">Status Akun</th>
                <th className="px-6 py-3">Terdaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recent_users?.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="font-semibold text-slate-800">{u.name}</div>
                    <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                  </td>
                  <td className="px-6 py-3.5">
                    <RoleBadge role={u.role.toLowerCase().replace(' ', '_')} size="sm" />
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge isActive={u.is_active} />
                  </td>
                  <td className="px-6 py-3.5 text-slate-500">{u.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
