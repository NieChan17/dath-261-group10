"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { extractAuthUser, getCurrentUser } from "@/lib/api/auth";
import type { Role } from "@/types/auth";

interface WorkspaceGuardProps {
  allowedRoles: Role[];
  loginRole: "learner" | "instructor" | "admin";
  children: React.ReactNode;
}

export function WorkspaceGuard({
  allowedRoles,
  loginRole,
  children,
}: WorkspaceGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    async function verifySession() {
      try {
        const res = await getCurrentUser();
        const user = extractAuthUser(res);
        if (!active) return;

        if (!user || !allowedRoles.includes(user.role)) {
          router.replace(`/login?role=${loginRole}`);
          return;
        }

        if (typeof window !== "undefined") {
          const uiRole = user.role === "student" ? "learner" : user.role;
          localStorage.setItem("edupulse_role", uiRole);
          localStorage.setItem("edupulse_user", JSON.stringify(user));
        }
        setAuthorized(true);
      } catch {
        if (!active) return;
        if (typeof window !== "undefined") {
          localStorage.removeItem("edupulse_role");
          localStorage.removeItem("edupulse_user");
        }
        router.replace(`/login?role=${loginRole}`);
      }
    }

    verifySession();
    return () => {
      active = false;
    };
  }, [allowedRoles, loginRole, router]);

  if (!authorized) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-[#f8f9ff]">
        <div className="flex items-center gap-2 text-xs text-[#737686]">
          <Loader2 className="h-4 w-4 animate-spin text-[#2563eb]" />
          <span>Verifying authenticated session...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
