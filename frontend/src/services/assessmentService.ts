import { apiClient } from './api';
import type { ApiResponse } from '../types';
import type {
  Assignment,
  AssignmentPayload,
  Exam,
  ExamAttemptRow,
  ExamPayload,
  ExamResult,
  ExamSession,
  StudentAssignment,
  StudentExam,
  SubmissionRow,
} from '../types/assessment';

type WithMeta<T, M> = { data: T; meta: M };

export const assessmentService = {
  /* ---------- Mentor / Admin: assignments ---------- */
  async listAssignments(courseId: number): Promise<Assignment[]> {
    const res = await apiClient.get<ApiResponse<Assignment[]>>(`/teach/courses/${courseId}/assignments`);
    return res.data.data;
  },

  async createAssignment(courseId: number, payload: AssignmentPayload): Promise<Assignment> {
    const res = await apiClient.post<ApiResponse<Assignment>>(`/teach/courses/${courseId}/assignments`, payload);
    return res.data.data;
  },

  async updateAssignment(id: number, payload: AssignmentPayload): Promise<Assignment> {
    const res = await apiClient.put<ApiResponse<Assignment>>(`/teach/assignments/${id}`, payload);
    return res.data.data;
  },

  async deleteAssignment(id: number): Promise<void> {
    await apiClient.delete(`/teach/assignments/${id}`);
  },

  /* ---------- Mentor / Admin: grading ---------- */
  async gradingQueue(status: 'submitted' | 'graded' | 'all'): Promise<{ rows: SubmissionRow[]; pending: number; graded: number }> {
    const res = await apiClient.get<WithMeta<SubmissionRow[], { pending: number; graded: number }>>('/teach/submissions', {
      params: { status },
    });
    return { rows: res.data.data, pending: res.data.meta.pending, graded: res.data.meta.graded };
  },

  async grade(submissionId: number, score: number, feedback: string | null): Promise<SubmissionRow> {
    const res = await apiClient.put<ApiResponse<SubmissionRow>>(`/teach/submissions/${submissionId}/grade`, { score, feedback });
    return res.data.data;
  },

  /* ---------- Mentor / Admin: exams ---------- */
  async listExams(courseId: number): Promise<Exam[]> {
    const res = await apiClient.get<ApiResponse<Exam[]>>(`/teach/courses/${courseId}/exams`);
    return res.data.data;
  },

  async getExam(id: number): Promise<Exam> {
    const res = await apiClient.get<ApiResponse<Exam>>(`/teach/exams/${id}`);
    return res.data.data;
  },

  async createExam(courseId: number, payload: ExamPayload): Promise<Exam> {
    const res = await apiClient.post<ApiResponse<Exam>>(`/teach/courses/${courseId}/exams`, payload);
    return res.data.data;
  },

  async updateExam(id: number, payload: ExamPayload): Promise<Exam> {
    const res = await apiClient.put<ApiResponse<Exam>>(`/teach/exams/${id}`, payload);
    return res.data.data;
  },

  async deleteExam(id: number): Promise<void> {
    await apiClient.delete(`/teach/exams/${id}`);
  },

  async submitExamForReview(id: number): Promise<string> {
    const res = await apiClient.post<ApiResponse<Exam>>(`/teach/exams/${id}/submit-review`);
    return res.data.message;
  },

  async examAttempts(id: number): Promise<ExamAttemptRow[]> {
    const res = await apiClient.get<ApiResponse<ExamAttemptRow[]>>(`/teach/exams/${id}/attempts`);
    return res.data.data;
  },

  /* ---------- Admin: exam review ---------- */
  async reviewList(status: string): Promise<{ rows: Exam[]; meta: { pending: number; approved: number; rejected: number } }> {
    const res = await apiClient.get<WithMeta<Exam[], { pending: number; approved: number; rejected: number }>>('/exam-reviews', {
      params: { status },
    });
    return { rows: res.data.data, meta: res.data.meta };
  },

  async reviewDetail(id: number): Promise<Exam> {
    const res = await apiClient.get<ApiResponse<Exam>>(`/exam-reviews/${id}`);
    return res.data.data;
  },

  async approveExam(id: number): Promise<string> {
    const res = await apiClient.post<ApiResponse<Exam>>(`/exam-reviews/${id}/approve`);
    return res.data.message;
  },

  async rejectExam(id: number, note: string): Promise<string> {
    const res = await apiClient.post<ApiResponse<Exam>>(`/exam-reviews/${id}/reject`, { note });
    return res.data.message;
  },

  /* ---------- Student ---------- */
  async myAssignments(): Promise<StudentAssignment[]> {
    const res = await apiClient.get<ApiResponse<StudentAssignment[]>>('/learn/assignments');
    return res.data.data;
  },

  async submitAssignment(id: number, payload: { content?: string | null; link_url?: string | null }): Promise<string> {
    const res = await apiClient.post<ApiResponse>(`/learn/assignments/${id}/submit`, payload);
    return res.data.message;
  },

  async myExams(): Promise<StudentExam[]> {
    const res = await apiClient.get<ApiResponse<StudentExam[]>>('/learn/exams');
    return res.data.data;
  },

  async startExam(id: number): Promise<ExamSession> {
    const res = await apiClient.post<ApiResponse<ExamSession>>(`/learn/exams/${id}/start`);
    return res.data.data;
  },

  async submitExam(examId: number, attemptId: number, answers: Record<number, number>): Promise<{ result: ExamResult; message: string }> {
    const res = await apiClient.post<ApiResponse<ExamResult>>(`/learn/exams/${examId}/attempts/${attemptId}/submit`, { answers });
    return { result: res.data.data, message: res.data.message };
  },
};

export const EXAM_STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Menunggu Review Admin',
  approved: 'Disetujui',
  rejected: 'Perlu Revisi',
};

export const EXAM_STATUS_STYLE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  pending_review: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

/** Format an ISO date for display in Indonesian locale. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** Convert an ISO date to the value format of <input type="datetime-local">. */
export function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
