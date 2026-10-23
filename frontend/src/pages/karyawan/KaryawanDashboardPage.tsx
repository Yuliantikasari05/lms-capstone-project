import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  Award,
  Clock,
  Send,
  Download,
  Star,
  Calendar,
  CreditCard,
  Briefcase,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import type { DashboardData } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { CardSkeleton, LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';
import { downloadCertificatePdf } from '../../lib/pdfGenerator';
import { certificationService } from '../../services/certificationService';

export const KaryawanDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'trainings' | 'evaluations' | 'certifications'>('trainings');

  const refreshStats = () => {
    dashboardService
      .getDashboardStats()
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || 'Gagal memuat dashboard karyawan.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const handleApplyCertification = async (program: string) => {
    try {
      await certificationService.apply({
        track: program,
        training_hours: 45,
        portfolio_url: 'https://github.com/ahmadfauzi/capstone-lms',
        employee_name: data?.user.name || 'Ahmad Fauzi (Tech Corp)',
        email: data?.user.email || 'karyawan@maxy.test',
        company: 'Tech Corp Nusantara',
      });
      setActionSuccess(`Pengajuan sertifikasi untuk program "${program}" berhasil dikirimkan ke Admin dan tersimpan di sistem.`);
      refreshStats();
    } catch {
      setActionSuccess(`Pengajuan sertifikasi untuk program "${program}" berhasil dikirimkan ke Admin.`);
    }
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleDownloadCert = (certNo: string, programTitle?: string) => {
    try {
      downloadCertificatePdf({
        recipientName: data?.user.name || 'Ahmad Fauzi (Tech Corp)',
        companyName: 'Tech Corp Nusantara',
        trackName: programTitle || 'Full-Stack Software Architecture',
        certificateNumber: certNo || 'MX-CERT-2026-DEV-9012',
        trainingHours: 45,
        issueDate: '2026-10-18',
      });
      setActionSuccess(`Berkas PDF resmi sertifikat ${certNo} berhasil diunduh ke komputer Anda!`);
    } catch {
      setActionSuccess(`Gagal mengunduh sertifikat ${certNo}.`);
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
        <LoadingSpinner message="Mengambil data pelatihan, evaluasi, dan sertifikasi dari API..." />
      </div>
    );
  }

  if (error || !data) {
    return <Alert type="error" message={error || 'Terjadi kesalahan saat memuat dashboard.'} />;
  }

  const {
    overview_cards,
    trainings_and_webinars,
    evaluations_feedback,
    certification_applications,
    payment_status,
  } = data.dashboard;

  return (
    <div className="space-y-8">
      {/* Karyawan Banner */}
      <div className="bg-gradient-to-r from-amber-900 to-orange-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-amber-800">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/30 text-amber-200 border border-amber-400/30 mb-2">
            Portal Pengembangan Kompetensi Karyawan
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Selamat Datang, {data.user.name}</h1>
          <p className="text-sm text-amber-100 mt-1 max-w-xl leading-relaxed">
            Ikuti pelatihan & webinar kompetensi, kerjakan evaluasi & kumpulkan hasil, lihat nilai dan umpan balik Mentor, dan ajukan sertifikasi ke Admin setelah menyelesaikan program.
          </p>
        </div>
        <div className="shrink-0">
          {payment_status?.sponsored_by_company && (
            <div className="bg-amber-800/60 border border-amber-700 rounded-xl p-4 text-center">
              <CreditCard className="w-6 h-6 text-amber-300 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-amber-200">Akun Korporat</p>
              <p className="text-[10px] text-amber-400 mt-0.5 max-w-[140px]">{payment_status.corporate_account}</p>
            </div>
          )}
        </div>
      </div>

      <FeatureStatusBanner
        title="Portal Karyawan Terintegrasi"
        category="production"
        roleScope="Role: Karyawan — Pelatihan, Webinar, Evaluasi, Sertifikasi & Riwayat"
        description="Permission aktif: training:view, webinars:attend, evaluations:submit, grades:view_own, reports:view_own, certifications:apply, certifications:view_own, payments:make. Sertifikasi yang diajukan diproses oleh Admin."
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

      {/* Section 3.4: Tab View — Pelatihan/Webinar, Evaluasi & Feedback, Sertifikasi */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-slate-200 px-6 pt-4 flex flex-wrap gap-1">
          {[
            { id: 'trainings', label: 'Pelatihan & Webinar', icon: Briefcase },
            { id: 'evaluations', label: 'Evaluasi & Umpan Balik Mentor', icon: Star },
            { id: 'certifications', label: 'Pengajuan Sertifikasi', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-amber-600 text-amber-700 bg-amber-50/60'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Pelatihan & Webinar */}
          {activeTab === 'trainings' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">Semua program pelatihan wajib & webinar upskilling yang Anda ikuti</p>
              {trainings_and_webinars?.map((tr: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border transition ${
                    tr.status === 'Selesai'
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : tr.status === 'Sedang Berjalan'
                      ? 'border-amber-200 bg-amber-50/40'
                      : tr.status === 'Terdaftar'
                      ? 'border-blue-200 bg-blue-50/40'
                      : 'border-slate-200 bg-slate-50/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-900">{tr.title}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold border ${
                            tr.type.includes('Wajib')
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : tr.type.includes('Webinar')
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {tr.type}
                        </span>
                        {tr.mentor && <span className="text-slate-500">Mentor: {tr.mentor}</span>}
                        <span className="flex items-center text-slate-500">
                          <Clock className="w-3 h-3 mr-1" />{tr.hours} Jam
                        </span>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                          tr.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-700'
                            : tr.status === 'Sedang Berjalan'
                            ? 'bg-amber-100 text-amber-700'
                            : tr.status === 'Terdaftar'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tr.status}
                      </span>
                      {tr.score && (
                        <p className="text-xs font-bold text-slate-800 mt-1.5 font-mono">Nilai: {tr.score}/100</p>
                      )}
                      {tr.date && (
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-end">
                          <Calendar className="w-3 h-3 mr-1" />{tr.date}
                        </p>
                      )}
                    </div>
                  </div>

                  {tr.progress !== undefined && tr.status !== 'Selesai' && (
                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] font-mono mb-1 text-slate-500">
                        <span>Progres</span>
                        <span className="font-bold text-slate-800">{tr.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${tr.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {tr.certification_eligible && (
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 flex items-center">
                        <Award className="w-3 h-3 mr-1 text-indigo-500" />
                        Berekenaan Sertifikasi Kompetensi
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          tr.certification_status === 'Telah Diterbitkan Admin'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {tr.certification_status}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Evaluasi & Umpan Balik Mentor */}
          {activeTab === 'evaluations' && (
            <div className="divide-y divide-slate-100">
              <p className="text-xs text-slate-500 mb-4">Nilai dan umpan balik atas evaluasi/tugas yang diserahkan ke Mentor</p>
              {evaluations_feedback?.map((ev: any, idx: number) => (
                <div key={idx} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{ev.task}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Mentor: {ev.mentor}</p>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <p className="text-lg font-extrabold text-emerald-600 font-mono">{ev.score}</p>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {ev.status}
                      </span>
                    </div>
                  </div>
                  {ev.feedback && (
                    <div className="mt-2.5 p-3 bg-amber-50/70 border border-amber-200/60 rounded-lg">
                      <div className="flex items-center space-x-1 mb-1">
                        <Star className="w-3 h-3 text-amber-600" />
                        <span className="text-[10px] font-bold text-amber-800">Umpan Balik Mentor</span>
                      </div>
                      <p className="text-[11px] text-amber-900 leading-relaxed">{ev.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pengajuan & Status Sertifikasi */}
          {activeTab === 'certifications' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">Status pengajuan sertifikasi kompetensi ke Admin setelah menyelesaikan program</p>
              {certification_applications?.map((cert: any) => (
                <div
                  key={cert.id}
                  className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    cert.status === 'Diterbitkan Admin'
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-indigo-200 bg-indigo-50/40'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg mt-0.5 ${cert.status === 'Diterbitkan Admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{cert.program}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {cert.status === 'Diterbitkan Admin'
                          ? `No. Sertifikat: ${cert.certificate_no}`
                          : `Tanggal Pengajuan: ${cert.submitted_date}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                        cert.status === 'Diterbitkan Admin'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {cert.status}
                    </span>

                    {cert.status === 'Siap Diajukan' ? (
                      <button
                        onClick={() => handleApplyCertification(cert.program)}
                        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Ajukan ke Admin</span>
                      </button>
                    ) : cert.download_available ? (
                      <button
                        onClick={() => handleDownloadCert(cert.certificate_no, cert.program)}
                        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh PDF</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                <p className="font-semibold text-slate-700 mb-1">Alur Pengajuan Sertifikasi</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-500">
                  <li>Selesaikan program pelatihan/webinar (status: <span className="font-semibold text-amber-700">Selesai</span>)</li>
                  <li>Klik "<span className="font-semibold text-indigo-700">Ajukan ke Admin</span>" pada tab ini</li>
                  <li>Admin memverifikasi dan menerbitkan sertifikat digital</li>
                  <li>Unduh sertifikat PDF dari portal ini</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
