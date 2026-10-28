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
import type { Role, User } from "@/types/auth";

const roles: Role[] = ["student", "instructor", "admin"];
function UserDetails({ user, onClose }: { user: User; onClose: () => void }) {
  const { dispatch, announce } = useAdminDemo();
  const [role, setRole] = React.useState<Role>(user.role);
  const [confirm, setConfirm] = React.useState(false);
  return (
    <DemoDialog
      title={user.fullName}
      description="User details and demo role management."
      onClose={onClose}
    >
      <Detail label="User ID">
        <span className="font-mono">{user.id}</span>
      </Detail>
      <Detail label="Email">{user.email}</Detail>
      <Detail label="Created">{displayDate(user.createdAt)}</Detail>
      <Detail label="Avatar">{user.avatarUrl || "Not provided"}</Detail>
      <Detail label="Current Role">
        <Badge variant="secondary">{user.role}</Badge>
      </Detail>
      <div className="space-y-2">
        <label htmlFor="demo-user-role" className="text-sm font-medium">
          New Role
        </label>
        <select
          id="demo-user-role"
          className={controlClass}
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          {roles.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          One role per user. This changes demo data only; it does not grant
          access.
        </p>
      </div>
      <Button disabled={role === user.role} onClick={() => setConfirm(true)}>
        Review Role Change
      </Button>
      {confirm && (
        <ConfirmDemo
          title="Change this user's demo role?"
          onClose={() => setConfirm(false)}
          onConfirm={() => {
            dispatch({ type: "role", id: user.id, role });
            setConfirm(false);
            announce(
              `Demo role updated for ${user.fullName}. Audit event recorded.`,
            );
          }}
        >
          <p>
            {user.fullName}: <strong>{user.role}</strong> →{" "}
            <strong>{role}</strong>.
          </p>
        </ConfirmDemo>
      )}
    </DemoDialog>
  );
}
export default function AdminUsersPage() {
  const { state } = useAdminDemo();
  const [search, setSearch] = React.useState("");
  const [role, setRole] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const filtered = state.users.filter(
    (user) =>
      (!role || user.role === role) &&
      matches(search, user.fullName, user.email, user.id),
  );
  const result = paginate(filtered, page);
  React.useEffect(() => {
    if (page !== result.page) setPage(result.page);
  }, [page, result.page]);
  const selected = state.users.find((user) => user.id === selectedId);
  const clear = () => {
    setSearch("");
    setRole("");
    setPage(1);
  };
  return (
    <div
      data-component="AdminUsersPage"
      className="admin-users__container_01 space-y-6"
    >
      <AdminHeading
        title="Users"
        description="Find accounts, inspect details and preview role changes."
      />
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          <label htmlFor="user-search" className="text-sm font-medium">
            Search Users
          </label>
          <Input
            id="user-search"
            placeholder="Name, email or ID"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="user-role-filter" className="text-sm font-medium">
            Role
          </label>
          <select
            id="user-role-filter"
            className={controlClass}
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            {roles.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
      </div>
      <AdminTable
        caption="Demo users"
        columns={["User", "Role", "Created", "Actions"]}
      >
        {result.rows.map((user) => (
          <tr key={user.id}>
            <td>
              <p className="font-semibold">{user.fullName}</p>
              <p className="mt-1 break-all text-xs text-muted-foreground">
                {user.email}
              </p>
            </td>
            <td>
              <Badge variant={user.role === "admin" ? "default" : "outline"}>
                {user.role}
              </Badge>
            </td>
            <td className="whitespace-nowrap text-muted-foreground">
              {displayDate(user.createdAt)}
            </td>
            <td>
              <Button
                variant="outline"
                size="sm"
                aria-label={`View user ${user.fullName}`}
                onClick={() => setSelectedId(user.id)}
              >
                View Details
              </Button>
            </td>
          </tr>
        ))}
        {!filtered.length && <EmptyRows columns={4} onClear={clear} />}
      </AdminTable>
      <Pagination {...result} onPage={setPage} />
      <p className="text-sm text-muted-foreground">
        Account blocking is unavailable in this demo.
      </p>
      {selected && (
        <UserDetails
          key={selected.id}
          user={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
