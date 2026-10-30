import type { User } from "./auth";
import type { Course } from "./course";
import type { CourseStudentEnrollment } from "./enrollment";

// A list projection: no invented rating, thumbnail or curriculum values.
export type AdminDemoCourse = Pick<
  Course,
  | "id"
  | "title"
  | "description"
  | "instructorId"
  | "category"
  | "level"
  | "isPublished"
> & { code: string };
// Normalized links to the shared users/courses; progress retains the roster contract.
export type AdminDemoEnrollment = Pick<
  CourseStudentEnrollment,
  "id" | "status" | "enrolledAt" | "progress"
> & { studentId: User["id"]; courseId: Course["id"] };
export type ReportStatus = "Pending" | "Resolved" | "Dismissed";
export interface ContentReport {
  id: string;
  target: {
    id: string;
    type: "Discussion thread" | "Comment";
    title: string;
    content: string;
    authorId: string;
    courseId: string;
  };
  reporterId: string;
  reason: string;
  reportedAt: string;
  status: ReportStatus;
  review?: { note: string; reviewedAt: string; reviewerName: string };
}
export type AdminEventAction =
  | "Role changed"
  | "Publication changed"
  | "Report reviewed";
export interface AdminDemoEvent {
  id: string;
  actor: { id: string; name: string };
  action: AdminEventAction;
  target: { id: string; name: string };
  timestamp: string;
  details: string;
}
// Graded attempt projection for demo aggregates, not a new submission entity.
export interface DemoQuizAttempt {
  id: string;
  courseId: string;
  studentId: string;
  score: number;
  passScore: number;
}
export interface AdminDemoState {
  users: User[];
  courses: AdminDemoCourse[];
  enrollments: AdminDemoEnrollment[];
  reports: ContentReport[];
  events: AdminDemoEvent[];
  quizAttempts: DemoQuizAttempt[];
  sequence: number;
}
