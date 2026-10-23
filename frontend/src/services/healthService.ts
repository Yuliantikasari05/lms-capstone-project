import { apiClient } from './api';
import { ApiResponse } from '../types';

export interface HealthCheckData {
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  database: {
    driver: string;
    status: string;
    latency_ms: number;
  };
}

export const healthService = {
  async checkHealth(): Promise<HealthCheckData> {
    const response = await apiClient.get<ApiResponse<HealthCheckData>>('/health');
    return response.data.data;
  },
};
