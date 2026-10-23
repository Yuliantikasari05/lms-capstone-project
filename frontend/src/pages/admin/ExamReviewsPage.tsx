import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, ClipboardCheck, XCircle } from 'lucide-react';
import { assessmentService, EXAM_STATUS_LABEL, EXAM_STATUS_STYLE, formatDateTime } from '../../services/assessmentService';
import { getApiError } from '../../services/courseService';
import type { Exam } from '../../types/assessment';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

type Filter = 'pending_review' | 'approved' | 'rejected';

export const ExamReviewsPage: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('pending_review');
  const [rows, setRows] = useState<Exam[]>([]);
  const [meta, setMeta] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [detail, setDetail] = useState<Exam | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await assessmentService.reviewList(filter);
      setRows(res.rows);
      setMeta(res.meta);
      setError(null);
    } catch (err) {
      setError(getApiError(err, 'Gagal memuat pengajuan ujian.'));
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const open = async (exam: Exam) => {
    try {
      setDetail(await assessmentService.reviewDetail(exam.id));
      setRejecting(false);
      setNote('');
      setModalError(null);
    } catch (err) {
      setError(getApiError(err, 'Gagal memuat detail ujian.'));
    }
  };

  const approve = async () => {
    if (!detail) return;
    setSaving(true);
    setModalError(null);
    try {
      setSuccess(await assessmentService.approveExam(detail.id));
      setDetail(null);
      load();
    } catch (err) {
      setModalError(getApiError(err, 'Gagal menyetujui ujian.'));
    } finally {
      setSaving(false);
    }
  };

  const reject = async () => {
    if (!detail) return;
    if (!note.trim()) {
      setModalError('Isi catatan revisi untuk Mentor.');
      return;
    }
    setSaving(true);
    setModalError(null);
    try {
      setSuccess(await assessmentService.rejectExam(detail.id, note.trim()));
      setDetail(null);
      load();
    } catch (err) {
      setModalError(getApiError(err, 'Gagal menolak ujian.'));
    } finally {
      setSaving(false);
    }
  };

  const tabCls = (f: Filter) =>
    `px-4 py-2 text-xs font-semibold rounded-lg transition ${filter === f ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tinjauan Soal Ujian</h1>
          <p className="text-xs text-slate-500 mt-0.5">Periksa mutu bank soal yang diajukan Mentor sebelum dapat dikerjakan siswa.</p>
        </div>
        <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 space-x-1">
          <button className={tabCls('pending_review')} onClick={() => setFilter('pending_review')}>Menunggu ({meta.pending})</button>
          <button className={tabCls('approved')} onClick={() => setFilter('approved')}>Disetujui ({meta.approved})</button>
          <button className={tabCls('rejected')} onClick={() => setFilter('rejected')}>Revisi ({meta.rejected})</button>
        </div>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {isLoading ? (
        <LoadingSpinner message="Memuat pengajuan..." />
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <ClipboardCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Tidak ada pengajuan di kategori ini</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm divide-y divide-slate-100">
          {rows.map((x) => (
            <div key={x.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-900">{x.title}</p>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${EXAM_STATUS_STYLE[x.review_status]}`}>{EXAM_STATUS_LABEL[x.review_status]}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {x.course_title} • Mentor: {x.mentor_name ?? '-'} • {x.questions_count ?? 0} soal • {x.duration_minutes} menit
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">Diajukan {formatDateTime(x.submitted_at)}</p>
              </div>
              <button onClick={() => open(x)} className="shrink-0 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg border border-purple-200">
                {x.review_status === 'pending_review' ? 'Tinjau Soal' : 'Lihat Detail'}
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={detail ? `Tinjau: ${detail.title}` : ''} maxWidth="xl">
        {detail && (
          <div className="space-y-4">
            {modalError && <Alert type="error" message={modalError} />}
            <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
              <span>Kursus: <strong>{detail.course_title}</strong></span>
              <span>Mentor: <strong>{detail.mentor_name ?? '-'}</strong></span>
              <span>Durasi: <strong>{detail.duration_minutes} menit</strong></span>
              <span>Batas lulus: <strong>{detail.passing_score}</strong></span>
            </div>
            {detail.description && <p className="text-sm text-slate-700">{detail.description}</p>}
            {detail.review_note && (
              <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">Catatan: {detail.review_note}</p>
            )}

            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
              {(detail.questions ?? []).map((q, qi) => (
                <div key={q.id} className="border border-slate-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {qi + 1}. {q.question} <span className="text-[11px] font-normal text-slate-400">({q.points} poin)</span>
                  </p>
                  <ul className="mt-2 space-y-1">
                    {q.options.map((opt, oi) => (
                      <li
                        key={oi}
                        className={`flex items-center text-sm px-3 py-1.5 rounded-lg ${oi === q.correct_index ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700'}`}
                      >
                        {oi === q.correct_index && <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 shrink-0" />}
                        <span className="mr-1.5">{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {detail.review_status === 'pending_review' && (
              <div className="pt-2 border-t border-slate-100 space-y-3">
                {rejecting && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan revisi untuk Mentor *</label>
                    <textarea
                      rows={3}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                      placeholder="Jelaskan bagian soal yang perlu diperbaiki..."
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  {rejecting ? (
                    <>
                      <button onClick={() => setRejecting(false)} className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50">Batal</button>
                      <button onClick={reject} disabled={saving} className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg">
                        <XCircle className="w-4 h-4" /> <span>{saving ? 'Memproses...' : 'Kirim Penolakan'}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setRejecting(true)} className="px-4 py-2 text-xs font-semibold text-rose-700 border border-rose-200 hover:bg-rose-50 rounded-lg">Minta Revisi</button>
                      <button onClick={approve} disabled={saving} className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" /> <span>{saving ? 'Memproses...' : 'Setujui Ujian'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExamReviewsPage;
