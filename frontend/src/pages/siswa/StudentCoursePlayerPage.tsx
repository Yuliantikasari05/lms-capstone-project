import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, ExternalLink, FileText, Play } from 'lucide-react';
import { courseService, getApiError } from '../../services/courseService';
import type { Course, Lesson } from '../../types/course';
import { toEmbedUrl } from '../../lib/video';
import { Alert } from '../../components/common/Alert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const StudentCoursePlayerPage: React.FC = () => {
  const { id } = useParams();
  const courseId = Number(id);

  const [course, setCourse] = useState<Course | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (keepActive = false) => {
      try {
        const c = await courseService.learnCourse(courseId);
        setCourse(c);
        setError(null);
        if (!keepActive) {
          const all = (c.modules ?? []).flatMap((m) => m.lessons ?? []);
          const firstTodo = all.find((l) => !l.completed) ?? all[0];
          setActiveId(firstTodo?.id ?? null);
        }
      } catch (err) {
        setError(getApiError(err, 'Gagal memuat materi kursus.'));
      } finally {
        setIsLoading(false);
      }
    },
    [courseId]
  );

  useEffect(() => {
    load();
  }, [load]);

  const lessons: Lesson[] = useMemo(() => (course?.modules ?? []).flatMap((m) => m.lessons ?? []), [course]);
  const activeIndex = lessons.findIndex((l) => l.id === activeId);
  const active = activeIndex >= 0 ? lessons[activeIndex] : null;
  const next = activeIndex >= 0 ? lessons[activeIndex + 1] : undefined;
  const prev = activeIndex > 0 ? lessons[activeIndex - 1] : undefined;

  const toggleComplete = async () => {
    if (!active) return;
    setBusy(true);
    try {
      if (active.completed) {
        await courseService.uncompleteLesson(active.id);
      } else {
        await courseService.completeLesson(active.id);
      }
      await load(true);
    } catch (err) {
      setError(getApiError(err, 'Gagal memperbarui progres.'));
    } finally {
      setBusy(false);
    }
  };

  const completeAndNext = async () => {
    if (!active) return;
    setBusy(true);
    try {
      if (!active.completed) await courseService.completeLesson(active.id);
      await load(true);
      if (next) setActiveId(next.id);
    } catch (err) {
      setError(getApiError(err, 'Gagal memperbarui progres.'));
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Memuat materi..." />;
  if (!course) {
    return (
      <div className="space-y-4">
        <Alert type="error" message={error || 'Kursus tidak ditemukan.'} />
        <Link to="/siswa/courses" className="text-xs font-semibold text-blue-700 hover:underline">
          Kembali ke kelas saya
        </Link>
      </div>
    );
  }

  const pct = course.progress?.percent ?? 0;
  const embed = active?.type === 'video' ? toEmbedUrl(active.video_url) : null;

  return (
    <div className="space-y-5">
      <Link to="/siswa/courses" className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-blue-700">
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Kembali ke kelas saya
      </Link>

      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-snug">{course.title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">Pengajar: {course.instructor?.name ?? '-'}</p>
          </div>
          <div className="sm:w-64">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>{course.progress?.completed ?? 0}/{course.progress?.total ?? 0} materi</span>
              <span className="font-mono font-bold text-blue-600">{pct}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
        {course.enrollment_status === 'completed' && (
          <p className="mt-3 text-xs font-semibold text-emerald-700 flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-1" /> Selamat! Anda telah menyelesaikan seluruh materi kursus ini.
          </p>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Curriculum sidebar */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden self-start">
          {(course.modules ?? []).map((m, mi) => (
            <div key={m.id} className="border-b border-slate-100 last:border-b-0">
              <p className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50">
                Modul {mi + 1}: {m.title}
              </p>
              <ul>
                {(m.lessons ?? []).map((l) => (
                  <li key={l.id}>
                    <button
                      onClick={() => setActiveId(l.id)}
                      className={`w-full flex items-start space-x-2.5 px-4 py-2.5 text-left text-sm transition ${
                        l.id === activeId ? 'bg-blue-50 text-blue-800' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {l.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                      )}
                      <span className="flex-1 leading-snug">{l.title}</span>
                      {l.type === 'video' ? (
                        <Play className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Lesson viewer */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          {!active ? (
            <p className="text-sm text-slate-500 text-center py-10">Kursus ini belum memiliki materi.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{active.title}</h2>
                <p className="text-xs text-slate-500">
                  {active.type === 'video' ? 'Video' : 'Bacaan'} • {active.duration_minutes} menit
                </p>
              </div>

              {active.type === 'video' && (
                embed ? (
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-900">
                    <iframe
                      src={embed}
                      title={active.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : active.video_url ? (
                  <a
                    href={active.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-sm font-semibold text-blue-700 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" /> <span>Buka video di tab baru</span>
                  </a>
                ) : null
              )}

              {active.content && (
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{active.content}</div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100">
                <button
                  disabled={!prev}
                  onClick={() => prev && setActiveId(prev.id)}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-700 border border-slate-200 px-3 py-2 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> <span>Sebelumnya</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleComplete}
                    disabled={busy}
                    className={`text-xs font-semibold px-3 py-2 rounded-lg border transition disabled:opacity-50 ${
                      active.completed
                        ? 'text-slate-700 border-slate-200 hover:bg-slate-50'
                        : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {active.completed ? 'Batalkan Tanda Selesai' : 'Tandai Selesai'}
                  </button>
                  <button
                    onClick={completeAndNext}
                    disabled={busy || (!next && active.completed)}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 px-3 py-2 rounded-lg"
                  >
                    <span>{next ? 'Selesai & Lanjut' : 'Selesaikan Materi'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentCoursePlayerPage;
