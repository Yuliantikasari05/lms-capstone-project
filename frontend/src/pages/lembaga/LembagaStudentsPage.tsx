import React, { useState } from 'react';
import { Users, Plus, Search, Mail, Phone, BookOpen, CheckCircle2, Download, Send, BellRing } from 'lucide-react';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';

interface CohortStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  cohort: string;
  registered_at: string;
  progress_percent: number;
  status: 'active' | 'graduated' | 'inactive';
}

const INITIAL_COHORT_STUDENTS: CohortStudent[] = [
  {
    id: 'CS-01',
    name: 'Muhammad Farhan',
    email: 'farhan@bimbel.test',
    phone: '081234567890',
    cohort: 'Saintek Intensif 2027',
    registered_at: '01 Oktober 2026',
    progress_percent: 75,
    status: 'active',
  },
  {
    id: 'CS-02',
    name: 'Nadia Salsabila',
    email: 'nadia.s@bimbel.test',
    phone: '081298765432',
    cohort: 'Saintek Intensif 2027',
    registered_at: '05 Oktober 2026',
    progress_percent: 60,
    status: 'active',
  },
  {
    id: 'CS-03',
    name: 'Kevin Jonathan',
    email: 'kevin.j@bimbel.test',
    phone: '081311223344',
    cohort: 'Reguler Weekend',
    registered_at: '12 September 2026',
    progress_percent: 92,
    status: 'graduated',
  },
];

export const LembagaStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<CohortStudent[]>(INITIAL_COHORT_STUDENTS);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [reminderTarget, setReminderTarget] = useState<CohortStudent | null>(null);
  const [reminderMessage, setReminderMessage] = useState('');
  const [sendViaWhatsapp, setSendViaWhatsapp] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cohort: 'Saintek Intensif 2027',
  });

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.cohort.toLowerCase().includes(search.toLowerCase())
  );

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    const newStudent: CohortStudent = {
      id: `CS-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || '-',
      cohort: form.cohort,
      registered_at: 'Hari ini',
      progress_percent: 0,
      status: 'active',
    };

    setStudents((prev) => [newStudent, ...prev]);
    setShowAddModal(false);
    setForm({
      name: '',
      email: '',
      phone: '',
      cohort: 'Saintek Intensif 2027',
    });
    setAlert({
      type: 'success',
      message: `Siswa baru ${newStudent.name} berhasil didaftarkan dan di-enroll ke kohort ${newStudent.cohort}!`,
    });
  };

  const handleSendReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTarget) return;

    setAlert({
      type: 'success',
      message: `Pesan pengingat belajar berhasil dikirimkan ke email ${reminderTarget.email}${sendViaWhatsapp ? ` & WhatsApp (${reminderTarget.phone})` : ''}!`,
    });
    setReminderTarget(null);
    setReminderMessage('');
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,ID,Nama,Email,No. HP,Kohort,Tanggal Daftar,Progres (%),Status\n' +
      students.map((s) => `"${s.id}","${s.name}","${s.email}","${s.phone}","${s.cohort}","${s.registered_at}",${s.progress_percent},"${s.status}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `roster-siswa-lembaga-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Kelola & Daftarkan Siswa Kohort Lembaga Bimbingan"
        category="production"
        description="Daftarkan siswa baru ke kohort bimbingan Anda, kelola data kontak, pantau progres belajar kelompok, kirimkan pengingat belajar interaktif, dan ekspor rekap siswa."
        roleScope="Lembaga Bimbingan (students:enroll, students:manage)"
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari siswa, email, kohort..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center shadow-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-slate-500" /> Ekspor Roster CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Daftarkan Siswa Baru
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Nama Siswa & Kontak</th>
              <th className="py-3 px-4">Grup Kohort</th>
              <th className="py-3 px-4">Tanggal Daftar</th>
              <th className="py-3 px-4">Progres Belajar</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filteredStudents.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/60">
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-800">{s.name}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{s.email}</span>
                    <span>•</span>
                    <span>{s.phone}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-[10px] border border-blue-200">
                    {s.cohort}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-500">{s.registered_at}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-800">{s.progress_percent}%</span>
                  </div>
                  <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${s.progress_percent}%` }}
                    />
                  </div>
                </td>
                <td className="py-3 px-4">
                  {s.status === 'active' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Aktif Belajar
                    </span>
                  )}
                  {s.status === 'graduated' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      Lulus Kohort
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => {
                      setReminderTarget(s);
                      setReminderMessage(
                        `Halo ${s.name}, jangan lupa ada sesi live bimbingan kohort ${s.cohort} minggu ini. Silakan selesaikan materi Modul Anda ya!`
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center ml-auto shadow-xs"
                  >
                    <BellRing className="w-3.5 h-3.5 mr-1" /> Kirim Pengingat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reminder Message Modal */}
      {reminderTarget && (
        <Modal
          isOpen={true}
          onClose={() => setReminderTarget(null)}
          title={`Kirim Pengingat Belajar: ${reminderTarget.name}`}
        >
          <form onSubmit={handleSendReminder} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Email Tujuan:</span>
                <span className="font-bold text-slate-800">{reminderTarget.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No. WhatsApp:</span>
                <span className="font-bold text-slate-800">{reminderTarget.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Progres Belajar:</span>
                <span className="font-bold text-blue-600">{reminderTarget.progress_percent}% Selesai</span>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Isi Pesan Notifikasi & Pengingat</label>
              <textarea
                rows={4}
                required
                value={reminderMessage}
                onChange={(e) => setReminderMessage(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="waCheck"
                checked={sendViaWhatsapp}
                onChange={(e) => setSendViaWhatsapp(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="waCheck" className="text-xs text-slate-700 font-medium">
                Kirim juga salinan otomatis ke WhatsApp peserta ({reminderTarget.phone})
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setReminderTarget(null)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs flex items-center"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" /> Kirim Pesan Sekarang
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Enroll */}
      {showAddModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          title="Daftarkan Siswa Baru ke Kohort Bimbingan"
        >
          <form onSubmit={handleEnrollStudent} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap Siswa</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Muhammad Farhan"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Siswa</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="siswa@domain.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">No. WhatsApp / HP</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0812xxxxxxxx"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pilih Grup Kohort Bimbingan</label>
              <select
                value={form.cohort}
                onChange={(e) => setForm({ ...form, cohort: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Saintek Intensif 2027">Saintek Intensif 2027</option>
                <option value="Reguler Weekend">Reguler Weekend</option>
                <option value="Kelas Khusus Alumni">Kelas Khusus Alumni</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
              >
                Daftarkan Siswa Sekarang
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
