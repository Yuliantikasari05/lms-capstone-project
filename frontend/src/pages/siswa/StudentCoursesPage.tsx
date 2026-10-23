import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Layers, PlayCircle } from 'lucide-react';
import { courseService, getApiError } from '../../services/courseService';
import type { Course } from '../../types/course';
import { Alert } from '../../components/common/Alert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

type Tab = 'mine' | 'catalog';

export const StudentCoursesPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('mine');
  const [mine, setMine] = useState<Course[]>([]);
  const [catalog, setCatalog] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [m, c] = await Promise.all([courseService.myCourses(), courseService.catalog()]);
      setMine(m);
      setCatalog(c);
      setError(null);
    } catch (err) {
      setError(getApiError(err, 'Gagal memuat kelas.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const join = async (course: Course) => {
    setJoiningId(course.id);
    try {
      const msg = await courseService.joinCourse(course.id);
      setSuccess(msg);
      await load();
      setTab('mine');
    } catch (err) {
      setError(getApiError(err, 'Gagal bergabung ke kursus.'));
    } finally {
      setJoiningId(null);
    }
  };

  if (isLoading) return <LoadingSpinner message="Memuat kelas Anda..." />;

  const tabCls = (t: Tab) =>
    `px-4 py-2 text-xs font-semibold rounded-lg transition ${
      tab === t ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kelas & Materi Saya</h1>
          <p className="text-xs text-slate-500 mt-0.5">Lanjutkan belajar atau jelajahi kursus yang tersedia.</p>
        </div>
        <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 space-x-1">
          <button className={tabCls('mine')} onClick={() => setTab('mine')}>Kelas Saya ({mine.length})</button>
          <button className={tabCls('catalog')} onClick={() => setTab('catalog')}>Katalog</button>
        </div>
      </div>

      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {tab === 'mine' ? (
        mine.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Anda belum terdaftar di kursus mana pun</p>
            <button onClick={() => setTab('catalog')} className="mt-3 text-xs font-semibold text-blue-700 hover:underline">
              Lihat katalog kursus
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mine.map((c) => {
              const pct = c.progress?.percent ?? 0;
              return (
                <div key={c.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 leading-snug">{c.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Pengajar: {c.instructor?.name ?? '-'}</p>
                    </div>
                    {c.enrollment_status === 'completed' && (
                      <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Selesai
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{c.progress?.completed ?? 0} dari {c.progress?.total ?? 0} materi</span>
                      <span className="font-mono font-bold text-blue-600">{pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <Link
                    to={`/siswa/courses/${c.id}`}
                    className="mt-4 inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-lg"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>{pct === 0 ? 'Mulai Belajar' : pct === 100 ? 'Tinjau Ulang' : 'Lanjutkan Belajar'}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )
      ) : catalog.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          Belum ada kursus yang diterbitkan.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {catalog.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col">
              <h3 className="text-base font-bold text-slate-900 leading-snug">{c.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description || 'Belum ada deskripsi.'}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                <span className="flex items-center"><Layers className="w-3.5 h-3.5 mr-1" />{c.modules_count ?? 0} modul • {c.lessons_count ?? 0} materi</span>
                {c.category && <span>{c.category}</span>}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Pengajar: {c.instructor?.name ?? '-'}</span>
                {c.is_enrolled ? (
                  <Link to={`/siswa/courses/${c.id}`} className="text-xs font-semibold text-blue-700 hover:underline">
                    Sudah terdaftar — buka
                  </Link>
                ) : (
                  <button
                    onClick={() => join(c)}
                    disabled={joiningId === c.id}
                    className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-3.5 py-2 rounded-lg"
                  >
                    {joiningId === c.id ? 'Mendaftar...' : 'Gabung Kursus'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCoursesPage;
