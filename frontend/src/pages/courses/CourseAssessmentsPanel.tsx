import React, { useCallback, useEffect, useState } from 'react';
import { CalendarClock, ClipboardList, FileQuestion, Pencil, Plus, Send, Trash2, X } from 'lucide-react';
import { assessmentService, EXAM_STATUS_LABEL, EXAM_STATUS_STYLE, formatDateTime, toDateTimeLocal } from '../../services/assessmentService';
import { getApiError } from '../../services/courseService';
import type { Assignment, AssignmentPayload, Exam, ExamAttemptRow, QuestionPayload } from '../../types/assessment';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';

const blankQuestion = (): QuestionPayload => ({ question: '', options: ['', '', '', ''], correct_index: 0, points: 1 });

type Confirm = { message: string; run: () => Promise<void> } | null;

const inputCls =
  'w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white';

export const CourseAssessmentsPanel: React.FC<{ courseId: number }> = ({ courseId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);

  /* assignment modal */
  const [aModal, setAModal] = useState<{ open: boolean; editing: Assignment | null }>({ open: false, editing: null });
  const [aForm, setAForm] = useState({ title: '', description: '', due_at: '', max_score: 100 });
  const [aError, setAError] = useState<string | null>(null);

  /* exam modal */
  const [eModal, setEModal] = useState<{ open: boolean; editing: Exam | null }>({ open: false, editing: null });
  const [eForm, setEForm] = useState({ title: '', description: '', duration_minutes: 30, passing_score: 70 });
  const [questions, setQuestions] = useState<QuestionPayload[]>([blankQuestion()]);
  const [eError, setEError] = useState<string | null>(null);

  /* attempts modal */
  const [attemptsFor, setAttemptsFor] = useState<Exam | null>(null);
  const [attempts, setAttempts] = useState<ExamAttemptRow[]>([]);

  const load = useCallback(async () => {
    try {
      const [a, e] = await Promise.all([assessmentService.listAssignments(courseId), assessmentService.listExams(courseId)]);
      setAssignments(a);
      setExams(e);
    } catch (err) {
      setError(getApiError(err, 'Gagal memuat tugas dan ujian.'));
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  /* ------------------------------ assignments ------------------------------ */
  const openAssignment = (a: Assignment | null) => {
    setAForm({
      title: a?.title ?? '',
      description: a?.description ?? '',
      due_at: toDateTimeLocal(a?.due_at),
      max_score: a?.max_score ?? 100,
    });
    setAError(null);
    setAModal({ open: true, editing: a });
  };

  const saveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAError(null);
    const payload: AssignmentPayload = {
      title: aForm.title,
      description: aForm.description || null,
      due_at: aForm.due_at ? new Date(aForm.due_at).toISOString() : null,
      max_score: Number(aForm.max_score) || 100,
    };
    try {
      if (aModal.editing) {
        await assessmentService.updateAssignment(aModal.editing.id, payload);
        flash('Tugas berhasil diperbarui.');
      } else {
        await assessmentService.createAssignment(courseId, payload);
        flash('Tugas berhasil dibuat.');
      }
      setAModal({ open: false, editing: null });
      load();
    } catch (err) {
      setAError(getApiError(err, 'Gagal menyimpan tugas.'));
    } finally {
      setSaving(false);
    }
  };

  /* --------------------------------- exams --------------------------------- */
  const openExam = async (exam: Exam | null) => {
    setEError(null);
    if (!exam) {
      setEForm({ title: '', description: '', duration_minutes: 30, passing_score: 70 });
      setQuestions([blankQuestion()]);
      setEModal({ open: true, editing: null });
      return;
    }
    try {
      const full = await assessmentService.getExam(exam.id);
      setEForm({
        title: full.title,
        description: full.description ?? '',
        duration_minutes: full.duration_minutes,
        passing_score: full.passing_score,
      });
      setQuestions(
        (full.questions ?? []).length
          ? (full.questions ?? []).map((q) => ({ question: q.question, options: [...q.options], correct_index: q.correct_index, points: q.points }))
          : [blankQuestion()]
      );
      setEModal({ open: true, editing: full });
    } catch (err) {
      setError(getApiError(err, 'Gagal memuat detail ujian.'));
    }
  };

  const updateQuestion = (idx: number, patch: Partial<QuestionPayload>) =>
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));

  const updateOption = (qi: number, oi: number, value: string) =>
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? value : o)) } : q)));

  const addOption = (qi: number) =>
    setQuestions((qs) => qs.map((q, i) => (i === qi && q.options.length < 6 ? { ...q, options: [...q.options, ''] } : q)));

  const removeOption = (qi: number, oi: number) =>
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qi || q.options.length <= 2) return q;
        const options = q.options.filter((_, j) => j !== oi);
        let correct = q.correct_index;
        if (oi === correct) correct = 0;
        else if (oi < correct) correct -= 1;
        return { ...q, options, correct_index: correct };
      })
    );

  const saveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setEError(null);

    const cleaned = questions
      .map((q) => ({ ...q, question: q.question.trim(), options: q.options.map((o) => o.trim()) }))
      .filter((q) => q.question !== '');

    for (const [i, q] of cleaned.entries()) {
      if (q.options.some((o) => o === '')) {
        setEError(`Soal ${i + 1}: semua pilihan jawaban harus diisi (hapus pilihan yang tidak dipakai).`);
        return;
      }
    }

    setSaving(true);
    const payload = {
      title: eForm.title,
      description: eForm.description || null,
      duration_minutes: Number(eForm.duration_minutes) || 30,
      passing_score: Number(eForm.passing_score) || 0,
      questions: cleaned,
    };

    try {
      if (eModal.editing) {
        await assessmentService.updateExam(eModal.editing.id, payload);
        flash('Ujian berhasil diperbarui. Ajukan ke Admin agar dapat ditinjau.');
      } else {
        await assessmentService.createExam(courseId, payload);
        flash('Ujian disimpan sebagai draft. Ajukan ke Admin agar dapat ditinjau.');
      }
      setEModal({ open: false, editing: null });
      load();
    } catch (err) {
      setEError(getApiError(err, 'Gagal menyimpan ujian.'));
    } finally {
      setSaving(false);
    }
  };

  const submitForReview = async (exam: Exam) => {
    try {
      const msg = await assessmentService.submitExamForReview(exam.id);
      flash(msg);
      load();
    } catch (err) {
      setError(getApiError(err, 'Gagal mengajukan ujian.'));
    }
  };

  const showAttempts = async (exam: Exam) => {
    try {
      setAttempts(await assessmentService.examAttempts(exam.id));
      setAttemptsFor(exam);
    } catch (err) {
      setError(getApiError(err, 'Gagal memuat hasil ujian.'));
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setSaving(true);
    try {
      await confirm.run();
      setConfirm(null);
      load();
    } catch (err) {
      setConfirm(null);
      setError(getApiError(err, 'Aksi gagal dijalankan.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Assignments */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-800">Tugas</h2>
          </div>
          <button onClick={() => openAssignment(null)} className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg">
            <Plus className="w-3.5 h-3.5" /> <span>Tambah Tugas</span>
          </button>
        </div>

        {assignments.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">Belum ada tugas untuk kursus ini.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {assignments.map((a) => (
              <li key={a.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{a.title}</p>
                  <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center"><CalendarClock className="w-3.5 h-3.5 mr-1" />{a.due_at ? `Tenggat ${formatDateTime(a.due_at)}` : 'Tanpa tenggat'}</span>
                    <span>Nilai maks. {a.max_score}</span>
                    <span>{a.submissions_count ?? 0} terkumpul • {a.graded_count ?? 0} dinilai</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  <button onClick={() => openAssignment(a)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg" title="Edit tugas"><Pencil className="w-4 h-4" /></button>
                  <button
                    onClick={() =>
                      setConfirm({
                        message: `Hapus tugas "${a.title}" beserta seluruh pengumpulannya?`,
                        run: async () => {
                          await assessmentService.deleteAssignment(a.id);
                          flash('Tugas berhasil dihapus.');
                        },
                      })
                    }
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Hapus tugas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Exams */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileQuestion className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-800">Ujian (Bank Soal)</h2>
          </div>
          <button onClick={() => openExam(null)} className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg">
            <Plus className="w-3.5 h-3.5" /> <span>Buat Ujian</span>
          </button>
        </div>

        {exams.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">Belum ada ujian. Buat ujian, lalu ajukan ke Admin untuk ditinjau.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {exams.map((x) => {
              const editable = x.review_status === 'draft' || x.review_status === 'rejected';
              return (
                <li key={x.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900">{x.title}</p>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${EXAM_STATUS_STYLE[x.review_status]}`}>
                          {EXAM_STATUS_LABEL[x.review_status]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {x.questions_count ?? 0} soal • {x.duration_minutes} menit • lulus ≥ {x.passing_score} • {x.attempts_count ?? 0} percobaan
                      </p>
                      {x.review_status === 'rejected' && x.review_note && (
                        <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 mt-2">
                          Catatan Admin: {x.review_note}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 shrink-0">
                      {editable && (
                        <>
                          <button onClick={() => submitForReview(x)} className="inline-flex items-center space-x-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1.5 rounded-lg">
                            <Send className="w-3 h-3" /> <span>{x.review_status === 'rejected' ? 'Ajukan Ulang' : 'Ajukan'}</span>
                          </button>
                          <button onClick={() => openExam(x)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg" title="Edit ujian"><Pencil className="w-4 h-4" /></button>
                        </>
                      )}
                      {x.review_status === 'approved' && (
                        <button onClick={() => showAttempts(x)} className="text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg">
                          Lihat Hasil
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setConfirm({
                            message: `Hapus ujian "${x.title}" beserta semua soal dan hasilnya?`,
                            run: async () => {
                              await assessmentService.deleteExam(x.id);
                              flash('Ujian berhasil dihapus.');
                            },
                          })
                        }
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Hapus ujian"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Assignment modal */}
      <Modal isOpen={aModal.open} onClose={() => setAModal({ open: false, editing: null })} title={aModal.editing ? 'Edit Tugas' : 'Tambah Tugas'} maxWidth="lg">
        <form onSubmit={saveAssignment} className="space-y-4">
          {aError && <Alert type="error" message={aError} />}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Judul tugas *</label>
            <input required value={aForm.title} onChange={(e) => setAForm({ ...aForm, title: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Instruksi</label>
            <textarea rows={5} value={aForm.description} onChange={(e) => setAForm({ ...aForm, description: e.target.value })} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tenggat (opsional)</label>
              <input type="datetime-local" value={aForm.due_at} onChange={(e) => setAForm({ ...aForm, due_at: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nilai maksimum</label>
              <input type="number" min={1} max={1000} value={aForm.max_score} onChange={(e) => setAForm({ ...aForm, max_score: Number(e.target.value) })} className={inputCls} />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setAModal({ open: false, editing: null })} className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50">Batal</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      {/* Exam modal with question builder */}
      <Modal isOpen={eModal.open} onClose={() => setEModal({ open: false, editing: null })} title={eModal.editing ? 'Edit Ujian' : 'Buat Ujian'} maxWidth="xl">
        <form onSubmit={saveExam} className="space-y-4">
          {eError && <Alert type="error" message={eError} />}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Judul ujian *</label>
            <input required value={eForm.title} onChange={(e) => setEForm({ ...eForm, title: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi</label>
            <textarea rows={2} value={eForm.description} onChange={(e) => setEForm({ ...eForm, description: e.target.value })} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Durasi (menit)</label>
              <input type="number" min={1} max={300} value={eForm.duration_minutes} onChange={(e) => setEForm({ ...eForm, duration_minutes: Number(e.target.value) })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nilai kelulusan (0–100)</label>
              <input type="number" min={0} max={100} value={eForm.passing_score} onChange={(e) => setEForm({ ...eForm, passing_score: Number(e.target.value) })} className={inputCls} />
            </div>
          </div>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {questions.map((q, qi) => (
              <div key={qi} className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-700">Soal {qi + 1}</p>
                  <div className="flex items-center space-x-2">
                    <label className="text-[11px] text-slate-500">Poin</label>
                    <input type="number" min={1} max={100} value={q.points} onChange={(e) => updateQuestion(qi, { points: Number(e.target.value) || 1 })} className="w-16 text-xs border border-slate-300 rounded-lg px-2 py-1" />
                    <button type="button" onClick={() => setQuestions((qs) => (qs.length > 1 ? qs.filter((_, i) => i !== qi) : qs))} className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg" title="Hapus soal">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <textarea rows={2} placeholder="Tulis pertanyaan..." value={q.question} onChange={(e) => updateQuestion(qi, { question: e.target.value })} className={inputCls} />
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center space-x-2">
                      <input type="radio" name={`correct-${qi}`} checked={q.correct_index === oi} onChange={() => updateQuestion(qi, { correct_index: oi })} title="Tandai sebagai jawaban benar" className="accent-emerald-600" />
                      <input value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} placeholder={`Pilihan ${String.fromCharCode(65 + oi)}`} className={inputCls} />
                      <button type="button" onClick={() => removeOption(qi, oi)} disabled={q.options.length <= 2} className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30" title="Hapus pilihan">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => addOption(qi)} disabled={q.options.length >= 6} className="text-[11px] font-semibold text-blue-700 hover:underline disabled:opacity-40">
                      + Tambah pilihan
                    </button>
                    <span className="text-[11px] text-slate-400">Pilih radio di sebelah kiri untuk jawaban benar</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => setQuestions((qs) => [...qs, blankQuestion()])} className="w-full text-xs font-semibold text-purple-700 border-2 border-dashed border-purple-300 hover:bg-purple-50 rounded-lg py-2">
            + Tambah Soal
          </button>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setEModal({ open: false, editing: null })} className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50">Batal</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg">{saving ? 'Menyimpan...' : 'Simpan Draft'}</button>
          </div>
        </form>
      </Modal>

      {/* Attempts modal */}
      <Modal isOpen={!!attemptsFor} onClose={() => setAttemptsFor(null)} title={`Hasil: ${attemptsFor?.title ?? ''}`} maxWidth="lg">
        {attempts.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">Belum ada siswa yang mengerjakan ujian ini.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
                <th className="py-2 pr-3 font-semibold">Siswa</th>
                <th className="py-2 pr-3 font-semibold">Nilai</th>
                <th className="py-2 pr-3 font-semibold">Benar</th>
                <th className="py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td className="py-2 pr-3 text-sm text-slate-800">{a.student.name}</td>
                  <td className="py-2 pr-3 text-sm font-mono font-bold">{a.score}</td>
                  <td className="py-2 pr-3 text-sm text-slate-600">{a.correct_count}</td>
                  <td className="py-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${a.passed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                      {a.passed ? 'Lulus' : 'Belum lulus'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>

      {/* Confirm modal */}
      <Modal isOpen={!!confirm} onClose={() => setConfirm(null)} title="Konfirmasi" maxWidth="sm">
        <p className="text-sm text-slate-600">{confirm?.message}</p>
        <div className="flex justify-end space-x-2 pt-4">
          <button onClick={() => setConfirm(null)} className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50">Batal</button>
          <button onClick={runConfirm} disabled={saving} className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg">{saving ? 'Memproses...' : 'Ya, hapus'}</button>
        </div>
      </Modal>
    </div>
  );
};

export default CourseAssessmentsPanel;
