import { validateGrade } from "@/lib/instructor-grading";
import type { InstructorSubmission } from "@/types/submission";

export type ManualGradingSubmission = Exclude<InstructorSubmission, { type: "quiz" }>;

// In-memory workspace state only; these values never replace sample records.
export interface GradingDraft {
  score: string;
  feedback: string;
  reviewed: boolean;
}

export type GradingDraftChanges = Partial<Pick<GradingDraft, "score" | "feedback">>;

export function createGradingDraft(submission: ManualGradingSubmission): GradingDraft {
  return {
    score: submission.grading.score === null ? "" : String(submission.grading.score),
    feedback: submission.grading.feedback,
    reviewed: false,
  };
}

export function sameGradingDraftValues(a: Pick<GradingDraft, "score" | "feedback">, b: Pick<GradingDraft, "score" | "feedback">): boolean {
  return a.score === b.score && a.feedback === b.feedback;
}

export function editGradingDraft(
  submission: ManualGradingSubmission,
  current: GradingDraft | undefined,
  changes: GradingDraftChanges,
): GradingDraft | undefined {
  const baseline = createGradingDraft(submission);
  const previous = current ?? baseline;
  const next = { ...previous, ...changes, reviewed: false };
  if (sameGradingDraftValues(previous, next)) return current;
  return sameGradingDraftValues(baseline, next) ? undefined : next;
}

export function reviewGradingDraft(submission: ManualGradingSubmission, draft: GradingDraft): GradingDraft | undefined {
  return validateGrade(draft.score, submission.assessment.maxScore).valid ? { ...draft, reviewed: true } : undefined;
}
