import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatSubmissionDate, SUBMISSION_TYPE_LABELS } from "@/lib/instructor-submission-view";
import { formatGradeScore } from "@/lib/instructor-grading";
import type { InstructorSubmission } from "@/types/submission";
import { CodeSubmissionReview } from "./code-submission-review";
import { ManualGradingForm } from "./manual-grading-form";
import { QuizSubmissionReview } from "./quiz-submission-review";
import { SubmissionStatusBadge } from "./submission-shared";
import { WrittenSubmissionReview } from "./written-submission-review";

interface SubmissionDetailProps {
  submission: InstructorSubmission;
  backHref: string;
}

export function SubmissionDetail({ submission, backHref }: SubmissionDetailProps) {
  const { student, assessment, grading } = submission;
  return (
    <div data-component="SubmissionDetail" className="submission-detail__container_01 min-h-screen bg-background pb-16">
      <div className="submission-detail__content_01 mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="submission-detail__back_01 -ml-3 gap-2">
          <Link href={backHref}>
            <ArrowLeft aria-hidden="true" className="submission-detail__back-icon_01 h-4 w-4" />
            Back to submissions
          </Link>
        </Button>
        <header className="submission-detail__header_01 space-y-2">
          <h1 className="submission-detail__title_01 font-display text-2xl font-bold tracking-tight sm:text-3xl">Submission review</h1>
          <p className="submission-detail__description_01 text-sm text-muted-foreground">
            {submission.type === "quiz" ? "Review the submitted answers and automatic quiz scores. Manual quiz overrides are unavailable." : "Review the submitted work and prepare grading drafts."}
          </p>
        </header>
        <Card className="submission-detail__summary_01 min-w-0 rounded-[15px]">
          <CardHeader className="submission-detail__summary-header_01 items-start gap-3 sm:flex-row sm:justify-between">
            <div className="submission-detail__assessment_01 min-w-0 space-y-1">
              <p className="submission-detail__type_01 w-fit text-xs font-semibold uppercase tracking-wide text-teal-800 dark:rounded-md dark:bg-teal-950 dark:px-2 dark:py-1 dark:text-teal-200">{SUBMISSION_TYPE_LABELS[submission.type]}</p>
              <h2 className="submission-detail__assessment-title_01 break-words font-display text-xl font-bold">{assessment.title}</h2>
            </div>
            <SubmissionStatusBadge status={grading.status} />
          </CardHeader>
          <CardContent className="submission-detail__summary-content_01 space-y-5">
            <dl className="submission-detail__metadata_01 grid min-w-0 grid-cols-1 gap-5 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <div className="submission-detail__student_01 min-w-0">
                <dt className="submission-detail__label_01 text-muted-foreground">Student</dt>
                <dd className="submission-detail__value_01 mt-1 break-words font-medium">{student.fullName}<span className="submission-detail__email_01 mt-1 block break-all text-xs font-normal text-muted-foreground">{student.email}</span></dd>
              </div>
              <div className="submission-detail__course_01 min-w-0">
                <dt className="submission-detail__label_01 text-muted-foreground">Course</dt>
                <dd className="submission-detail__value_01 mt-1 break-words font-medium">{submission.course.title}</dd>
              </div>
              <div className="submission-detail__submitted_01">
                <dt className="submission-detail__label_01 text-muted-foreground">Submitted · ICT (UTC+7)</dt>
                <dd className="submission-detail__value_01 mt-1 font-medium"><time dateTime={submission.submittedAt}>{formatSubmissionDate(submission.submittedAt)}</time></dd>
              </div>
              <div className="submission-detail__attempt_01">
                <dt className="submission-detail__label_01 text-muted-foreground">Attempt</dt>
                <dd className="submission-detail__value_01 mt-1 font-medium">{submission.attemptNumber}</dd>
              </div>
              <div className="submission-detail__maximum_01">
                <dt className="submission-detail__label_01 text-muted-foreground">Maximum score</dt>
                <dd className="submission-detail__value_01 mt-1 font-medium">{formatGradeScore(assessment.maxScore)} points</dd>
              </div>
              {assessment.deadline && (
                <div className="submission-detail__deadline_01 sm:col-span-2">
                  <dt className="submission-detail__label_01 text-muted-foreground">Deadline · ICT (UTC+7)</dt>
                  <dd className="submission-detail__value_01 mt-1 font-medium"><time dateTime={assessment.deadline}>{formatSubmissionDate(assessment.deadline)}</time></dd>
                </div>
              )}
            </dl>
            <div className="submission-detail__instructions_01 border-t border-border pt-4">
              <h3 className="submission-detail__instructions-title_01 text-sm font-semibold">Assessment instructions</h3>
              <p className="submission-detail__instructions-text_01 mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{assessment.instructions}</p>
            </div>
          </CardContent>
        </Card>
        <div className="submission-detail__review-layout_01 grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="submission-detail__work_01 min-w-0">
            {submission.type === "quiz" && <QuizSubmissionReview submission={submission} />}
            {submission.type === "written" && <WrittenSubmissionReview submission={submission} />}
            {submission.type === "code" && <CodeSubmissionReview submission={submission} />}
          </div>
          <div className="submission-detail__grading_01 min-w-0 space-y-6">
            <Card className="submission-detail__recorded-grade_01 min-w-0 rounded-[15px]">
              <CardHeader className="submission-detail__grade-header_01">
                <h2 className="submission-detail__grade-title_01 font-display text-lg font-bold">Recorded grade</h2>
              </CardHeader>
              <CardContent className="submission-detail__grade-content_01 space-y-5">
                <p className="submission-detail__score_01 text-2xl font-bold text-foreground">
                  {grading.status === "graded" ? `${formatGradeScore(grading.score)} / ${formatGradeScore(assessment.maxScore)}` : "Not graded"}
                </p>
                {grading.status === "review-required" && <p className="submission-detail__review-reason_01 break-words rounded-lg border border-border bg-muted p-3 text-sm leading-relaxed">{grading.reviewReason}</p>}
                {grading.gradedAt && (
                  <p className="submission-detail__graded-at_01 text-xs text-muted-foreground">Graded <time dateTime={grading.gradedAt}>{formatSubmissionDate(grading.gradedAt)}</time> · ICT (UTC+7)</p>
                )}
                <div className="submission-detail__feedback_01 border-t border-border pt-4">
                  <h3 className="submission-detail__feedback-title_01 text-sm font-semibold">Recorded feedback</h3>
                  <p className="submission-detail__feedback-text_01 mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">{grading.feedback || "No feedback has been recorded."}</p>
                </div>
              </CardContent>
            </Card>
            {submission.type !== "quiz" && <ManualGradingForm key={submission.id} submission={submission} />}
          </div>
        </div>
      </div>
    </div>
  );
}
