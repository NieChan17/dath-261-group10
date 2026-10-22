import { Badge } from "@/components/ui/badge";
import { SUBMISSION_STATUS_LABELS } from "@/lib/instructor-submission-view";
import type { SubmissionStatus } from "@/types/submission";

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <Badge
      data-component="SubmissionStatusBadge"
      variant={status === "graded" ? "secondary" : "outline"}
      className={`submission-status__badge_01 shrink-0 ${status === "graded" ? "text-teal-800 dark:bg-teal-950 dark:text-teal-200" : status === "review-required" ? "border-red-700/30 text-red-700 dark:border-red-300/40 dark:bg-red-950 dark:text-red-300" : ""}`}
    >
      {SUBMISSION_STATUS_LABELS[status]}
    </Badge>
  );
}

export function SubmissionMockNotice() {
  return (
    <aside
      data-component="SubmissionMockNotice"
      aria-label="Mock data notice"
      className="submission-mock__notice_01 rounded-[15px] border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground"
    >
      <strong className="submission-mock__label_01 font-semibold">Mock data · Temporary grading drafts.</strong>{" "}
      Sample submissions and recorded grades are fictional. Drafts stay in this workspace only and are lost on a full reload or when leaving it.
      Nothing is saved to a server or sent to students.
    </aside>
  );
}
