import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SubmissionFilterForm } from "./submission-filters";
import { SubmissionDraftIndicator } from "./submission-draft-indicator";
import { SubmissionMockNotice, SubmissionStatusBadge } from "./submission-shared";
import {
  filterSubmissions, formatSubmissionDate, submissionDetailHref, SUBMISSION_TYPE_LABELS, type SubmissionFilters,
} from "@/lib/instructor-submission-view";
import type { InstructorSubmission } from "@/types/submission";
import { formatGradeScore } from "@/lib/instructor-grading";

export function SubmissionList({ submissions, filters }: {
  submissions: readonly InstructorSubmission[];
  filters: SubmissionFilters;
}) {
  const visible = filterSubmissions(submissions, filters);
  return (
    <div data-component="SubmissionList" className="submission-list__container_01 min-h-screen bg-background pb-16">
      <div className="submission-list__content_01 mx-auto max-w-7xl space-y-6 px-4 pt-6 sm:px-6 lg:px-8">
        <header className="submission-list__header_01 space-y-3">
          <Link href="/instructor" className="submission-list__back_01 inline-block rounded-lg text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            Back to Instructor Workspace
          </Link>
          <h1 className="submission-list__title_01 font-display text-2xl font-bold tracking-tight sm:text-3xl">Submissions</h1>
          <p className="submission-list__description_01 text-sm text-muted-foreground">Review student work and sample recorded grades across your courses. Filters use sample records; temporary drafts do not change these grades or statuses.</p>
        </header>
        <SubmissionMockNotice />
        <SubmissionFilterForm submissions={submissions} filters={filters} />
        <section aria-labelledby="submission-results-title" className="submission-list__results_01 space-y-4">
          <div className="submission-list__results-header_01 flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="submission-results-title" className="submission-list__results-title_01 font-display text-lg font-bold">
              {visible.length} of {submissions.length} submissions
            </h2>
            <p className="submission-list__timezone_01 text-xs text-muted-foreground">Newest first · Times in ICT (UTC+7)</p>
          </div>
          {visible.length ? (
            <ul className="submission-list__grid_01 grid gap-4 xl:grid-cols-2">
              {visible.map((submission) => (
                <li key={submission.id} className="submission-list__item_01 min-w-0">
                  <Card data-component="SubmissionListItem" className="submission-list__card_01 h-full rounded-[15px]">
                    <CardContent className="submission-list__card-content_01 flex h-full flex-col gap-4 p-5">
                      <div className="submission-list__student-row_01 flex flex-wrap items-start justify-between gap-3">
                        <div className="submission-list__student_01 min-w-0 break-words">
                          <h3 className="submission-list__student-name_01 font-display font-bold">{submission.student.fullName}</h3>
                          <p className="submission-list__email_01 break-all text-sm text-muted-foreground">{submission.student.email}</p>
                        </div>
                        <SubmissionStatusBadge status={submission.grading.status} />
                      </div>
                      <dl className="submission-list__metadata_01 grid min-w-0 grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <div className="submission-list__assessment_01 col-span-2 min-w-0">
                          <dt className="submission-list__label_01 text-xs text-muted-foreground">Assessment · {SUBMISSION_TYPE_LABELS[submission.type]}</dt>
                          <dd className="submission-list__value_01 break-words font-semibold">{submission.assessment.title}</dd>
                        </div>
                        <div className="submission-list__course_01 col-span-2 min-w-0">
                          <dt className="submission-list__label_02 text-xs text-muted-foreground">Course</dt>
                          <dd className="submission-list__value_02 break-words">{submission.course.title}</dd>
                        </div>
                        <div className="submission-list__date_01 min-w-0">
                          <dt className="submission-list__label_03 text-xs text-muted-foreground">Submitted</dt>
                          <dd className="submission-list__value_03"><time dateTime={submission.submittedAt}>{formatSubmissionDate(submission.submittedAt)}</time></dd>
                        </div>
                        <div className="submission-list__attempt_01">
                          <dt className="submission-list__label_04 text-xs text-muted-foreground">Attempt</dt>
                          <dd className="submission-list__value_04">{submission.attemptNumber}</dd>
                        </div>
                      </dl>
                      <SubmissionDraftIndicator submissionId={submission.id} />
                      <div className="submission-list__footer_01 mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                        <p className="submission-list__score_01 text-sm font-semibold">
                          {submission.grading.score === null ? "Sample: Not graded" : `Sample score: ${formatGradeScore(submission.grading.score)} / ${formatGradeScore(submission.assessment.maxScore)}`}
                        </p>
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={submissionDetailHref(submission.id, filters)}
                            aria-label={`Review ${submission.student.fullName}'s ${submission.assessment.title}, attempt ${submission.attemptNumber}`}
                          >Review</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <Card data-component="SubmissionEmptyState" className="submission-list__empty_01 rounded-[15px]">
              <CardContent className="submission-list__empty-content_01 space-y-3 p-8 text-center">
                <h3 className="submission-list__empty-title_01 font-display text-lg font-bold">{submissions.length ? "No matching submissions" : "No submissions yet"}</h3>
                <p className="submission-list__empty-description_01 text-sm text-muted-foreground">
                  {submissions.length ? "Try another student name or email, or clear your filters to see all submissions." : "Student work will appear here when submissions are available."}
                </p>
                {submissions.length > 0 && <Button asChild variant="outline"><Link href="/instructor/submissions">Show all submissions</Link></Button>}
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
