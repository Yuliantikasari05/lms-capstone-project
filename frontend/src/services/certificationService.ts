import { apiClient } from './api';

export interface CertificationApplication {
  id: string | number;
  user_id?: number;
  employee_name: string;
  email: string;
  company: string;
  track: string;
  training_hours: number;
  portfolio_url: string;
  status: 'pending' | 'verified' | 'issued' | 'rejected';
  certificate_number?: string | null;
  issued_at?: string | null;
  admin_notes?: string | null;
  created_at?: string;
}

const STORAGE_KEY = 'lms_persistent_certifications';

// Initial fallback seed data if database is empty or offline
const SEED_CERTIFICATIONS: CertificationApplication[] = [
  {
    id: 1,
    employee_name: 'Ahmad Fauzi (Tech Corp)',
    email: 'karyawan@maxy.test',
    company: 'Tech Corp Nusantara',
    track: 'Certified Docker & Kubernetes Practitioner',
    training_hours: 45,
    portfolio_url: 'https://github.com/ahmadfauzi/k8s-cluster',
    status: 'issued',
    certificate_number: 'MX-CERT-2026-DEV-9012',
    issued_at: '2026-08-20 10:00:00',
    created_at: '2026-08-15 09:00:00',
  },
  {
    id: 2,
    employee_name: 'Ahmad Fauzi (Tech Corp)',
    email: 'karyawan@maxy.test',
    company: 'Tech Corp Nusantara',
    track: 'Full-Stack Software Architecture',
    training_hours: 48,
    portfolio_url: 'https://github.com/ahmadfauzi/capstone-lms',
    status: 'pending',
    certificate_number: null,
    issued_at: null,
    created_at: '2026-10-16 14:20:00',
  },
  {
    id: 3,
    employee_name: 'Diana Permatasari',
    email: 'diana.karyawan@maxy.test',
    company: 'Fintech Solusindo',
    track: 'Cloud DevOps & Containerization',
    training_hours: 42,
    portfolio_url: 'https://github.com/diana-devops/terraform-aws',
    status: 'verified',
    certificate_number: null,
    issued_at: null,
    created_at: '2026-10-15 09:15:00',
  },
  {
    id: 4,
    employee_name: 'Budi Santoso',
    email: 'budi.santoso@bankmitra.com',
    company: 'Bank Mandiri Mitra',
    track: 'Cybersecurity & Compliance Audit',
    training_hours: 56,
    portfolio_url: 'https://security-audit.internal/reports/audit-2026',
    status: 'issued',
    certificate_number: 'MX-CERT-2026-SEC-0881',
    issued_at: '2026-10-10 11:30:00',
    created_at: '2026-10-05 10:00:00',
  },
];

const getLocalCache = (): CertificationApplication[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse local certification cache', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CERTIFICATIONS));
  return SEED_CERTIFICATIONS;
};

const setLocalCache = (items: CertificationApplication[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('lms:certifications-updated', { detail: items }));
  } catch (e) {
    console.error('Failed to save local certification cache', e);
  }
};

export const certificationService = {
  /**
   * Fetch all certifications. If admin, returns all. If regular user, filtered by email/user.
   */
  async getAll(): Promise<CertificationApplication[]> {
    try {
      const res = await apiClient.get('/certifications');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const remote: CertificationApplication[] = res.data.data;
        if (remote.length > 0) {
          // Merge remote with local cache so newly approved status is synchronized
          const local = getLocalCache();
          const remoteIds = new Set(remote.map((r) => String(r.id)));
          const merged = [...remote, ...local.filter((l) => !remoteIds.has(String(l.id)))];
          setLocalCache(merged);
          return merged;
        }
      }
    } catch (e) {
      console.warn('API /certifications fetch failed, using persistent storage fallback', e);
    }
    return getLocalCache();
  },

  /**
   * Submit new certification application
   */
  async apply(payload: {
    track: string;
    training_hours: number;
    portfolio_url: string;
    company?: string;
    employee_name?: string;
    email?: string;
  }): Promise<CertificationApplication> {
    try {
      const res = await apiClient.post('/certifications', payload);
      if (res.data?.success && res.data.data) {
        const created: CertificationApplication = res.data.data;
        const current = getLocalCache();
        const updated = [created, ...current.filter((c) => String(c.id) !== String(created.id))];
        setLocalCache(updated);
        return created;
      }
    } catch (e) {
      console.warn('API /certifications store failed, saving to local persistent storage', e);
    }

    // Local persistent fallback
    const newRecord: CertificationApplication = {
      id: Date.now(),
      employee_name: payload.employee_name || 'Ahmad Fauzi (Tech Corp)',
      email: payload.email || 'karyawan@maxy.test',
      company: payload.company || 'Tech Corp Nusantara',
      track: payload.track,
      training_hours: payload.training_hours,
      portfolio_url: payload.portfolio_url,
      status: 'pending',
      created_at: new Date().toISOString(),
      certificate_number: null,
      issued_at: null,
    };

    const current = getLocalCache();
    const updated = [newRecord, ...current];
    setLocalCache(updated);
    return newRecord;
  },

  /**
   * Approve application and issue certificate (Admin only)
   */
  async approve(id: string | number): Promise<CertificationApplication> {
    try {
      const res = await apiClient.post(`/certifications/${id}/approve`);
      if (res.data?.success && res.data.data) {
        const updated: CertificationApplication = res.data.data;
        const current = getLocalCache();
        setLocalCache(current.map((c) => (String(c.id) === String(id) ? updated : c)));
        return updated;
      }
    } catch (e) {
      console.warn('API /certifications/approve failed, updating local persistent storage', e);
    }

    const current = getLocalCache();
    const target = current.find((c) => String(c.id) === String(id));
    const certNumber = target?.certificate_number || `MX-CERT-2026-DEV-${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedList = current.map((c) =>
      String(c.id) === String(id)
        ? {
            ...c,
            status: 'issued' as const,
            certificate_number: certNumber,
            issued_at: new Date().toISOString(),
          }
        : c
    );

    setLocalCache(updatedList);
    return updatedList.find((c) => String(c.id) === String(id))!;
  },

  /**
   * Reject application (Admin only)
   */
  async reject(id: string | number, reason?: string): Promise<CertificationApplication> {
    try {
      const res = await apiClient.post(`/certifications/${id}/reject`, { notes: reason });
      if (res.data?.success && res.data.data) {
        const updated: CertificationApplication = res.data.data;
        const current = getLocalCache();
        setLocalCache(current.map((c) => (String(c.id) === String(id) ? updated : c)));
        return updated;
      }
    } catch (e) {
      console.warn('API /certifications/reject failed, updating local persistent storage', e);
    }

    const current = getLocalCache();
    const updatedList = current.map((c) =>
      String(c.id) === String(id)
        ? {
            ...c,
            status: 'rejected' as const,
            admin_notes: reason || 'Jam pelatihan atau portofolio belum memenuhi syarat.',
          }
        : c
    );

    setLocalCache(updatedList);
    return updatedList.find((c) => String(c.id) === String(id))!;
  },
};
