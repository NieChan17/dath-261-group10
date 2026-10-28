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
