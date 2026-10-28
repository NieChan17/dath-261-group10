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
  displayDate,
  EmptyRows,
  matches,
  Pagination,
} from "@/components/admin/admin-ui";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { paginate } from "@/lib/admin-demo";
import type { ContentReport, ReportStatus } from "@/types/admin";

function ReportDetails({
  report,
  onClose,
}: {
  report: ContentReport;
  onClose: () => void;
}) {
  const { state, dispatch, announce } = useAdminDemo();
  const [note, setNote] = React.useState(report.review?.note || "");
  const [outcome, setOutcome] = React.useState<"Resolved" | "Dismissed">(
    report.status === "Dismissed" ? "Dismissed" : "Resolved",
  );
  const [confirm, setConfirm] = React.useState(false);
  const changed =
    note.trim().length > 0 &&
    (report.status !== outcome || report.review?.note !== note.trim());
  const userName = (id: string) =>
    state.users.find((u) => u.id === id)?.fullName || "Not provided";
  return (
    <DemoDialog
      title={`Review ${report.id}`}
      description="Provisional demo review: report state only. Content is never hidden, removed or edited."
      onClose={onClose}
    >
      <Detail label="Status">
        <Badge variant={report.status === "Pending" ? "outline" : "secondary"}>
          {report.status}
        </Badge>
      </Detail>
      <Detail label="Reported Content">
        {report.target.type} · {report.target.id}
        <br />
        {report.target.title}
      </Detail>
      <Detail label="Content">
        <blockquote className="rounded-lg border-l-4 border-primary bg-muted/40 p-3">
          {report.target.content}
        </blockquote>
      </Detail>
      <Detail label="Author / Course">
        {userName(report.target.authorId)} ·{" "}
        {state.courses.find((c) => c.id === report.target.courseId)?.title ||
          "Not provided"}
      </Detail>
      <Detail label="Reporter / Date">
        {userName(report.reporterId)} · {displayDate(report.reportedAt)}
      </Detail>
      <Detail label="Reason">{report.reason}</Detail>
      <Detail label="Previous Review">
        {report.review
          ? `${report.review.reviewerName} · ${displayDate(report.review.reviewedAt)}\n${report.review.note}`
          : "Not reviewed"}
      </Detail>
      <div className="space-y-2">
        <label htmlFor="review-outcome" className="text-sm font-medium">
          Review Outcome
        </label>
        <select
          id="review-outcome"
          className={controlClass}
          value={outcome}
          onChange={(e) =>
            setOutcome(e.target.value as "Resolved" | "Dismissed")
          }
        >
          <option>Resolved</option>
          <option>Dismissed</option>
        </select>
        <p className="text-xs text-muted-foreground">
          Provisional: Resolved records a completed review; Dismissed records
          that no further report handling is needed. Neither action changes
          content.
        </p>
      </div>
      <div className="space-y-2">
        <label htmlFor="review-note" className="text-sm font-medium">
          Review Note (required)
        </label>
        <textarea
          id="review-note"
          required
          rows={4}
          maxLength={1000}
          className={`${controlClass} h-auto py-3`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          aria-describedby="review-note-help"
        />
        <p id="review-note-help" className="text-xs text-muted-foreground">
          Enter a note to record a review. Maximum 1,000 characters. Unchanged
          reviews do not create events.
        </p>
      </div>
      <Button disabled={!changed} onClick={() => setConfirm(true)}>
        Review Demo Action
      </Button>
      {confirm && (
        <ConfirmDemo
          title="Save this demo review?"
          onClose={() => setConfirm(false)}
          onConfirm={() => {
            dispatch({ type: "review", id: report.id, status: outcome, note });
            setConfirm(false);
            announce(
              `Demo review saved for ${report.id}. Content unchanged; audit event recorded.`,
            );
          }}
        >
          <div className="space-y-3">
            <p>
              {report.status} → <strong>{outcome}</strong>
            </p>
            <p className="whitespace-pre-wrap">{note.trim()}</p>
            <p className="text-sm text-muted-foreground">
              Only the report and demo audit history will change.
            </p>
          </div>
        </ConfirmDemo>
      )}
    </DemoDialog>
  );
}
export default function AdminReportsPage() {
  const { state } = useAdminDemo();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const filtered = state.reports.filter(
    (report) =>
      (!status || report.status === status) &&
      matches(
        search,
        report.id,
        report.target.title,
        report.target.content,
        report.target.type,
        report.reason,
        report.review?.note || "",
      ),
  );
  const result = paginate(filtered, page);
  React.useEffect(() => {
    if (page !== result.page) setPage(result.page);
  }, [page, result.page]);
  const selected = state.reports.find((report) => report.id === selectedId);
  const clear = () => {
    setSearch("");
    setStatus("");
    setPage(1);
  };
  return (
    <div
      data-component="AdminReportsPage"
      className="admin-reports__container_01 space-y-6"
    >
      <AdminHeading
        title="Content Reports"
        description="Review reported discussion threads and comments in an isolated demo queue."
      />
      <p className="text-sm text-muted-foreground">
        Provisional review outcomes: Pending, Resolved or Dismissed. Reviews
        update reports only; content stays unchanged.
      </p>
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <label htmlFor="report-search" className="text-sm font-medium">
            Search Reports
          </label>
          <Input
            id="report-search"
            placeholder="Content, reason, report ID or review note"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="report-status-filter" className="text-sm font-medium">
            Report Status
          </label>
          <select
            id="report-status-filter"
            className={controlClass}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {(["Pending", "Resolved", "Dismissed"] as ReportStatus[]).map(
              (value) => (
                <option key={value}>{value}</option>
              ),
            )}
          </select>
        </div>
      </div>
      <AdminTable
        caption="Demo content reports"
        columns={[
          "Report / Content",
          "Reason",
          "Reported",
          "Status",
          "Actions",
        ]}
      >
        {result.rows.map((report) => (
          <tr key={report.id}>
            <td className="max-w-xs">
              <p className="font-mono text-xs text-muted-foreground">
                {report.id} · {report.target.type}
              </p>
              <p className="mt-1 font-semibold">{report.target.title}</p>
            </td>
            <td className="max-w-xs break-words">{report.reason}</td>
            <td className="whitespace-nowrap text-xs text-muted-foreground">
              {displayDate(report.reportedAt)}
            </td>
            <td>
              <Badge
                variant={report.status === "Pending" ? "outline" : "secondary"}
              >
                {report.status}
              </Badge>
            </td>
            <td>
              <Button
                variant="outline"
                size="sm"
                aria-label={`Review ${report.id}`}
                onClick={() => setSelectedId(report.id)}
              >
                View / Review
              </Button>
            </td>
          </tr>
        ))}
        {!filtered.length && <EmptyRows columns={5} onClear={clear} />}
      </AdminTable>
      <Pagination {...result} onPage={setPage} />
      {selected && (
        <ReportDetails
          key={selected.id}
          report={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
