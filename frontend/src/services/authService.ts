
import { apiClient, ensureCsrfCookie } from './api';
import { ApiResponse, User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponseData {
  user: User;
  token: string;
  token_type: string;
  primary_role: string;
  redirect_url: string;
}

export const authService = {
  /**
   * Login pengguna.
   */
  async login(
    credentials: LoginCredentials,
  ): Promise<LoginResponseData> {
    // Ambil CSRF cookie terlebih dahulu.
    await ensureCsrfCookie();

    // Kirim kredensial ke endpoint Laravel.
    const response = await apiClient.post<
      ApiResponse<LoginResponseData>
    >('/auth/login', credentials);

    const data = response.data.data;

    // Simpan token dan profil pengguna.
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }

    localStorage.setItem(
      'auth_user',
      JSON.stringify(data.user),
    );

    return data;
  },

  /**
   * Mengambil profil pengguna yang sedang login.
   */
  async getMe(): Promise<{
    user: User;
    primary_role: string;
    redirect_url: string;
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        user: User;
        primary_role: string;
        redirect_url: string;
      }>
    >('/auth/me');

    const data = response.data.data;

    localStorage.setItem(
      'auth_user',
      JSON.stringify(data.user),
    );

    return data;
  },

  /**
   * Memperbarui profil pengguna.
   */
  async updateProfile(payload: {
    name: string;
    phone?: string;
    avatar_url?: string;
  }): Promise<User> {
    const response = await apiClient.put<
      ApiResponse<User>
    >('/auth/profile', payload);

    const updated = response.data.data;

    localStorage.setItem(
      'auth_user',
      JSON.stringify(updated),
    );

    return updated;
  },

  /**
   * Memperbarui password pengguna.
   */
  async updatePassword(payload: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    await apiClient.put('/auth/password', payload);
  },

  /**
   * Logout pengguna.
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },
};
