import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const API_PREFIX =
  import.meta.env.VITE_API_PREFIX || '/api/v1';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

/**
 * Mengambil CSRF cookie Laravel Sanctum sebelum login.
 */
export async function ensureCsrfCookie(): Promise<void> {
  await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
    headers: {
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
}

/**
 * Menambahkan Bearer token jika tersedia.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
);

/**
 * Menangani respons error dari API.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (
    error: AxiosError<{
      message?: string;
      errors?: Record<string, string[]>;
    }>,
  ) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      window.dispatchEvent(
        new CustomEvent('lms:session-expired'),
      );
    }

    return Promise.reject(error);
  },
);
