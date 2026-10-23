import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Layers, Pencil, Plus, RefreshCw, Search, Trash2, Users } from 'lucide-react';
import { courseService, getApiError } from '../../services/courseService';
import type { Course, CourseAudience, CourseFormPayload, CourseLevel, UserOption } from '../../types/course';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const LEVEL_LABEL: Record<CourseLevel, string> = {
  beginner: 'Pemula',
  intermediate: 'Menengah',
  advanced: 'Lanjutan',
};

const AUDIENCE_LABEL: Record<CourseAudience, string> = {
  siswa: 'Siswa',
  karyawan: 'Karyawan',
  umum: 'Umum',
};

const emptyForm: CourseFormPayload = {
  title: '',
  description: '',
  category: '',
  level: 'beginner',
  audience: 'siswa',
  thumbnail_url: '',
  instructor_id: null,
};

export const CourseStatusBadge: React.FC<{ status: 'draft' | 'published' }> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
      status === 'published'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-slate-100 text-slate-600 border-slate-200'
    }`}
  >
    {status === 'published' ? 'Terbit' : 'Draft'}
  </span>
);

export const CourseManagementPage: React.FC = () => {
  const location = useLocation();
  const { role } = useAuth();
  const basePath = location.pathname.startsWith('/admin') ? '/admin/courses' : '/mentor/courses';
  const isAdmin = role === 'admin';

  const [courses, setCourses] = useState<Course[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number } | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [mentors, setMentors] = useState<UserOption[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState<CourseFormPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState<Course | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await courseService.list({ page, search: debouncedSearch || undefined, status: status || undefined });
      setCourses(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(getApiError(err, 'Gagal memuat daftar kursus.'));
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, status]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (isAdmin) {
      courseService.options().then((o) => setMentors(o.mentors)).catch(() => undefined);
    }
  }, [isAdmin]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditing(course);
    setForm({
      title: course.title,
      description: course.description ?? '',
      category: course.category ?? '',
      level: course.level,
      audience: course.audience,
      thumbnail_url: course.thumbnail_url ?? '',
      instructor_id: course.instructor_id,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    const payload: CourseFormPayload = {
      ...form,
      description: form.description || null,
      category: form.category || null,
      thumbnail_url: form.thumbnail_url || null,
    };
    if (!isAdmin) delete payload.instructor_id;

    try {
      if (editing) {
        await courseService.update(editing.id, payload);
        setSuccess('Kursus berhasil diperbarui.');
      } else {
        await courseService.create(payload);
        setSuccess('Kursus dibuat sebagai draft. Tambahkan modul dan materi, lalu terbitkan.');
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(getApiError(err, 'Gagal menyimpan kursus.'));
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (course: Course) => {
    setError(null);
    try {
      await courseService.update(course.id, { status: course.status === 'published' ? 'draft' : 'published' });
      setSuccess(course.status === 'published' ? 'Kursus dikembalikan ke draft.' : 'Kursus berhasil diterbitkan.');
      load();
    } catch (err) {
      setError(getApiError(err, 'Gagal mengubah status kursus.'));
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    try {
      await courseService.remove(deleting.id);
      setSuccess(`Kursus "${deleting.title}" berhasil dihapus.`);
      setDeleting(null);
      load();
    } catch (err) {
      setError(getApiError(err, 'Gagal menghapus kursus.'));
      setDeleting(null);
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    'w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kurikulum & Konten</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin
              ? 'Kelola seluruh kursus sistem: modul, materi teks/video, publikasi, dan peserta.'
              : 'Kelola kursus milik Anda: modul, materi teks/video, publikasi, dan peserta.'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={load}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            title="Muat ulang"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2.5 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Kursus Baru</span>
          </button>
        </div>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul kursus..."
            className={`${inputCls} pl-9`}
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className={`${inputCls} sm:w-44`}
        >
          <option value="">Semua status</option>
          <option value="published">Terbit</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Memuat kursus..." />
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Belum ada kursus</p>
          <p className="text-xs text-slate-500 mt-1">Klik "Kursus Baru" untuk membuat kursus pertama.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {courses.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <CourseStatusBadge status={c.status} />
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                      {LEVEL_LABEL[c.level]}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                      {AUDIENCE_LABEL[c.audience]}
                    </span>
                  </div>
                  <Link to={`${basePath}/${c.id}`} className="text-base font-bold text-slate-900 hover:text-blue-700 leading-snug block">
                    {c.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description || 'Belum ada deskripsi.'}</p>
                </div>
              </div>

              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-4">
                <span className="flex items-center"><Layers className="w-3.5 h-3.5 mr-1" />{c.modules_count ?? 0} modul • {c.lessons_count ?? 0} materi</span>
                <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1" />{c.students_count ?? 0} peserta</span>
                {c.category && <span>{c.category}</span>}
                {isAdmin && c.instructor && <span>Pengajar: {c.instructor.name}</span>}
              </div>

              <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-slate-100">
                <Link
                  to={`${basePath}/${c.id}`}
                  className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition"
                >
                  Kelola Materi & Peserta
                </Link>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => togglePublish(c)}
                    className="text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition"
                  >
                    {c.status === 'published' ? 'Jadikan Draft' : 'Terbitkan'}
                  </button>
                  <button
                    onClick={() => openEdit(c)}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                    title="Edit info kursus"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleting(c)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                    title="Hapus kursus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>
            Halaman {meta.current_page} dari {meta.last_page} • {meta.total} kursus
          </span>
          <div className="space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-40 hover:bg-slate-50"
            >
              Sebelumnya
            </button>
            <button
              disabled={page >= meta.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-40 hover:bg-slate-50"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Edit Kursus' : 'Kursus Baru'} maxWidth="lg">
        <form onSubmit={handleSave} className="space-y-4">
          {formError && <Alert type="error" message={formError} />}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Judul kursus *</label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi</label>
            <textarea rows={3} value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
              <input value={form.category ?? ''} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls} placeholder="mis. Web Development" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Level</label>
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as CourseLevel })} className={inputCls}>
                <option value="beginner">Pemula</option>
                <option value="intermediate">Menengah</option>
                <option value="advanced">Lanjutan</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Untuk</label>
              <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value as CourseAudience })} className={inputCls}>
                <option value="siswa">Siswa</option>
                <option value="karyawan">Karyawan</option>
                <option value="umum">Umum</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">URL thumbnail (opsional)</label>
            <input type="url" value={form.thumbnail_url ?? ''} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} className={inputCls} placeholder="https://..." />
          </div>
          {isAdmin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pengajar</label>
              <select
                value={form.instructor_id ?? ''}
                onChange={(e) => setForm({ ...form, instructor_id: e.target.value ? Number(e.target.value) : null })}
                className={inputCls}
              >
                <option value="">Saya sendiri</option>
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50">
              Batal
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleting} onClose={() => setDeleting(null)} title="Hapus Kursus" maxWidth="sm">
        <p className="text-sm text-slate-600">
          Hapus kursus <strong>{deleting?.title}</strong>? Seluruh modul, materi, dan data peserta kursus ini ikut terhapus.
        </p>
        <div className="flex justify-end space-x-2 pt-4">
          <button onClick={() => setDeleting(null)} className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50">
            Batal
          </button>
          <button onClick={confirmDelete} disabled={saving} className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg">
            {saving ? 'Menghapus...' : 'Ya, hapus'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CourseManagementPage;
