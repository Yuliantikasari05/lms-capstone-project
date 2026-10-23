import { apiClient } from './api';

export interface ScheduleSession {
  id: string | number;
  mentor_id?: number;
  mentor_name?: string;
  title: string;
  course_name: string;
  session_type: 'reguler' | 'webinar' | 'korporat';
  scheduled_date: string;
  start_time: string;
  duration_minutes: number;
  meeting_url: string;
  attendees_count: number;
  is_finished: boolean;
  notes?: string;
  created_at?: string;
}

const STORAGE_KEY = 'lms_persistent_schedules';

// Initial fallback seeds
const SEED_SCHEDULES: ScheduleSession[] = [
  {
    id: 1,
    title: 'Sesi Tanya Jawab Praktikum RESTful API & ORM',
    mentor_name: 'Budi Mentor (Full-Stack Specialist)',
    course_name: 'Full-Stack Web Development Bootcamp',
    session_type: 'reguler',
    scheduled_date: '2026-10-19',
    start_time: '19:30',
    duration_minutes: 90,
    meeting_url: 'https://meet.google.com/xyz-maxy-api',
    notes: 'Siapkan laptop dengan kode tugas Modul 2 sudah running di local.',
    attendees_count: 24,
    is_finished: false,
  },
  {
    id: 2,
    title: 'Workshop Korporat: Best Practice Container Security',
    mentor_name: 'Budi Mentor (Cloud Architect)',
    course_name: 'Microservices with Go & Docker',
    session_type: 'korporat',
    scheduled_date: '2026-10-21',
    start_time: '14:00',
    duration_minutes: 120,
    meeting_url: 'https://zoom.us/j/9823102391',
    notes: 'Sesi hands-on docker vulnerability scan dan hard-security config.',
    attendees_count: 18,
    is_finished: false,
  },
  {
    id: 3,
    title: 'Webinar Publik: Tren AI Engineer 2027 & Prospek Karir',
    mentor_name: 'Dr. Hendra Gunawan (Guest Speaker)',
    course_name: 'Webinar Umum Maxy Academy',
    session_type: 'webinar',
    scheduled_date: '2026-10-25',
    start_time: '10:00',
    duration_minutes: 90,
    meeting_url: 'https://meet.google.com/maxy-webinar-ai',
    notes: 'Terbuka untuk seluruh siswa dan karyawan Maxy Academy.',
    attendees_count: 145,
    is_finished: false,
  },
  {
    id: 4,
    title: 'Review Sprint 1: Setup Laravel Backend & Sanctum',
    mentor_name: 'Budi Mentor',
    course_name: 'Full-Stack Web Development Bootcamp',
    session_type: 'reguler',
    scheduled_date: '2026-10-12',
    start_time: '19:30',
    duration_minutes: 60,
    meeting_url: 'https://meet.google.com/xyz-maxy-api',
    notes: 'Rekaman sesi sudah diunggah pada Modul 1 materi suplemen.',
    attendees_count: 22,
    is_finished: true,
  },
];

const getLocalCache = (): ScheduleSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse local schedules cache', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_SCHEDULES));
  return SEED_SCHEDULES;
};

const setLocalCache = (items: ScheduleSession[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('lms:schedules-updated', { detail: items }));
  } catch (e) {
    console.error('Failed to save local schedules cache', e);
  }
};

export const scheduleService = {
  /**
   * Fetch all mentoring & webinar schedules
   */
  async getAll(): Promise<ScheduleSession[]> {
    try {
      const res = await apiClient.get('/schedules');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const remote: ScheduleSession[] = res.data.data;
        if (remote.length > 0) {
          const local = getLocalCache();
          const remoteIds = new Set(remote.map((r) => String(r.id)));
          const merged = [...remote, ...local.filter((l) => !remoteIds.has(String(l.id)))];
          setLocalCache(merged);
          return merged;
        }
      }
    } catch (e) {
      console.warn('API /schedules fetch failed, using persistent storage fallback', e);
    }
    return getLocalCache();
  },

  /**
   * Create a new schedule session (Mentor / Admin)
   */
  async create(payload: {
    title: string;
    course_name?: string;
    session_type: 'reguler' | 'webinar' | 'korporat';
    scheduled_date: string;
    start_time: string;
    duration_minutes?: number;
    meeting_url: string;
    notes?: string;
  }): Promise<ScheduleSession> {
    try {
      const res = await apiClient.post('/schedules', payload);
      if (res.data?.success && res.data.data) {
        const created: ScheduleSession = res.data.data;
        const current = getLocalCache();
        const updated = [created, ...current.filter((s) => String(s.id) !== String(created.id))];
        setLocalCache(updated);
        return created;
      }
    } catch (e) {
      console.warn('API /schedules store failed, saving to local persistent storage', e);
    }

    const newRecord: ScheduleSession = {
      id: `SCH-${Date.now()}`,
      title: payload.title,
      mentor_name: 'Budi Mentor',
      course_name: payload.course_name || 'Full-Stack Web Development Bootcamp',
      session_type: payload.session_type,
      scheduled_date: payload.scheduled_date,
      start_time: payload.start_time,
      duration_minutes: payload.duration_minutes || 90,
      meeting_url: payload.meeting_url,
      notes: payload.notes || 'Silakan bergabung 5 menit sebelum sesi dimulai.',
      attendees_count: 0,
      is_finished: false,
      created_at: new Date().toISOString(),
    };

    const current = getLocalCache();
    const updated = [newRecord, ...current];
    setLocalCache(updated);
    return newRecord;
  },

  /**
   * Toggle schedule finished status
   */
  async toggleFinished(id: string | number): Promise<ScheduleSession> {
    try {
      const res = await apiClient.patch(`/schedules/${id}/toggle-finished`);
      if (res.data?.success && res.data.data) {
        const updated: ScheduleSession = res.data.data;
        const current = getLocalCache();
        setLocalCache(current.map((s) => (String(s.id) === String(id) ? updated : s)));
        return updated;
      }
    } catch (e) {
      console.warn('API /schedules toggle-finished failed, updating local persistent storage', e);
    }

    const current = getLocalCache();
    const updated = current.map((s) =>
      String(s.id) === String(id) ? { ...s, is_finished: !s.is_finished } : s
    );
    setLocalCache(updated);
    return updated.find((s) => String(s.id) === String(id))!;
  },

  /**
   * Delete a schedule session
   */
  async delete(id: string | number): Promise<void> {
    try {
      await apiClient.delete(`/schedules/${id}`);
    } catch (e) {
      console.warn('API /schedules delete failed, removing from local persistent storage', e);
    }

    const current = getLocalCache();
    const updated = current.filter((s) => String(s.id) !== String(id));
    setLocalCache(updated);
  },
};
