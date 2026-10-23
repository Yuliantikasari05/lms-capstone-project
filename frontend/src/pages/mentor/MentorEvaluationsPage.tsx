import React, { useCallback, useEffect, useState } from 'react';
import { ClipboardCheck, ExternalLink, Star } from 'lucide-react';
import { assessmentService, formatDateTime } from '../../services/assessmentService';
import { getApiError } from '../../services/courseService';
import type { SubmissionRow } from '../../types/assessment';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

type Filter = 'submitted' | 'graded';

const inputCls =
  'w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white';

export const MentorEvaluationsPage: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('submitted');
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [counts, setCounts] = useState({ pending: 0, graded: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [target, setTarget] = useState<SubmissionRow | null>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await assessmentService.gradingQueue(filter);
      setRows(res.rows);
      setCounts({ pending: res.pending, graded: res.graded });
      setError(null);
    } catch (err) {
      setError(getApiError(err, 'Gagal memuat antrian penilaian.'));
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const open = (row: SubmissionRow) => {
    setTarget(row);
    setScore(row.score !== null ? String(row.score) : '');
    setFeedback(row.feedback ?? '');
    setFormError(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    setSaving(true);
    setFormError(null);
    try {
      await assessmentService.grade(target.id, Number(score), feedback || null);
      setSuccess(`Nilai untuk ${target.student.name} berhasil disimpan.`);
      setTarget(null);
      load();
    } catch (err) {
      setFormError(getApiError(err, 'Gagal menyimpan nilai.'));
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Penilaian & Feedback</h1>
          <p className="text-xs text-slate-500 mt-0.5">Nilai pengumpulan tugas siswa dan berikan umpan balik.</p>
        </div>
        <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 space-x-1">
          <button className={tabCls('submitted')} onClick={() => setFilter('submitted')}>Perlu Dinilai ({counts.pending})</button>
          <button className={tabCls('graded')} onClick={() => setFilter('graded')}>Sudah Dinilai ({counts.graded})</button>
        </div>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {isLoading ? (
        <LoadingSpinner message="Memuat antrian penilaian..." />
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <ClipboardCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">
            {filter === 'submitted' ? 'Tidak ada tugas yang menunggu penilaian' : 'Belum ada tugas yang dinilai'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm divide-y divide-slate-100">
          {rows.map((r) => (
            <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">{r.assignment.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {r.student.name} • {r.assignment.course.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  Dikumpulkan {formatDateTime(r.submitted_at)}
                  {r.is_late && <span className="ml-2 text-rose-600 font-semibold">Terlambat</span>}
                </p>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                {r.status === 'graded' && (
                  <span className="text-sm font-mono font-bold text-emerald-700">
                    {r.score}/{r.assignment.max_score}
                  </span>
                )}
                <button onClick={() => open(r)} className="inline-flex items-center space-x-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200">
                  <Star className="w-3.5 h-3.5" />
                  <span>{r.status === 'graded' ? 'Ubah Nilai' : 'Beri Nilai & Feedback'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!target} onClose={() => setTarget(null)} title="Penilaian Tugas" maxWidth="lg">
        {target && (
          <form onSubmit={save} className="space-y-4">
            {formError && <Alert type="error" message={formError} />}
            <div>
              <p className="text-sm font-bold text-slate-900">{target.assignment.title}</p>
              <p className="text-xs text-slate-500">{target.student.name} • {target.student.email}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 max-h-56 overflow-y-auto">
              {target.content ? (
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{target.content}</p>
              ) : (
                <p className="text-xs text-slate-400">Tidak ada jawaban teks.</p>
              )}
              {target.link_url && (
                <a href={target.link_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-semibold text-blue-700 hover:underline">
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> Buka link pekerjaan
                </a>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nilai (0–{target.assignment.max_score}) *</label>
              <input
                required
                type="number"
                min={0}
                max={target.assignment.max_score}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Umpan balik</label>
              <textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} className={inputCls} placeholder="Apa yang sudah baik dan apa yang perlu diperbaiki?" />
            </div>
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setTarget(null)} className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50">Batal</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg">{saving ? 'Menyimpan...' : 'Simpan Nilai'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default MentorEvaluationsPage;
