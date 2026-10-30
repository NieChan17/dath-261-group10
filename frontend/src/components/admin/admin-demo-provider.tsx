"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ScrollText,
  Flag,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { adminDemoReducer, type AdminDemoAction } from "@/lib/admin-demo";
import { createAdminDemo } from "@/lib/mock-admin-data";
import type { AdminDemoState } from "@/types/admin";
import { ConfirmDemo } from "./admin-ui";

const Context = React.createContext<{
  state: AdminDemoState;
  dispatch: React.Dispatch<AdminDemoAction>;
  announce: (message: string) => void;
} | null>(null);
export function useAdminDemo() {
  const context = React.useContext(Context);
  if (!context) throw new Error("Admin demo must be inside its provider");
  return context;
}
const navigation = [
  { label: "Overview", href: ROUTES.ADMIN.OVERVIEW, icon: LayoutDashboard },
  { label: "Users", href: ROUTES.ADMIN.USERS, icon: Users },
  { label: "Courses", href: ROUTES.ADMIN.COURSES, icon: BookOpen },
  { label: "Audit Logs", href: ROUTES.ADMIN.LOGS, icon: ScrollText },
  { label: "Content Reports", href: ROUTES.ADMIN.REPORTS, icon: Flag },
];
export function AdminDemoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(
    adminDemoReducer,
    undefined,
    createAdminDemo,
  );
  const [resetOpen, setResetOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const pathname = usePathname();
  React.useEffect(() => {
    setMessage("");
  }, [pathname]);
  return (
    <Context.Provider value={{ state, dispatch, announce: setMessage }}>
      <div
        data-component="AdminDemoProvider"
        className="admin-demo__container_01 mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LayoutDashboard aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-lg font-bold">Admin Workspace</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setResetOpen(true)}>
            <RotateCcw aria-hidden="true" className="mr-2 h-4 w-4" />
            Reset Changes
          </Button>
        </div>
        <nav
          aria-label="Admin navigation"
          className="flex flex-wrap gap-2 border-b border-border pb-4"
        >
          {navigation.map(({ label, href, icon: Icon }) => (
            <Button
              key={href}
              asChild
              variant={pathname === href ? "default" : "ghost"}
            >
              <Link
                href={href}
                aria-current={pathname === href ? "page" : undefined}
              >
                <Icon aria-hidden="true" className="mr-2 h-4 w-4" />
                {label}
              </Link>
            </Button>
          ))}
        </nav>
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={
            message
              ? "rounded-lg border border-secondary/30 bg-secondary/10 p-3 text-sm"
              : "sr-only"
          }
        >
          {message}
        </p>
        {children}
        {resetOpen && (
          <ConfirmDemo
            title="Reset all frontend changes?"
            confirmLabel="Reset Changes"
            onClose={() => setResetOpen(false)}
            onConfirm={() => {
              dispatch({ type: "reset" });
              setResetOpen(false);
              setMessage(
                "Frontend changes reset. Initial data restored in this session only; no server data was changed.",
              );
            }}
          >
            <p>
              This discards all frontend changes and restores the initial data
              and audit history in this session. No server data is affected.
            </p>
          </ConfirmDemo>
        )}
      </div>
    </Context.Provider>
  );
}
