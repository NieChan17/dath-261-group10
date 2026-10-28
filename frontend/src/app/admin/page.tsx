"use client";

import { useAdminDemo } from "@/components/admin/admin-demo-provider";
import { AdminHeading, Metric, percent } from "@/components/admin/admin-ui";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { demoMetrics, enrollmentTrend } from "@/lib/admin-demo";

export default function AdminOverviewPage() {
  const { state } = useAdminDemo();
  const metrics = demoMetrics(state);
  const trend = enrollmentTrend(state);
  return (
    <div
      data-component="AdminOverviewPage"
      className="admin-overview__container_01 space-y-6"
    >
      <AdminHeading
        title="System Overview"
        description="An overview of users, courses and learning activity."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Total Users"
          value={state.users.length}
          help={`${state.users.filter((u) => u.role === "student").length} students · ${state.users.filter((u) => u.role === "instructor").length} instructors · ${state.users.filter((u) => u.role === "admin").length} admins`}
        />
        <Metric
          label="Total Courses"
          value={state.courses.length}
          help={`${state.courses.filter((c) => c.isPublished).length} published · ${state.courses.filter((c) => !c.isPublished).length} draft`}
        />
        <Metric
          label="Active Enrollments"
          value={metrics.active}
          help="Current active records; not all-time enrollments."
        />
        <Metric
          label="Course Completion Rate"
          value={percent(metrics.completionRate)}
          help={`${metrics.completed} completed / (active + completed) enrollments.`}
        />
      </div>
      <details className="rounded-2xl border border-border bg-card p-4 text-sm">
        <summary className="cursor-pointer rounded font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Metric Definitions
        </summary>
        <p className="mt-3 text-muted-foreground">
          Completion = completed / (active + completed); cancelled and suspended
          records are excluded. A missing denominator is N/A. Trend counts
          records by enrolledAt, not historical re-enrollment events. Quiz
          statistics use every graded attempt, including repeat attempts; scores
          are percentages.
        </p>
      </details>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Trend</CardTitle>
            <p className="text-sm text-muted-foreground">
              August–October 2026
            </p>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <caption className="sr-only">
                Enrollment records by month, with visual bars
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="pb-3 text-left">
                    Month
                  </th>
                  <th scope="col" className="pb-3 text-left">
                    Records
                  </th>
                </tr>
              </thead>
              <tbody>
                {trend.map((row) => (
                  <tr key={row.month}>
                    <th scope="row" className="py-3 pr-4 text-left font-medium">
                      {row.month}
                    </th>
                    <td className="w-2/3">
                      <div className="flex items-center gap-3">
                        <div
                          aria-hidden="true"
                          className="h-3 flex-1 overflow-hidden rounded-full bg-muted"
                        >
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${(row.count / Math.max(1, ...trend.map((r) => r.count))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="tabular-nums">{row.count}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Learning Results</CardTitle>
            <p className="text-sm text-muted-foreground">
              Graded quiz attempts
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="mt-1 text-3xl font-bold">
                  {percent(metrics.averageScore)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
                <p className="mt-1 text-3xl font-bold">
                  {percent(metrics.passRate)}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {metrics.attempts} graded attempts ·{" "}
              {new Set(state.quizAttempts.map((a) => a.studentId)).size} unique
              learners. Each attempt uses its own pass score. Assignment points
              are not included.
            </p>
            <div className="text-sm">
              <Badge variant="outline">
                {state.reports.filter((r) => r.status === "Pending").length}{" "}
                pending reports
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Completion by Course</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {state.courses.map((course) => {
              const summary = demoMetrics(state, course.id);
              return (
                <li
                  key={course.id}
                  className="flex items-start justify-between gap-4 py-3 text-sm"
                >
                  <span className="min-w-0 break-words">
                    <span className="mr-2 font-mono text-xs text-muted-foreground">
                      {course.code}
                    </span>
                    {course.title}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {percent(summary.completionRate)}
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
