import { apiClient } from './api';
import type { ApiResponse, PaginatedResponse } from '../types';
import type {
  Course,
  CourseEnrollment,
  CourseFormPayload,
  CourseModule,
  CourseProgress,
  Lesson,
  LessonFormPayload,
  UserOption,
} from '../types/course';

export interface CourseQueryParams {
  search?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

/** Extract the most useful message from an Axios/Laravel error. */
export function getApiError(err: any, fallback: string): string {
  const errors = err?.response?.data?.errors as Record<string, string[]> | undefined;
  if (errors) {
    const first = Object.values(errors)[0];
    if (first && first[0]) return first[0];
  }
  return err?.response?.data?.message || fallback;
}

export const courseService = {
  /* ---------- Admin / Mentor management ---------- */
  async list(params: CourseQueryParams = {}): Promise<PaginatedResponse<Course>> {
    const res = await apiClient.get<PaginatedResponse<Course>>('/manage/courses', { params });
    return res.data;
  },

  async get(id: number): Promise<Course> {
    const res = await apiClient.get<ApiResponse<Course>>(`/manage/courses/${id}`);
    return res.data.data;
  },

  async create(payload: CourseFormPayload): Promise<Course> {
    const res = await apiClient.post<ApiResponse<Course>>('/manage/courses', payload);
    return res.data.data;
  },

  async update(id: number, payload: Partial<CourseFormPayload> & { status?: 'draft' | 'published' }): Promise<Course> {
    const res = await apiClient.put<ApiResponse<Course>>(`/manage/courses/${id}`, payload);
    return res.data.data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/manage/courses/${id}`);
  },

  async options(): Promise<{ students: UserOption[]; mentors: UserOption[] }> {
    const res = await apiClient.get<ApiResponse<{ students: UserOption[]; mentors: UserOption[] }>>('/manage/options');
    return res.data.data;
  },

  async createModule(courseId: number, payload: { title: string; description?: string | null }): Promise<CourseModule> {
    const res = await apiClient.post<ApiResponse<CourseModule>>(`/manage/courses/${courseId}/modules`, payload);
    return res.data.data;
  },

  async updateModule(id: number, payload: { title: string; description?: string | null }): Promise<CourseModule> {
    const res = await apiClient.put<ApiResponse<CourseModule>>(`/manage/modules/${id}`, payload);
    return res.data.data;
  },

  async removeModule(id: number): Promise<void> {
    await apiClient.delete(`/manage/modules/${id}`);
  },

  async createLesson(moduleId: number, payload: LessonFormPayload): Promise<Lesson> {
    const res = await apiClient.post<ApiResponse<Lesson>>(`/manage/modules/${moduleId}/lessons`, payload);
    return res.data.data;
  },

  async updateLesson(id: number, payload: LessonFormPayload): Promise<Lesson> {
    const res = await apiClient.put<ApiResponse<Lesson>>(`/manage/lessons/${id}`, payload);
    return res.data.data;
  },

  async removeLesson(id: number): Promise<void> {
    await apiClient.delete(`/manage/lessons/${id}`);
  },

  async enrollments(courseId: number): Promise<CourseEnrollment[]> {
    const res = await apiClient.get<ApiResponse<CourseEnrollment[]>>(`/manage/courses/${courseId}/enrollments`);
    return res.data.data;
  },

  async enroll(courseId: number, userId: number): Promise<string> {
    const res = await apiClient.post<ApiResponse>(`/manage/courses/${courseId}/enrollments`, { user_id: userId });
    return res.data.message;
  },

  async unenroll(courseId: number, userId: number): Promise<void> {
    await apiClient.delete(`/manage/courses/${courseId}/enrollments/${userId}`);
  },

  /* ---------- Student learning ---------- */
  async myCourses(): Promise<Course[]> {
    const res = await apiClient.get<ApiResponse<Course[]>>('/learn/courses');
    return res.data.data;
  },

  async catalog(): Promise<Course[]> {
    const res = await apiClient.get<ApiResponse<Course[]>>('/learn/catalog');
    return res.data.data;
  },

  async joinCourse(courseId: number): Promise<string> {
    const res = await apiClient.post<ApiResponse>(`/learn/courses/${courseId}/enroll`);
    return res.data.message;
  },

  async learnCourse(courseId: number): Promise<Course> {
    const res = await apiClient.get<ApiResponse<Course>>(`/learn/courses/${courseId}`);
    return res.data.data;
  },

  async completeLesson(lessonId: number): Promise<{ progress: CourseProgress; enrollment_status: string }> {
    const res = await apiClient.post<ApiResponse<{ progress: CourseProgress; enrollment_status: string }>>(
      `/learn/lessons/${lessonId}/complete`
    );
    return res.data.data;
  },

  async uncompleteLesson(lessonId: number): Promise<{ progress: CourseProgress; enrollment_status: string }> {
    const res = await apiClient.delete<ApiResponse<{ progress: CourseProgress; enrollment_status: string }>>(
      `/learn/lessons/${lessonId}/complete`
    );
    return res.data.data;
  },
};
