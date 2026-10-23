import React, { useState } from 'react';
import { FolderKanban, Plus, BookOpen, Layers, Edit3, Trash2, Eye, CheckCircle2, FileText, Video } from 'lucide-react';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';

interface SubLesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'quiz';
  duration_minutes: number;
}

interface LembagaModule {
  id: string;
  title: string;
  target_cohort: string;
  lessons_count: number;
  duration_weeks: number;
  status: 'published' | 'draft';
  description: string;
  lessons: SubLesson[];
}

const INITIAL_MODULES: LembagaModule[] = [
  {
    id: 'LM-01',
    title: 'Kurikulum Intensif UTBK & Penalaran Matematika',
    target_cohort: 'Kohort Saintek 2027',
    lessons_count: 3,
    duration_weeks: 8,
    status: 'published',
    description: 'Modul bimbingan komprehensif drilling soal TPS, Penalaran Umum, dan Literasi Bahasa.',
    lessons: [
      { id: 'LES-01', title: 'Strategi Menyelesaikan Penalaran Deduktif & Induktif', type: 'video', duration_minutes: 45 },
      { id: 'LES-02', title: 'Trik Cepat Soal Perbandingan Kuantitatif & Aritmetika', type: 'text', duration_minutes: 30 },
      { id: 'LES-03', title: 'Simulasi Latihan Soal Bab 1 & Evaluasi Mandiri', type: 'quiz', duration_minutes: 60 },
    ],
  },
  {
    id: 'LM-02',
    title: 'Drilling Soal Tes Potensi Skolastik (TPS) Mandiri',
    target_cohort: 'Kohort Reguler Weekend',
    lessons_count: 2,
    duration_weeks: 4,
    status: 'published',
    description: 'Bank materi latihan harian dengan pembahasan video terperinci oleh tutor lembaga.',
    lessons: [
      { id: 'LES-04', title: 'Bedah Tuntas Pemahaman Bacaan & Menulis (PBM)', type: 'video', duration_minutes: 40 },
      { id: 'LES-05', title: 'Latihan 50 Soal Analogi & Logika Bahasa', type: 'quiz', duration_minutes: 50 },
    ],
  },
  {
    id: 'LM-03',
    title: 'Persiapan Ujian Mandiri PTN Favorit (SIMAK UI & UTUL UGM)',
    target_cohort: 'Kohort Khusus Alumni',
    lessons_count: 2,
    duration_weeks: 6,
    status: 'draft',
    description: 'Modul pengayaan tingkat tinggi untuk seleksi mandiri perguruan tinggi terkemuka.',
    lessons: [
      { id: 'LES-06', title: 'Karakteristik & Silabus Soal Campuran Sains', type: 'text', duration_minutes: 35 },
      { id: 'LES-07', title: 'Drilling Paket Soal Ujian Mandiri 2024-2025', type: 'quiz', duration_minutes: 90 },
    ],
  },
];

