import React, { useState } from 'react';
import { Users, Search, BookOpen, CheckCircle, Clock, MessageSquare, Award, ExternalLink } from 'lucide-react';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';

interface StudentTrackItem {
  id: string;
  name: string;
  email: string;
  role_type: 'siswa' | 'karyawan';
  course_name: string;
  progress_percent: number;
  completed_assignments: number;
  total_assignments: number;
  exam_score: number | null;
  last_active: string;
}

const INITIAL_STUDENTS: StudentTrackItem[] = [
  {
    id: 'STU-01',
    name: 'Budi Pratama (SMA 1)',
    email: 'siswa@maxy.test',
    role_type: 'siswa',
    course_name: 'Full-Stack Web Development Bootcamp',
    progress_percent: 65,
    completed_assignments: 4,
    total_assignments: 5,
    exam_score: 88,
    last_active: '2 jam yang lalu',
  },
  {
    id: 'STU-02',
    name: 'Ahmad Fauzi (Tech Corp)',
    email: 'karyawan@maxy.test',
    role_type: 'karyawan',
    course_name: 'Microservices with Go & Docker',
    progress_percent: 90,
    completed_assignments: 6,
    total_assignments: 6,
    exam_score: 94,
    last_active: '15 menit yang lalu',
  },
  {
    id: 'STU-03',
    name: 'Clarissa Maharani',
    email: 'clarissa@maxy.test',
    role_type: 'siswa',
    course_name: 'UI/UX Design Masterclass & Prototyping',
    progress_percent: 40,
    completed_assignments: 2,
    total_assignments: 4,
    exam_score: null,
    last_active: 'Kemarin',
  },
  {
    id: 'STU-04',
    name: 'Rizky Ramadhan',
    email: 'rizky.r@techcorp.co.id',
    role_type: 'karyawan',
    course_name: 'Microservices with Go & Docker',
    progress_percent: 25,
    completed_assignments: 1,
    total_assignments: 6,
    exam_score: null,
    last_active: '3 hari yang lalu',
  },
];

export const MentorStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<StudentTrackItem[]>(INITIAL_STUDENTS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'siswa' | 'karyawan'>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentTrackItem | null>(null);
  const [mentorNote, setMentorNote] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredStudents = students.filter((s) => {
    const matchRole = roleFilter === 'all' || s.role_type === roleFilter;
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.course_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorNote.trim()) return;

    setAlert({
      type: 'success',
      message: `Catatan bimbingan berhasil dikirim ke notifikasi & email ${selectedStudent?.name}!`,
    });
    setMentorNote('');
    setSelectedStudent(null);
  };

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Daftar Peserta Binaan & Pemantauan Progres Belajar"
        category="production"
        description="Pantau perkembangan belajar seluruh siswa akademik dan peserta pelatihan korporat yang Anda dampingi secara individual."
        roleScope="Mentor (students:view, evaluations:submit)"
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Peserta Aktif</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{students.length}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600">Siswa Akademik</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">
              {students.filter((s) => s.role_type === 'siswa').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-indigo-600">Karyawan Korporat</p>
            <p className="text-2xl font-bold text-indigo-700 mt-1">
              {students.filter((s) => s.role_type === 'karyawan').length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama peserta, kelas, email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Segmen:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700"
          >
            <option value="all">Semua Segmen</option>
            <option value="siswa">Hanya Siswa Akademik</option>
            <option value="karyawan">Hanya Karyawan Korporat</option>
          </select>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Nama Peserta</th>
              <th className="py-3 px-4">Segmen</th>
              <th className="py-3 px-4">Kelas Diikuti</th>
              <th className="py-3 px-4">Progres Materi</th>
              <th className="py-3 px-4">Tugas / Ujian</th>
              <th className="py-3 px-4">Aktivitas Terakhir</th>
              <th className="py-3 px-4 text-right">Bimbingan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filteredStudents.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/60">
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-800">{s.name}</div>
                  <div className="text-[11px] text-slate-400">{s.email}</div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      s.role_type === 'karyawan'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {s.role_type}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-slate-700">{s.course_name}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-800">{s.progress_percent}%</span>
                  </div>
                  <div className="w-28 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        s.progress_percent >= 80
                          ? 'bg-emerald-500'
                          : s.progress_percent >= 50
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${s.progress_percent}%` }}
                    />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium text-slate-800">
                    {s.completed_assignments}/{s.total_assignments} Tugas
                  </span>
                  {s.exam_score !== null && (
                    <div className="text-[11px] font-semibold text-blue-600">
                      Ujian: {s.exam_score}/100
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-400">{s.last_active}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setSelectedStudent(s)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                  >
                    Beri Catatan
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note / Feedback Modal */}
      {selectedStudent && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedStudent(null)}
          title={`Beri Catatan Bimbingan: ${selectedStudent.name}`}
        >
          <form onSubmit={handleSendFeedback} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-500">Kelas: <span className="font-semibold text-slate-800">{selectedStudent.course_name}</span></p>
              <p className="text-slate-500 mt-0.5">Progres: <span className="font-semibold text-blue-600">{selectedStudent.progress_percent}% selesai</span></p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Pesan / Rekomendasi Mentor untuk Peserta:
              </label>
              <textarea
                required
                rows={4}
                value={mentorNote}
                onChange={(e) => setMentorNote(e.target.value)}
                placeholder="Contoh: Sangat baik pada pemahaman arsitektur. Perbanyak latihan unit testing sebelum ujian akhir..."
                className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
              >
                Kirim Catatan Bimbingan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
