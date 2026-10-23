import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Video, Clock, CheckCircle2, User, RefreshCw, AlertCircle } from 'lucide-react';
import { FeatureStatusBanner } from '../../components/common/FeatureStatusBanner';
import { scheduleService, ScheduleSession } from '../../services/scheduleService';

export const SiswaSchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getAll();
      setSchedules(data);
    } catch (e) {
      console.error('Failed to load siswa schedules', e);
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

  // Find the nearest upcoming session
  const upcomingSession = schedules.find((s) => !s.is_finished);

  const formatDisplayDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <FeatureStatusBanner
        title="Jadwal Bimbingan Live & Webinar Tatap Muka"
        category="production"
        description="Akses langsung tautan Google Meet / Zoom untuk sesi mentoring kelas Anda yang dijadwalkan oleh Mentor secara real-time, dapatkan bimbingan langsung, dan review praktikum."
        roleScope="Siswa (schedules:view, webinars:attend)"
      />

      {/* Hero Notice Card */}
      {upcomingSession ? (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white mb-1">
              🔔 Sesi Terdekat
            </div>
            <h2 className="text-lg font-bold">{upcomingSession.title}</h2>
            <p className="text-blue-100 text-xs">
              {formatDisplayDate(upcomingSession.scheduled_date)} • {upcomingSession.start_time} WIB bersama{' '}
              <span className="font-semibold text-white">{upcomingSession.mentor_name || 'Budi Mentor'}</span>
            </p>
            {upcomingSession.notes && (
              <p className="text-blue-200 text-[11px] italic pt-1">{upcomingSession.notes}</p>
            )}
          </div>
          <a
            href={upcomingSession.meeting_url}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-bold text-xs flex items-center shadow-md transition-all shrink-0 cursor-pointer"
          >
            <Video className="w-4 h-4 mr-2 text-blue-600" /> Masuk Ruang Google Meet
          </a>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex items-center justify-between">
          <div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-700 text-slate-300 mb-1">
              📅 Informasi Sesi
            </div>
            <h2 className="text-base font-bold">Semua Sesi Telah Selesai</h2>
            <p className="text-slate-400 text-xs mt-0.5">Jadwal bimbingan live berikutnya akan diumumkan oleh Mentor pengampu Anda.</p>
          </div>
          <button
            onClick={() => loadData()}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 rounded-lg border border-slate-700"
            title="Cek Jadwal Baru"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      )}

      {/* Schedule List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
            Daftar Seluruh Jadwal Kelas Anda (Tersinkronisasi Realtime)
          </h3>
          <button
            onClick={() => loadData()}
            title="Muat ulang jadwal"
            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>

        {loading && schedules.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-blue-500" />
            Memuat kalender jadwal bimbingan...
          </div>
        ) : schedules.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            Belum ada jadwal bimbingan yang terdaftar untuk kelas Anda saat ini.
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((s) => (
              <div
                key={s.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  s.is_finished
                    ? 'bg-slate-50/70 border-slate-200 text-slate-500'
                    : 'bg-white border-slate-200 shadow-xs hover:border-blue-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-slate-800">{s.title}</h4>
                    {s.is_finished ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        Telah Selesai
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Terjadwal
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 uppercase">
                      {s.session_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 flex items-center">
                    <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {s.mentor_name || 'Budi Mentor'} • <span className="text-slate-400 ml-1">{s.course_name}</span>
                  </p>
                  {s.notes && <p className="text-[11px] text-slate-500">{s.notes}</p>}
                </div>

                <div className="sm:text-right shrink-0 flex flex-col sm:items-end space-y-2">
                  <div className="text-xs font-semibold text-slate-700 flex items-center sm:justify-end">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {s.scheduled_date} • {s.start_time} WIB ({s.duration_minutes} Menit)
                  </div>

                  {!s.is_finished ? (
                    <a
                      href={s.meeting_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer transition-colors"
                    >
                      <Video className="w-3.5 h-3.5 mr-1.5" /> Buka Link Pertemuan
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Sesi telah berakhir</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
