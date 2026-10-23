import React, { useState } from 'react';
import { Briefcase, PlayCircle, Video, CheckCircle2, Clock, Search, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';

interface TrainingTrack {
  id: number;
  title: string;
  department: string;
  is_mandatory: boolean;
  total_hours: number;
  completed_hours: number;
  progress_percent: number;
  mentor: string;
  course_id: number;
}

const TRAININGS: TrainingTrack[] = [
  {
    id: 1,
    title: 'Microservices with Go, Docker & Kubernetes',
    department: 'Engineering / Software Development',
    is_mandatory: true,
    total_hours: 40,
    completed_hours: 36,
    progress_percent: 90,
    mentor: 'Budi Mentor (Cloud Architect)',
    course_id: 2,
  },
  {
    id: 2,
    title: 'Information Security & ISO 27001 Compliance Audit',
    department: 'DevSecOps & IT Governance',
    is_mandatory: true,
    total_hours: 20,
    completed_hours: 12,
    progress_percent: 60,
    mentor: 'Siti Rahmawati, CISSP',
    course_id: 1,
  },
  {
    id: 3,
    title: 'High-Performance PostgreSQL Tuning & Partitioning',
    department: 'Data Platform',
    is_mandatory: false,
    total_hours: 15,
    completed_hours: 5,
    progress_percent: 33,
    mentor: 'Dr. Hendra Gunawan',
    course_id: 1,
  },
];

export const KaryawanTrainingsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const filteredTrainings = TRAININGS.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Jalur Pelatihan Korporat & Webinar Upskilling"
        category="production"
        description="Akses program pelatihan wajib dari perusahaan, selesaikan modul kompetensi teknis, dan catat jam pelatihan untuk persyaratan sertifikasi profesional."
        roleScope="Karyawan (training:view, courses:enrolled)"
      />

      {/* Search Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pelatihan, divisi, kompetensi..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Training Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTrainings.map((t) => (
          <div
            key={t.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {t.department}
                </span>
                {t.is_mandatory && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                    Wajib Perusahaan
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-800 leading-snug">{t.title}</h3>
              <p className="text-xs text-slate-500 mt-1">Mentor Pengampu: {t.mentor}</p>

              {/* Progress */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Progres Pelatihan:</span>
                  <span className="text-blue-600">{t.progress_percent}% ({t.completed_hours}/{t.total_hours} Jam)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${t.progress_percent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Target Selesai: Akhir Kuartal
              </span>

              <Link
                to={`/siswa/courses/${t.course_id}/learn`}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs flex items-center"
              >
                <PlayCircle className="w-3.5 h-3.5 mr-1.5" /> Lanjutkan Belajar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
