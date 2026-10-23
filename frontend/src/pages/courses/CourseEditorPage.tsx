import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, Pencil, Play, Plus, Trash2, UserMinus, UserPlus } from 'lucide-react';
import { courseService, getApiError } from '../../services/courseService';
import type {
  Course,
  CourseEnrollment,
  CourseModule,
  Lesson,
  LessonFormPayload,
  UserOption,
} from '../../types/course';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CourseStatusBadge } from './CourseManagementPage';
import { CourseAssessmentsPanel } from './CourseAssessmentsPanel';

type ConfirmState = { message: string; onConfirm: () => Promise<void> } | null;

const emptyLesson: LessonFormPayload = {
  title: '',
  type: 'text',
  content: '',
  video_url: '',
  duration_minutes: 10,
};

export const CourseEditorPage: React.FC = () => {
  const { id } = useParams();
  const courseId = Number(id);
  const location = useLocation();
  const basePath = location.pathname.startsWith('/admin') ? '/admin/courses' : '/mentor/courses';

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [students, setStudents] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // module modal
  const [moduleModal, setModuleModal] = useState<{ open: boolean; editing: CourseModule | null }>({ open: false, editing: null });
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });

  // lesson modal
  const [lessonModal, setLessonModal] = useState<{ open: boolean; moduleId: number | null; editing: Lesson | null }>({
    open: false,
    moduleId: null,
    editing: null,
  });
  const [lessonForm, setLessonForm] = useState<LessonFormPayload>(emptyLesson);

  const [modalError, setModalError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [studentToAdd, setStudentToAdd] = useState('');

  const load = useCallback(async () => {
    try {
      const [c, e, o] = await Promise.all([
        courseService.get(courseId),
        courseService.enrollments(courseId),
        courseService.options(),
      ]);
      setCourse(c);
      setEnrollments(e);
      setStudents(o.students);
      setError(null);
    } catch (err) {
      setError(getApiError(err, 'Gagal memuat kursus.'));
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const enrolledIds = useMemo(() => new Set(enrollments.map((e) => e.user_id)), [enrollments]);
  const availableStudents = students.filter((s) => !enrolledIds.has(s.id));

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  /* ---------- course ---------- */
  const togglePublish = async () => {
    if (!course) return;
    try {
      await courseService.update(course.id, { status: course.status === 'published' ? 'draft' : 'published' });
      flash(course.status === 'published' ? 'Kursus dikembalikan ke draft.' : 'Kursus berhasil diterbitkan.');
      load();
    } catch (err) {
      setError(getApiError(err, 'Gagal mengubah status kursus.'));
    }
  };

  /* ---------- modules ---------- */
  const openModule = (m: CourseModule | null) => {
    setModuleForm({ title: m?.title ?? '', description: m?.description ?? '' });
    setModalError(null);
    setModuleModal({ open: true, editing: m });
  };

  const saveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError(null);
    const payload = { title: moduleForm.title, description: moduleForm.description || null };
    try {
      if (moduleModal.editing) {
        await courseService.updateModule(moduleModal.editing.id, payload);
        flash('Modul berhasil diperbarui.');
      } else {
        await courseService.createModule(courseId, payload);
        flash('Modul berhasil ditambahkan.');
      }
      setModuleModal({ open: false, editing: null });
      load();
    } catch (err) {
      setModalError(getApiError(err, 'Gagal menyimpan modul.'));
    } finally {
      setSaving(false);
    }
  };

  const askDeleteModule = (m: CourseModule) =>
    setConfirm({
      message: `Hapus modul "${m.title}" beserta seluruh materinya?`,
      onConfirm: async () => {
        await courseService.removeModule(m.id);
        flash('Modul berhasil dihapus.');
      },
    });

  /* ---------- lessons ---------- */
  const openLesson = (moduleId: number, l: Lesson | null) => {
    setLessonForm(
      l
        ? {
            title: l.title,
            type: l.type,
            content: l.content ?? '',
            video_url: l.video_url ?? '',
            duration_minutes: l.duration_minutes,
          }
        : emptyLesson
    );
    setModalError(null);
    setLessonModal({ open: true, moduleId, editing: l });
  };

  const saveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonModal.moduleId) return;
    setSaving(true);
    setModalError(null);
    const payload: LessonFormPayload = {
      ...lessonForm,
      content: lessonForm.content || null,
      video_url: lessonForm.type === 'video' ? lessonForm.video_url || null : null,
      duration_minutes: Number(lessonForm.duration_minutes) || 0,
    };
    try {
      if (lessonModal.editing) {
        await courseService.updateLesson(lessonModal.editing.id, payload);
        flash('Materi berhasil diperbarui.');
      } else {
        await courseService.createLesson(lessonModal.moduleId, payload);
        flash('Materi berhasil ditambahkan.');
      }
      setLessonModal({ open: false, moduleId: null, editing: null });
      load();
    } catch (err) {
      setModalError(getApiError(err, 'Gagal menyimpan materi.'));
    } finally {
      setSaving(false);
    }
  };

  const askDeleteLesson = (l: Lesson) =>
    setConfirm({
      message: `Hapus materi "${l.title}"?`,
      onConfirm: async () => {
        await courseService.removeLesson(l.id);
        flash('Materi berhasil dihapus.');
      },
    });

  /* ---------- enrollments ---------- */
  const enrollStudent = async () => {
    if (!studentToAdd) return;
    try {
      const msg = await courseService.enroll(courseId, Number(studentToAdd));
      setStudentToAdd('');
      flash(msg);
      load();
    } catch (err) {
      setError(getApiError(err, 'Gagal mendaftarkan peserta.'));
    }
  };

  const askUnenroll = (e: CourseEnrollment) =>
    setConfirm({
      message: `Keluarkan ${e.name ?? 'peserta'} dari kursus ini?`,
      onConfirm: async () => {
        await courseService.unenroll(courseId, e.user_id);
        flash('Peserta dikeluarkan dari kursus.');
      },
    });

  const runConfirm = async () => {
    if (!confirm) return;
    setSaving(true);
    try {
      await confirm.onConfirm();
      setConfirm(null);
      load();
    } catch (err) {
      setConfirm(null);
      setError(getApiError(err, 'Aksi gagal dijalankan.'));
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white';

  if (isLoading) return <LoadingSpinner message="Memuat kursus..." />;
  if (!course) return <Alert type="error" message={error || 'Kursus tidak ditemukan.'} />;

  const modules = course.modules ?? [];

  return (
    <div className="space-y-6">
      <Link to={basePath} className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-blue-700">
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Kembali ke daftar kursus
      </Link>

      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <CourseStatusBadge status={course.status} />
            {course.category && <span className="text-[11px] text-slate-500">{course.category}</span>}
          </div>
          <h1 className="text-xl font-bold text-slate-900 leading-snug">{course.title}</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">{course.description || 'Belum ada deskripsi.'}</p>
          <p className="text-xs text-slate-500 mt-2">
            {course.modules_count ?? 0} modul • {course.lessons_count ?? 0} materi • {course.students_count ?? 0} peserta
            {course.instructor ? ` • Pengajar: ${course.instructor.name}` : ''}
          </p>
        </div>
        <button
          onClick={togglePublish}
          className={`shrink-0 px-4 py-2 text-xs font-semibold rounded-lg border transition ${
            course.status === 'published'
              ? 'text-slate-700 border-slate-200 hover:bg-slate-50'
              : 'text-white bg-emerald-600 hover:bg-emerald-700 border-emerald-600'
          }`}
        >
          {course.status === 'published' ? 'Jadikan Draft' : 'Terbitkan Kursus'}
        </button>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Curriculum */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">Kurikulum</h2>
          <button
            onClick={() => openModule(null)}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" /> <span>Tambah Modul</span>
          </button>
        </div>

        {modules.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            Belum ada modul. Tambahkan modul pertama, lalu isi dengan materi.
          </p>
        ) : (
          <div className="space-y-4">
            {modules.map((m, mi) => (
              <div key={m.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between gap-2 bg-slate-50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      Modul {mi + 1}: {m.title}
                    </p>
                    {m.description && <p className="text-xs text-slate-500 truncate">{m.description}</p>}
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button onClick={() => openLesson(m.id, null)} className="text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg">
                      + Materi
                    </button>
                    <button onClick={() => openModule(m)} className="p-1.5 text-slate-600 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg" title="Edit modul">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => askDeleteModule(m)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" title="Hapus modul">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {(m.lessons ?? []).length === 0 ? (
                  <p className="text-xs text-slate-400 px-4 py-3">Belum ada materi di modul ini.</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {(m.lessons ?? []).map((l, li) => (
                      <li key={l.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          {l.type === 'video' ? (
                            <Play className="w-4 h-4 text-purple-500 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                          )}
                          <span className="text-sm text-slate-800 truncate">
                            {li + 1}. {l.title}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center shrink-0">
                            <Clock className="w-3 h-3 mr-0.5" />
                            {l.duration_minutes} mnt
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          <button onClick={() => openLesson(m.id, l)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg" title="Edit materi">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => askDeleteLesson(l)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" title="Hapus materi">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignments & exams */}
      <CourseAssessmentsPanel courseId={courseId} />

      {/* Participants */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-800 mb-4">Peserta Kursus</h2>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <select value={studentToAdd} onChange={(e) => setStudentToAdd(e.target.value)} className={inputCls}>
            <option value="">Pilih siswa untuk didaftarkan...</option>
            {availableStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
          <button
            onClick={enrollStudent}
            disabled={!studentToAdd}
            className="inline-flex items-center justify-center space-x-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 px-4 py-2 rounded-lg shrink-0"
          >
            <UserPlus className="w-4 h-4" /> <span>Daftarkan</span>
          </button>
        </div>

        {enrollments.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">Belum ada peserta terdaftar.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  <th className="py-2 pr-3 font-semibold">Peserta</th>
                  <th className="py-2 pr-3 font-semibold">Progres</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((e) => (
                  <tr key={e.id}>
                    <td className="py-2.5 pr-3">
                      <p className="text-sm font-semibold text-slate-900">{e.name}</p>
                      <p className="text-xs text-slate-500">{e.email}</p>
                    </td>
                    <td className="py-2.5 pr-3 w-56">
                      <div className="flex items-center space-x-2">
                        <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${e.progress.percent}%` }} />
                        </div>
                        <span className="text-xs font-mono text-slate-600 w-20 text-right">
                          {e.progress.completed}/{e.progress.total} ({e.progress.percent}%)
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          e.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {e.status === 'completed' ? 'Selesai' : 'Berjalan'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => askUnenroll(e)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg" title="Keluarkan peserta">
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Module modal */}
      <Modal
        isOpen={moduleModal.open}
        onClose={() => setModuleModal({ open: false, editing: null })}
        title={moduleModal.editing ? 'Edit Modul' : 'Tambah Modul'}
      >
        <form onSubmit={saveModule} className="space-y-4">
          {modalError && <Alert type="error" message={modalError} />}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Judul modul *</label>
            <input required value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi</label>
            <textarea rows={3} value={moduleForm.description} onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })} className={inputCls} />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setModuleModal({ open: false, editing: null })} className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50">
              Batal
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Lesson modal */}
      <Modal
        isOpen={lessonModal.open}
        onClose={() => setLessonModal({ open: false, moduleId: null, editing: null })}
        title={lessonModal.editing ? 'Edit Materi' : 'Tambah Materi'}
        maxWidth="lg"
      >
        <form onSubmit={saveLesson} className="space-y-4">
          {modalError && <Alert type="error" message={modalError} />}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Judul materi *</label>
            <input required value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe</label>
              <select value={lessonForm.type} onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value as 'text' | 'video' })} className={inputCls}>
                <option value="text">Teks</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Durasi (menit)</label>
              <input type="number" min={0} max={1000} value={lessonForm.duration_minutes ?? 0} onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: Number(e.target.value) })} className={inputCls} />
            </div>
          </div>
          {lessonForm.type === 'video' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Link video (YouTube / Vimeo) *</label>
              <input type="url" required value={lessonForm.video_url ?? ''} onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })} className={inputCls} placeholder="https://www.youtube.com/watch?v=..." />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lessonForm.type === 'video' ? 'Catatan / ringkasan video' : 'Isi materi'}
            </label>
            <textarea rows={7} value={lessonForm.content ?? ''} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} className={inputCls} />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setLessonModal({ open: false, moduleId: null, editing: null })} className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50">
              Batal
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm modal */}
      <Modal isOpen={!!confirm} onClose={() => setConfirm(null)} title="Konfirmasi" maxWidth="sm">
        <p className="text-sm text-slate-600">{confirm?.message}</p>
        <div className="flex justify-end space-x-2 pt-4">
          <button onClick={() => setConfirm(null)} className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50">
            Batal
          </button>
          <button onClick={runConfirm} disabled={saving} className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg">
            {saving ? 'Memproses...' : 'Ya, lanjutkan'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CourseEditorPage;
