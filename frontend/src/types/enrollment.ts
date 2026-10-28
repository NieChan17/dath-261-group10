export type EnrollmentStatus = 'active' | 'completed' | 'cancelled' | 'suspended';

export interface ProgressSummary {
  totalLessons: number;
  completedLessons: number;
  percentage: number;
}

export interface ResumeLesson {
  lessonId: string;
  sectionId: string;
  title: string;
  lastPositionSeconds: number;
}

export interface LessonProgressDetail {
  id: string;
  title: string;
  contentType: string;
  durationMinutes: number;
  orderIndex: number;
  section: {
    id: string;
    title: string;
    orderIndex: number;
  };
  progress: {
    isCompleted: boolean;
    lastPositionSeconds: number;
    updatedAt: string | null;
  };
}

export interface EnrollmentProgressResponse {
  enrollment: {
    id: string;
    status: EnrollmentStatus;
    enrolledAt: string;
  };
  summary: ProgressSummary;
  resumeLesson: ResumeLesson | null;
  lessons: LessonProgressDetail[];
}

export interface UserEnrolledCourse {
  id: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  lastActivityAt: string | null;
  course: {
    id: string;
    code: string;
    title: string;
    description: string;
    thumbnailUrl: string | null;
    category: string;
    level: string;
    instructor: {
      id: string;
      fullName: string;
    };
  };
  progress: ProgressSummary;
}

export interface CourseStudentEnrollment {
  id: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  lastActivityAt: string | null;
  student: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };
  progress: ProgressSummary;
}

export interface CourseEnrollmentStatus {
  isEnrolled: boolean;
  data: {
    id: string;
    student_id: string;
    course_id: string;
    status: EnrollmentStatus;
    enrolled_at: string;
  } | null;
}
