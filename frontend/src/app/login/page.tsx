"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { loginUser } from "@/lib/api/auth";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";

interface RoleMetadata {
  title: string;
  roleLabel: string;
  defaultEmail: string;
  targetRoute: string;
  targetWorkspaceName: string;
}

const ROLE_CONFIG: Record<string, RoleMetadata> = {
  learner: {
    title: "Sign in to Learner Portal",
    roleLabel: "Learner & Student",
    defaultEmail: "student@edupulse.hcmut.edu.vn",
    targetRoute: ROUTES.HOME,
    targetWorkspaceName: "Learner Dashboard",
  },
  instructor: {
    title: "Sign in to Instructor Workspace",
    roleLabel: "Faculty & Instructor",
    defaultEmail: "instructor@edupulse.hcmut.edu.vn",
    targetRoute: ROUTES.INSTRUCTOR.OVERVIEW,
    targetWorkspaceName: "Instructor Workspace",
  },
  admin: {
    title: "Sign in to Admin Portal",
    roleLabel: "System Administrator",
    defaultEmail: "admin@edupulse.hcmut.edu.vn",
    targetRoute: ROUTES.ADMIN.OVERVIEW,
    targetWorkspaceName: "System Admin Portal",
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRole = searchParams.get("role")?.toLowerCase() || "learner";
  const roleKey = ROLE_CONFIG[rawRole] ? rawRole : "learner";
  const config = ROLE_CONFIG[roleKey];

  const [email, setEmail] = React.useState(config.defaultEmail);
  const [password, setPassword] = React.useState("password123");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Sync default email if role query param changes
  React.useEffect(() => {
    setEmail(config.defaultEmail);
  }, [config.defaultEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await loginUser(email, password);
      // Persist chosen role session
      if (typeof window !== "undefined") {
        localStorage.setItem("edupulse_role", roleKey);
        localStorage.setItem(
          "edupulse_user",
          JSON.stringify({ email, role: roleKey })
        );
      }

      setSuccess(
        `Signed in successfully! Redirecting to ${config.targetWorkspaceName}...`
      );
      setTimeout(() => {
        router.push(config.targetRoute);
      }, 700);
    } catch (err: any) {
      setError(err?.message || "Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail(config.defaultEmail);
    setPassword("password123");
  };

  return (
    <div
      data-component="LoginPage"
      className="login__container_01 flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-[#f8f9ff]"
    >
      <div className="w-full max-w-md space-y-3">
        {/* Back Link to Portals */}
        <Link
          href={ROUTES.PORTAL}
          className="login__back-link_01 inline-flex items-center gap-1.5 text-xs font-semibold text-[#737686] hover:text-[#0b1c30] transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Portals</span>
        </Link>

        <Card className="login__card_01 w-full shadow-md rounded-[18px] border-[#e2e8f0] bg-white">
          <CardHeader className="text-center space-y-1.5 pt-6 pb-2">
            <CardTitle className="login__title_01 text-xl font-display font-bold text-[#0b1c30]">
              {config.title}
            </CardTitle>
            <CardDescription className="login__desc_01 text-xs text-[#737686]">
              Enter your credentials to access your {config.targetWorkspaceName}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-2">
              {error && (
                <div className="login__error-box_01 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="login__success-box_01 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{success}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#434655]">
                    Email Address
                  </label>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-[11px] text-[#2563eb] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Use Demo Email</span>
                  </button>
                </div>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={config.defaultEmail}
                  className="h-10 text-xs bg-[#f8f9ff] focus:bg-white border-[#e2e8f0]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#434655]">
                    Password
                  </label>
                  <Link
                    href={ROUTES.FORGOT_PASSWORD}
                    className="text-xs text-[#2563eb] hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 text-xs bg-[#f8f9ff] focus:bg-white border-[#e2e8f0]"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white font-bold text-xs h-10 cursor-pointer shadow-xs active:scale-95 transition-all ${
                  roleKey === "instructor"
                    ? "bg-[#006a61] hover:bg-[#004d44]"
                    : roleKey === "admin"
                    ? "bg-[#0b1c30] hover:bg-[#1e293b]"
                    : "bg-[#2563eb] hover:bg-[#1d4ed8]"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In & Enter Portal</span>
                )}
              </Button>
              <p className="text-xs text-center text-[#737686]">
                Don&apos;t have an account?{" "}
                <Link
                  href={ROUTES.REGISTER}
                  className="text-[#2563eb] font-semibold hover:underline"
                >
                  Create one
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-[#f8f9ff]">
          <div className="flex items-center gap-2 text-xs text-[#737686]">
            <Loader2 className="h-4 w-4 animate-spin text-[#2563eb]" />
            <span>Loading login portal...</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
