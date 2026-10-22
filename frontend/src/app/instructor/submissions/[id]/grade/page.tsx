import { notFound } from "next/navigation";
import { SubmissionDetail } from "@/components/instructor/submissions/submission-detail";
import { MOCK_INSTRUCTOR_SUBMISSIONS } from "@/lib/mock-instructor-submissions";
import { readSubmissionFilters, submissionListHref, type SubmissionSearchParams } from "@/lib/instructor-submission-view";

export default function InstructorSubmissionDetailPage({ params, searchParams }: {
  params: { id: string };
  searchParams: SubmissionSearchParams;
}) {
  const submission = MOCK_INSTRUCTOR_SUBMISSIONS.find((item) => item.id === params.id);
  if (!submission) notFound();
  const filters = readSubmissionFilters(searchParams, MOCK_INSTRUCTOR_SUBMISSIONS);
  return <SubmissionDetail submission={submission} backHref={submissionListHref(filters)} />;
}
