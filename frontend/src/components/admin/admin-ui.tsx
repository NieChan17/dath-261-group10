"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const controlClass =
  "h-11 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
export function AdminHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      data-component="AdminHeading"
      className="admin-heading__container_01 space-y-2"
    >
      <h1 className="text-2xl sm:text-3xl">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
export function DemoDialog({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();
  React.useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previousFocus?.isConnected && !previousFocus.matches(":disabled")) {
        previousFocus.focus();
      } else {
        // A successful change can disable the opener inside the parent dialog.
        const parentDialog = previousFocus?.closest("dialog[open]");
        const fallback = parentDialog?.isConnected
          ? parentDialog.querySelector<HTMLButtonElement>("button:not(:disabled)")
          : document.querySelector<HTMLInputElement>('input[id$="-search"]');
        fallback?.focus();
      }
    };
  }, []);
  return (
    <dialog
      ref={ref}
      data-component="DemoDialog"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.stopPropagation();
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (
          event.key !== "Tab" ||
          (event.target as HTMLElement).closest("dialog") !==
            event.currentTarget
        )
          return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
          ),
        );
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      className="admin-dialog__container_01 m-auto max-h-[85dvh] w-[calc(100%_-_2rem)] max-w-xl overflow-y-auto rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl backdrop:bg-foreground/40"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id={titleId} className="min-w-0 break-words text-xl">
          {title}
        </h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          autoFocus
          onClick={onClose}
        >
          Close
        </Button>
      </div>
      <p id={descriptionId} className="mt-2 text-sm text-muted-foreground">
        {description}
      </p>
      <div className="mt-6 space-y-4 break-words">{children}</div>
    </dialog>
  );
}
export function ConfirmDemo({
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = "Confirm Demo Change",
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
}) {
  return (
    <DemoDialog
      title={title}
      description="Demo — changes are not saved to the server."
      onClose={onClose}
    >
      <div>{children}</div>
      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </DemoDialog>
  );
}
export function AdminTable({
  caption,
  columns,
  children,
}: {
  caption: string;
  columns: string[];
  children: React.ReactNode;
}) {
  return (
    <div
      data-component="AdminTable"
      role="region"
      aria-label={`${caption} table; scroll horizontally on small screens`}
      tabIndex={0}
      className="admin-table__container_01 overflow-x-auto rounded-2xl border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b bg-muted/40">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="px-4 py-3 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border [&_td]:px-4 [&_td]:py-4 [&_td]:align-top">
          {children}
        </tbody>
      </table>
    </div>
  );
}
export function EmptyRows({
  columns,
  onClear,
}: {
  columns: number;
  onClear: () => void;
}) {
  return (
    <tr data-component="AdminEmptyRows">
      <td colSpan={columns}>
        <div className="space-y-3 py-6 text-center">
          <p className="font-medium">No matching records</p>
          <p className="text-muted-foreground">
            Try a different search or clear the filters.
          </p>
          <Button variant="outline" onClick={onClear}>
            Clear Filters
          </Button>
        </div>
      </td>
    </tr>
  );
}
export function Pagination({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
}) {
  return (
    <nav
      data-component="AdminPagination"
      aria-label="Table pagination"
      className="admin-pagination__container_01 flex flex-wrap items-center justify-between gap-3 text-sm"
    >
      <p role="status">
        {total} results · Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => onPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
export function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-component="AdminDetail"
      className="admin-detail__container_01 space-y-1"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="whitespace-pre-wrap break-words text-sm">
        {children ?? "Not provided"}
      </div>
    </div>
  );
}
export function Metric({
  label,
  value,
  help,
}: {
  label: string;
  value: string | number;
  help: string;
}) {
  return (
    <Card data-component="AdminMetric">
      <CardContent className="space-y-2 p-5">
        <h2 className="text-sm font-medium text-muted-foreground">{label}</h2>
        <p className="font-display text-3xl font-bold tabular-nums">{value}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{help}</p>
      </CardContent>
    </Card>
  );
}
export const percent = (value: number | null) =>
  value === null ? "N/A" : `${value}%`;
export const displayDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value)) + " ICT (UTC+7)";
export const matches = (search: string, ...values: string[]) =>
  values.join(" ").toLowerCase().includes(search.trim().toLowerCase());
