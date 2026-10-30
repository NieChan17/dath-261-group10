import type { InstructorSubmission, SubmissionStatus } from "@/types/submission";

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  pending: "Pending",
  graded: "Graded",
  "review-required": "Review required",
};

export const SUBMISSION_TYPE_LABELS: Record<InstructorSubmission["type"], string> = {
  quiz: "Quiz",
  written: "Written / file",
  code: "Code",
};

export type SubmissionSearchParams = Record<string, string | string[] | undefined>;

export interface SubmissionFilters {
  course: string;
  assessment: string;
  status: SubmissionStatus | "";
  q: string;
}

export function readSubmissionFilters(
  params: SubmissionSearchParams,
  submissions: readonly InstructorSubmission[],
): SubmissionFilters {
  const first = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value) ?? "";
  };
  const course = first("course");
  const assessment = first("assessment");
  const status = first("status");
  return {
    course: submissions.some((submission) => submission.course.id === course) ? course : "",
    assessment: submissions.some((submission) => submission.assessment.id === assessment) ? assessment : "",
    status: status === "pending" || status === "graded" || status === "review-required" ? status : "",
    q: first("q").trim(),
  };
}

export function filterSubmissions(submissions: readonly InstructorSubmission[], filters: SubmissionFilters): InstructorSubmission[] {
  const query = filters.q.trim().toLowerCase();
  return submissions.filter((submission) =>
    (!filters.course || submission.course.id === filters.course) &&
    (!filters.assessment || submission.assessment.id === filters.assessment) &&
    (!filters.status || submission.grading.status === filters.status) &&
    (!query || [submission.student.fullName, submission.student.email].some((value) => value.toLowerCase().includes(query)))
  ).sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt) || a.id.localeCompare(b.id));
}

function filterQuery(filters: SubmissionFilters): string {
  const params = new URLSearchParams();
  if (filters.course) params.set("course", filters.course);
  if (filters.assessment) params.set("assessment", filters.assessment);
  if (filters.status) params.set("status", filters.status);
  if (filters.q) params.set("q", filters.q);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function submissionListHref(filters: SubmissionFilters): string {
  return `/instructor/submissions${filterQuery(filters)}`;
}

export function submissionDetailHref(id: string, filters: SubmissionFilters): string {
  return `/instructor/submissions/${encodeURIComponent(id)}/grade${filterQuery(filters)}`;
}

export function formatSubmissionDate(timestamp: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(timestamp));
}
