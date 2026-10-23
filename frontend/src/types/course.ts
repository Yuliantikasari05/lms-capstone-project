export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseAudience = 'siswa' | 'karyawan' | 'umum';
export type CourseStatus = 'draft' | 'published';
export type LessonType = 'text' | 'video';

export interface CourseProgress {
  completed: number;
  total: number;
  percent: number;
}

export interface Lesson {
  id: number;
  course_module_id: number;
  title: string;
  type: LessonType;
  content: string | null;
  video_url: string | null;
  duration_minutes: number;
  position: number;
  completed?: boolean;
}

export interface CourseModule {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  position: number;
  lessons?: Lesson[];
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  level: CourseLevel;
  audience: CourseAudience;
  thumbnail_url: string | null;
  status: CourseStatus;
  instructor_id: number | null;
  instructor?: { id: number; name: string } | null;
  modules_count?: number;
  lessons_count?: number;
  students_count?: number;
  modules?: CourseModule[];
  is_enrolled?: boolean;
  enrollment_status?: 'active' | 'completed';
  progress?: CourseProgress;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: number;
  user_id: number;
  name: string | null;
  email: string | null;
  status: 'active' | 'completed';
  enrolled_at: string | null;
  progress: CourseProgress;
}

export interface UserOption {
  id: number;
  name: string;
  email: string;
}

export interface CourseFormPayload {
  title: string;
  description?: string | null;
  category?: string | null;
  level: CourseLevel;
  audience: CourseAudience;
  thumbnail_url?: string | null;
  instructor_id?: number | null;
}

export interface LessonFormPayload {
  title: string;
  type: LessonType;
  content?: string | null;
  video_url?: string | null;
  duration_minutes?: number | null;
}
