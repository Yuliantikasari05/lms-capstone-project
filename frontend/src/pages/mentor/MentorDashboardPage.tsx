import React, { useEffect, useState } from 'react';
import {
  ClipboardCheck,
  Users,
  Calendar,
  BookOpen,
  MessageSquare,
  Star,
  FileText,
  Send,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import type { DashboardData } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { CardSkeleton, LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';

export const MentorDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    dashboardService
      .getDashboardStats()
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || 'Gagal memuat dashboard mentor.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleGradeSubmit = (name: string, task: string) => {
    setActionSuccess(`Penilaian & umpan balik untuk "${task}" oleh ${name} berhasil dikirimkan.`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleExamProposalSubmit = (title: string) => {
    setActionSuccess(`Paket soal ujian "${title}" telah diajukan ke Admin untuk ditinjau mutu.`);
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
        <LoadingSpinner message="Mengambil data kelas, peserta, dan evaluasi dari API..." />
      </div>
    );
  }

  if (error || !data) {
    return <Alert type="error" message={error || 'Terjadi kesalahan saat memuat dashboard.'} />;
  }

  const {
    overview_cards,
    managed_programs,
    pending_submissions,
    exam_proposals,
    recent_discussions_reviews,
  } = data.dashboard;

  return (
    <div className="space-y-8">
      {/* Mentor Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-blue-800">
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 mb-2">
            Portal Fasilitator, Pengajar & Pendamping Peserta
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Halo, {data.user.name}</h1>
          <p className="text-sm text-blue-200 mt-1 max-w-xl leading-relaxed">
            Kelola kurikulum & materi ajar, pantau kemajuan siswa dan karyawan binaan, berikan penilaian & umpan balik, atur jadwal sesi live & webinar, dan ajukan soal ujian ke Admin.
          </p>
        </div>
      </div>

      <FeatureStatusBanner
        title="Modul Fasilitator Terintegrasi"
        category="production"
        roleScope="Role: Mentor — Kurikulum, Evaluasi, Sesi, Ujian & Diskusi"
        description="Akses dikontrol oleh permission: courses:manage, assignments:review, schedules:manage, webinars:manage, exams:create, exams:submit_review, discussions:manage. Admin yang meninjau soal ujian yang Anda ajukan."
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

      {/* Section 3.2: Program yang Dikelola — Kelas Reguler, Pelatihan Karyawan, Webinar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-800">Kelas, Pelatihan & Webinar yang Dikelola</h3>
            <p className="text-xs text-slate-500">Semua program pembelajaran yang Anda ampu (Kelas Reguler Siswa, Diklat Korporat Karyawan, Webinar)</p>
          </div>
          <BookOpen className="w-5 h-5 text-blue-500" />
        </div>

        <div className="space-y-4">
          {managed_programs?.map((p: any) => (
            <div
              key={p.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors bg-slate-50/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        p.type.includes('Siswa')
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : p.type.includes('Karyawan')
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {p.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {p.participants} Peserta
                    </span>
                    <span>•</span>
                    {p.next_session ? (
                      <span className="flex items-center text-blue-600 font-medium">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
                        {p.next_session}
                      </span>
                    ) : (
                      <span className="text-slate-400">{p.date}</span>
                    )}
                  </div>
                </div>
                {p.progress !== undefined && (
                  <span className="text-xs font-bold text-blue-600 font-mono shrink-0">{p.progress}% Progres</span>
                )}
              </div>
              {p.progress !== undefined && (
                <div className="mt-3 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 3.2: Penilaian, Feedback & Pengajuan Soal Ujian ke Admin */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Tugas & Evaluasi Menunggu Penilaian */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-5">
            <ClipboardCheck className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-bold text-slate-800">Tugas & Evaluasi — Penilaian & Umpan Balik</h3>
              <p className="text-xs text-slate-500">Antrian submisi dari Siswa dan Karyawan yang perlu dinilai</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {pending_submissions?.map((sub: any) => (
              <div key={sub.id} className="py-4 first:pt-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{sub.task_title}</p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          sub.role_type === 'Siswa'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {sub.role_type}
                      </span>
                      <span>{sub.participant_name}</span>
                      <span>•</span>
                      <span>{sub.program}</span>
                    </div>
                    <span className="text-[10px] text-amber-600 font-mono font-medium">{sub.submitted_at}</span>
                  </div>

                  <button
                    onClick={() => handleGradeSubmit(sub.participant_name, sub.task_title)}
                    className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition shrink-0"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Beri Nilai & Feedback</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pengajuan Soal Ujian ke Admin & Forum Diskusi */}
        <div className="lg:col-span-2 space-y-5">
          {/* Pengajuan Soal Ujian ke Admin */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-800">Pengajuan Bank Soal Ujian ke Admin</h3>
            </div>

            <div className="space-y-3">
              {exam_proposals?.map((ep: any) => (
                <div key={ep.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{ep.title}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        ep.review_status === 'Disetujui Admin'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {ep.review_status}
                    </span>
                    {ep.review_status === 'Menunggu Persetujuan Admin' ? null : (
                      <button
                        onClick={() => handleExamProposalSubmit(ep.title)}
                        className="text-[10px] flex items-center space-x-0.5 text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-md border border-purple-200 transition"
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>Ajukan Ulang</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">{ep.submitted_date} • {ep.questions_count} Soal</p>
                </div>
              ))}

              <button
                onClick={() => handleExamProposalSubmit('Bank Soal Baru')}
                className="w-full text-xs font-semibold text-purple-700 border-2 border-dashed border-purple-300 hover:bg-purple-50 rounded-lg py-2 transition"
              >
                + Buat & Ajukan Soal Ujian Baru
              </button>
            </div>
          </div>

          {/* Forum Diskusi & Ulasan */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Diskusi & Ulasan Terbaru</h3>
            </div>

            <div className="divide-y divide-slate-100">
              {recent_discussions_reviews?.map((item: any) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{item.topic}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-slate-500">{item.author}</span>
                    <div className="flex items-center space-x-2">
                      {item.rating && (
                        <span className="flex items-center text-amber-500 text-[10px] font-bold">
                          {'★'.repeat(item.rating)} {item.rating}/5
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
