import { apiClient } from './api';
import { ApiResponse, PaginatedResponse, Role, User } from '../types';

export interface UserQueryParams {
  search?: string;
  role?: string;
  is_active?: string;
  page?: number;
  per_page?: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role_id: number;
  is_active?: boolean;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role_id: number;
  is_active: boolean;
}

export const userService = {
  async getUsers(params: UserQueryParams = {}): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>('/admin/users', { params });
    return response.data;
  },

  async getUser(id: number): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);
    return response.data.data;
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/admin/users', payload);
    return response.data.data;
  },

  async updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(`/admin/users/${id}`, payload);
    return response.data.data;
  },

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
  },

  async getRoles(): Promise<Role[]> {
    const response = await apiClient.get<ApiResponse<Role[]>>('/admin/roles');
    return response.data.data;
  },

  async exportUsers(format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    const response = await apiClient.get('/admin/users/export', {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};

