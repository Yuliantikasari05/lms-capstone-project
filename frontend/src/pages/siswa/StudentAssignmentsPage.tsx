import React, { useCallback, useEffect, useState } from 'react';
import { CalendarClock, CheckCircle2, ClipboardList, FileQuestion, Timer } from 'lucide-react';
import { assessmentService, formatDateTime } from '../../services/assessmentService';
import { getApiError } from '../../services/courseService';
import type { ExamSession, StudentAssignment, StudentExam } from '../../types/assessment';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ExamTakerModal } from './ExamTakerModal';

type Tab = 'assignments' | 'exams';

const inputCls =
  'w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white';

export const StudentAssignmentsPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('assignments');
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [exams, setExams] = useState<StudentExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [target, setTarget] = useState<StudentAssignment | null>(null);
  const [form, setForm] = useState({ content: '', link_url: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [session, setSession] = useState<ExamSession | null>(null);
  const [startingId, setStartingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [a, e] = await Promise.all([assessmentService.myAssignments(), assessmentService.myExams()]);
      setAssignments(a);
      setExams(e);
      setError(null);
    } catch (err) {
      setError(getApiError(err, 'Gagal memuat tugas dan ujian.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openSubmit = (a: StudentAssignment) => {
    setTarget(a);
    setForm({ content: a.submission?.content ?? '', link_url: a.submission?.link_url ?? '' });
    setFormError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    setSaving(true);
    setFormError(null);
    try {
      const msg = await assessmentService.submitAssignment(target.id, {
        content: form.content || null,
        link_url: form.link_url || null,
      });
      setSuccess(msg);
      setTarget(null);
      load();
    } catch (err) {
      setFormError(getApiError(err, 'Gagal mengumpulkan tugas.'));
    } finally {
      setSaving(false);
    }
  };

  const startExam = async (exam: StudentExam) => {
    setStartingId(exam.id);
    try {
      setSession(await assessmentService.startExam(exam.id));
    } catch (err) {
      setError(getApiError(err, 'Gagal memulai ujian.'));
    } finally {
      setStartingId(null);
    }
  };

  if (isLoading) return <LoadingSpinner message="Memuat tugas dan ujian..." />;

  const tabCls = (t: Tab) =>
    `px-4 py-2 text-xs font-semibold rounded-lg transition ${tab === t ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`;

  const now = Date.now();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tugas & Ujian</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kumpulkan tugas dan kerjakan ujian dari kursus yang Anda ikuti.</p>
        </div>
        <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 space-x-1">
          <button className={tabCls('assignments')} onClick={() => setTab('assignments')}>Tugas ({assignments.length})</button>
          <button className={tabCls('exams')} onClick={() => setTab('exams')}>Ujian ({exams.length})</button>
        </div>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {tab === 'assignments' ? (
        assignments.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
            <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Belum ada tugas</p>
            <p className="text-xs text-slate-500 mt-1">Tugas dari kursus yang Anda ikuti akan muncul di sini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {assignments.map((a) => {
              const s = a.submission;
              const overdue = !s && a.due_at && new Date(a.due_at).getTime() < now;
              return (
                <div key={a.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-500">{a.course.title}</p>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{a.title}</h3>
                    </div>
                    <span
                      className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        s?.status === 'graded'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : s
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : overdue
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {s?.status === 'graded' ? 'Dinilai' : s ? 'Terkumpul' : overdue ? 'Lewat tenggat' : 'Belum dikumpulkan'}
                    </span>
                  </div>

                  {a.description && <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap line-clamp-3">{a.description}</p>}

                  <p className="flex items-center text-xs text-slate-500 mt-3">
                    <CalendarClock className="w-3.5 h-3.5 mr-1" />
                    {a.due_at ? `Tenggat ${formatDateTime(a.due_at)}` : 'Tanpa tenggat'}
                  </p>

                  {s?.status === 'graded' && (
                    <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                      <p className="text-sm font-bold text-emerald-800">
                        Nilai: {s.score} / {a.max_score}
                      </p>
                      {s.feedback && <p className="text-xs text-emerald-900 mt-1 whitespace-pre-wrap">{s.feedback}</p>}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    {s?.status === 'graded' ? (
                      <span className="text-xs text-slate-400">Tugas sudah dinilai dan tidak dapat diubah.</span>
                    ) : (
                      <button onClick={() => openSubmit(a)} className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-lg">
                        {s ? 'Perbarui Pengumpulan' : 'Kumpulkan Tugas'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <FileQuestion className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Belum ada ujian tersedia</p>
          <p className="text-xs text-slate-500 mt-1">Ujian yang sudah disetujui Admin akan muncul di sini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {exams.map((x) => (
            <div key={x.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col">
              <p className="text-[11px] text-slate-500">{x.course.title}</p>
              <h3 className="text-base font-bold text-slate-900 leading-snug">{x.title}</h3>
              {x.description && <p className="text-xs text-slate-600 mt-1 line-clamp-2">{x.description}</p>}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-3">
                <span className="flex items-center"><Timer className="w-3.5 h-3.5 mr-1" />{x.duration_minutes} menit</span>
                <span>{x.questions_count} soal</span>
                <span>Lulus ≥ {x.passing_score}</span>
              </div>

              {x.attempts_count > 0 && (
                <div className={`mt-3 rounded-lg border p-3 flex items-center justify-between ${x.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                  <span className="text-xs text-slate-700">
                    {x.attempts_count}x percobaan • nilai terbaik <strong>{x.best_score}</strong>
                  </span>
                  {x.passed && (
                    <span className="flex items-center text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Lulus
                    </span>
                  )}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => startExam(x)}
                  disabled={startingId === x.id || x.questions_count === 0}
                  className="text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-3.5 py-2 rounded-lg"
                >
                  {startingId === x.id ? 'Memuat...' : x.has_open_attempt ? 'Lanjutkan Ujian' : x.attempts_count > 0 ? 'Ulangi Ujian' : 'Mulai Ujian'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit assignment modal */}
      <Modal isOpen={!!target} onClose={() => setTarget(null)} title={target ? `Kumpulkan: ${target.title}` : ''} maxWidth="lg">
        {target && (
          <form onSubmit={submit} className="space-y-4">
            {formError && <Alert type="error" message={formError} />}
            {target.description && (
              <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap">{target.description}</div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jawaban / penjelasan</label>
              <textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Link pekerjaan (GitHub, Drive, dll.)</label>
              <input type="url" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} className={inputCls} placeholder="https://..." />
              <p className="text-[11px] text-slate-400 mt-1">Isi minimal salah satu: jawaban atau link.</p>
            </div>
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={() => setTarget(null)} className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50">Batal</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg">{saving ? 'Mengirim...' : 'Kirim'}</button>
            </div>
          </form>
        )}
      </Modal>

      {session && (
        <ExamTakerModal
          session={session}
          onClose={(finished) => {
            setSession(null);
            if (finished) setTab('exams');
            load();
          }}
        />
      )}
    </div>
  );
};

export default StudentAssignmentsPage;
