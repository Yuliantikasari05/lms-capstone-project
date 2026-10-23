import { apiClient } from './api';

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'exam_review' | 'certification' | 'revenue' | 'submission' | 'evaluation' | 'schedule' | 'grade' | 'gamification' | 'student' | 'report';
  read: boolean;
  created_at: string;
}

export interface NotificationResponse {
  role: string;
  unread_count: number;
  notifications: SystemNotification[];
}

export const notificationService = {
  async getNotifications(): Promise<NotificationResponse> {
    const response = await apiClient.get<{ success: boolean; data: NotificationResponse }>('/notifications');
    return response.data.data;
  },
};
