import type { Role } from "../types/auth";
import type {
  AdminDemoEvent,
  AdminDemoState,
  ReportStatus,
} from "../types/admin";
import { createAdminDemo } from "./mock-admin-data";

export type AdminDemoAction =
  | { type: "role"; id: string; role: Role }
  | { type: "publication"; id: string; isPublished: boolean }
  | {
      type: "review";
      id: string;
      status: Exclude<ReportStatus, "Pending">;
      note: string;
    }
  | { type: "reset" };

export function adminDemoReducer(
  state: AdminDemoState,
  action: AdminDemoAction,
): AdminDemoState {
  if (action.type === "reset") return createAdminDemo();
  const sequence = state.sequence + 1;
  const timestamp = new Date(Date.UTC(2026, 9, 28, 9, sequence)).toISOString();
  const actor = { id: "user-1", name: "Alex Morgan (demo actor)" };
  let event: Omit<AdminDemoEvent, "id" | "timestamp" | "actor">;
  let next = state;
  if (action.type === "role") {
    const user = state.users.find((u) => u.id === action.id);
    if (!user || user.role === action.role) return state;
    next = {
      ...state,
      users: state.users.map((u) =>
        u.id === action.id ? { ...u, role: action.role } : u,
      ),
    };
    event = {
      action: "Role changed",
      target: { id: user.id, name: user.fullName },
      details: `Role changed from ${user.role} to ${action.role}. Demo only; no authorization was changed.`,
    };
  } else if (action.type === "publication") {
    const course = state.courses.find((c) => c.id === action.id);
    if (!course || course.isPublished === action.isPublished) return state;
    next = {
      ...state,
      courses: state.courses.map((c) =>
        c.id === action.id ? { ...c, isPublished: action.isPublished } : c,
      ),
    };
    event = {
      action: "Publication changed",
      target: { id: course.id, name: course.title },
      details: `Publication changed from ${course.isPublished ? "Published" : "Draft"} to ${action.isPublished ? "Published" : "Draft"}. Demo only; instructor publishing remains available.`,
    };
  } else {
    const report = state.reports.find((r) => r.id === action.id);
    const note = action.note.trim();
    if (
      !report ||
      !note ||
      (report.status === action.status && report.review?.note === note)
    )
      return state;
    next = {
      ...state,
      reports: state.reports.map((r) =>
        r.id === action.id
          ? {
              ...r,
              status: action.status,
              review: { note, reviewedAt: timestamp, reviewerName: actor.name },
            }
          : r,
      ),
    };
    event = {
      action: "Report reviewed",
      target: { id: report.id, name: report.target.title },
      details: `${report.status} → ${action.status}. Review note: ${note}\nContent remains unchanged.`,
    };
  }
  return {
    ...next,
    sequence,
    events: [
      { ...event, id: `demo-event-${sequence}`, timestamp, actor },
      ...state.events,
    ],
  };
}

export function ratio(numerator: number, denominator: number): number | null {
  return denominator > 0
    ? Math.round((numerator / denominator) * 1000) / 10
    : null;
}
export function demoMetrics(state: AdminDemoState, courseId?: string) {
  const enrollments = state.enrollments.filter(
    (e) => !courseId || e.courseId === courseId,
  );
  const attempts = state.quizAttempts.filter(
    (a) => !courseId || a.courseId === courseId,
  );
  return {
    active: enrollments.filter((e) => e.status === "active").length,
    completed: enrollments.filter((e) => e.status === "completed").length,
    completionRate: ratio(
      enrollments.filter((e) => e.status === "completed").length,
      enrollments.filter(
        (e) => e.status === "active" || e.status === "completed",
      ).length,
    ),
    averageScore: attempts.length
      ? Math.round(
          (attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length) *
            10,
        ) / 10
      : null,
    passRate: ratio(
      attempts.filter((a) => a.score >= a.passScore).length,
      attempts.length,
    ),
    attempts: attempts.length,
  };
}
export function enrollmentTrend(state: AdminDemoState) {
  return ["2026-08", "2026-09", "2026-10"].map((month) => ({
    month,
    count: state.enrollments.filter((e) => e.enrolledAt.startsWith(month))
      .length,
  }));
}
export function paginate<T>(rows: T[], requestedPage: number, pageSize = 5) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  return {
    rows: rows.slice((page - 1) * pageSize, page * pageSize),
    page,
    totalPages,
    total: rows.length,
  };
}