export const LembagaModulesPage: React.FC = () => {
  const [modules, setModules] = useState<LembagaModule[]>(INITIAL_MODULES);
  const [showModal, setShowModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<LembagaModule | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<'video' | 'text' | 'quiz'>('video');
  const [newLessonDuration, setNewLessonDuration] = useState(30);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    title: '',
    target_cohort: 'Kohort Baru 2027',
    duration_weeks: 6,
    description: '',
  });

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const newMod: LembagaModule = {
      id: `LM-${Date.now()}`,
      title: form.title.trim(),
      target_cohort: form.target_cohort,
      lessons_count: 1,
      duration_weeks: Number(form.duration_weeks),
      status: 'published',
      description: form.description.trim(),
      lessons: [
        { id: `LES-${Date.now()}`, title: 'Pengenalan & Silabus Program', type: 'text', duration_minutes: 20 },
      ],
    };

    setModules((prev) => [newMod, ...prev]);
    setShowModal(false);
    setForm({
      title: '',
      target_cohort: 'Kohort Baru 2027',
      duration_weeks: 6,
      description: '',
    });
    setAlert({ type: 'success', message: 'Modul mandiri kurikulum lembaga berhasil dibuat dan aktif untuk kohort!' });
  };

  const handleToggleStatus = (id: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === 'published' ? 'draft' : 'published' } : m
      )
    );
    setAlert({ type: 'success', message: 'Status publikasi modul berhasil diperbarui!' });
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim() || !selectedModule) return;

    const newLesson: SubLesson = {
      id: `LES-${Date.now()}`,
      title: newLessonTitle.trim(),
      type: newLessonType,
      duration_minutes: Number(newLessonDuration),
    };

    const updated = {
      ...selectedModule,
      lessons_count: selectedModule.lessons.length + 1,
      lessons: [...selectedModule.lessons, newLesson],
    };

    setSelectedModule(updated);
    setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setNewLessonTitle('');
    setAlert({ type: 'success', message: `Submateri "${newLesson.title}" berhasil ditambahkan ke modul!` });
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!selectedModule) return;

    const updated = {
      ...selectedModule,
      lessons_count: Math.max(0, selectedModule.lessons.length - 1),
      lessons: selectedModule.lessons.filter((l) => l.id !== lessonId),
    };

    setSelectedModule(updated);
    setModules((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setAlert({ type: 'success', message: 'Submateri berhasil dihapus dari kurikulum.' });
  };

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Modul & Kurikulum Mandiri Lembaga Bimbingan"
        category="production"
        description="Rancang dan kelola kurikulum eksklusif lembaga Anda, kelola materi & submodul secara interaktif, dan publikasikan untuk kohort Anda."
        roleScope="Lembaga Bimbingan (courses:manage, curriculum:edit)"
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Action Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Daftar Modul & Silabus Lembaga</h3>
          <p className="text-xs text-slate-500">Materi mandiri lembaga bimbingan terlindungi dan eksklusif untuk kohort Anda.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center shadow-xs"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Tambah Modul Baru
        </button>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modules.map((m) => (
          <div
            key={m.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {m.target_cohort}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    m.status === 'published'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {m.status === 'published' ? 'Terbit' : 'Draft'}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-800 leading-snug">{m.title}</h4>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{m.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center font-medium">
                  <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {m.lessons.length} Submateri
                </span>
                <span className="font-semibold text-slate-700">{m.duration_weeks} Minggu</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleToggleStatus(m.id)}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                {m.status === 'published' ? 'Jadikan Draft' : 'Terbitkan'}
              </button>
              <button
                onClick={() => setSelectedModule(m)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" /> Kelola Materi ({m.lessons.length})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Module Syllabus Manager Modal */}
      {selectedModule && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedModule(null)}
          title={`Kelola Materi & Submodul: ${selectedModule.title}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-slate-500 block">Target Kohort:</span>
                <span className="font-bold text-slate-800">{selectedModule.target_cohort}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Total Submateri:</span>
                <span className="font-bold text-blue-600">{selectedModule.lessons.length} Materi</span>
              </div>
            </div>

            {/* List of Lessons */}
            <div className="space-y-2">
              <span className="font-bold text-slate-700 block">Daftar Submateri Terjadwal:</span>
              {selectedModule.lessons.length === 0 ? (
                <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  Belum ada submateri pada modul ini. Tambahkan di bawah.
                </div>
              ) : (
                selectedModule.lessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-50"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-slate-800">{lesson.title}</span>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="uppercase font-bold text-slate-500">[{lesson.type}]</span>
                          <span>•</span>
                          <span>{lesson.duration_minutes} Menit Belajar</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Hapus materi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add New Lesson Form */}
            <form onSubmit={handleAddLesson} className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-3">
              <span className="font-bold text-blue-900 block flex items-center">
                <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Submateri Baru:
              </span>
              <div>
                <input
                  type="text"
                  required
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="Judul materi (e.g. Pembahasan Soal Trigonometri)"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <select
                    value={newLessonType}
                    onChange={(e) => setNewLessonType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="video">Video Pembahasan</option>
                    <option value="text">Artikel / Rangkuman Teks</option>
                    <option value="quiz">Latihan Soal / Kuis</option>
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    min="5"
                    value={newLessonDuration}
                    onChange={(e) => setNewLessonDuration(Number(e.target.value))}
                    placeholder="Durasi (Menit)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs shadow-xs"
              >
                + Tambahkan ke Silabus Modul
              </button>
            </form>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedModule(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 shadow-xs"
              >
                Selesai Mengelola
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Add Module */}
      {showModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowModal(false)}
          title="Buat Modul Kurikulum Mandiri Baru"
        >
          <form onSubmit={handleCreateModule} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Judul Modul / Program Bimbingan</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh: Modul Intensif UTBK TPS & Literasi"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Kohort</label>
                <input
                  type="text"
                  required
                  value={form.target_cohort}
                  onChange={(e) => setForm({ ...form, target_cohort: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Estimasi Durasi (Minggu)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={form.duration_weeks}
                  onChange={(e) => setForm({ ...form, duration_weeks: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Deskripsi & Target Capaian</label>
              <textarea
                rows={3}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Rangkum tujuan pembelajaran dan materi yang akan dibahas..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
              >
                Simpan & Rilis Modul
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
