"use client";

import * as React from "react";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";
import {
  AdminHeading,
  AdminTable,
  ConfirmDemo,
  controlClass,
  DemoDialog,
  Detail,
  EmptyRows,
  matches,
  Pagination,
  percent,
} from "@/components/admin/admin-ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { demoMetrics, paginate } from "@/lib/admin-demo";
import type { AdminDemoCourse } from "@/types/admin";

function CourseDetails({
  course,
  onClose,
}: {
  course: AdminDemoCourse;
  onClose: () => void;
}) {
  const { state, dispatch, announce } = useAdminDemo();
  const [confirm, setConfirm] = React.useState(false);
  const instructor = state.users.find((u) => u.id === course.instructorId);
  const metrics = demoMetrics(state, course.id);
  return (
    <DemoDialog
      title={course.title}
      description="Course details and demo publication controls."
      onClose={onClose}
    >
      <Detail label="Course Code / ID">
        <span className="font-mono">
          {course.code} / {course.id}
        </span>
      </Detail>
      <Detail label="Description">
        {course.description || "Not provided"}
      </Detail>
      <Detail label="Instructor">
        {instructor
          ? `${instructor.fullName} · ${instructor.email}`
          : "Not provided"}
      </Detail>
      <Detail label="Category / Level">
        {course.category} · {course.level}
      </Detail>
      <Detail label="Publication">
        <Badge variant={course.isPublished ? "secondary" : "outline"}>
          {course.isPublished ? "Published" : "Draft"}
        </Badge>
      </Detail>
      <Detail label="Active Enrollments">{metrics.active}</Detail>
      <Detail label="Completion Rate (provisional)">
        {percent(metrics.completionRate)} · completed / (active + completed). No
        eligible enrollments = N/A.
      </Detail>
      <p className="text-xs text-muted-foreground">
        Instructors retain publishing capabilities. This demo toggle does not
        publish or unpublish a real course.
      </p>
      <Button onClick={() => setConfirm(true)}>
        {course.isPublished ? "Move to Draft (Demo)" : "Publish (Demo)"}
      </Button>
      {confirm && (
        <ConfirmDemo
          title="Change demo publication?"
          onClose={() => setConfirm(false)}
          onConfirm={() => {
            dispatch({
              type: "publication",
              id: course.id,
              isPublished: !course.isPublished,
            });
            setConfirm(false);
            announce(
              `Demo publication updated for ${course.code}. Audit event recorded.`,
            );
          }}
        >
          <p>
            {course.title}:{" "}
            <strong>
              {course.isPublished ? "Published → Draft" : "Draft → Published"}
            </strong>
            .
          </p>
        </ConfirmDemo>
      )}
    </DemoDialog>
  );
}
export default function AdminCoursesPage() {
  const { state } = useAdminDemo();
  const [search, setSearch] = React.useState("");
  const [publication, setPublication] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const filtered = state.courses.filter((course) => {
    const instructor = state.users.find((u) => u.id === course.instructorId);
    return (
      (!publication || course.isPublished === (publication === "published")) &&
      matches(
        search,
        course.title,
        course.code,
        course.description,
        instructor?.fullName || "",
        instructor?.email || "",
      )
    );
  });
  const result = paginate(filtered, page);
  React.useEffect(() => {
    if (page !== result.page) setPage(result.page);
  }, [page, result.page]);
  const selected = state.courses.find((course) => course.id === selectedId);
  const clear = () => {
    setSearch("");
    setPublication("");
    setPage(1);
  };
  return (
    <div
      data-component="AdminCoursesPage"
      className="admin-courses__container_01 space-y-6"
    >
      <AdminHeading
        title="Courses"
        description="Inspect courses, instructors and active enrollment statistics."
      />
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <label htmlFor="course-search" className="text-sm font-medium">
            Search Courses
          </label>
          <Input
            id="course-search"
            placeholder="Title, code, description or instructor"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="publication-filter" className="text-sm font-medium">
            Publication
          </label>
          <select
            id="publication-filter"
            className={controlClass}
            value={publication}
            onChange={(e) => {
              setPublication(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All publication states</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>
      <AdminTable
        caption="Demo courses"
        columns={[
          "Course",
          "Instructor",
          "Publication",
          "Active Enrollments",
          "Actions",
        ]}
      >
        {result.rows.map((course) => (
          <tr key={course.id}>
            <td className="max-w-xs">
              <p className="font-mono text-xs text-muted-foreground">
                {course.code}
              </p>
              <p className="mt-1 break-words font-semibold">{course.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {course.level}
              </p>
            </td>
            <td>
              {state.users.find((u) => u.id === course.instructorId)
                ?.fullName || "Not provided"}
            </td>
            <td>
              <Badge variant={course.isPublished ? "secondary" : "outline"}>
                {course.isPublished ? "Published" : "Draft"}
              </Badge>
            </td>
            <td className="tabular-nums">
              {demoMetrics(state, course.id).active}
            </td>
            <td>
              <Button
                variant="outline"
                size="sm"
                aria-label={`View course ${course.code}`}
                onClick={() => setSelectedId(course.id)}
              >
                View Details
              </Button>
            </td>
          </tr>
        ))}
        {!filtered.length && <EmptyRows columns={5} onClear={clear} />}
      </AdminTable>
      <Pagination {...result} onPage={setPage} />
      <p className="text-sm text-muted-foreground">
        Active Enrollments counts only active records. Draft and Published are
        existing publication states, not an Admin approval workflow.
      </p>
      {selected && (
        <CourseDetails
          key={selected.id}
          course={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
