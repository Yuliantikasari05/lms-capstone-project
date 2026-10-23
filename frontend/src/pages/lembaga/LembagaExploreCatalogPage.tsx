import React, { useState } from 'react';
import { Compass, BookOpen, Layers, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';
import { Alert } from '../../components/common/Alert';

interface SystemCourse {
  id: number;
  title: string;
  category: string;
  level: string;
  total_modules: number;
  total_lessons: number;
  is_adopted: boolean;
  description: string;
}

const SYSTEM_CATALOG: SystemCourse[] = [
  {
    id: 1,
    title: 'Full-Stack Web Development Bootcamp',
    category: 'Software Engineering',
    level: 'Menengah',
    total_modules: 4,
    total_lessons: 18,
    is_adopted: true,
    description: 'Kurikulum standar industri mencakup Laravel 12, PostgreSQL, React, dan integrasi Payment Gateway.',
  },
  {
    id: 2,
    title: 'Microservices Architecture with Go & Docker',
    category: 'Cloud Engineering',
    level: 'Lanjutan',
    total_modules: 3,
    total_lessons: 12,
    is_adopted: false,
    description: 'Standar kurikulum backend berskala tinggi dengan microservices, containerization, dan CI/CD.',
  },
  {
    id: 3,
    title: 'Dasar Pemrograman Web Modern (HTML, CSS, JS)',
    category: 'Fundamental',
    level: 'Pemula',
    total_modules: 2,
    total_lessons: 8,
    is_adopted: true,
    description: 'Materi pondasi coding yang dirancang khusus untuk siswa SMA / pemula bimbingan belajar.',
  },
];

export const LembagaExploreCatalogPage: React.FC = () => {
  const [catalog, setCatalog] = useState<SystemCourse[]>(SYSTEM_CATALOG);
  const [search, setSearch] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredCatalog = catalog.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleAdoption = (id: number) => {
    setCatalog((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.is_adopted;
          setAlert({
            type: 'success',
            message: nextState
              ? `Kurikulum "${c.title}" berhasil diadopsi ke katalog siswa kohort lembaga Anda!`
              : `Kurikulum "${c.title}" dicabut dari adopsi kohort.`,
          });
          return { ...c, is_adopted: nextState };
        }
        return c;
      })
    );
  };

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Jelajah Katalog Kurikulum Standar Sistem LMS"
        category="production"
        description="Telusuri bank modul standar nasional Maxy Academy, tinjau silabus lengkap, dan adopsi materi kurikulum ke dalam program belajar lembaga bimbingan Anda."
        roleScope="Lembaga Bimbingan (courses:explore, catalog:view)"
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Search Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kurikulum, kategori sistem..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Catalog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredCatalog.map((course) => (
          <div
            key={course.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {course.category}
                </span>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {course.level}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-800 leading-snug">{course.title}</h4>
              <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">{course.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center">
                  <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {course.total_modules} Modul
                </span>
                <span>{course.total_lessons} Materi Video & Teks</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              {course.is_adopted ? (
                <span className="text-xs font-semibold text-emerald-700 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Telah Diadopsi
                </span>
              ) : (
                <span className="text-xs text-slate-400">Tersedia untuk Adopsi</span>
              )}

              <button
                onClick={() => handleToggleAdoption(course.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors ${
                  course.is_adopted
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {course.is_adopted ? 'Batalkan Adopsi' : 'Adopsi Kurikulum'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
