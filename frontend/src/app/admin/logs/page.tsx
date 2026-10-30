"use client";

import * as React from "react";
import { useAdminDemo } from "@/components/admin/admin-demo-provider";
import {
  AdminHeading,
  AdminTable,
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
import type { AdminEventAction } from "@/types/admin";

export default function AdminLogsPage() {
  const { state } = useAdminDemo();
  const [search, setSearch] = React.useState("");
  const [action, setAction] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const filtered = state.events.filter(
    (event) =>
      (!action || event.action === action) &&
      matches(
        search,
        event.id,
        event.actor.name,
        event.actor.id,
        event.target.name,
        event.target.id,
        event.details,
        event.action,
        event.timestamp,
        displayDate(event.timestamp),
      ),
  );
  const result = paginate(filtered, page);
  React.useEffect(() => {
    if (page !== result.page) setPage(result.page);
  }, [page, result.page]);
  const selected = state.events.find((event) => event.id === selectedId);
  const clear = () => {
    setSearch("");
    setAction("");
    setPage(1);
  };
  return (
    <div
      data-component="AdminLogsPage"
      className="admin-logs__container_01 space-y-6"
    >
      <AdminHeading
        title="Audit Logs"
        description="Administrative events, newest first."
      />
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <label htmlFor="log-search" className="text-sm font-medium">
            Search Audit Events
          </label>
          <Input
            id="log-search"
            placeholder="Actor, target, details, date or ID"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="log-action-filter" className="text-sm font-medium">
            Action
          </label>
          <select
            id="log-action-filter"
            className={controlClass}
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All actions</option>
            {(
              [
                "Role changed",
                "Publication changed",
                "Report reviewed",
              ] as AdminEventAction[]
            ).map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
      </div>
      <AdminTable
        caption="Administrative audit events"
        columns={["Event / Time", "Actor", "Action", "Target", "Details"]}
      >
        {result.rows.map((event) => (
          <tr key={event.id}>
            <td className="whitespace-nowrap">
              <p className="font-mono text-xs">{event.id}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {displayDate(event.timestamp)}
              </p>
            </td>
            <td>{event.actor.name}</td>
            <td>
              <Badge variant="outline">{event.action}</Badge>
            </td>
            <td className="max-w-xs break-words">
              {event.target.name}
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {event.target.id}
              </p>
            </td>
            <td>
              <Button
                variant="outline"
                size="sm"
                aria-label={`View event ${event.id}`}
                onClick={() => setSelectedId(event.id)}
              >
                View Details
              </Button>
            </td>
          </tr>
        ))}
        {!filtered.length && <EmptyRows columns={5} onClear={clear} />}
      </AdminTable>
      <Pagination {...result} onPage={setPage} />
      {selected && (
        <DemoDialog
          title={selected.action}
          description="Administrative event details."
          onClose={() => setSelectedId(null)}
        >
          <Detail label="Event ID">
            <span className="font-mono">{selected.id}</span>
          </Detail>
          <Detail label="Actor">
            {selected.actor.name} · {selected.actor.id}
          </Detail>
          <Detail label="Target">
            {selected.target.name} · {selected.target.id}
          </Detail>
          <Detail label="Timestamp">{displayDate(selected.timestamp)}</Detail>
          <Detail label="Details">{selected.details}</Detail>
        </DemoDialog>
      )}
    </div>
  );
}
