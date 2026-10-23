export interface Role {
  id: number;
  name: 'admin' | 'mentor' | 'siswa' | 'karyawan' | 'lembaga_bimbingan' | string;
  display_name: string;
  description?: string;
  users_count?: number;
  permissions_count?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at?: string;
  roles: Role[];
  primary_role: 'admin' | 'mentor' | 'siswa' | 'karyawan' | 'lembaga_bimbingan';
  permissions: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface OverviewCard {
  title: string;
  value: string | number;
  icon: string;
  change: string;
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'indigo';
}

export interface DashboardData {
  role: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  dashboard: {
    overview_cards: OverviewCard[];
    [key: string]: any;
  };
}
