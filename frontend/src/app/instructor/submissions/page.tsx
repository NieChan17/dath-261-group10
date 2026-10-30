import { SubmissionList } from "@/components/instructor/submissions/submission-list";
import { MOCK_INSTRUCTOR_SUBMISSIONS } from "@/lib/mock-instructor-submissions";
import { readSubmissionFilters, type SubmissionSearchParams } from "@/lib/instructor-submission-view";

export default function InstructorSubmissionsPage({ searchParams }: { searchParams: SubmissionSearchParams }) {
  const filters = readSubmissionFilters(searchParams, MOCK_INSTRUCTOR_SUBMISSIONS);
  return <SubmissionList submissions={MOCK_INSTRUCTOR_SUBMISSIONS} filters={filters} />;
}
