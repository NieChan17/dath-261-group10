"use client";

import * as React from "react";
import { WorkspaceGuard } from "@/components/auth/workspace-guard";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceGuard
      allowedRoles={["instructor", "admin"]}
      loginRole="instructor"
    >
      {children}
    </WorkspaceGuard>
  );
}
