import React, { useState } from 'react';
import { ClipboardCheck, CheckCircle2, Clock, Upload, ExternalLink, Star } from 'lucide-react';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';

interface EvaluationItem {
  id: string;
  title: string;
  competency_track: string;
  deadline: string;
  status: 'pending' | 'submitted' | 'graded';
  mentor_name: string;
  score?: number;
  mentor_feedback?: string;
  submission_url?: string;
}

const INITIAL_EVALUATIONS: EvaluationItem[] = [
  {
    id: 'EVAL-01',
    title: 'Evaluasi Implementasi CI/CD Pipeline & GitHub Actions',
    competency_track: 'DevOps & Cloud Automation',
    deadline: '24 Oktober 2026',
    status: 'graded',
    mentor_name: 'Budi Mentor',
    score: 95,
    mentor_feedback: 'Arsitektur pipeline sangat rapi, sudah menerapkan caching dependency dan automated linting test dengan efisien.',
    submission_url: 'https://github.com/techcorp/cicd-pipeline-demo',
  },
  {
    id: 'EVAL-02',
    title: 'Analisis Vulnerability Scanning & Rekomendasi Patching',
    competency_track: 'Information Security',
    deadline: '28 Oktober 2026',
    status: 'submitted',
    mentor_name: 'Siti Rahmawati, CISSP',
    submission_url: 'https://drive.google.com/audit-report-v1.pdf',
  },
  {
    id: 'EVAL-03',
    title: 'Perancangan Database High Availability & Read-Replicas',
    competency_track: 'Database Infrastructure',
    deadline: '05 November 2026',
    status: 'pending',
    mentor_name: 'Budi Mentor',
  },
];

export const KaryawanEvaluationsPage: React.FC = () => {
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>(INITIAL_EVALUATIONS);
  const [selectedEval, setSelectedEval] = useState<EvaluationItem | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl.trim() || !selectedEval) return;

    setEvaluations((prev) =>
      prev.map((ev) =>
        ev.id === selectedEval.id
          ? { ...ev, status: 'submitted', submission_url: submissionUrl.trim() }
          : ev
      )
    );

    setSelectedEval(null);
    setSubmissionUrl('');
    setSubmissionNotes('');
    setAlert({
      type: 'success',
      message: 'Submisi evaluasi kompetensi berhasil dikirimkan ke Mentor untuk dinilai!',
    });
  };

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Evaluasi Kompetensi & Umpan Balik Mentor"
        category="production"
        description="Kumpulkan laporan praktikum dan tugas evaluasi kompetensi korporat, lalu tinjau penilaian dan rekomendasi teknis langsung dari Mentor."
        roleScope="Karyawan (evaluations:submit, evaluations:view)"
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Evaluations List */}
      <div className="space-y-4">
        {evaluations.map((ev) => (
          <div
            key={ev.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {ev.competency_track}
                </span>
                <h3 className="text-sm font-bold text-slate-800 mt-1">{ev.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Penilai: {ev.mentor_name} • Batas Waktu: {ev.deadline}</p>
              </div>

              <div>
                {ev.status === 'graded' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Nilai: {ev.score}/100
                  </span>
                )}
                {ev.status === 'submitted' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    ⏳ Menunggu Penilaian Mentor
                  </span>
                )}
                {ev.status === 'pending' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    Belum Dikumpulkan
                  </span>
                )}
              </div>
            </div>

            {/* Graded Feedback Box */}
            {ev.status === 'graded' && ev.mentor_feedback && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                <span className="font-bold text-emerald-900 flex items-center">
                  <Star className="w-3.5 h-3.5 mr-1 text-emerald-600 fill-emerald-600" /> Umpan Balik Mentor:
                </span>
                <p className="text-emerald-800 leading-relaxed">{ev.mentor_feedback}</p>
              </div>
            )}

            {/* Submission Link */}
            {ev.submission_url && (
              <div className="text-xs text-slate-600 flex items-center">
                <span className="font-semibold text-slate-700 mr-2">Berkas Submisi:</span>
                <a
                  href={ev.submission_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline flex items-center font-medium"
                >
                  {ev.submission_url} <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              {ev.status === 'pending' && (
                <button
                  onClick={() => setSelectedEval(ev)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs flex items-center"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" /> Kumpulkan Evaluasi
                </button>
              )}
              {ev.status === 'submitted' && (
                <span className="text-xs text-slate-400 italic">Submisi sudah diterima sistem</span>
              )}
              {ev.status === 'graded' && (
                <span className="text-xs font-semibold text-emerald-600">✓ Kompetensi Terpenuhi</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Modal */}
      {selectedEval && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedEval(null)}
          title={`Kumpulkan Tugas Evaluasi: ${selectedEval.title}`}
        >
          <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Tautan Portofolio / Berkas / Repository GitHub
              </label>
              <input
                type="url"
                required
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="https://github.com/... atau Google Drive link"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Catatan Tambahan untuk Mentor</label>
              <textarea
                rows={3}
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Jelaskan ringkasan pendekatan teknis yang Anda terapkan..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedEval(null)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
              >
                Kirim Submisi ke Mentor
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
