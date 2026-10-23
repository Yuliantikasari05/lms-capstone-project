export type ExamReviewStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';

export interface Assignment {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  due_at: string | null;
  max_score: number;
  submissions_count: number | null;
  graded_count: number | null;
  created_at: string;
}

export interface AssignmentPayload {
  title: string;
  description?: string | null;
  due_at?: string | null;
  max_score?: number;
}

export interface SubmissionRow {
  id: number;
  assignment: {
    id: number;
    title: string;
    max_score: number;
    due_at: string | null;
    course: { id: number; title: string };
  };
  student: { id: number; name: string; email: string };
  content: string | null;
  link_url: string | null;
  submitted_at: string | null;
  is_late: boolean;
  score: number | null;
  feedback: string | null;
  status: 'submitted' | 'graded';
  graded_at: string | null;
}

export interface QuestionPayload {
  question: string;
  options: string[];
  correct_index: number;
  points: number;
}

export interface ExamQuestion extends QuestionPayload {
  id: number;
  position: number;
}

export interface Exam {
  id: number;
  course_id: number;
  course_title: string | null;
  mentor_name: string | null;
  title: string;
  description: string | null;
  duration_minutes: number;
  passing_score: number;
  review_status: ExamReviewStatus;
  review_note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  questions_count: number | null;
  attempts_count: number | null;
  questions?: ExamQuestion[];
}

export interface ExamPayload {
  title: string;
  description?: string | null;
  duration_minutes: number;
  passing_score: number;
  questions: QuestionPayload[];
}

export interface ExamAttemptRow {
  id: number;
  student: { id: number; name: string; email: string };
  score: number;
  correct_count: number;
  passed: boolean;
  submitted_at: string;
}

/* ---------------- student side ---------------- */

export interface StudentAssignment {
  id: number;
  title: string;
  description: string | null;
  course: { id: number; title: string };
  due_at: string | null;
  max_score: number;
  submission: {
    id: number;
    content: string | null;
    link_url: string | null;
    submitted_at: string;
    status: 'submitted' | 'graded';
    score: number | null;
    feedback: string | null;
    graded_at: string | null;
  } | null;
}

export interface StudentExam {
  id: number;
  title: string;
  description: string | null;
  course: { id: number; title: string };
  duration_minutes: number;
  passing_score: number;
  questions_count: number;
  attempts_count: number;
  best_score: number | null;
  passed: boolean;
  has_open_attempt: boolean;
}

export interface ExamSession {
  attempt_id: number;
  started_at: string;
  ends_at: string;
  exam: { id: number; title: string; duration_minutes: number; passing_score: number };
  questions: { id: number; question: string; options: string[]; points: number }[];
}

export interface ExamResult {
  score: number;
  correct_count: number;
  total_questions: number;
  passed: boolean;
  passing_score: number;
  timed_out: boolean;
}
