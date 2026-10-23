import { apiClient } from './api';
import { ApiResponse, DashboardData } from '../types';

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardData> {
    const response = await apiClient.get<ApiResponse<DashboardData>>('/dashboard/stats');
    return response.data.data;
  },
};
