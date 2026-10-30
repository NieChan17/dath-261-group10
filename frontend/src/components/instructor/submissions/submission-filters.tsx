"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readSubmissionFilters, submissionListHref, SUBMISSION_STATUS_LABELS, type SubmissionFilters } from "@/lib/instructor-submission-view";
import type { InstructorSubmission, SubmissionStatus } from "@/types/submission";

const SELECT_CLASS = "h-11 w-full min-w-0 rounded-lg border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function SubmissionFilterForm({ submissions, filters }: {
  submissions: readonly InstructorSubmission[];
  filters: SubmissionFilters;
}) {
  const router = useRouter();
  const [values, setValues] = useState(filters);
  useEffect(() => {
    setValues(filters);
  }, [filters]);
  const courses = Array.from(new Map(submissions.map(({ course }) => [course.id, course])).values());
  const assessments = Array.from(new Map(submissions.map(({ assessment }) => [assessment.id, assessment])).values());
  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "");
    const next = readSubmissionFilters({ q: value("q"), course: value("course"), assessment: value("assessment"), status: value("status") }, submissions);
    router.push(submissionListHref(next), { scroll: false });
  };
  return (
    <form
      data-component="SubmissionFilters"
      action="/instructor/submissions"
      method="get"
      onSubmit={applyFilters}
      aria-label="Filter submissions"
      className="submission-filters__form_01 space-y-4 rounded-[15px] border border-border bg-card p-4 sm:p-6"
    >
      <div className="submission-filters__fields_01 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="submission-filters__field_01 min-w-0 space-y-2">
          <label htmlFor="submission-search" className="submission-filters__label_01 block text-sm font-semibold">Student name or email</label>
          <Input id="submission-search" name="q" type="search" value={values.q} onChange={(event) => setValues({ ...values, q: event.target.value })} placeholder="Search students" />
        </div>
        <div className="submission-filters__field_02 min-w-0 space-y-2">
          <label htmlFor="submission-course" className="submission-filters__label_02 block text-sm font-semibold">Course</label>
          <select id="submission-course" name="course" value={values.course} onChange={(event) => setValues({ ...values, course: event.target.value })} className={`submission-filters__select_01 ${SELECT_CLASS}`}>
            <option value="">All courses</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </div>
        <div className="submission-filters__field_03 min-w-0 space-y-2">
          <label htmlFor="submission-assessment" className="submission-filters__label_03 block text-sm font-semibold">Assessment</label>
          <select id="submission-assessment" name="assessment" value={values.assessment} onChange={(event) => setValues({ ...values, assessment: event.target.value })} className={`submission-filters__select_02 ${SELECT_CLASS}`}>
            <option value="">All assessments</option>
            {assessments.map((assessment) => <option key={assessment.id} value={assessment.id}>{assessment.title}</option>)}
          </select>
        </div>
        <div className="submission-filters__field_04 min-w-0 space-y-2">
          <label htmlFor="submission-status" className="submission-filters__label_04 block text-sm font-semibold">Grading status</label>
          <select id="submission-status" name="status" value={values.status} onChange={(event) => setValues({ ...values, status: event.target.value as SubmissionFilters["status"] })} className={`submission-filters__select_03 ${SELECT_CLASS}`}>
            <option value="">All statuses</option>
            {(Object.keys(SUBMISSION_STATUS_LABELS) as SubmissionStatus[]).map((status) => (
              <option key={status} value={status}>{SUBMISSION_STATUS_LABELS[status]}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="submission-filters__actions_01 flex flex-wrap items-center gap-3">
        <Button type="submit">Apply filters</Button>
        <Button asChild variant="outline"><Link href="/instructor/submissions">Clear filters</Link></Button>
      </div>
    </form>
  );
}
