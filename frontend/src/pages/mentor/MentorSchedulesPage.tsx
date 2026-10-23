import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, Clock, Video, Users, Trash2, CheckCircle, RefreshCw } from 'lucide-react';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { scheduleService, ScheduleSession } from '../../services/scheduleService';

export const MentorSchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleSession[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [form, setForm] = useState({
    title: '',
    course_name: 'Full-Stack Web Development Bootcamp',
    session_type: 'reguler' as 'reguler' | 'webinar' | 'korporat',
    scheduled_date: new Date().toISOString().slice(0, 10),
    start_time: '19:00',
    duration_minutes: 90,
    meeting_url: 'https://meet.google.com/new',
    notes: 'Siapkan laptop dan lingkungan praktikum sebelum sesi dimulai.',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getAll();
      setSchedules(data);
    } catch (e) {
      console.error('Failed to load mentor schedules', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('lms:schedules-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('lms:schedules-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadData]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    try {
      setSubmitting(true);
      await scheduleService.create({
        title: form.title.trim(),
        course_name: form.course_name,
        session_type: form.session_type,
        scheduled_date: form.scheduled_date,
        start_time: form.start_time,
        duration_minutes: Number(form.duration_minutes),
        meeting_url: form.meeting_url.trim(),
        notes: form.notes.trim(),
      });

      setShowModal(false);
      setForm({
        title: '',
        course_name: 'Full-Stack Web Development Bootcamp',
        session_type: 'reguler',
        scheduled_date: new Date().toISOString().slice(0, 10),
        start_time: '19:00',
        duration_minutes: 90,
        meeting_url: 'https://meet.google.com/new',
        notes: 'Siapkan laptop dan lingkungan praktikum sebelum sesi dimulai.',
      });
      setAlert({
        type: 'success',
        message: 'Jadwal sesi live berhasil dibuat, disimpan permanen, dan otomatis muncul di kalender siswa!',
      });
      await loadData();
    } catch (e) {
      setAlert({ type: 'error', message: 'Gagal membuat jadwal bimbingan.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFinished = async (id: string | number) => {
    try {
      const updated = await scheduleService.toggleFinished(id);
      setSchedules((prev) =>
        prev.map((s) => (String(s.id) === String(id) ? updated : s))
      );
      setAlert({
        type: 'success',
        message: updated.is_finished
          ? 'Sesi bimbingan berhasil ditandai selesai.'
          : 'Sesi bimbingan diaktifkan kembali.',
      });
    } catch (e) {
      setAlert({ type: 'error', message: 'Gagal memperbarui status sesi.' });
    }
  };

  const handleDeleteSchedule = async (id: string | number) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan/menghapus jadwal sesi bimbingan ini?')) return;
    try {
      await scheduleService.delete(id);
      setSchedules((prev) => prev.filter((s) => String(s.id) !== String(id)));
      setAlert({ type: 'success', message: 'Jadwal sesi berhasil dihapus dari sistem.' });
    } catch (e) {
      setAlert({ type: 'error', message: 'Gagal menghapus jadwal sesi.' });
    }
  };

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Jadwal Pembelajaran, Mentoring & Webinar"
        category="production"
        description="Atur kalender pertemuan live interactive, bagikan tautan Google Meet / Zoom kepada peserta binaan secara real-time, dan pantau kehadiran sesi."
        roleScope="Mentor (schedules:manage, schedules:view)"
      />

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Kalender Sesi Live Mentor</h3>
          <p className="text-xs text-slate-500">
            Tautan pertemuan otomatis tersinkronisasi dan tampil di dasbor dan kalender seluruh peserta terkait.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => loadData()}
            title="Muat ulang jadwal terbaru"
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Buat Jadwal Baru
          </button>
        </div>
      </div>

      {/* Schedule Cards */}
      {loading && schedules.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-blue-500" />
          Memuat jadwal bimbingan dari database...
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
          <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">Belum Ada Jadwal Pertemuan</p>
          <p className="text-xs text-slate-400 mt-1">Klik tombol "Buat Jadwal Baru" untuk menjadwalkan sesi pertama Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((s) => (
            <div
              key={s.id}
              className={`p-5 rounded-xl border transition-all ${
                s.is_finished
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : 'bg-white border-slate-200 shadow-xs hover:border-blue-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    s.session_type === 'korporat'
                      ? 'bg-indigo-100 text-indigo-800'
                      : s.session_type === 'webinar'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  Sesi {s.session_type}
                </span>

                <div className="flex items-center space-x-2">
                  {s.is_finished ? (
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Selesai
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" /> Terjadwal
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteSchedule(s.id)}
                    title="Hapus sesi ini"
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-800 mt-2.5 leading-snug">{s.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{s.course_name}</p>
              {s.notes && (
                <p className="text-[11px] text-slate-400 mt-1 italic">{s.notes}</p>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium">
                    {s.scheduled_date} • {s.start_time} WIB ({s.duration_minutes} Menit)
                  </span>
                </div>
                <div className="flex items-center space-x-1 font-medium text-slate-500">
                  <Users className="w-3.5 h-3.5" />
                  <span>{s.attendees_count} Peserta</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-2">
                <a
                  href={s.meeting_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer transition-colors"
                >
                  <Video className="w-3.5 h-3.5 mr-1.5" /> Buka Ruang Kelas
                </a>

                <button
                  onClick={() => handleToggleFinished(s.id)}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
                >
                  {s.is_finished ? 'Tandai Belum Selesai' : 'Tandai Sesi Berakhir'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Schedule */}
      {showModal && (
        <Modal
          isOpen={true}
          onClose={() => !submitting && setShowModal(false)}
          title="Atur Jadwal Bimbingan / Webinar Baru"
        >
          <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Judul Sesi / Topik Bahasan</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Contoh: Bimbingan Live Review Modul 3"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tipe Sesi</label>
              <select
                value={form.session_type}
                onChange={(e) => setForm({ ...form, session_type: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="reguler">Reguler Siswa</option>
                <option value="korporat">Pelatihan Korporat Karyawan</option>
                <option value="webinar">Webinar Umum</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={form.scheduled_date}
                  onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Waktu Mulai (WIB)</label>
                <input
                  type="time"
                  required
                  value={form.start_time}
                  onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tautan Google Meet / Zoom</label>
              <input
                type="url"
                required
                value={form.meeting_url}
                onChange={(e) => setForm({ ...form, meeting_url: e.target.value })}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Catatan Tambahan untuk Peserta (Opsional)</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Misal: Siapkan laptop dan pull repository sprint 2..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowModal(false)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs flex items-center cursor-pointer transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Jadwal Sesi'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
